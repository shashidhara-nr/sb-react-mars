export interface BopThirdPartyAddress {
  addressLine1: string;
  addressLine2?: string;
  postCode?: string;
  suburb?: string;
  townName: string;
  region?: string;
  countryCode: string;
}

export interface BopThirdPartyPhone {
  firstName?: string;
  lastName?: string;
  mobilePhoneNumber?: string;
  mobilePhoneUsage?: string[];
  alternatePhoneNumber?: string;
  alternatePhoneUsage?: string[];
}

export interface BopThirdPartyContact {
  email?: string;
  emailUsage?: string[];
  contactName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  telephoneNumber?: string;
  mobileNumber?: string;
  faxNumber?: string;
  jobTitle?: string;
  workPhoneNumber?: string;
  workPhoneUsage?: string[];
  mobilePhoneNumber?: string;
  mobilePhoneUsage?: string[];
}

export interface BopThirdPartyPayload {

  entityKey?: number;
  action?: string;
  status?: string;
  versionNumber?: number;
  entityType: 'individual' | 'entity' | 'company';

  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  idNumber?: string;
  idType?: string;

  entityName?: string;
  companyCategory?: string;

  taxpayerReference?: string;
  vatReference?: string;
  customsClientNo?: string;
  ccn?: string;
  thirdPartyCode?: string;

  address: BopThirdPartyAddress;

  hasPostalAddress?: boolean;
  postalAddress?: BopThirdPartyAddress;

  phone?: BopThirdPartyPhone;
  contact?: BopThirdPartyContact;

  entityCategory?: string;
  countryRegion?: string;
  authoriseStatus?: string;
  createdBy?: string;
  createdDateTime?: string;
  lastAuthorisedBy?: string;
  lastAuthorisedDateTime?: string;
  whenModified?: number;

  canAuthorise?: boolean;
  hasDAPPermission?: boolean;
  declineReason?: string;
  deleteInd?: string;
  originatingChannel?: string;

  customerKey?: number;
  customerId?: string;
  customerName?: string;
  customerStatus?: string;
  customerCountry?: string;
}

export type Section = {
  title: string;
  titleIcon: any; 
  fields: any[];                      
  ShowActionBtns: boolean;
};

export type FieldPath = string | [string, string];

export type BopThirdPartyT = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  entityName?: string;
  companyCategory?: string;
  taxpayerReference?: string;
  vatReference?: string;
  customsClientNo?: string;
  idNumber?: string;
  idType?: string;
  entityType: 'individual' | 'entity' | 'company';
  address?: BopThirdPartyAddress;
  postalAddress?: BopThirdPartyAddress;
  phone?: BopThirdPartyPhone;
  contact?: BopThirdPartyContact;
};

export type BreadcrumbLink = {
  href: string;
  label: string;
};
 