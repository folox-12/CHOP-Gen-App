import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { OrganizationId } from "../organisation/organisationTypes";

type CommonDocsState = {
  files: Record<OrganizationId, Record<string, string>>;
  setFile: (orgId: OrganizationId, key: string, path: string) => void;
};

export const useCommonDocsStore = create<CommonDocsState>()(
  devtools(
    persist(
      (set) => ({
        files: {},
        setFile: (orgId, key, path) =>
          set((state) => ({
            files: {
              ...state.files,
              [orgId]: { ...(state.files[orgId] ?? {}), [key]: path },
            },
          })),
      }),
      { name: "common-docs-storage" },
    ),
    { name: "CommonDocsStore" },
  ),
);
