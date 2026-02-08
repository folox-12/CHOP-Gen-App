import { Organization } from "./organisationTypes";

export const organizations: Organization[] = [
  {
    id: "org1",
    name: `ООО ЧОО "АЙСБЕРГ-2011"`,
    ceo: "А.И. Игнатьев",
    outgoingNumber: "101",
    hiringOrderNumber: "1",
    firingOrderNumber: "1",
    licenseIssueDate: "29.02.2012",
    licenseNumber: "9015",
    legalAddress:
      "11508, Россия, г. Москва, Южнопортовая ул., дом 15, стр. 1, этаж 1 антр офис 103",
    phone: "8-495-258-51-74",
    email: "irisberg-2011@mail.ru",
    numberOfDocument: "864",
  },
  {
    id: "org2",
    name: `ООО ЧОП "АЙСБЕРГ"`,
    ceo: "И.А. Пирогова",
    outgoingNumber: "19",
    hiringOrderNumber: "1",
    firingOrderNumber: "1",
    licenseIssueDate: "17.11.2008",
    licenseNumber: "7525",
    legalAddress: "109387, город Москва, Люблинская ул., д. 42, помещ. 31/8/1 ",
    phone: "8-495-258-51-74",
    email: "irisberg@mail.ru",
    numberOfDocument: "718",
  },
];
