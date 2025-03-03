import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { OPENAI_SUPPORTED_MODELS } from "./constants";
import db from "./database";
import {
  ActiveAssistant,
  ActiveConversation,
  Chat,
  ConversationHistoryItem,
  IOllamaModelInfo,
  Model,
} from "./model.types";

export const fetchOpenAiModels = async (apiKey: string) => {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const models = await client.models.list();
  return models.data
    .filter((m) => OPENAI_SUPPORTED_MODELS.includes(m.id))
    .map((m) => ({ id: m.id, baseUrl: undefined }));
};

export const fetchOllamaModels = async (url: string) => {
  const response = await fetch(`${url}/api/tags`);
  const responseData = await response.json();
  return responseData.models.map((m: IOllamaModelInfo) => ({
    id: m.name,
    baseUrl: `${url}/v1/`,
  }));
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
      !existingList.some((m2) => m1.id === m2.id && m1.baseUrl === m2.baseUrl)
  );
  for (const model of modelToBeAdded) {
    await db.model.add(model);
  }

  const modelToBeRemoved: Model[] = existingList.filter(
    (m1) => !newList.some((m2) => m1.id === m2.id && m1.baseUrl === m2.baseUrl)
  );
  for (const model of modelToBeRemoved) {
    await db.model.delete(model.id);
  }
};

export const getActiveConversation = async (
  conversationId: number
): Promise<ActiveConversation | undefined> => {
  const conversation = await db.conversation.get(conversationId);
  if (!conversation) return undefined;

  const assistant = await db.assistant.get(conversation.assistantId);
  const chats = await db.chat
    .where({ conversationId: conversation.id })
    .toArray();

  let model = undefined;
  if (assistant) {
    model = await db.model.get(assistant.modelId);
  }

  return {
    ...conversation,
    assistant: assistant ? { ...assistant, model } : assistant,
    chats,
  };
};

export const getConversationHistory = async (): Promise<
  ConversationHistoryItem[]
> => {
  const conversationList = await db.conversation.reverse().sortBy("id");
  const conversationHistoryList = [];
  for (const conversation of conversationList) {
    conversationHistoryList.push({
      ...conversation,
      assistant: await db.assistant
        .where({ id: conversation.assistantId })
        .first(),
      firstChat: await db.chat
        .where({ conversationId: conversation.id })
        .first(),
    });
  }
  return conversationHistoryList;
};

export const getActiveAssistant = async (
  assistantId: number
): Promise<ActiveAssistant | undefined> => {
  const assistant = await db.assistant.get(assistantId);
  if (!assistant) return undefined;

  const model = await db.model.get(assistant.modelId);
  return { ...assistant, model };
};
