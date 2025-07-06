import { supabase } from '../lib/supabase';
import type { Message } from '../types';

export interface ChatSession {
  id: string;
  user_id: string;
  session_id: string;
  messages: Message[];
  title: string;
  created_at: string;
  updated_at: string;
}

export class ChatStorageService {
  /**
   * Save a chat session to Supabase
   */
  static async saveChatSession(
    sessionId: string,
    messages: Message[],
    title: string
  ): Promise<ChatSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated, skipping chat storage');
        return null;
      }

      console.log('Saving chat session:', sessionId, 'with', messages.length, 'messages');

      // Check if session already exists
      const { data: existingSession } = await supabase
        .from('chat_storage')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        // Update existing session
        const { data, error } = await supabase
          .from('chat_storage')
          .update({
            messages: messages,
            title: title,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating chat session:', error);
          throw error;
        }

        console.log('Chat session updated successfully:', data.id);
        return data;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('chat_storage')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            messages: messages,
            title: title
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating chat session:', error);
          throw error;
        }

        console.log('Chat session created successfully:', data.id);
        return data;
      }
    } catch (error) {
      console.error('Failed to save chat session:', error);
      return null;
    }
  }

  /**
   * Load all chat sessions for the current user
   */
  static async loadChatSessions(): Promise<ChatSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated for chat sessions');
        return [];
      }

      console.log('Loading chat sessions for user:', user.email);

      const { data, error } = await supabase
        .from('chat_storage')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading chat sessions:', error);
        throw error;
      }

      console.log('Loaded chat sessions:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return [];
    }
  }

  /**
   * Load a specific chat session
   */
  static async loadChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated for chat session');
        return null;
      }

      const { data, error } = await supabase
        .from('chat_storage')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error loading chat session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load chat session:', error);
      return null;
    }
  }

  /**
   * Delete a chat session
   */
  static async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('chat_storage')
        .delete()
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error deleting chat session:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete chat session:', error);
      return false;
    }
  }

  /**
   * Update chat session title
   */
  static async updateChatTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('chat_storage')
        .update({ 
          title: title,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error updating chat title:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to update chat title:', error);
      return false;
    }
  }
}