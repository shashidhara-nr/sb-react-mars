export interface BillingAccountDetails {
  id: string;
  accountName: string;
  accountNumber: string;
  branchSortCode: string;
  bicSwift: string;
  currency: string;
  countryRegion: string;
  billingAccountType: string;
}

export interface CreateBillingAccountPayload {
  billingAccount: string;
  billingAddBankAccounts: [
    {
      accountName: '',
      accountNumber: '',
      branchSortCode: '',
      bicSwift: '',
      currency: '',
      countryRegion: ''
    }
  ],
  billingAccountType: string;
}
