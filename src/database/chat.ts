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

export const getChatList = async (conversationId: number) => {
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
