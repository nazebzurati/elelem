import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettings = create(
  persist(
    (set) => ({
      ollamaUrl: '',
      openaiApiKey: '',
      update: ({ openaiApiKey, ollamaUrl }) =>
        set((state) => ({ ...state, openaiApiKey, ollamaUrl }))
    }),
    { name: 'settings' }
  )
)

export default useSettings
