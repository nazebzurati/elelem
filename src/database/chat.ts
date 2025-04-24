import db from "./config";
import { getModel, ModelWithDetails } from "./model";
import { getPrompt, Prompt } from "./prompt";

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

export interface ChatWithDetails extends Chat {
  model?: ModelWithDetails;
  prompt?: Prompt;
}

export const getChat = async (
  chatId?: number,
): Promise<ChatWithDetails | undefined> => {
  if (!chatId) return undefined;
  const chat = await db.chat.get(chatId);
  if (!chat) return undefined;
  return {
    ...chat,
    model: await getModel(chat.modelId),
    prompt: chat.promptId ? await getPrompt(chat.promptId) : undefined,
  };
};

export const getChatList = async (): Promise<Chat[]> => {
  return await db.chat.toArray();
};

export const getChats = async (conversationId: number) => {
  const chats = await db.chat.where({ conversationId }).toArray();
  return await Promise.all(
    chats.map(async (chat) => {
      return {
        ...chat,
        model: await getModel(chat.modelId),
        prompt: chat.promptId ? await getPrompt(chat.promptId) : undefined,
      };
    }),
  );
};
