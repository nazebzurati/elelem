import db from "./config";
import { getModel, ModelWithDetails } from "./model";
import { getPrompt, Prompt } from "./prompt";

export enum ChatReplyTypeEnum {
  NEW,
  EDIT_CHAT,
  EDIT_CHAT_RETRY,
}

export interface Chat {
  id: number;
  conversationId: number;
  promptId?: number;
  modelId: string;
  user: string;
  assistant?: string;
  sendAt: number;
  parentId?: number;
  replyType: ChatReplyTypeEnum;
  retryForId?: number;
  receivedAt?: number;
}

export interface ChatWithDetails extends Chat {
  model?: ModelWithDetails;
  prompt?: Prompt;
}

export const getChatListByRefId = (data: Chat[], refId?: number): Chat[] => {
  if (data.length <= 0) return data;
  if (!refId) {
    refId = data
      .filter((d) => d.parentId === undefined)
      .sort((a, b) => b.id - a.id)[0].id;
  }

  // get branch up
  const up: Chat[] = [];
  let current = data.find((d) => d.id === refId);
  while (current) {
    up.unshift(current);
    if (current.parentId === undefined) break;
    current = data
      .filter((d) => d.id === current?.parentId)
      .sort((a, b) => b.id - a.id)[0];
  }

  // get branch down
  const down: Chat[] = [];
  current = data.find((d) => d.id === refId);
  while (current) {
    current = data
      .filter((d) => current?.id === d.parentId)
      .sort((a, b) => b.id - a.id)[0];
    if (current === undefined) break;
    down.push(current);
  }

  return [...up, ...down];
};

export const getPreviousChatList = async (
  conversationId: number,
  refId?: number,
) => {
  if (!refId) return [];
  const chats = await db.chat.where({ conversationId }).toArray();

  // get branch up
  const up: Chat[] = [];
  let current = chats.find((d) => d.id === refId);
  while (current) {
    up.unshift(current);
    if (current.parentId === undefined) break;
    current = chats
      .filter((d) => d.id === current?.parentId)
      .sort((a, b) => b.id - a.id)[0];
  }
  return up;
};

export const getChatList = async (conversationId: number) => {
  const chats = await db.chat.where({ conversationId }).toArray();
  return await Promise.all(
    chats.map(async (chat) => {
      return {
        ...chat,
        model: await getModel(chat.modelId),
        prompt: chat.promptId ? await getPrompt(chat.promptId) : undefined,
      };
    }),
  );
};

export const getChat = async (chatId: number) => {
  const chat = await db.chat.get(chatId);
  if (!chat) return undefined;
  return {
    ...chat,
    model: await getModel(chat.modelId),
    prompt: chat.promptId ? await getPrompt(chat.promptId) : undefined,
  };
};
