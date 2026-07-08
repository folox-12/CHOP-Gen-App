export type ObjectId = string;

export type Customer = {
  orgName: string;
  signatory: string;
  fullName: string;
  position: string;
};

export type ObjectFiles = {
  contract?: string;
  instruction?: string;
  scheme?: string;
};

export type SecuredObject = {
  id: ObjectId;
  address: string;
  contractNumber: string;
  contractDate: string;
  customer: Customer;
  files: ObjectFiles;
};
