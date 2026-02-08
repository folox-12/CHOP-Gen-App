import { create } from "zustand";
import {
  PeopleFieldKeysEng,
  PeopleFieldKeysRus,
  PeopleType,
  PeopleTypeLess,
} from "./peopleTypes";
import { mapDictionaryPeople } from "@/entity/people/useDictionaryPeople";
import { persist, devtools } from "zustand/middleware";
import { createPeopleViewModel } from "./peopleService";
import { OrganizationId } from "../organisation/organisationTypes";

type UserState = {
  people: Record<OrganizationId, PeopleType[]>;
  peopleLess: PeopleTypeLess[];
  setPeople: (
    orgId: OrganizationId,
    rawPeople: Record<PeopleFieldKeysRus, string>[],
  ) => void;
  getPeopleByOrgId: (orgId: OrganizationId) => PeopleType[];

  setPeopleLess: (rawPeople: PeopleType[]) => void;
  getOnePersonById: (index: string) => PeopleTypeLess | undefined;
};
export const usePeopleStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        people: { org1: [], org2: [] },
        peopleLess: [],

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

        getPeopleByOrgId: (orgId) => get().people[orgId],

        setPeopleLess: (people) => {
          set({ peopleLess: createPeopleViewModel(people) });
        },

        getOnePersonById(index: string) {
          return get().peopleLess.find((el) => el.id === index);
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
