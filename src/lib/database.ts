import Dexie, { type EntityTable } from "dexie";
import { Chat, Conversation, Model, Prompt, Provider } from "./model.types";

const db = new Dexie("elelem") as Dexie & {
  provider: EntityTable<Provider, "id">;
  model: EntityTable<Model, "id">;
  prompt: EntityTable<Prompt, "id">;
  conversation: EntityTable<Conversation, "id">;
  chat: EntityTable<Chat, "id">;
};

db.version(2).stores({
  provider: "++id, baseURL, apiKey",
  model: "id, providerId",
  prompt: "++id, title, prompt",
  conversation: "++id, title, createdAt",
  chat: "++id, conversationId, promptId, modelId, user, assistant, sendAt, receivedAt",
});

export default db;
