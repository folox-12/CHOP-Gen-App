import { create } from "zustand";
import {
  PeopleFieldKeysEng,
  PeopleFieldKeysRus,
  PeopleType,
} from "./peopleTypes";
import { mapDictionaryPeople } from "@/entity/people/useDictionaryPeople";
import { persist, devtools } from "zustand/middleware";
import { OrganizationId } from "../organisation/organisationTypes";

type UserState = {
  people: Record<OrganizationId, PeopleType[]>;
  setPeople: (
    orgId: OrganizationId,
    rawPeople: Record<PeopleFieldKeysRus, string>[],
  ) => void;
  getPeopleByOrgId: (orgId: OrganizationId) => PeopleType[];
  removePeople: (orgId: OrganizationId) => void;
};

export const usePeopleStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        people: {},

        setPeople: (orgId, rawPeople) => {
          const dictionaryPeople = mapDictionaryPeople<
            PeopleFieldKeysRus,
            PeopleFieldKeysEng
          >(rawPeople);
          set({
            people: {
              ...get().people,
              [orgId]: dictionaryPeople,
            },
          });
        },

        getPeopleByOrgId: (orgId) => get().people[orgId] ?? [],

        removePeople: (orgId) => {
          set((state) => {
            const rest = { ...state.people };
            delete rest[orgId];
            return { people: rest };
          });
        },
      }),
      {
        name: "people-storage",
      },
    ),
    {
      name: "PeopleStore",
    },
  ),
);
