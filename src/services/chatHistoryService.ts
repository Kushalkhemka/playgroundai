import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type ChatType = 'text' | 'image' | 'knowledge_search' | 'video';

export interface ChatHistoryEntry {
  id: string;
  user_id: string;
  chat_type: ChatType;
  message_content: any;
  timestamp: string;
  metadata: any;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryFilter {
  chat_type?: ChatType;
  session_id?: string;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

export interface ChatStats {
  total_chats: number;
  text_chats: number;
  image_chats: number;
  knowledge_search_chats: number;
  total_sessions: number;
  first_chat_date: string | null;
  last_chat_date: string | null;
}

export class ChatHistoryService {
  /**
   * Store a chat interaction in the database
   */
  static async storeChatEntry(
    chatType: ChatType,
    messageContent: any,
    sessionId: string,
    metadata: any = {}
  ): Promise<ChatHistoryEntry | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated, skipping chat storage');
        return null;
      }

      console.log('Storing chat entry for user:', user.email, 'type:', chatType);

      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          chat_type: chatType,
          message_content: messageContent,
          session_id: sessionId,
          metadata: metadata,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing chat entry:', error);
        throw error;
      }

      console.log('Chat entry stored successfully:', data.id);
      return data;
    } catch (error) {
      console.error('Failed to store chat entry:', error);
      return null;
    }
  }

  /**
   * Store a text conversation (prompt-response pair)
   */
  static async storeTextConversation(
    prompt: string,
    response: string,
    model: string,
    sessionId: string,
    metadata: any = {}
  ): Promise<ChatHistoryEntry | null> {
    const messageContent = {
      prompt,
      response,
      model,
      type: 'conversation'
    };

    const enrichedMetadata = {
      ...metadata,
      model,
      response_length: response.length,
      prompt_length: prompt.length
    };

    return this.storeChatEntry('text', messageContent, sessionId, enrichedMetadata);
  }

  /**
   * Store an image generation request
   */
  static async storeImageGeneration(
    prompt: string,
    imageUrls: string[],
    model: string,
    sessionId: string,
    metadata: any = {}
  ): Promise<ChatHistoryEntry | null> {
    const messageContent = {
      prompt,
      image_urls: imageUrls,
      model,
      type: 'image_generation',
      image_count: imageUrls.length
    };

    const enrichedMetadata = {
      ...metadata,
      model,
      image_count: imageUrls.length,
      prompt_length: prompt.length,
      image_urls: imageUrls
    };

    return this.storeChatEntry('image', messageContent, sessionId, enrichedMetadata);
  }

  /**
   * Store a video generation request
   */
  static async storeVideoGeneration(
    prompt: string,
    videoUrls: string[],
    model: string,
    sessionId: string,
    metadata: any = {}
  ): Promise<ChatHistoryEntry | null> {
    const messageContent = {
      prompt,
      video_urls: videoUrls,
      model,
      type: 'video_generation',
      video_count: videoUrls.length
    };

    const enrichedMetadata = {
      ...metadata,
      model,
      video_count: videoUrls.length,
      prompt_length: prompt.length,
      video_urls: videoUrls
    };

    return this.storeChatEntry('video' as any, messageContent, sessionId, enrichedMetadata);
  }

  /**
   * Store a knowledge search query
   */
  static async storeKnowledgeSearch(
    query: string,
    results: any,
    sessionId: string,
    metadata: any = {}
  ): Promise<ChatHistoryEntry | null> {
    const messageContent = {
      query,
      results,
      type: 'knowledge_search',
      result_count: Array.isArray(results) ? results.length : 1
    };

    const enrichedMetadata = {
      ...metadata,
      query_length: query.length,
      result_count: Array.isArray(results) ? results.length : 1
    };

    return this.storeChatEntry('knowledge_search', messageContent, sessionId, enrichedMetadata);
  }

  /**
   * Retrieve user's chat history with filtering options
   */
  static async getChatHistory(filter: ChatHistoryFilter = {}): Promise<ChatHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated for chat history retrieval');
        return [];
      }

      console.log('Fetching chat history for user:', user.email);

      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filter.chat_type) {
        query = query.eq('chat_type', filter.chat_type);
      }

      if (filter.session_id) {
        query = query.eq('session_id', filter.session_id);
      }

      if (filter.start_date) {
        query = query.gte('timestamp', filter.start_date);
      }

      if (filter.end_date) {
        query = query.lte('timestamp', filter.end_date);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching chat history:', error);
        throw error;
      }

      console.log('Retrieved chat history entries:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      return [];
    }
  }

  /**
   * Get chat history for a specific session
   */
  static async getSessionHistory(sessionId: string): Promise<ChatHistoryEntry[]> {
    return this.getChatHistory({ session_id: sessionId });
  }

  /**
   * Get recent chat sessions
   */
  static async getRecentSessions(limit: number = 10): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated for recent sessions');
        return [];
      }

      const { data, error } = await supabase
        .from('chat_history')
        .select('session_id, timestamp')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit * 5); // Get more to account for duplicates

      if (error) {
        console.error('Error fetching recent sessions:', error);
        throw error;
      }

      // Extract unique session IDs in order
      const uniqueSessions = Array.from(
        new Set(data?.map(entry => entry.session_id) || [])
      ).slice(0, limit);

      return uniqueSessions;
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error);
      return [];
    }
  }

  /**
   * Get user chat statistics
   */
  static async getChatStats(): Promise<ChatStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated for chat stats');
        return null;
      }

      const { data, error } = await supabase
        .rpc('get_user_chat_stats', { target_user_id: user.id });

      if (error) {
        console.error('Error fetching chat stats:', error);
        throw error;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Failed to fetch chat stats:', error);
      return null;
    }
  }

  /**
   * Delete a specific chat entry
   */
  static async deleteChatEntry(entryId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting chat entry:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete chat entry:', error);
      return false;
    }
  }

  /**
   * Delete all chat history for a session
   */
  static async deleteSessionHistory(sessionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting session history:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete session history:', error);
      return false;
    }
  }

  /**
   * Delete all chat history for the current user
   */
  static async deleteAllChatHistory(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting all chat history:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete all chat history:', error);
      return false;
    }
  }

  /**
   * Batch store multiple chat entries (for offline sync)
   */
  static async batchStoreChatEntries(entries: Omit<ChatHistoryEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<ChatHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const entriesWithUserId = entries.map(entry => ({
        ...entry,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('chat_history')
        .insert(entriesWithUserId)
        .select();

      if (error) {
        console.error('Error batch storing chat entries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to batch store chat entries:', error);
      return [];
    }
  }

  /**
   * Search chat history by content
   */
  static async searchChatHistory(searchTerm: string, chatType?: ChatType): Promise<ChatHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .textSearch('message_content', searchTerm)
        .order('timestamp', { ascending: false });

      if (chatType) {
        query = query.eq('chat_type', chatType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching chat history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to search chat history:', error);
      return [];
    }
  }
}