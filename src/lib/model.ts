import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import db from "./database";
import {
  Chat,
  ChatWithDetails,
  ConversationWithDetails,
  Model,
  ModelWithDetails,
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

export const getConversation = async (
  conversationId: number
): Promise<ConversationWithDetails | undefined> => {
  const conversation = await db.conversation.get(conversationId);
  if (!conversation) return undefined;

  const relatedChats = await db.chat
    .where({ conversationId: conversation.id })
    .toArray();

  const chats: ChatWithDetails[] = [];
  for (const chat of relatedChats) {
    const model: Model | undefined = await db.model.get(chat.modelId);
    chats.push({
      ...chat,
      model: model
        ? { ...model, provider: await db.provider.get(model.providerId) }
        : undefined,
      prompt: chat.promptId ? await db.prompt.get(chat.promptId) : undefined,
    });
  }

  return { ...conversation, chats };
};

export const getConversationAll = async (): Promise<
  ConversationWithDetails[]
> => {
  const conversationList = await db.conversation.reverse().sortBy("id");

  const conversationHistoryList = [];
  for (const conversation of conversationList) {
    const queriedConversation = await getConversation(conversation.id);
    if (queriedConversation) conversationHistoryList.push(queriedConversation);
  }
  return conversationHistoryList;
};

export const getActiveModel = async (): Promise<
  ModelWithDetails | undefined
> => {
  const model = await db.model.where({ isActive: 1 }).first();
  if (!model) return undefined;
  return { ...model, provider: await db.provider.get(model.providerId) };
};
