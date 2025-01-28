import Dexie from 'dexie';

export const db = new Dexie('elelem');

db.version(1).stores({
  assistant: '++id, name, modelId, prompt',
  conversation: '++id, assistantId, title',
  chat: '++id, conversationId, user, assistant, sendAt, receivedAt'
});
