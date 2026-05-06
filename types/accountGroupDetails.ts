export interface CreateAccountGroupPayload {
  accountGroupName: string;
  serviceAgreement: string;
  addAccounts: AccountGroupAccountDetails[];
  subGroups: SubGroup[];
  accountGroupDetails: AccountGroupDetailsState | null;
}

export interface SubGroup {
  subGroupName: string;
  subGroupAccounts: AccountGroupAccountDetails[];
}

export interface AccountGroupDetailsState {
  accountGroupName: string;
  serviceAgreement: {label: string; value: string} | null;
}

export interface AccountGroupAccountDetails {
  id: string;
  name: string;
  masked: string;
  accNumber: string;
  sortCode: string;
  bic: string;
  counterPartyName: string;
  financialInstitutionName: string;
  branchName: string;
  town: string;
  bankCountryCode: string;
  accountType: string;
  addressLine1: string;
  currency: string;
  countryRegion: string;
  checkbox?: boolean;
}
