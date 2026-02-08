import { create } from "zustand";
import { Organization, OrganizationId } from "./organisationTypes";
import { organizations } from "./OrganisationService";
import { persist, devtools } from "zustand/middleware";

type CompanyState = {
  selectedId: OrganizationId;
  organization?: Organization;
  mainInfoAboutCompany: Organization[];
  selectOrg: (orgId: OrganizationId) => void;
  changeOutgoingNumber: (value: number) => void;
  changeHiringOrderNumber: (value: number) => void;
  changeFiringOrderNumber: (value: number) => void;
};

const DEFAULT_VALUE_COMPANY_ID = "org1";

export const useCompanyStore = create<CompanyState>()(
  devtools(
    persist(
      (set, get) => {
        const updateOrgField = (patch: Partial<Organization>) => {
          const { selectedId, mainInfoAboutCompany } = get();
          const current = mainInfoAboutCompany.find(
            ({ id }) => id === selectedId,
          )!;
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
          organization: organizations[0],
          selectOrg: (orgId) => {
            set({
              selectedId: orgId,
              organization: get().mainInfoAboutCompany.find(
                ({ id }) => id === orgId,
              ),
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
