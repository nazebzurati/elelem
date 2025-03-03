import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type UpdateSettings = {
  openAiApiKey: string | undefined;
  ollamaUrl: string | undefined;
};

interface SettingsState {
  ollamaUrl: string;
  openAiApiKey: string;
  update: ({ openAiApiKey, ollamaUrl }: UpdateSettings) => void;

  isOnboardingCompleted: boolean;
  resetOnboardingFlag: () => void;
  setOnboardingComplete: () => void;

  activeAssistantId: number | undefined;
  setActiveAssistant: (assistantId: number | undefined) => void;

  activeConversationId: number | undefined;
  setActiveConversation: (conversationId: number | undefined) => void;
}

const useSettings = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        ollamaUrl: "",
        openAiApiKey: "",
        update: ({ openAiApiKey, ollamaUrl }) =>
          set((state) => ({
            ...state,
            openAiApiKey: openAiApiKey ?? "",
            ollamaUrl: ollamaUrl ?? "",
          })),

        isOnboardingCompleted: false,
        resetOnboardingFlag: () =>
          set((state) => ({
            ...state,
            isOnboardingCompleted: false,
            activeAssistantId: undefined,
            activeConversationId: undefined,
          })),
        setOnboardingComplete: () =>
          set((state) => ({ ...state, isOnboardingCompleted: true })),

        activeAssistantId: undefined,
        setActiveAssistant: (assistantId) =>
          set((state) => ({
            ...state,
            activeAssistantId: assistantId,
            activeConversationId: undefined,
          })),

        activeConversationId: undefined,
        setActiveConversation: (conversationId) =>
          set((state) => ({
            ...state,
            activeConversationId: conversationId,
          })),
      }),
      {
        name: "settings",
      }
    )
  )
);

export default useSettings;
