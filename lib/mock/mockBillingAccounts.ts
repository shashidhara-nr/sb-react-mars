// mockBillingAccounts.ts
const currencies = ['USD', 'EUR', 'GBP'];
const countries = ['ZA', 'US', 'UK'];
const types = ['nonTransactional', 'transactional'];

export const mockBillingAccountsData = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  accountBalance: { 
    name: `[Account name ${i + 1}]`, 
    number: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
    accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
    branch: `BR${String(i % 10).padStart(2, '0')}`,
  },
  serialNumber: `SN${String(i + 1).padStart(4, '0')}`,
  bicSwift: `BIC${String(i + 1).padStart(4, '0')}`,
  branchSortCode: `SC${String(i + 1).padStart(4, '0')}`,
  currency: currencies[i % currencies.length],
  countryRegion: countries[i % countries.length],
  billingAccountType: types[i % types.length],
  links: { href: `/billing-accounts/manage?accountId=${i + 1}`, text: 'manageAccount' },
}));

export const mockBillingAccountsBatchData = Array.from({ length: 10 }, (_, i) => ({
  accountName: `[Account name ${i + 1}]`,
  accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
  branchSortCode: `SC${String(i + 1).padStart(4, '0')}`,
  bicSwift: `BIC${String(i + 1).padStart(4, '0')}`,
  currency: currencies[i % currencies.length],
  countryRegion: countries[i % countries.length],
  feeOption: i % 2 === 0 ? 'fixed' : 'variable',
}));
