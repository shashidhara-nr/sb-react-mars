// types/bopThirdParty.ts
// Type definitions for BOP Third Party entities

export interface BopThirdPartyAddress {
  addressLine1: string;
  addressLine2?: string;
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
  jobTitle?: string;
  workPhoneNumber?: string;
  workPhoneUsage?: string[];
  mobilePhoneNumber?: string;
  mobilePhoneUsage?: string[];
}

export interface BopThirdPartyPayload {
  // System fields
  entityKey?: number;
  action?: string;
  status?: string;
  versionNumber?: number;
  entityType: 'individual' | 'entity' | 'company';
  
  // Personal/Individual fields
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  idNumber?: string;
  idType?: string;
  
  // Entity fields
  entityName?: string;
  companyCategory?: string;
  
  // Common identification fields
  taxpayerReference?: string;
  vatReference?: string;
  customsClientNo?: string;
  ccn?: string;
  thirdPartyCode?: string;
  
  // Address
  address: BopThirdPartyAddress;
  
  // Postal address (optional)
  hasPostalAddress?: boolean;
  postalAddress?: BopThirdPartyAddress;
  
  // Contact information
  phone?: BopThirdPartyPhone;
  contact?: BopThirdPartyContact;
  
  // Status and metadata
  entityCategory?: string;
  countryRegion?: string;
  authoriseStatus?: string;
  createdBy?: string;
  createdDateTime?: string;
  lastAuthorisedBy?: string;
  lastAuthorisedDateTime?: string;
  whenModified?: number;
  
  // Audit and approval
  canAuthorise?: boolean;
  hasDAPPermission?: boolean;
  declineReason?: string;
  deleteInd?: string;
  originatingChannel?: string;
  
  // Customer association
  customerKey?: number;
  customerId?: string;
  customerName?: string;
  customerStatus?: string;
  customerCountry?: string;
}
