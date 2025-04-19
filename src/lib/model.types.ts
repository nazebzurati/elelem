export interface Model {
  id: string;
  providerId: number;
}

export interface Provider {
  id: number;
  baseURL?: string;
  apiKey?: string;
}

export interface Prompt {
  id: number;
  title: string;
  prompt: string;
}

export interface Conversation {
  id: number;
  title?: string;
  createdAt: number;
}

export interface Chat {
  id: number;
  conversationId: number;
  promptId?: number;
  modelId: string;
  user: string;
  assistant?: string;
  sendAt: number;
  receivedAt?: number;
}

export interface ProviderWithCount extends Provider {
  modelCount: number;
}

export interface ModelWithDetails extends Model {
  provider?: Provider;
}

export interface ChatWithDetails extends Chat {
  model?: ModelWithDetails;
  prompt?: Prompt;
}

export interface ConversationWithDetails extends Conversation {
  chats: ChatWithDetails[];
}
