export interface Model {
  id: string;
  baseURL?: string;
  apiKey?: string;
}

export interface Prompt {
  id: number;
  title: string;
  prompt: string | undefined;
}

export interface Conversation {
  id: number;
  title: string;
}

export interface Chat {
  id: number;
  modelId: string;
  conversationId: number;
  promptId?: number;
  user: string;
  assistant?: string;
  sendAt: number;
  receivedAt?: number;
}

export interface ChatWithInfo extends Chat {
  model: Model;
  prompt: Prompt | undefined;
}

export interface ConversationWithInfo extends Conversation {
  chats: ChatWithInfo[];
}
