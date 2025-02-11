import Dexie, { type EntityTable } from "dexie";
import {
  ActiveAssistant,
  ActiveConversation,
  Assistant,
  Chat,
  Conversation,
  ConversationHistoryItem,
  Model,
} from "./types";

const db = new Dexie("FriendsDatabase") as Dexie & {
  model: EntityTable<Model, "id">;
  assistant: EntityTable<Assistant, "id">;
  conversation: EntityTable<Conversation, "id">;
  chat: EntityTable<Chat, "id">;
};

db.version(1).stores({
  model: "id, baseUrl",
  assistant: "++id, name, modelId, prompt",
  conversation: "++id, assistantId, title",
  chat: "++id, conversationId, user, assistant, sendAt, receivedAt",
});

export default db;

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
    const firstChat = await db.chat
      .where({ conversationId: conversation.id })
      .first();
    conversationHistoryList.push({ ...conversation, firstChat });
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
