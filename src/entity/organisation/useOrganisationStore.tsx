import { create } from "zustand";
import { Organization, OrganizationId } from "./organisationTypes";
import { organizations } from "./OrganisationService";
import { persist, devtools } from "zustand/middleware";

type CompanyState = {
  selectedId: OrganizationId;
  organization?: Organization;
  mainInfoAboutCompany: Organization[];
  selectOrg: (orgId: OrganizationId) => void;
  addOrg: (org: Organization) => void;
  removeOrg: (orgId: OrganizationId) => void;
  changeOutgoingNumber: (value: number) => void;
  changeHiringOrderNumber: (value: number) => void;
  changeFiringOrderNumber: (value: number) => void;
};

const DEFAULT_VALUE_COMPANY_ID = "";

export const useCompanyStore = create<CompanyState>()(
  devtools(
    persist(
      (set, get) => {
        const updateOrgField = (patch: Partial<Organization>) => {
          const { selectedId, mainInfoAboutCompany } = get();
          const current = mainInfoAboutCompany.find(
            ({ id }) => id === selectedId,
          );
          if (!current) return;
          set({
            organization: { ...current, ...patch },
            mainInfoAboutCompany: mainInfoAboutCompany.map((el) =>
              el.id === selectedId ? { ...el, ...patch } : el,
            ),
          });
        };

        return {
          selectedId: DEFAULT_VALUE_COMPANY_ID,
          mainInfoAboutCompany: [...organizations],
          organization: undefined,
          selectOrg: (orgId) => {
            set({
              selectedId: orgId,
              organization: get().mainInfoAboutCompany.find(
                ({ id }) => id === orgId,
              ),
            });
          },
          addOrg: (org) => {
            set((state) => ({
              mainInfoAboutCompany: [...state.mainInfoAboutCompany, org],
              selectedId: org.id,
              organization: org,
            }));
          },
          removeOrg: (orgId) => {
            set((state) => {
              const remaining = state.mainInfoAboutCompany.filter(
                ({ id }) => id !== orgId,
              );
              const nextSelected =
                state.selectedId === orgId
                  ? (remaining[0]?.id ?? "")
                  : state.selectedId;
              return {
                mainInfoAboutCompany: remaining,
                selectedId: nextSelected,
                organization: remaining.find(({ id }) => id === nextSelected),
              };
            });
          },
          changeOutgoingNumber(value: number) {
            updateOrgField({ outgoingNumber: value.toString() });
          },
          changeHiringOrderNumber(value: number) {
            updateOrgField({ hiringOrderNumber: value.toString() });
          },
          changeFiringOrderNumber(value: number) {
            updateOrgField({ firingOrderNumber: value.toString() });
          },
        };
      },
      { name: "company-store" },
    ),
    {
      name: "CompanyStore",
    },
  ),
);
