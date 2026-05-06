export interface UserDetailsPayload {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  identificationType?: string;
  identificationNumber: string;
  language: string;
  gender?: string;
  addressDetails: {
    postCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    townCity?: string;
    regionName?: string;
    country: string;
  },
  postalAddressCheck: boolean;
  postalAddressDetails: {
    postCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    townCity?: string;
    regionName?: string;
    country: string;
  };
  phoneEmailDetails: {
    mobilePhoneNumber?: string;
    mobileCommunicationPermissions?: string;
    homePhoneNumber?: string;
    homeCommunicationPermissions?: string;
    emailAddress?: string;
    emailCommunicationPermissions?: string;
  }
}