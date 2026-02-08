export type OrganizationId = "org1" | "org2";

export type Organization = {
  id: OrganizationId;
  name: string;
  ceo: string;
  outgoingNumber: string;
  hiringOrderNumber: string;
  firingOrderNumber: string;
  licenseIssueDate: string;
  licenseNumber: string;
  legalAddress: string;
  phone: string;
  email: string;
  numberOfDocument: string;
};
