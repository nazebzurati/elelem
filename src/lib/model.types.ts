export interface Model {
  id: string;
  baseUrl?: string;
}

export interface Assistant {
  id: number;
  name: string;
  modelId: string;
  prompt: string | undefined;
}

export interface Conversation {
  id: number;
  assistantId: number;
  title: string;
}

export interface Chat {
  id: number;
  conversationId: number;
  user: string;
  assistant?: string;
  sendAt: number;
  receivedAt?: number;
}

export interface IOllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ActiveAssistant extends Assistant {
  model: Model | undefined;
}

export interface AssistantListing extends Assistant {
  index: number;
}

export interface ActiveConversation extends Conversation {
  assistant: ActiveAssistant | undefined;
  chats: Chat[];
}

export interface ConversationHistoryItem extends Conversation {
  firstChat: Chat | undefined;
  assistant: Assistant | undefined;
}
