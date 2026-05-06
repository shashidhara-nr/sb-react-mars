// // mockBillingAccounts.ts
// export const mockPaymentDetailsData = Array.from({ length: 200 }, (_, i) => ({
//   id: `${i + 1}`,
//   accountBalance: { name: `[Account name ${i + 1}]`, number: `XXXXXXXX${String(i + 1).padStart(2, '0')}` },
//   serialNumber: `SN${String(i + 1).padStart(4, '0')}`,
//   bicSwift: `BIC${String(i + 1).padStart(4, '0')}`,
//   branchSortCode: `SC${String(i + 1).padStart(4, '0')}`,
//   currency: 'GBP',
//   countryRegion: 'UK',
//   billingAccountType: 'Current',
//   links: { href: `/billing-accounts/manage?accountId=${i + 1}`, text: 'manageAccount' },
// }));

// export const mockPaymentDetails = Array.from({ length: 10 }, (_, i) => ({
//   accountName: `[Account name ${i + 1}]`,
//   accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
//   branchSortCode: `SC${String(i + 1).padStart(4, '0')}`,
//   bicSwift: `BIC${String(i + 1).padStart(4, '0')}`,
//   currency: 'GBP',
//   countryRegion: 'UK',
//   feeOption: i % 2 === 0 ? 'Standard' : 'Premium',
// }));


// mockBillingAccounts.ts

export const mockPaymentDetailsData = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,

  accountBalance: {
    name: `[Account name ${i + 1}]`,
    number: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
  },
 accountName: `[Account name ${i + 1}]`,
 accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,

  serialNumber: `SN${String(i + 1).padStart(4, '0')}`,
  bicSwift: `BIC${String(i + 1).padStart(4, '0')}`,
  branchSortCode: `SC-${String(i + 1).padStart(2, '0')}-${String(i + 2).padStart(2, '0')}`,


  beneficiaryCode: `BEN${String(i + 1).padStart(5, '0')}`,
  beneficiaryType: i % 2 === 0 ? 'Individual' : 'Corporate',
  beneficiaryCdiReference: `CDI-REF-${String(i + 1).padStart(6, '0')}`,

  transferAmount: 1200 + i * 5,
  transactionCurrency: 'GBP',

  currency: 'GBP',
  countryRegion: 'UK',
  billingAccountType: 'Current',
  

}));