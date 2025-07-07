"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    Bot,
    User,
    RotateCcw,
    MessageSquare,
    Trash2,
    Edit3,
    Search,
    Menu,
    ChevronLeft,
    Database,
    Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { useAuthStore } from '@/store/authStore';
import { AuthFlow } from './auth-flow';
import { A4FApiService, StreamingMessage } from "../../services/a4fApi";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardCanvas } from "./animated-glow-card";
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import { FileUpload } from './file-upload';
import { ModelSelector } from './model-selector';
import type { Model, ImageModel } from './model-selector';
import { IMAGE_MODELS, MODELS } from './model-selector';
import { ImageApiService } from '../../services/imageApi';
import { RAGApiService } from '../../services/ragApi';
import { VideoApiService } from '../../services/videoApi';
import { useChatStore } from '../../store/chatStore';
import { AnimatedGlowingBorder } from "./animated-glowing-border";
import GradientButton from "@/components/ui/button-1";
import { ChatStorageService } from '../../services/chatStorageService';
import { ChatHistoryService } from '../../services/chatHistoryService';
import type { Model as A4FModel } from "../../services/a4fApi";
import { GlowEffect } from '@/components/ui/glow-effect';
import { uploadImageToSupabase } from '../../services/supabaseStorageService';

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div 
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

// OpenAI Logo Component
const OpenAILogo = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
      fill="currentColor"
    />
  </svg>
);

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
  videoUrls?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// Custom Markdown Components
const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        className="rounded-lg !bg-gray-900 !mt-2 !mb-2"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-gray-800 text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold text-white/95 mt-6 mb-4 border-b border-white/10 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold text-white/90 mt-5 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-medium text-white/85 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-white/80 leading-relaxed mb-3">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside text-white/80 mb-3 space-y-1">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside text-white/80 mb-3 space-y-1">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-white/80">
      {children}
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-white/20 pl-4 italic text-white/70 my-4">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-white/20 rounded-lg">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border border-white/20 px-3 py-2 bg-white/5 text-white/90 font-medium text-left">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-white/20 px-3 py-2 text-white/80">
      {children}
    </td>
    ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-white/95">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-white/85">
      {children}
    </em>
  ),
  a: ({ children, href }: any) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: any) => (
    <div className="relative inline-block align-middle w-full max-w-md my-4">
      <GlowEffect
        className="z-0 rounded-lg"
        mode="rotate"
        blur="medium"
        scale={1.08}
        colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
      />
      <img
        src={src}
        alt={alt}
        className="relative z-10 w-full rounded-lg shadow-lg border border-white/10"
        style={{ display: 'block' }}
      />
    </div>
  ),
};

export function AnimatedAIChat() {
    const { isAuthenticated, initialize } = useAuthStore();
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<Array<{type: 'image' | 'file', url: string, name: string, file?: File}>>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentAssistantMessage, setCurrentAssistantMessage] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedModel, setSelectedModel] = useState<Model | ImageModel>('provider-5/gpt-4o');
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [isRAGMode, setIsRAGMode] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <ImageIcon className="w-4 h-4" />, 
            label: "Generate Image", 
            description: "Create an image from text", 
            prefix: "/image" 
        },
        { 
            icon: <Video className="w-4 h-4" />, 
            label: "Generate Video", 
            description: "Create a video from text", 
            prefix: "/video" 
        },
        { 
            icon: <Figma className="w-4 h-4" />, 
            label: "Import Figma", 
            description: "Import a design from Figma", 
            prefix: "/figma" 
        },
        { 
            icon: <MonitorIcon className="w-4 h-4" />, 
            label: "Create Page", 
            description: "Generate a new web page", 
            prefix: "/page" 
        },
        { 
            icon: <Sparkles className="w-4 h-4" />, 
            label: "Improve", 
            description: "Improve existing UI design", 
            prefix: "/improve" 
        },
        { 
            icon: <Database className="w-4 h-4" />, 
            label: "Search Knowledge Base", 
            description: "Query the knowledge base", 
            prefix: "/rag" 
        },
    ];

    const currentSession = chatSessions.find(session => session.id === currentSessionId);
    const showChat = currentSession && currentSession.messages.length > 0;

    const filteredSessions = chatSessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.messages.some(msg => 
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!isAuthenticated) {
            setShowAuth(true);
        } else {
            setShowAuth(false);
        }
    }, [isAuthenticated]);

    // Load existing chat sessions from Supabase
    useEffect(() => {
        const loadChatSessions = async () => {
            if (isAuthenticated) {
                try {
                    const sessions = await ChatStorageService.loadChatSessions();
                    // Convert ChatStorageService format to local format
                    const convertedSessions: ChatSession[] = sessions.map(session => ({
                        id: session.session_id,
                        title: session.title,
                        messages: session.messages || [],
                        createdAt: new Date(session.created_at).getTime(),
                        updatedAt: new Date(session.updated_at).getTime(),
                    }));
                    setChatSessions(convertedSessions);
                    console.log('Loaded chat sessions from Supabase:', convertedSessions.length);
                } catch (error) {
                    console.error('Failed to load chat sessions:', error);
                }
            }
        };

        loadChatSessions();
    }, [isAuthenticated]);

    const handleAuthSuccess = () => {
        setShowAuth(false);
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentSession?.messages, currentAssistantMessage]);

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const createNewSession = async () => {
        const newSessionId = Date.now().toString();
        const newSession: ChatSession = {
            id: newSessionId,
            title: "New Chat",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        
        // Add to local state immediately for UI responsiveness
        setChatSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSessionId);
        
        // Save to Supabase
        if (isAuthenticated) {
            try {
                await ChatStorageService.saveChatSession(newSessionId, [], "New Chat");
                console.log('New session saved to Supabase:', newSessionId);
            } catch (error) {
                console.error('Failed to save new session to Supabase:', error);
            }
        }
        
        return newSessionId;
    };

    const updateSessionTitle = async (sessionId: string, firstMessage: string) => {
        const newTitle = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
        
        // Update local state immediately for UI responsiveness
        setChatSessions(prev => prev.map(session => 
            session.id === sessionId 
                ? { ...session, title: newTitle }
                : session
        ));
        
        // Update title in Supabase
        if (isAuthenticated) {
            try {
                await ChatStorageService.updateChatTitle(sessionId, newTitle);
                console.log('Session title updated in Supabase:', sessionId, newTitle);
            } catch (error) {
                console.error('Failed to update session title in Supabase:', error);
            }
        }
    };

    const deleteSession = async (sessionId: string) => {
        // Remove from local state immediately for UI responsiveness
        setChatSessions(prev => prev.filter(session => session.id !== sessionId));
        if (currentSessionId === sessionId) {
            setCurrentSessionId(null);
        }
        
        // Delete from Supabase
        if (isAuthenticated) {
            try {
                await ChatStorageService.deleteChatSession(sessionId);
                console.log('Session deleted from Supabase:', sessionId);
            } catch (error) {
                console.error('Failed to delete session from Supabase:', error);
            }
        }
    };

    const handleFileUpload = (url: string, file: File) => {
        const fileType = file.type.startsWith('image/') ? 'image' : 'file';
        setAttachments(prev => [...prev, {
            type: fileType,
            url,
            name: file.name,
            file
        }]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => {
            const attachment = prev[index];
            if (attachment.url.startsWith('blob:')) {
                URL.revokeObjectURL(attachment.url);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleImageGeneration = async (prompt: string): Promise<string> => {
        try {
            const response = await ImageApiService.generateImage({
                model: selectedModel as ImageModel,
                prompt: prompt.replace('/image ', ''),
                n: 1,
                size: '1024x1024'
            });

            if (response.data && response.data.length > 0) {
                const imageUrl = response.data[0].url;
                // Download the image as a blob
                const imageResponse = await fetch(imageUrl);
                if (!imageResponse.ok) {
                    throw new Error('Failed to download generated image.');
                }
                const imageBlob = await imageResponse.blob();

                // Get user and session info for upload
                const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
                if (!user) {
                    throw new Error('User not authenticated for image upload.');
                }
                let sessionId = currentSessionId;
                if (!sessionId) {
                    sessionId = await createNewSession();
                }
                // Upload to Supabase storage
                const supabaseImageUrl = await uploadImageToSupabase(imageBlob, user.id, sessionId);

                return `I've generated an image for you based on your prompt: "${prompt.replace('/image ', '')}"
\n![Generated Image](${supabaseImageUrl})`;
            } else {
                return 'Sorry, no image was generated. Please try again.';
            }
        } catch (error) {
            console.error('Image generation error:', error);
            return 'Sorry, I encountered an error while generating the image. Please try again.';
        }
    };

    const handleVideoGeneration = async (prompt: string): Promise<string> => {
        try {
            const cleanPrompt = prompt.replace('/video ', '');
            // Call the actual video generation API
            const response = await VideoApiService.generateVideo({
                model: 'provider-6/wan-2.1',
                prompt: cleanPrompt,
                ratio: '9:16',
                quality: '720p',
                duration: 8
            });

            if (response.data && response.data.length > 0) {
                const videoUrls = response.data.map(video => video.url);
                // Store video generation in chat history
                const { storeVideoGeneration, getRagSessionId } = useChatStore.getState();
                const sessionId = getRagSessionId();
                await storeVideoGeneration(cleanPrompt, videoUrls, 'provider-6/wan-2.1', sessionId);
                // Create video HTML for each generated video
                const videoElements = videoUrls.map(url => 
                    `<video controls style="max-width: 100%; height: auto; margin: 10px 0;">\n  <source src="${url}" type="video/mp4">\n  Your browser does not support the video tag.\n</video>`
                ).join('\n\n');
                return `I've generated ${videoUrls.length} video${videoUrls.length > 1 ? 's' : ''} for you based on your prompt: "${cleanPrompt}"\n\n${videoElements}`;
            } else {
                return 'Sorry, no video was generated. Please try again.';
            }
        } catch (error) {
            console.error('Video generation error:', error);
            let message = 'Sorry, I encountered an error while generating the video. Please try again.';
            if (error instanceof Error) {
                message = `Sorry, I encountered an error while generating the video: ${error.message}. Please try again.`;
            }
            return message;
        }
    };

    const handleRAGQuery = async (query: string) => {
        if (!query.trim()) return;

        let sessionId = currentSessionId;
        if (!sessionId) {
            sessionId = await createNewSession();
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: query.trim(),
            timestamp: Date.now(),
        };

        // Add user message to session
        setChatSessions(prev => prev.map(session => 
            session.id === sessionId 
                ? { 
                    ...session, 
                    messages: [...session.messages, userMessage],
                    updatedAt: Date.now()
                }
                : session
        ));

        // Update title if this is the first message
        if (!currentSession || currentSession.messages.length === 0) {
            await updateSessionTitle(sessionId, userMessage.content);
        }

        setValue("");
        adjustHeight(true);
        setIsRAGMode(false);
        setIsTyping(true);

        try {
            const response = await RAGApiService.queryKnowledgeBase(query.replace('/rag ', ''), sessionId);
            
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.answer,
                timestamp: Date.now(),
                model: "knowledge-base",
            };

            // Save to Supabase
            await saveSessionToSupabase(sessionId, [...currentSession?.messages || [], userMessage, assistantMessage]);

            setChatSessions(prev => prev.map(session => 
                session.id === sessionId 
                    ? { 
                        ...session, 
                        messages: [...session.messages, assistantMessage],
                        updatedAt: Date.now()
                    }
                    : session
            ));
        } catch (error) {
            console.error('Error querying knowledge base:', error);
            let message = 'Sorry, I encountered an error while searching the knowledge base. Please try again.';
            if (error instanceof Error) {
                message = `Sorry, I encountered an error while searching the knowledge base: ${error.message}. Please try again.`;
            }
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: message,
                timestamp: Date.now(),
                model: "knowledge-base",
            };
            
            // Save to Supabase
            await saveSessionToSupabase(sessionId, [...currentSession?.messages || [], userMessage, errorMessage]);
            
            setChatSessions(prev => prev.map(session => 
                session.id === sessionId 
                    ? { 
                        ...session, 
                        messages: [...session.messages, errorMessage],
                        updatedAt: Date.now()
                    }
                    : session
            ));
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                    
                    if (selectedCommand.prefix === '/rag') {
                        setIsRAGMode(true);
                    }
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    // Helper function to save session to Supabase
    const saveSessionToSupabase = async (sessionId: string, messages: ChatMessage[]) => {
        if (isAuthenticated) {
            try {
                const currentSession = chatSessions.find(s => s.id === sessionId);
                const title = currentSession?.title || "New Chat";
                await ChatStorageService.saveChatSession(sessionId, messages, title);
                console.log('Session saved to Supabase:', sessionId);
            } catch (error) {
                console.error('Failed to save session to Supabase:', error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!value.trim() || isTyping) return;

        const messageContent = value.trim();
        let assistantContent = ""; // Declare at function level

        // Check if it's a RAG query
        if (messageContent.startsWith('/rag ') || isRAGMode) {
            await handleRAGQuery(messageContent);
            return;
        }

        let sessionId = currentSessionId;
        if (!sessionId) {
            sessionId = await createNewSession();
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageContent,
            timestamp: Date.now(),
            attachments: attachments.length > 0 ? attachments.map(att => ({
                type: att.type,
                url: att.url,
                name: att.name
            })) : undefined,
        };

        // Add user message to session
        setChatSessions(prev => prev.map(session => 
            session.id === sessionId 
                ? { 
                    ...session, 
                    messages: [...session.messages, userMessage],
                    updatedAt: Date.now()
                }
                : session
        ));

        // Update title if this is the first message
        if (!currentSession || currentSession.messages.length === 0) {
            await updateSessionTitle(sessionId, userMessage.content);
        }

        setValue("");
        adjustHeight(true);
        setAttachments([]);
        setIsTyping(true);
        setCurrentAssistantMessage("");

        try {
            // Check if it's an image generation command
            if (messageContent.startsWith('/image ')) {
                try {
                    assistantContent = await handleImageGeneration(messageContent);
                    
                    const assistantMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: assistantContent,
                        timestamp: Date.now(),
                    };
                    
                    await saveSessionToSupabase(sessionId, [...currentSession?.messages || [], userMessage, assistantMessage]);
                    
                    setChatSessions(prev => prev.map(session => 
                        session.id === sessionId 
                            ? { 
                                ...session, 
                                messages: [...session.messages, assistantMessage],
                                updatedAt: Date.now()
                            }
                            : session
                    ));
                    setIsTyping(false);
                    return;
                } catch (error) {
                    assistantContent = "Sorry, I encountered an error while generating the image. Please try again.";
                }
            } else if (messageContent.startsWith('/video ')) {
                try {
                    assistantContent = await handleVideoGeneration(messageContent);
                    
                    const assistantMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: assistantContent,
                        timestamp: Date.now(),
                    };
                    
                    await saveSessionToSupabase(sessionId, [...currentSession?.messages || [], userMessage, assistantMessage]);
                    
                    setChatSessions(prev => prev.map(session => 
                        session.id === sessionId 
                            ? { 
                                ...session, 
                                messages: [...session.messages, assistantMessage],
                                updatedAt: Date.now()
                            }
                            : session
                    ));
                    setIsTyping(false);
                    return;
                } catch (error) {
                    assistantContent = "Sorry, I encountered an error while generating the video. Please try again.";
                }
            } else {
                // Regular chat message
                // Check if the selected model is an image generation model
                if (IMAGE_MODELS.includes(selectedModel as ImageModel)) {
                    // If user didn't use /image command but selected an image model, 
                    // treat it as an image generation request
                    try {
                        assistantContent = await handleImageGeneration(`/image ${messageContent}`);
                        
                        const assistantMessage: ChatMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: assistantContent,
                            timestamp: Date.now(),
                        };
                        
                        await saveSessionToSupabase(sessionId, [...currentSession?.messages || [], userMessage, assistantMessage]);
                        
                        setChatSessions(prev => prev.map(session => 
                            session.id === sessionId 
                                ? { 
                                    ...session, 
                                    messages: [...session.messages, assistantMessage],
                                    updatedAt: Date.now()
                                }
                                : session
                        ));
                        setIsTyping(false);
                        return;
                    } catch (error) {
                        assistantContent = "Sorry, I encountered an error while generating the image. Please try again.";
                    }
                } else {
                    // Use chat completion API for chat models
                    const session = chatSessions.find(s => s.id === sessionId);
                    const apiMessages: StreamingMessage[] = [
                        ...(session?.messages || []).map(msg => ({ role: msg.role, content: msg.content })),
                        { role: 'user', content: messageContent }
                    ];

                    // Ensure selectedModel is a chat model, not an image model
                    const validA4FModels: A4FModel[] = [
                        'provider-1/chatgpt-4o-latest',
                        'provider-5/gpt-4o',
                        'provider-5/gpt-4o-mini',
                        'provider-5/o1-preview',
                        'provider-5/o1-mini',
                        'provider-2/claude-3-5-sonnet-20241022',
                        'provider-2/claude-3-5-haiku-20241022',
                        'provider-3/llama-3.1-405b-instruct',
                        'provider-3/llama-3.1-70b-instruct',
                        'provider-4/gemini-1.5-pro-002',
                        'provider-4/gemini-1.5-flash-002'
                    ];
                    const chatModel: A4FModel = validA4FModels.includes(selectedModel as A4FModel) ? selectedModel as A4FModel : 'provider-5/gpt-4o';

                    await A4FApiService.streamResponse(
                        apiMessages,
                        (chunk: string) => {
                            assistantContent += chunk;
                            setCurrentAssistantMessage(assistantContent);
                        },
                        async () => {
                            // On completion, add the final message
                            const assistantMessage: ChatMessage = {
                                id: (Date.now() + 1).toString(),
                                role: 'assistant',
                                content: assistantContent,
                                timestamp: Date.now(),
                            };
                            
                            await saveSessionToSupabase(sessionId, [...session?.messages || [], userMessage, assistantMessage]);
                            
                            setChatSessions(prev => prev.map(session => 
                                session.id === sessionId 
                                    ? { 
                                        ...session, 
                                        messages: [...session.messages, assistantMessage],
                                        updatedAt: Date.now()
                                    }
                                    : session
                            ));
                            setCurrentAssistantMessage("");
                            setIsTyping(false);
                        },
                        async (error: Error) => {
                            console.error('Streaming error:', error);
                            const errorMessage: ChatMessage = {
                                id: (Date.now() + 1).toString(),
                                role: 'assistant',
                                content: 'Sorry, I encountered an error while processing your request. Please try again.',
                                timestamp: Date.now(),
                            };
                            
                            await saveSessionToSupabase(sessionId, [...session?.messages || [], userMessage, errorMessage]);
                            
                            setChatSessions(prev => prev.map(session => 
                                session.id === sessionId 
                                    ? { 
                                        ...session, 
                                        messages: [...session.messages, errorMessage],
                                        updatedAt: Date.now()
                                    }
                                    : session
                            ));
                            setCurrentAssistantMessage("");
                            setIsTyping(false);
                        },
                        chatModel
                    );
                    return;
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            assistantContent = "Sorry, I encountered an error while processing your request. Please try again.";
        }

        // Add error message if we reach here
        const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: assistantContent,
            timestamp: Date.now(),
        };
        
        await saveSessionToSupabase(sessionId, [...currentSession?.messages || [], userMessage, assistantMessage]);
        
        setChatSessions(prev => prev.map(session => 
            session.id === sessionId 
                ? { 
                    ...session, 
                    messages: [...session.messages, assistantMessage],
                    updatedAt: Date.now()
                }
                : session
        ));
        setIsTyping(false);
    };

    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
        
        if (selectedCommand.prefix === '/rag') {
            setIsRAGMode(true);
        }
        
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    // Handle authentication state - render auth flow if not authenticated
    if (showAuth) {
        return <AuthFlow onSuccess={handleAuthSuccess} />;
    }

    return (
        <div className="min-h-screen flex w-full bg-black text-white relative overflow-hidden">
            {/* Background Effects - Always Present */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>

            {/* Mouse Follow Effect */}
            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="w-80 bg-black/50 backdrop-blur-xl border-r border-white/10 flex flex-col relative z-20"
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white/90">Chat History</h2>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors lg:hidden"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                            </div>
                            
                            {/* New Chat Button */}
                            <button
                                onClick={createNewSession}
                                className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white/95 transition-all"
                            >
                                <PlusIcon size={16} />
                                <span className="text-sm font-medium">New Chat</span>
                            </button>

                            {/* Search */}
                            <div className="relative mt-3">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Chat Sessions List */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-2">
                                {filteredSessions.length > 0 ? (
                                    <div className="space-y-1">
                                        {filteredSessions.map((session) => (
                                            <motion.div
                                                key={session.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn(
                                                    "group relative p-3 rounded-lg cursor-pointer transition-all",
                                                    currentSessionId === session.id
                                                        ? "bg-white/10 border border-white/20"
                                                        : "hover:bg-white/5"
                                                )}
                                                onClick={() => setCurrentSessionId(session.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <MessageSquare size={16} className="text-white/60 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-white/90 truncate pr-6">
                                                            {session.title}
                                                        </div>
                                        <div className="text-xs text-white/50 mt-1">
                                            {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                                        </div>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // TODO: Implement edit functionality
                                            }}
                                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
                                        >
                                            <Edit3 size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSession(session.id);
                                            }}
                                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-red-400"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-center text-white/40 text-sm">
                        No chats found
                    </div>
                )}
            </div>
        </div>
    </motion.div>
)}
            </AnimatePresence>

            {/* Mobile Sidebar Toggle */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-30 p-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg text-white/60 hover:text-white/90 transition-colors lg:hidden"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-10">
                {/* Chat Messages */}
                <AnimatePresence>
                    {showChat && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 overflow-y-auto pt-8 pb-4 px-6"
                        >
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Messages */}
                                {currentSession?.messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            message.role === 'user' 
                                                ? 'bg-white/10 backdrop-blur-sm' 
                                                : 'bg-black backdrop-blur-sm border border-white/20'
                                        }`}>
                                            {message.role === 'user' ? (
                                                <User size={16} className="text-white/90" />
                                            ) : message.model === "knowledge-base" ? (
                                                <Database size={16} className="text-white" />
                                            ) : (
                                                <OpenAILogo size={16} className="text-white" />
                                            )}
                                        </div>
                                        <div className={`max-w-[75%] p-4 rounded-2xl backdrop-blur-xl ${
                                            message.role === 'user'
                                                ? 'bg-white/[0.08] border border-white/[0.12] text-white/95'
                                                : 'bg-white/[0.04] border border-white/[0.08] text-white/90'
                                        }`}>
                                            {/* Attachments */}
                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className="mb-3 space-y-2">
                                                    {message.attachments.map((attachment, index) => (
                                                        <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                                                            {attachment.type === 'image' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <ImageIcon size={16} />
                                                                    <img 
                                                                        src={attachment.url} 
                                                                        alt={attachment.name}
                                                                        className="max-w-xs rounded-lg"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <FileUp size={16} />
                                                                    <span>{attachment.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {message.role === 'assistant' ? (
                                                <div className="prose prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={MarkdownComponents}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {message.content}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Current streaming message */}
                                {currentAssistantMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-8 h-8 bg-black backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <OpenAILogo size={16} className="text-white" />
                                        </div>
                                        <div className="max-w-[75%] p-4 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] text-white/90">
                                            <div className="prose prose-invert max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={MarkdownComponents}
                                                >
                                                    {currentAssistantMessage}
                                                </ReactMarkdown>
                                                <motion.span 
                                                    className="inline-block w-2 h-4 bg-white/60 ml-1"
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Welcome Screen or Input Area */}
                <div className={cn(
                    "flex flex-col items-center justify-center relative z-10 transition-all duration-700 ease-out",
                    showChat ? "py-6" : "flex-1 py-6"
                )}>
                    <div className="w-full max-w-2xl mx-auto px-6">
                        {/* Welcome Header - Only show when not in chat mode */}
                        <AnimatePresence>
                            {!showChat && (
                                <motion.div 
                                    className="text-center space-y-6 mb-12"
                                    initial={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="inline-block"
                                    >
                                        <h1 className="text-4xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                                            How can I help today?
                                        </h1>
                                        <motion.div 
                                            className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2"
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: "100%", opacity: 1 }}
                                            transition={{ delay: 0.5, duration: 0.8 }}
                                        />
                                    </motion.div>
                                    <motion.p 
                                        className="text-white/50 text-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Type a command or ask a question
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <motion.div 
                            className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                            animate={{
                                scale: showChat ? 0.95 : 1,
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <AnimatePresence>
                                {showCommandPalette && (
                                    <motion.div 
                                        ref={commandPaletteRef}
                                        className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div className="py-1 bg-black/95">
                                            {commandSuggestions.map((suggestion, index) => (
                                                <motion.div
                                                    key={suggestion.prefix}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                                                        activeSuggestion === index 
                                                            ? "bg-white/10 text-white" 
                                                            : "text-white/70 hover:bg-white/5"
                                                    )}
                                                    onClick={() => selectCommandSuggestion(index)}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <div className="w-5 h-5 flex items-center justify-center text-white/60">
                                                        {suggestion.icon}
                                                    </div>
                                                    <div className="font-medium">{suggestion.label}</div>
                                                    <div className="text-white/40 text-xs ml-1">
                                                        {suggestion.prefix}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* RAG Mode Indicator */}
                            {isRAGMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-8 left-0 flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20"
                                >
                                    <Database size={12} />
                                    Knowledge Base Search Mode
                                </motion.div>
                            )}

                            <div className="p-4">
                                <Textarea
                                    ref={textareaRef}
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e.target.value);
                                        adjustHeight();
                                    }}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    placeholder={isRAGMode ? "Search the knowledge base..." : showChat ? "Continue the conversation..." : "Ask me anything..."}
                                    containerClassName="w-full"
                                    className={cn(
                                        "w-full px-4 py-3",
                                        "resize-none",
                                        "bg-transparent",
                                        "border-none",
                                        "text-white/90 text-sm",
                                        "focus:outline-none",
                                        "placeholder:text-white/30",
                                        "min-h-[60px]"
                                    )}
                                    style={{
                                        overflow: "hidden",
                                    }}
                                    showRing={false}
                                    disabled={isTyping}
                                />
                            </div>

                            {/* Attachments Display */}
                            <AnimatePresence>
                                {attachments.length > 0 && (
                                    <motion.div 
                                        className="px-4 pb-3 flex gap-2 flex-wrap"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        {attachments.map((attachment, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70 border border-white/10"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                            >
                                                {attachment.type === 'image' ? (
                                                    <ImageIcon className="w-3 h-3" />
                                                ) : (
                                                    <FileUp className="w-3 h-3" />
                                                )}
                                                <span className="truncate max-w-[100px]">{attachment.name}</span>
                                                <button 
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-white/40 hover:text-white transition-colors"
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* File Upload Area */}
                            <AnimatePresence>
                                {showFileUpload && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-4 pb-4"
                                    >
                                        <FileUpload
                                            onUpload={handleFileUpload}
                                            acceptedTypes={["image/*", ".pdf", ".txt", ".doc", ".docx"]}
                                            maxSize={10}
                                            className="w-full"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowFileUpload(!showFileUpload)}
                                        whileTap={{ scale: 0.94 }}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors relative group",
                                            showFileUpload 
                                                ? "bg-white/10 text-white/90 border border-white/20" 
                                                : "text-white/40 hover:text-white/90"
                                        )}
                                        disabled={isTyping}
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        <motion.span
                                            className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            layoutId="button-highlight"
                                        />
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        data-command-button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCommandPalette(prev => !prev);
                                        }}
                                        whileTap={{ scale: 0.94 }}
                                        className={cn(
                                            "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group",
                                            showCommandPalette && "bg-white/10 text-white/90"
                                        )}
                                    >
                                        <Command className="w-4 h-4" />
                                        <motion.span
                                            className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            layoutId="button-highlight"
                                        />
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        onClick={() => setIsRAGMode(!isRAGMode)}
                                        whileTap={{ scale: 0.94 }}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors relative group",
                                            isRAGMode 
                                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50" 
                                                : "text-white/40 hover:text-white/90"
                                        )}
                                    >
                                        <Database className="w-4 h-4" />
                                        <motion.span
                                            className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            layoutId="button-highlight"
                                        />
                                    </motion.button>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Model Selector */}
                                    <div className="min-w-[200px]">
                                        <ModelSelector
                                            value={selectedModel}
                                            onChange={setSelectedModel}
                                            modelType={value.trim().startsWith('/image') ? 'image' : 'all'}
                                            showSearch={true}
                                        />
                                    </div>
                                    
                                    <GradientButton
                                        onClick={handleSendMessage}
                                        width="100px"
                                        height="40px"
                                        className={cn(
                                            (!value.trim() || isTyping) && "opacity-50 cursor-not-allowed",
                                            isRAGMode && "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                                        )}
                                        disabled={isTyping || !value.trim()}
                                    >
                                        {isTyping ? (
                                            <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <SendIcon className="w-4 h-4 mr-2" />
                                        )}
                                        <span>Send</span>
                                    </GradientButton>
                                </div>
                            </div>
                        </motion.div>

                        {/* Command Suggestions - Only show when not in chat mode */}
                        <AnimatePresence>
                            {!showChat && (
                                <motion.div 
                                    className="flex flex-wrap items-center justify-center gap-2 mt-8"
                                    initial={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {commandSuggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={suggestion.prefix}
                                            onClick={() => selectCommandSuggestion(index)}
                                            className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 transition-all relative group backdrop-blur-sm border border-white/[0.05]"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {suggestion.icon}
                                            <span>{suggestion.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}