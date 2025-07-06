import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useChatStore } from './chatStore';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string, username: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            throw error;
          }

          if (data.user && data.session) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
            });
            
          }
        } catch (error: any) {
          console.error('Sign in error:', error);
          throw new Error(error.message || 'Failed to sign in');
        } finally {
          set({ isLoading: false });
        }
      },

      signUpWithEmail: async (email: string, password: string, fullName: string, username: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                username: username,
              },
            },
          });

          if (error) {
            throw error;
          }

          // For demo purposes, we'll auto-confirm the user
          if (data.user) {
            // Simulate email confirmation for demo
            const { data: confirmData, error: confirmError } = await supabase.auth.verifyOtp({
              email,
              token: '123456', // Demo token
              type: 'signup'
            });
            
            if (!confirmError && confirmData.session) {
              set({
                user: confirmData.user,
                session: confirmData.session,
                isAuthenticated: true,
              });
            }
          }
        } catch (error: any) {
          console.error('Sign up error:', error);
          throw new Error(error.message || 'Failed to create account');
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (email: string, token: string) => {
        set({ isLoading: true });
        try {
          // For demo purposes, simulate successful OTP verification
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            set({
              user: session.user,
              session: session,
              isAuthenticated: true,
            });
          } else {
            throw new Error('No active session found');
          }
        } catch (error: any) {
          console.error('OTP verification error:', error);
          throw new Error(error.message || 'Invalid verification code');
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            throw error;
          }
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
          
        } catch (error: any) {
          console.error('Sign out error:', error);
          throw new Error(error.message || 'Failed to sign out');
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
          }

          if (session) {
            set({
              user: session.user,
              session: session,
              isAuthenticated: true,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
          }

          // Listen for auth state changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (session) {
              set({
                user: session.user,
                session: session,
                isAuthenticated: true,
              });
              
              // Initialize chat store when user signs in
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Reset and initialize chat store
                const chatStore = useChatStore.getState();
                chatStore.setInitialized(false);
                setTimeout(async () => {
                  await chatStore.initializeFromHistory();
                }, 500);
              }
            } else {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              });
              
              // Clear chat store when user signs out
              if (event === 'SIGNED_OUT') {
                const chatStore = useChatStore.getState();
                chatStore.setInitialized(false);
                chatStore.conversations = [];
                chatStore.activeConversationId = null;
              }
            }
          });
        } catch (error: any) {
          console.error('Auth initialization error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setSession: (session: Session | null) => {
        set({ 
          session,
          user: session?.user || null,
          isAuthenticated: !!session 
        });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        // Don't persist session/user as Supabase handles this
        // Only persist non-sensitive state if needed
      }),
    }
  )
);

// Initialize auth store on app start
useAuthStore.getState().initialize();