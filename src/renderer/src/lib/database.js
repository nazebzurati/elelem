import Dexie from 'dexie';

export const db = new Dexie('elelem');

db.version(1).stores({
  model: 'id, baseUrl',
  assistant: '++id, name, modelId, prompt',
  conversation: '++id, assistantId, title',
  chat: '++id, conversationId, user, assistant, sendAt, receivedAt'
});

export const updateModelList = async (newList) => {
  const existingList = await db.model.toArray();

  const modelToBeAdded = newList.filter(
    (m1) => !existingList.some((m2) => m1.id === m2.id && m1.baseUrl === m2.baseUrl)
  );
  for (const model of modelToBeAdded) {
    await db.model.add(model);
  }

  const modelToBeRemoved = existingList.filter(
    (m1) => !newList.some((m2) => m1.id === m2.id && m1.baseUrl === m2.baseUrl)
  );
  for (const model of modelToBeRemoved) {
    await db.model.remove(model);
  }
};

export const getActiveConversation = async (conversationId) => {
  const conversation = await db.conversation.get(conversationId);
  if (conversation) {
    [conversation.assistant, conversation.chats] = await Promise.all([
      db.assistant.get(conversation.assistantId),
      db.chat.where({ conversationId: conversation.id }).toArray()
    ]);
    conversation.assistant.model = await db.model.get(conversation.assistant.modelId);
  }
  return conversation;
};

export const getActiveAssistant = async (assistantId) => {
  const assistant = await db.assistant.get(assistantId);
  assistant.model = await db.model.get(assistant.modelId);
  return assistant;
};
