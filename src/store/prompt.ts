import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface PromptState {
  selectedPromptId?: number;
  setSelectedPromptId: (id: number) => void;
}

const usePrompt = create<PromptState>()(
  devtools(
    persist(
      (set) => ({
        selectedPromptId: undefined,
        setSelectedPromptId: (id: number) =>
          set((state) => ({
            ...state,
            selectedPromptId: id,
          })),
      }),
      { name: "prompt" },
    ),
  ),
);

export default usePrompt;
