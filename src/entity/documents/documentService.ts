import { Organization } from "../organisation/organisationTypes";
import { PeopleTypeLess } from "../people/peopleTypes";
import { TEXTS } from "@/constants/texts";

type Document = {
  key: string;
  value: string;
};

const DOCUMENTS_FOR_TEMPLATE: Document[] = [
  { key: "requestToCard", value: TEXTS.documents.requestToCard },
  { key: "requestToEmployee", value: TEXTS.documents.requestToEmployee },
  {
    key: "inventoryForRequestToCard",
    value: TEXTS.documents.inventoryForRequestToCard,
  },
  { key: "requestToFire", value: TEXTS.documents.requestToFire },
  {
    key: "requestFromOrganization",
    value: TEXTS.documents.requestFromOrganization,
  },
];

export const HIRING_DOCS = [
  "requestToCard",
  "requestToEmployee",
  "inventoryForRequestToCard",
] as const;

export const FIRING_DOCS = [
  "requestToFire",
  "requestFromOrganization",
] as const;

const DOCS_WITHOUT_OUTGOING_NUMBER = ["inventoryForRequestToCard"] as const;

export const needsOutgoingNumber = (key: string): boolean =>
  !(DOCS_WITHOUT_OUTGOING_NUMBER as readonly string[]).includes(key);

const isHiringDoc = (key: string) =>
  (HIRING_DOCS as readonly string[]).includes(key);
const isFiringDoc = (key: string) =>
  (FIRING_DOCS as readonly string[]).includes(key);

const generateDocsInfoFromPersonData = (
  peopleData: PeopleTypeLess[],
  company?: Organization,
) => {
  if (!company || !peopleData) return;
  const howManyPerson = peopleData.length;
  const data = {
    people: [...peopleData],
    date: new Date().toLocaleDateString(),
    year: new Date().getFullYear(),
    org: {
      ...company,
    },
    infoForInventory: {
      requestNumbers: howManyPerson,
      numberYcho: howManyPerson * 2,
      photoNumber: howManyPerson,
      personalData: howManyPerson,
      copyOfOrder: howManyPerson,
      qualification: howManyPerson,
      education: howManyPerson,
      passport: howManyPerson * 2,
      quantity: 0,
    },
  };

  const quantity = Object.values(data.infoForInventory).reduce(
    (sum, value) => sum + value,
    0,
  );

  data.infoForInventory.quantity = quantity;

  return data;
};

export default {
  getDocuments: () => DOCUMENTS_FOR_TEMPLATE,
  getDocumentByKeys: (key: string) => {
    return DOCUMENTS_FOR_TEMPLATE.find((el) => el.key === key)!.value;
  },
  generateDocsInfoFromPersonData,
  isHiringDoc,
  isFiringDoc,
};
