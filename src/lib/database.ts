import Dexie, { type EntityTable } from "dexie";
import { Prompt, Chat, Conversation, Model } from "./model.types";

const db = new Dexie("elelem") as Dexie & {
  model: EntityTable<Model, "id">;
  prompt: EntityTable<Prompt, "id">;
  conversation: EntityTable<Conversation, "id">;
  chat: EntityTable<Chat, "id">;
};

db.version(2).stores({
  model: "id, baseURL, apiKey",
  prompt: "++id, title, prompt",
  conversation: "++id, title",
  chat: "++id, conversationId, promptId, user, assistant, sendAt, receivedAt",
});

export default db;
