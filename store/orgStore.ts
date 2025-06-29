// src/store/orgStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrgStore {
  organizationId: string | null;
  setOrganizationId: (id: string) => void;
}

export const useOrgStore = create<OrgStore>()(
  persist(
    (set) => ({
      organizationId: null,
      setOrganizationId: (id) => set({ organizationId: id }),
    }),
    {
      name: "orgStorage", // key in localStorage
    }
  )
);
