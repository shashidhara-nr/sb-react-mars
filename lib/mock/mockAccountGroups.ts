// mockAccountGroups.ts
export const mockAccountGroupsData = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  accountGroupName: `[Account Group name ${i + 1}]`,
  numberOfAccounts: `[X ${String(i + 1).padStart(4, '0')}]`,
  serviceAgreement: `[Service Agreement name ${(i % 3) + 1}]`,
  links: { href: `/account-groups/manage`, text: 'manageAccountGroup' },
}));
 
export const mockAccountGroupsBatchData = Array.from({ length: 10 }, (_, i) => ({
  name: `[Account name ${i + 1}]`,
  accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
  branchSortCode: `SC${String(i + 1).padStart(4, '0')}`,
  bicSwift: `BIC${String(i + 1).padStart(4, '0')}`,
  currency: 'GBP',
  countryRegion: 'UK',
  feeOption: i % 2 === 0 ? 'Standard' : 'Premium',
}));