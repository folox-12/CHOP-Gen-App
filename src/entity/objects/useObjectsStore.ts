import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { OrganizationId } from "../organisation/organisationTypes";
import { SecuredObject } from "./objectTypes";

type ObjectsState = {
  objects: Record<OrganizationId, SecuredObject[]>;
  addObject: (orgId: OrganizationId, object: SecuredObject) => void;
  removeObject: (orgId: OrganizationId, objectId: string) => void;
  getObjectsByOrgId: (orgId: OrganizationId) => SecuredObject[];
};

export const useObjectsStore = create<ObjectsState>()(
  devtools(
    persist(
      (set, get) => ({
        objects: {},

        addObject: (orgId, object) =>
          set((state) => ({
            objects: {
              ...state.objects,
              [orgId]: [...(state.objects[orgId] ?? []), object],
            },
          })),

        removeObject: (orgId, objectId) =>
          set((state) => ({
            objects: {
              ...state.objects,
              [orgId]: (state.objects[orgId] ?? []).filter(
                (el) => el.id !== objectId,
              ),
            },
          })),

        getObjectsByOrgId: (orgId) => get().objects[orgId] ?? [],
      }),
      { name: "objects-storage" },
    ),
    { name: "ObjectsStore" },
  ),
);
