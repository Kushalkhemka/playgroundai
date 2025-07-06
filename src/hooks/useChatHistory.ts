import { useState, useEffect, useCallback } from 'react';
import { ChatHistoryService, type ChatHistoryEntry, type ChatHistoryFilter, type ChatStats } from '../services/chatHistoryService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface UseChatHistoryReturn {
  chatHistory: ChatHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  stats: ChatStats | null;
  recentSessions: string[];
  
  // Actions
  loadChatHistory: (filter?: ChatHistoryFilter) => Promise<void>;
  loadSessionHistory: (sessionId: string) => Promise<void>;
  loadRecentSessions: () => Promise<void>;
  loadStats: () => Promise<void>;
  searchHistory: (searchTerm: string, chatType?: 'text' | 'image' | 'knowledge_search') => Promise<void>;
  deleteChatEntry: (entryId: string) => Promise<void>;
  deleteSessionHistory: (sessionId: string) => Promise<void>;
  deleteAllHistory: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useChatHistory = (autoLoad: boolean = true): UseChatHistoryReturn => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<string[]>([]);
  
  const { isAuthenticated } = useAuthStore();

  const loadChatHistory = useCallback(async (filter?: ChatHistoryFilter) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const history = await ChatHistoryService.getChatHistory(filter);
      setChatHistory(history);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load chat history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadSessionHistory = useCallback(async (sessionId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const history = await ChatHistoryService.getSessionHistory(sessionId);
      setChatHistory(history);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load session history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadRecentSessions = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const sessions = await ChatHistoryService.getRecentSessions();
      setRecentSessions(sessions);
    } catch (err: any) {
      console.error('Failed to load recent sessions:', err);
    }
  }, [isAuthenticated]);

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const chatStats = await ChatHistoryService.getChatStats();
      setStats(chatStats);
    } catch (err: any) {
      console.error('Failed to load chat stats:', err);
    }
  }, [isAuthenticated]);

  const searchHistory = useCallback(async (searchTerm: string, chatType?: 'text' | 'image' | 'knowledge_search') => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await ChatHistoryService.searchChatHistory(searchTerm, chatType);
      setChatHistory(results);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search chat history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const deleteChatEntry = useCallback(async (entryId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const success = await ChatHistoryService.deleteChatEntry(entryId);
      if (success) {
        setChatHistory(prev => prev.filter(entry => entry.id !== entryId));
        toast.success('Chat entry deleted');
      } else {
        toast.error('Failed to delete chat entry');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete chat entry';
      toast.error(errorMessage);
    }
  }, [isAuthenticated]);

  const deleteSessionHistory = useCallback(async (sessionId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const success = await ChatHistoryService.deleteSessionHistory(sessionId);
      if (success) {
        setChatHistory(prev => prev.filter(entry => entry.session_id !== sessionId));
        setRecentSessions(prev => prev.filter(id => id !== sessionId));
        toast.success('Session history deleted');
      } else {
        toast.error('Failed to delete session history');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete session history';
      toast.error(errorMessage);
    }
  }, [isAuthenticated]);

  const deleteAllHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const success = await ChatHistoryService.deleteAllChatHistory();
      if (success) {
        setChatHistory([]);
        setRecentSessions([]);
        setStats(null);
        toast.success('All chat history deleted');
      } else {
        toast.error('Failed to delete chat history');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete chat history';
      toast.error(errorMessage);
    }
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadChatHistory(),
      loadRecentSessions(),
      loadStats()
    ]);
  }, [loadChatHistory, loadRecentSessions, loadStats]);

  // Auto-load on authentication
  useEffect(() => {
    if (isAuthenticated && autoLoad) {
      refresh();
    }
  }, [isAuthenticated, autoLoad, refresh]);

  return {
    chatHistory,
    isLoading,
    error,
    stats,
    recentSessions,
    loadChatHistory,
    loadSessionHistory,
    loadRecentSessions,
    loadStats,
    searchHistory,
    deleteChatEntry,
    deleteSessionHistory,
    deleteAllHistory,
    refresh
  };
};