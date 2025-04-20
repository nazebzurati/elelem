import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SettingsState {
  activePromptId?: number;
  setActivePrompt: (promptId?: number) => void;

  activeModelId?: string;
  setActiveModel: (modelId?: string) => void;

  activeConversationId?: number;
  setActiveConversation: (conversationId?: number) => void;
}

const useSettings = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        activePromptId: undefined,
        setActivePrompt: (promptId) =>
          set((state) => ({
            ...state,
            activePromptId: promptId,
          })),

        activeModelId: undefined,
        setActiveModel: (modelId) =>
          set((state) => ({
            ...state,
            activeModelId: modelId,
          })),

        activeConversationId: undefined,
        setActiveConversation: (conversationId) =>
          set((state) => ({
            ...state,
            activeConversationId: conversationId,
          })),
      }),
      { name: "settings" }
    )
  )
);

export default useSettings;
