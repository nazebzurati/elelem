import Dexie, { type EntityTable } from "dexie";
import { Assistant, Chat, Conversation, Model } from "./model.types";

const db = new Dexie("elelem") as Dexie & {
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
