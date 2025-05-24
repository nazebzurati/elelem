import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ChatState {
  selectedChatId?: number;
  setSelectedChat: (id?: number) => void;
}

const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
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
