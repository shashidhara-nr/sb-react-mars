export const mockAuditPaymentTableData = Array.from({ length: 200 }, (_, i) => ({
  paymentID: `PID${i + 1}`,
  dateCreated: `2024-06-${(i % 30) + 1}`,
  userName: `User${i + 1}`,
  instructions: `Instruction ${i + 1}`,
  paymentType: i % 2 === 0 ? 'Credit' : 'Debit',
  amount: (Math.random() * 1000).toFixed(2),
  links: { href: `/accounts-and-balances/transactions-and-statement?tab=transactions&accountId=${i + 1}`, text: 'viewAndManage' }
}));

export const mockAuditCollectionTableData = Array.from({ length: 200 }, (_, i) => ({
  collectionID: `CID${i + 1}`,
  dateCreated: `2024-06-${(i % 30) + 1}`,
  userName: `User${i + 1}`,
  instructions: `Instruction ${i + 1}`,
  collectionType: i % 2 === 0 ? 'Credit' : 'Debit',
  amount: (Math.random() * 1000).toFixed(2),
  links: { href: `/accounts-and-balances/transactions-and-statement?tab=transactions&accountId=${i + 1}`, text: 'viewAndManage' }
}));

export const mockAuditTransferTableData = Array.from({ length: 200 }, (_, i) => ({
  transferID: `TID${i + 1}`,
  dateCreated: `2024-06-${(i % 30) + 1}`,
  userName: `User${i + 1}`,
  instructions: `Instruction ${i + 1}`,
  transferType: i % 2 === 0 ? 'Credit' : 'Debit',
  amount: (Math.random() * 1000).toFixed(2),
  links: { href: `/accounts-and-balances/transactions-and-statement?tab=transactions&accountId=${i + 1}`, text: 'viewAndManage' }
}));