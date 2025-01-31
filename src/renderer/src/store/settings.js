import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettings = create(
  persist(
    (set) => ({
      ollamaUrl: '',
      openAiApiKey: '',
      activeAssistantId: undefined,
      activeConversationId: undefined,
      isOnboardingCompleted: false,
      update: ({ openAiApiKey, ollamaUrl }) =>
        set((state) => ({ ...state, openAiApiKey, ollamaUrl })),
      resetOnboardingFlag: () => set((state) => ({ ...state, isOnboardingCompleted: false })),
      setOnboardingComplete: () => set((state) => ({ ...state, isOnboardingCompleted: true })),
      setActiveConversation: (conversationId) =>
        set((state) => ({
          ...state,
          activeConversationId: conversationId
        })),
      setActiveAssistant: (assistantId) =>
        set((state) => ({
          ...state,
          activeAssistantId: assistantId,
          activeConversationId: undefined
        }))
    }),
    { name: 'settings' }
  )
);

export default useSettings;
