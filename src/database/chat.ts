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

  // set refId if undefined
  refId ??= data
    .filter((d) => d.parentId === undefined)
    .sort((a, b) => b.id - a.id)[0].id;

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

export const getAltChat = (
  chat: ChatWithDetails,
  chatAlts: ChatWithDetails[],
  replyType: ChatReplyTypeEnum,
) => {
  let alts: ChatWithDetails[] = [];
  if (replyType === ChatReplyTypeEnum.EDIT_CHAT) {
    const allowedTypes = [ChatReplyTypeEnum.EDIT_CHAT, ChatReplyTypeEnum.NEW];
    alts = chatAlts.filter((c) => allowedTypes.includes(c.replyType));
  } else if (replyType === ChatReplyTypeEnum.EDIT_CHAT_RETRY) {
    const altIds: number[] = [chat.id];
    chatAlts.forEach((a) => {
      if (a.retryForId === chat.id) altIds.push(a.id);
      if (a.id === chat.retryForId) altIds.push(chat.retryForId);
    });
    alts = chatAlts
      .filter((c) => altIds.includes(c.id))
      .sort((a, b) => a.id - b.id);
  }
  return alts;
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
