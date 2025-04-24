import { ChatWithDetails, getChatList } from "./chat";
import db from "./config";

export interface Conversation {
  id: number;
  title?: string;
  createdAt: number;
}
export interface ConversationWithDetails extends Conversation {
  chats: ChatWithDetails[];
}

export const getConversation = async (
  conversationId: number,
): Promise<ConversationWithDetails | undefined> => {
  const conversation = await db.conversation.get(conversationId);
  if (!conversation) return undefined;
  return { ...conversation, chats: await getChatList(conversation.id) };
};

export const getConversationList = async (): Promise<
  ConversationWithDetails[]
> => {
  const conversationList = await db.conversation.reverse().sortBy("id");
  const conversationWithDetails: ConversationWithDetails[] = [];
  for (const conversation of conversationList) {
    const chats = await getChatList(conversation.id);
    if (chats.length > 0) {
      conversationWithDetails.push({ ...conversation, chats });
    }
  }
  return conversationWithDetails;
};
