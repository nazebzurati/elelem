import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import db from "./database";
import {
  Chat,
  ChatWithDetails,
  ConversationWithDetails,
  ModelWithDetails,
  Prompt,
} from "./model.types";

export const fetchModels = async (baseURL?: string, apiKey?: string) => {
  const client = new OpenAI({ baseURL, apiKey, dangerouslyAllowBrowser: true });
  const models = await client.models.list();
  return models.data.map((m) => m.id);
};

export const prepareMessages = ({
  chats,
  system,
  input,
}: {
  chats: Chat[];
  system: string;
  input: string;
}): ChatCompletionMessageParam[] => {
  const messages: ChatCompletionMessageParam[] = [];
  if (system) {
    messages.push({ role: "developer", content: system });
  }
  (chats || []).forEach((chat) => {
    messages.push({ role: "user", content: chat.user });
    messages.push({ role: "assistant", content: chat.assistant });
  });
  messages.push({ role: "user", content: input });
  return messages;
};

export const getModel = async (
  modelId: string,
): Promise<ModelWithDetails | undefined> => {
  const model = await db.model.get(modelId);
  if (!model) return undefined;
  return { ...model, provider: await db.provider.get(model.providerId) };
};

export const getModelList = async (): Promise<ModelWithDetails[]> => {
  const modelList = await Promise.all(
    (await db.model.toArray()).map(async (model) => getModel(model.id)),
  );
  return modelList.filter((model): model is ModelWithDetails => Boolean(model));
};

export const getPrompt = async (
  promptId?: number,
): Promise<Prompt | undefined> => {
  if (!promptId) return undefined;
  return await db.prompt.get(promptId);
};

export const getPromptList = async (): Promise<Prompt[]> => {
  return await db.prompt.toArray();
};

export const getChat = async (
  chatId?: number,
): Promise<ChatWithDetails | undefined> => {
  if (!chatId) return undefined;
  const chat = await db.chat.get(chatId);
  if (!chat) return undefined;
  return {
    ...chat,
    model: await getModel(chat.modelId),
    prompt: await getPrompt(chat.promptId),
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
        prompt: await getPrompt(chat.promptId),
      };
    }),
  );
};

export const getConversation = async (
  conversationId: number,
): Promise<ConversationWithDetails | undefined> => {
  const conversation = await db.conversation.get(conversationId);
  if (!conversation) return undefined;
  return { ...conversation, chats: await getChats(conversation.id) };
};

export const getConversationAll = async (): Promise<
  ConversationWithDetails[]
> => {
  const conversationList = await Promise.all(
    (await db.conversation.reverse().sortBy("id")).map(async (conversation) => {
      return await getConversation(conversation.id);
    }),
  );
  return conversationList.filter(
    (conversation): conversation is ConversationWithDetails =>
      Boolean(conversation),
  );
};
