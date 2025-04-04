import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type ServiceConfig = {
  baseURL: string | undefined;
  apiKey: string | undefined;
};

interface SettingsState {
  configs: ServiceConfig[];
  update: (configs: ServiceConfig[]) => void;

  activeModelId: string | undefined;
  setActiveModel: (modelId: string | undefined) => void;

  activePromptId: number | undefined;
  setActivePrompt: (promptId: number | undefined) => void;

  activeConversationId: number | undefined;
  setActiveConversation: (conversationId: number | undefined) => void;
}

const useSettings = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        configs: [],
        update: (configs: ServiceConfig[]) =>
          set((state) => ({
            ...state,
            configs,
          })),

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
      {
        name: "settings",
      }
    )
  )
);

export default useSettings;
