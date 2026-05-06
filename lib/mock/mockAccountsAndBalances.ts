// mockAccountsAndBalances.ts
export const mockAccountsAndBalances = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  accountBalance: { name: `[Account name ${i + 1}]`, number: `XXXXXXXX${String(i + 1).padStart(2, '0')}` },
  openingBalance: `£${(10000 + i * 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  clearedBalance: `£${(8500 + i * 80).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  interimBalance: `£${(9000 + i * 90).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  availableBalance: `£${(7500 + i * 70).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  links: [
    { href: `/accounts-and-balances/transactions-and-statement?tab=transactions&accountId=${i + 1}`, text: 'transactions' },
    { href: `/accounts-and-balances/transactions-and-statement?tab=statements&accountId=${i + 1}`, text: 'statements' }
  ]
}));

export const mockTransactions = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  transactionType: `Type ${i + 1}`,
  originatorReference: `Ref${String(i + 1).padStart(3, '0')}`,
  description: `Transaction description ${i + 1}`,
  dateCreated: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
  bookDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
  amount: `£${(100 + i * 10).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}));

export const mockConsolidatedBalances = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
  accountName: `Account name ${i + 1}`,
  sortCode: `XX-XX-${String(i + 1).padStart(2, '0')}`,
  currency: 'GBP',
  conversionUSD: `£${(10000 + i * 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  balance: `£${(8500 + i * 80).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  balanceInUSD: `$${((8500 + i * 80) * 1.25).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  balanceAsAt: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
}));

export const mockExcludedBalances = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
  accountName: `Account name ${i + 1}`,
  currency: 'GBP',
  branchCode: `Branch code ${String(i + 1).padStart(3, '0')}`,
  reasonForExclusion: `Reason for exclusion ${i + 1}`,
}));

export const mockDownloadedReports = Array.from({ length: 50 }, (_, i) => {
  const statuses = [
    { value: 'approved', color: 'success' },
    { value: 'accountDormant', color: 'success' },
    { value: 'awaitingApproval', color: 'success' },
    { value: 'declined', color: 'success' },
    { value: 'dateExpired', color: 'success' }
  ];
  
  return {
    id: `${i + 1}`,
    reportName: `Report ${i + 1}`,
    dateCreated: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
    reportNumber: `RPT${String(i + 1).padStart(4, '0')}`,
    status: statuses[i % statuses.length]
  };
});

export const mockStatementData = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  statementNumber: `STM${String(i + 1).padStart(4, '0')}`,
  statementDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
  creditsCount: i + 1,
  debitsCount: i + 1,
  openingBalance: `£${(10000 + i * 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  closingBalance: `£${(8500 + i * 80).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}));

export const mockTransactionsData = Array.from({ length: 30 }, (_, i) => ({
  id: `${i + 1}`,
  originatorReference: `Ref${String(i + 1).padStart(3, '0')}`,
  valueDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
  bookDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
  description: `Transaction description ${i + 1}`,
  transactionType: `Type ${i + 1}`,
  serviceFee: `£${(5 + i * 0.5).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  amount: `£${(100 + i * 10).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}));  