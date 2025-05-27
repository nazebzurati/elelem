import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ChatState {
  chatRefId?: number;
  setSelectedChatRefId: (id?: number) => void;

  selectedChatId?: number;
  setSelectedChat: (id?: number) => void;
}

const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        chatRefId: undefined,
        setSelectedChatRefId: (id) =>
          set((state) => ({
            ...state,
            selectedChatId: id,
          })),

        selectedChatId: undefined,
        setSelectedChat: (id) =>
          set((state) => ({
            ...state,
            selectedChatId: id,
          })),
      }),
      { name: "chat" },
    ),
  ),
);

export default useChatStore;
