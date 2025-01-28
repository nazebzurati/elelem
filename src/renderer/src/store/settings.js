import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettings = create(
  persist(
    (set) => ({
      ollamaUrl: '',
      openAiApiKey: '',
      update: ({ openAiApiKey, ollamaUrl }) =>
        set((state) => ({ ...state, openAiApiKey, ollamaUrl }))
    }),
    { name: 'settings' }
  )
);

export default useSettings;
