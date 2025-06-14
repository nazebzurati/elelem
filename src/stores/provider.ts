import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ProviderState {
  selectedProviderId?: number;
  setSelectedProvider: (id?: number) => void;
}

const useProviderStore = create<ProviderState>()(
  devtools(
    persist(
      (set) => ({
        selectedProviderId: undefined,
        setSelectedProvider: (id) =>
          set((state) => ({
            ...state,
            selectedProviderId: id,
          })),
      }),
      { name: "provider" },
    ),
  ),
);

export default useProviderStore;
