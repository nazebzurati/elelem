import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface HistoryState {
  selectedConversationId?: number;
  setSelectedConversation: (id?: number) => void;
}

const useHistory = create<HistoryState>()(
  devtools(
    persist(
      (set) => ({
        selectedConversationId: undefined,
        setSelectedConversation: (id) =>
          set((state) => ({
            ...state,
            selectedConversationId: id,
          })),
      }),
      { name: "history" },
    ),
  ),
);

export default useHistory;
