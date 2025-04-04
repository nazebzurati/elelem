import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import db from "./database";
import { Chat, ChatWithInfo, ConversationWithInfo, Model } from "./model.types";

export const fetchModels = async (baseURL?: string, apiKey?: string) => {
  const client = new OpenAI({ baseURL, apiKey, dangerouslyAllowBrowser: true });
  const models = await client.models.list();
  return models.data.map((m) => ({ id: m.id, baseURL, apiKey }));
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

export const updateModelList = async (newList: Model[]) => {
  const existingList = await db.model.toArray();

  const modelToBeAdded = newList.filter(
    (m1) =>
      !existingList.some((m2) => m1.id === m2.id && m1.baseURL === m2.baseURL)
  );
  for (const model of modelToBeAdded) {
    await db.model.add(model);
  }

  const modelToBeRemoved: Model[] = existingList.filter(
    (m1) => !newList.some((m2) => m1.id === m2.id && m1.baseURL === m2.baseURL)
  );
  for (const model of modelToBeRemoved) {
    await db.model.delete(model.id);
  }
};

export const getConversation = async (
  conversationId: number
): Promise<ConversationWithInfo | undefined> => {
  const conversation = await db.conversation.get(conversationId);
  if (!conversation) return undefined;

  const relatedChats = await db.chat
    .where({ conversationId: conversation.id })
    .toArray();

  let chats: ChatWithInfo[] = [];
  for (const chat of relatedChats) {
    chats.push({
      ...chat,
      model: (await db.model.get(chat.modelId))!,
      prompt: chat.promptId ? await db.prompt.get(chat.promptId) : undefined,
    });
  }

  return { ...conversation, chats };
};

export const getConversationAll = async (): Promise<ConversationWithInfo[]> => {
  const conversationList = await db.conversation.reverse().sortBy("id");

  const conversationHistoryList = [];
  for (const conversation of conversationList) {
    const queriedConversation = await getConversation(conversation.id);
    if (queriedConversation) conversationHistoryList.push(queriedConversation);
  }
  return conversationHistoryList;
};

export const getActiveModel = async (
  modelId: string
): Promise<Model | undefined> => await db.model.get(modelId);
