import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ProviderState {
  selectedProviderId?: number;
  setSelectedProviderId: (id: number) => void;
}

const useProvider = create<ProviderState>()(
  devtools(
    persist(
      (set) => ({
        selectedProviderId: undefined,
        setSelectedProviderId: (id: number) =>
          set((state) => ({
            ...state,
            selectedProviderId: id,
          })),
      }),
      {
        name: "provider",
      }
    )
  )
);

export default useProvider;
