export interface CompanyDetailsPayload {
  companyName: string;
  companyId: string;
  companyRegistrationNumber?: string;
  referenceCurrency?: string;
  companyTaxNumber: string;
  companyVatNumber: string;
  systemId?: string;
  operationsMode?: string;
  companyAddress: {
    postCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    townCity?: string;
    regionName?: string;
    country: string;
  },
  companyPostalAddress: {
    postCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    townCity?: string;
    regionName?: string;
    country: string;
  },
  companyCommunicationInformation: {
    principlePointOfContact?: string;
    jobTitle?: string;
    mobilePhoneNumber?: string;
    workPhoneNumber?: string;
    emailAddress?: string;
  },
  passwordRenewalSchedule: {
    passwordRenewalRequired?: boolean;
    passwordExpiryDate?: string;
  }
}