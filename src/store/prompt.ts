import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface PromptState {
  selectedPromptId?: number;
  setSelectedPrompt: (id?: number) => void;
}

const usePrompt = create<PromptState>()(
  devtools(
    persist(
      (set) => ({
        selectedPromptId: undefined,
        setSelectedPrompt: (id) =>
          set((state) => ({
            ...state,
            selectedPromptId: id,
          })),
      }),
      { name: "prompt" }
    )
  )
);

export default usePrompt;
