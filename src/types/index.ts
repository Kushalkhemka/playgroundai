export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  model?: string;
  metadata?: {
    tokens: number;
    responseTime: number;
    quality: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  color: string;
  description: string;
  maxTokens: number;
  supportedFeatures: string[];
}

export interface ChatSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ApiKey {
  provider: string;
  key: string;
  isValid: boolean;
}


export interface ImageGenerationRequest {
  prompt: string;
  model: string;
  style?: string;
  size?: string;
  quality?: string;
  count?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  model: string;
  ratio?: string;
  quality?: string;
  duration?: number;
}
