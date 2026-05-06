export const mockLimitsAllRecordsTableData = Array.from({ length: 200 }, (_, i) => {
  // Generate realistic limit data with proper types and statuses
  const limitTypes = [
    { name: 'Overall', type: 'OVERALL_PAYMENT', mandatory: true },
    { name: 'Overall', type: 'OVERALL_TRANSFER', mandatory: true },
    { name: 'Domestic Payment', type: 'PAYMENT', mandatory: false },
    { name: 'International Payment', type: 'PAYMENT', mandatory: false },
    { name: 'Transfer', type: 'TRANSFER', mandatory: false },
    { name: 'Collection', type: 'COLLECTION', mandatory: false },
  ];

  // Statuses: N (New), ACA (Awaiting Authorization), ACT (Authorization Completed), R (Repair), C (Cancelled), U (Updated)
  const statuses = [
    { value: 'Active', statusCode: 'N', color: 'success' },
    { value: 'Pending', statusCode: 'ACA', color: 'warning' },
    { value: 'Authorized', statusCode: 'ACT', color: 'info' },
    { value: 'Repair', statusCode: 'R', color: 'error' },
    { value: 'Inactive', statusCode: 'U', color: 'secondary' },
  ];

  const limitType = limitTypes[i % limitTypes.length];
  const status = statuses[i % statuses.length];

  return {
    id: i + 1,
    limitTypeName: limitType.name,
    limitType: limitType.type,
    limitCurrency: i % 2 === 0 ? 'USD' : 'EUR',
    limitAmount: (Math.random() * 5000).toFixed(2),
    limitPeriodDays: (i % 30) + 1,
    productType: i % 2 === 0 ? 'ProductA' : 'ProductB',
    debtStatus: { value: status.value, color: status.color },
    status: status.statusCode,
    correctStatus: status.statusCode,
    correctLimitTypeName: limitType.name,
    hasDeletePermission: i % 5 !== 0, // Some users don't have permission
    editButtonEnabled: i % 7 !== 0, // Some users don't have edit permission
    links: { href: `/limits/manage-limit?&limitId=${i + 1}`, text: 'manageLimit' }
  };
});

export const mockCreditLimitsAllRecordsTableData = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  creditLimitName: `CreditLimitName${i + 1}`,
  creditLimitType: i % 3 === 0 ? 'TypeA' : 'TypeB',
  fromDate: `2024-01-${(i % 30) + 1}`,
  toDate: `2024-12-${(i % 30) + 1}`,
  productType: i % 2 === 0 ? 'ProductA' : 'ProductB',
  status: { value: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Inactive' : 'Pending', color: i % 3 === 0 ? 'success' : i % 3 === 1 ? 'warning' : 'primary' },
  links: { href: `/credit-limits/details?&limitId=${i + 1}`, text: 'manageLimit' }
}));

export const mockAllocationTableData = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  productName: `ProductName${i + 1}`,
  utilisation: (Math.random() * 100).toFixed(2),
  dailyLimit: (Math.random() * 1000).toFixed(2),
  weeklyLimit: (Math.random() * 5000).toFixed(2),
  monthlyLimit: (Math.random() * 20000).toFixed(2),
  quarterlyLimit: (Math.random() * 50000).toFixed(2),
  annualLimit: (Math.random() * 100000).toFixed(2)
}));

export const mockUsageByGroupTableData = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  accountGroupName: `AccountGroup${(i % 10) + 1}`,
  utilisation: (Math.random() * 100).toFixed(2),
  dailyLimit: (Math.random() * 1000).toFixed(2),
  weeklyLimit: (Math.random() * 5000).toFixed(2),
  monthlyLimit: (Math.random() * 20000).toFixed(2),
  quarterlyLimit: (Math.random() * 50000).toFixed(2),
  annualLimit: (Math.random() * 100000).toFixed(2),
  productName: `ProductName${i + 1}`
}));


export const mockUsageByAccountTableData = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  accountNumber: `ACC${(10000 + i)}`,
  utilisation: (Math.random() * 100).toFixed(2),
  dailyLimit: (Math.random() * 1000).toFixed(2),
  weeklyLimit: (Math.random() * 5000).toFixed(2),
  monthlyLimit: (Math.random() * 20000).toFixed(2),
  quarterlyLimit: (Math.random() * 50000).toFixed(2),
  annualLimit: (Math.random() * 100000).toFixed(2)
}));

export const mockAccountTableData = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  accountNumber: `ACC${(10000 + i)}`,
  accountName: `AccountName${i + 1}`,
  accountOwner: `Owner${(i % 20) + 1}`,
  bicSwift: `BICSWIFT${(i % 50) + 1}`,
  bankName: `BankName${(i % 10) + 1}`,
  status: { value: i % 2 === 0 ? 'Active' : 'Inactive', color: i % 2 === 0 ? 'success' : 'error' },
  annualLimit: (Math.random() * 100000).toFixed(2)
}));
