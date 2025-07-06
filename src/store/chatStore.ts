import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Conversation, ModelConfig, ChatSettings, ApiKey } from '../types';
import { ChatHistoryService } from '../services/chatHistoryService';
import { ChatStorageService } from '../services/chatStorageService';
import { useAuthStore } from './authStore';

interface ChatStore {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  
  // RAG Session Management
  ragSessionId: string | null;
  
  // Chat History Sync
  isHistorySyncing: boolean;
  lastSyncTimestamp: number | null;
  isInitialized: boolean;
  
  // Chat Storage
  isChatStorageLoading: boolean;
  chatStorageError: string | null;
  
  // Models
  availableModels: ModelConfig[];
  selectedModels: string[];
  
  // Settings
  chatSettings: ChatSettings;
  apiKeys: ApiKey[];
  
  // UI State
  isLoading: boolean;
  
  // Actions
  createConversation: (model: string) => string;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  addMessageWithHistory: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>, sessionId?: string) => Promise<void>;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  addApiKey: (apiKey: ApiKey) => void;
  removeApiKey: (provider: string) => void;
  setSelectedModels: (models: string[]) => void;
  setLoading: (loading: boolean) => void;
  setHistorySyncing: (syncing: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setChatStorageLoading: (loading: boolean) => void;
  setChatStorageError: (error: string | null) => void;
  
  // RAG Actions
  generateRAGSessionId: () => string;
  getRagSessionId: () => string;
  clearRAGSession: () => void;
  
  // History Actions
  initializeFromHistory: () => Promise<void>;
  syncChatHistory: () => Promise<void>;
  restoreConversationsFromHistory: () => Promise<void>;
  loadChatSessionsFromStorage: () => Promise<void>;
  saveChatSessionToStorage: (conversationId: string) => Promise<void>;
  storeTextConversation: (prompt: string, response: string, model: string, sessionId?: string) => Promise<void>;
  storeImageGeneration: (prompt: string, imageUrls: string[], model: string, sessionId?: string) => Promise<void>;
  storeVideoGeneration: (prompt: string, videoUrls: string[], model: string, sessionId?: string) => Promise<void>;
  storeKnowledgeSearch: (query: string, results: any, sessionId?: string) => Promise<void>;
}

const defaultModels: ModelConfig[] = [
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    provider: 'RAG',
    color: 'purple',
    description: 'Search through uploaded documents and knowledge base',
    maxTokens: 4096,
    supportedFeatures: ['text', 'search', 'documents'],
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    color: 'gpt',
    description: 'Most capable model for complex tasks',
    maxTokens: 8192,
    supportedFeatures: ['text', 'code', 'analysis'],
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    color: 'gpt',
    description: 'Fast and efficient for most tasks',
    maxTokens: 4096,
    supportedFeatures: ['text', 'code'],
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    color: 'claude',
    description: 'Excellent for analysis and reasoning',
    maxTokens: 200000,
    supportedFeatures: ['text', 'code', 'analysis', 'long-context'],
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    color: 'claude',
    description: 'Balanced performance and speed',
    maxTokens: 200000,
    supportedFeatures: ['text', 'code', 'analysis'],
  },
  {
    id: 'palm-2',
    name: 'PaLM 2',
    provider: 'Google',
    color: 'palm',
    description: 'Advanced reasoning and multilingual',
    maxTokens: 8192,
    supportedFeatures: ['text', 'code', 'multilingual'],
  },
];

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      activeConversationId: null,
      ragSessionId: null,
      availableModels: defaultModels,
      selectedModels: ['gpt-4'],
      chatSettings: {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      apiKeys: [],
      isLoading: false,
      isHistorySyncing: false,
      lastSyncTimestamp: null,
      isInitialized: false,
      isChatStorageLoading: false,
      chatStorageError: null,

      // Actions
      createConversation: (model: string) => {
        const id = Date.now().toString();
        const conversation: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));

        return id;
      },

      addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const id = Date.now().toString();
        const fullMessage: Message = {
          ...message,
          id,
          timestamp: Date.now(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, fullMessage],
                  updatedAt: Date.now(),
                  title: conv.messages.length === 0 ? message.content.slice(0, 50) + '...' : conv.title,
                }
              : conv
          ),
        }));
      },

      addMessageWithHistory: async (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>, sessionId?: string) => {
        const state = get();
        
        // Add message to local state first
        state.addMessage(conversationId, message);
        
        // Save to chat storage after adding message
        try {
          await state.saveChatSessionToStorage(conversationId);
        } catch (error) {
          console.error('Failed to save to chat storage:', error);
        }
        
        // Store in chat history if user is authenticated
        try {
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            console.log('User not authenticated, skipping history storage');
            return;
          }
          
          const actualSessionId = sessionId || conversationId;
          
          if (message.role === 'user') {
            // Store user message - we'll store the complete conversation when we get the response
            return;
          }
          
          // For assistant messages, find the corresponding user message and store the conversation
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (conversation && conversation.messages.length >= 2) {
            const userMessage = conversation.messages[conversation.messages.length - 2];
            const assistantMessage = conversation.messages[conversation.messages.length - 1];
            
            if (userMessage.role === 'user' && assistantMessage.role === 'assistant') {
              console.log('Storing conversation:', userMessage.content.slice(0, 50));
              await state.storeTextConversation(
                userMessage.content,
                assistantMessage.content,
                assistantMessage.model || 'unknown',
                actualSessionId
              );
            }
          }
        } catch (error) {
          console.error('Failed to store chat history:', error);
          // Don't throw error to avoid breaking the chat flow
        }
      },

      updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      deleteConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },

      setActiveConversation: (id: string | null) => {
        set({ activeConversationId: id });
      },

      updateChatSettings: (settings: Partial<ChatSettings>) => {
        set((state) => ({
          chatSettings: { ...state.chatSettings, ...settings },
        }));
      },

      addApiKey: (apiKey: ApiKey) => {
        set((state) => ({
          apiKeys: [...state.apiKeys.filter((key) => key.provider !== apiKey.provider), apiKey],
        }));
      },

      removeApiKey: (provider: string) => {
        set((state) => ({
          apiKeys: state.apiKeys.filter((key) => key.provider !== provider),
        }));
      },

      setSelectedModels: (models: string[]) => {
        set({ selectedModels: models });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHistorySyncing: (syncing: boolean) => {
        set({ isHistorySyncing: syncing });
      },

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },

      setChatStorageLoading: (loading: boolean) => {
        set({ isChatStorageLoading: loading });
      },

      setChatStorageError: (error: string | null) => {
        set({ chatStorageError: error });
      },

      generateRAGSessionId: () => {
        const sessionId = `rag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({ ragSessionId: sessionId });
        return sessionId;
      },

      getRagSessionId: () => {
        const state = get();
        if (!state.ragSessionId) {
          return state.generateRAGSessionId();
        }
        return state.ragSessionId;
      },

      clearRAGSession: () => {
        set({ ragSessionId: null });
      },

      initializeFromHistory: async () => {
        const state = get();
        if (state.isInitialized) return;
        
        set({ isHistorySyncing: true });
        try {
          // Check if user is authenticated
          const authStore = useAuthStore.getState();
          if (!authStore.isAuthenticated) {
            console.log('User not authenticated, skipping history initialization');
            set({ isInitialized: true, isHistorySyncing: false });
            return;
          }

          console.log('Initializing chat history for user:', authStore.user?.email);
          
          // Clear existing conversations first
          set({ conversations: [], activeConversationId: null });
          
          // Load from chat storage first (newer system)
          await state.loadChatSessionsFromStorage();
          
          // Then load from chat history (legacy system) if no conversations loaded
          const currentState = get();
          if (currentState.conversations.length === 0) {
            await state.restoreConversationsFromHistory();
          }
          
          set({ isInitialized: true, isHistorySyncing: false });
          console.log('Chat history initialization completed');
        } catch (error) {
          console.error('Failed to initialize from history:', error);
          set({ isInitialized: true, isHistorySyncing: false });
        }
      },

      loadChatSessionsFromStorage: async () => {
        const state = get();
        state.setChatStorageLoading(true);
        state.setChatStorageError(null);
        
        try {
          console.log('Loading chat sessions from storage...');
          const chatSessions = await ChatStorageService.loadChatSessions();
          
          console.log('Retrieved chat sessions:', chatSessions.length);
          
          if (chatSessions.length === 0) {
            state.setChatStorageLoading(false);
            return;
          }

          // Convert chat sessions to conversations
          const conversations: Conversation[] = chatSessions.map(session => ({
            id: session.session_id,
            title: session.title,
            messages: session.messages || [],
            createdAt: new Date(session.created_at).getTime(),
            updatedAt: new Date(session.updated_at).getTime(),
            model: session.messages?.[0]?.model || 'gpt-4',
          }));
          
          // Sort conversations by update time (most recent first)
          conversations.sort((a, b) => b.updatedAt - a.updatedAt);
          
          console.log('Converted to conversations:', conversations.length);
          
          // Update store with loaded conversations
          set((state) => ({
            conversations: conversations,
            activeConversationId: conversations.length > 0 ? conversations[0].id : null,
          }));
          
          console.log(`Loaded ${conversations.length} conversations from chat storage`);
          
        } catch (error) {
          console.error('Failed to load chat sessions from storage:', error);
          state.setChatStorageError(error instanceof Error ? error.message : 'Failed to load chat sessions');
        } finally {
          state.setChatStorageLoading(false);
        }
      },

      saveChatSessionToStorage: async (conversationId: string) => {
        const state = get();
        const conversation = state.conversations.find(c => c.id === conversationId);
        
        if (!conversation) {
          console.warn('Conversation not found for storage:', conversationId);
          return;
        }

        try {
          console.log('Saving conversation to storage:', conversationId);
          await ChatStorageService.saveChatSession(
            conversation.id,
            conversation.messages,
            conversation.title
          );
          console.log('Conversation saved successfully');
        } catch (error) {
          console.error('Failed to save conversation to storage:', error);
          state.setChatStorageError(error instanceof Error ? error.message : 'Failed to save conversation');
        }
      },

      restoreConversationsFromHistory: async () => {
        try {
          console.log('Fetching chat history from Supabase...');
          // Get recent chat history grouped by session
          const chatHistory = await ChatHistoryService.getChatHistory({ limit: 100 });
          
          console.log('Retrieved chat history entries:', chatHistory.length);
          
          if (chatHistory.length === 0) return;

          // Group by session_id to reconstruct conversations
          const sessionGroups: Record<string, typeof chatHistory> = {};
          chatHistory.forEach(entry => {
            if (!sessionGroups[entry.session_id]) {
              sessionGroups[entry.session_id] = [];
            }
            sessionGroups[entry.session_id].push(entry);
          });

          console.log('Grouped into sessions:', Object.keys(sessionGroups).length);

          // Convert sessions to conversations
          const restoredConversations: Conversation[] = [];
          
          Object.entries(sessionGroups).forEach(([sessionId, entries]) => {
            // Sort entries by timestamp
            entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            const messages: Message[] = [];
            let conversationTitle = 'Restored Conversation';
            let model = 'gpt-4';
            
            entries.forEach((entry, index) => {
              if (entry.chat_type === 'text') {
                const content = entry.message_content;
                
                // Add user message
                if (content.prompt) {
                  messages.push({
                    id: `${entry.id}_user`,
                    content: content.prompt,
                    role: 'user',
                    timestamp: new Date(entry.timestamp).getTime(),
                  });
                  
                  // Set title from first user message
                  if (index === 0) {
                    conversationTitle = content.prompt.slice(0, 50) + (content.prompt.length > 50 ? '...' : '');
                  }
                }
                
                // Add assistant message
                if (content.response) {
                  messages.push({
                    id: `${entry.id}_assistant`,
                    content: content.response,
                    role: 'assistant',
                    timestamp: new Date(entry.timestamp).getTime() + 1000, // Slight offset
                    model: content.model || model,
                    metadata: entry.metadata,
                  });
                  
                  model = content.model || model;
                }
              } else if (entry.chat_type === 'knowledge_search') {
                const content = entry.message_content;
                
                // Add user query
                if (content.query) {
                  messages.push({
                    id: `${entry.id}_user`,
                    content: content.query,
                    role: 'user',
                    timestamp: new Date(entry.timestamp).getTime(),
                  });
                  
                  if (index === 0) {
                    conversationTitle = content.query.slice(0, 50) + (content.query.length > 50 ? '...' : '');
                  }
                }
                
                // Add search results
                if (content.results) {
                  const resultText = typeof content.results === 'string' 
                    ? content.results 
                    : content.results.answer || JSON.stringify(content.results);
                    
                  messages.push({
                    id: `${entry.id}_assistant`,
                    content: resultText,
                    role: 'assistant',
                    timestamp: new Date(entry.timestamp).getTime() + 1000,
                    model: 'knowledge-base',
                    metadata: entry.metadata,
                  });
                }
              } else if (entry.chat_type === 'image') {
                const content = entry.message_content;
                
                // Add user message (prompt)
                if (content.prompt) {
                  messages.push({
                    id: `${entry.id}_user`,
                    content: content.prompt,
                    role: 'user',
                    timestamp: new Date(entry.timestamp).getTime(),
                  });
                  
                  // Set title from first user message
                  if (index === 0) {
                    conversationTitle = content.prompt.slice(0, 50) + (content.prompt.length > 50 ? '...' : '');
                  }
                }
                
                // Add assistant message with image metadata
                if (content.image_urls && Array.isArray(content.image_urls)) {
                  messages.push({
                    id: `${entry.id}_assistant`,
                    content: `Generated ${content.image_count || content.image_urls.length} image${(content.image_count || content.image_urls.length) > 1 ? 's' : ''} based on your prompt.`,
                    role: 'assistant',
                    timestamp: new Date(entry.timestamp).getTime() + 1000,
                    model: content.model || model,
                    metadata: {
                      ...entry.metadata,
                      image_urls: content.image_urls,
                      image_count: content.image_count || content.image_urls.length,
                      tokens: 0,
                      responseTime: 1000,
                      quality: 0.95,
                    },
                  });
                  
                  model = content.model || model;
                }
              } else if (entry.chat_type === 'video') {
                const content = entry.message_content;
                
                // Add user message (prompt)
                if (content.prompt) {
                  messages.push({
                    id: `${entry.id}_user`,
                    content: content.prompt,
                    role: 'user',
                    timestamp: new Date(entry.timestamp).getTime(),
                  });
                  
                  // Set title from first user message
                  if (index === 0) {
                    conversationTitle = content.prompt.slice(0, 50) + (content.prompt.length > 50 ? '...' : '');
                  }
                }
                
                // Add assistant message with video metadata
                if (content.video_urls && Array.isArray(content.video_urls)) {
                  messages.push({
                    id: `${entry.id}_assistant`,
                    content: `Generated ${content.video_count || content.video_urls.length} video${(content.video_count || content.video_urls.length) > 1 ? 's' : ''} based on your prompt.`,
                    role: 'assistant',
                    timestamp: new Date(entry.timestamp).getTime() + 1000,
                    model: content.model || model,
                    metadata: {
                      ...entry.metadata,
                      video_urls: content.video_urls,
                      video_count: content.video_count || content.video_urls.length,
                      tokens: 0,
                      responseTime: 3000,
                      quality: 0.95,
                    },
                  });
                  
                  model = content.model || model;
                }
              }
            });
            
            if (messages.length > 0) {
              const conversation: Conversation = {
                id: sessionId,
                title: conversationTitle,
                messages,
                createdAt: new Date(entries[0].timestamp).getTime(),
                updatedAt: new Date(entries[entries.length - 1].timestamp).getTime(),
                model,
              };
              
              restoredConversations.push(conversation);
            }
          });
          
          // Sort conversations by update time (most recent first)
          restoredConversations.sort((a, b) => b.updatedAt - a.updatedAt);
          
          console.log('Restored conversations:', restoredConversations.length);
          
          // Update store with restored conversations
          set((state) => ({
            conversations: restoredConversations,
            activeConversationId: restoredConversations.length > 0 ? restoredConversations[0].id : null,
          }));
          
          console.log(`Restored ${restoredConversations.length} conversations from chat history`);
          
        } catch (error) {
          console.error('Failed to restore conversations from history:', error);
        }
      },

      syncChatHistory: async () => {
        const state = get();
        if (state.isHistorySyncing) return;
        
        state.setHistorySyncing(true);
        try {
          await state.restoreConversationsFromHistory();
          set({ lastSyncTimestamp: Date.now() });
        } catch (error) {
          console.error('Failed to sync chat history:', error);
        } finally {
          state.setHistorySyncing(false);
        }
      },

      storeTextConversation: async (prompt: string, response: string, model: string, sessionId?: string) => {
        try {
          const actualSessionId = sessionId || get().getRagSessionId();
          await ChatHistoryService.storeTextConversation(prompt, response, model, actualSessionId);
        } catch (error) {
          console.error('Failed to store text conversation:', error);
        }
      },

      storeImageGeneration: async (prompt: string, imageUrls: string[], model: string, sessionId?: string) => {
        try {
          const actualSessionId = sessionId || get().getRagSessionId();
          await ChatHistoryService.storeImageGeneration(prompt, imageUrls, model, actualSessionId, {
            image_count: imageUrls.length,
            image_urls: imageUrls
          });
        } catch (error) {
          console.error('Failed to store image generation:', error);
        }
      },

      storeKnowledgeSearch: async (query: string, results: any, sessionId?: string) => {
        try {
          const actualSessionId = sessionId || get().getRagSessionId();
          await ChatHistoryService.storeKnowledgeSearch(query, results, actualSessionId);
        } catch (error) {
          console.error('Failed to store knowledge search:', error);
        }
      },

      storeVideoGeneration: async (prompt: string, videoUrls: string[], model: string, sessionId?: string) => {
        try {
          const actualSessionId = sessionId || get().getRagSessionId();
          await ChatHistoryService.storeVideoGeneration(prompt, videoUrls, model, actualSessionId, {
            video_count: videoUrls.length,
            video_urls: videoUrls
          });
        } catch (error) {
          console.error('Failed to store video generation:', error);
        }
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
        ragSessionId: state.ragSessionId,
        chatSettings: state.chatSettings,
        apiKeys: state.apiKeys,
        selectedModels: state.selectedModels,
        lastSyncTimestamp: state.lastSyncTimestamp,
        isInitialized: state.isInitialized,
        isChatStorageLoading: false,
        chatStorageError: null,
      }),
    }
  )
);