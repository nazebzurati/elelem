import { ChatReplyTypeEnum } from "@database/chat";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ChatState {
  chatRefId?: number;
  setSelectedChatRefId: (id?: number) => void;

  selectedChatId?: number;
  selectedChatType: ChatReplyTypeEnum;
  setSelectedChat: (id?: number, type?: ChatReplyTypeEnum) => void;
}

const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        chatRefId: undefined,
        setSelectedChatRefId: (id) =>
          set((state) => ({
            ...state,
            chatRefId: id,
          })),

        selectedChatId: undefined,
        selectedChatType: ChatReplyTypeEnum.EDIT_CHAT,
        setSelectedChat: (id, type = ChatReplyTypeEnum.EDIT_CHAT) =>
          set((state) => ({
            ...state,
            selectedChatId: id,
            selectedChatType: type,
          })),
      }),
      { name: "chat" },
    ),
  ),
);

export default useChatStore;
