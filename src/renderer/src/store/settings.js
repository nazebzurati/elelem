import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettings = create(
  persist(
    (set) => ({
      ollamaUrl: '',
      openAiApiKey: '',
      isOnboardingCompleted: false,
      update: ({ openAiApiKey, ollamaUrl }) =>
        set((state) => ({ ...state, openAiApiKey, ollamaUrl })),
      resetOnboardingFlag: () => set((state) => ({ ...state, isOnboardingCompleted: false })),
      setOnboardingComplete: () => set((state) => ({ ...state, isOnboardingCompleted: true }))
    }),
    { name: 'settings' }
  )
);

export default useSettings;
