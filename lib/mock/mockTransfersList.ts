export const mockTransfersList = Array.from({ length: 200 }, (_, i) => {
  const statuses = [
    { value: 'complete', color: 'success' },
    { value: 'awaitingApproval', color: 'warning' },
    { value: 'declined', color: 'error' },
  ];

  const idx = i + 1;
  const status = statuses[idx % statuses.length];

  return {
    id: idx,
    instructionId: `INST-${String(idx).padStart(3, '0')}`,
    batchId: `BATCH-${String(idx).padStart(3, '0')}`,
    transactionId: `TXN-${String(idx).padStart(3, '0')}`,
    debitAccount: `DEBIT-${String(idx).padStart(3, '0')}`,
    creditAccount: `CREDIT-${String(idx).padStart(3, '0')}`,
    valueDate: `2026-01-${String((idx % 28) + 1).padStart(2, '0')}`,
    dateValue: new Date(2026, 0, (idx % 28) + 1),
    accountNumber: 'XXXXXXX',
    amount: Math.floor(Math.random() * 30000) + 1000,
    currency: ['USD', 'EUR', 'GBP'][idx % 3],
    paymentType: ['Invoice', 'Salary', 'Refund'][idx % 3],
    status,
    links: {
      href: `/find-transactions/detail?paymentId=PMT-${String(idx).padStart(3, '0')}&transactionType=transfer`,
      text: 'viewDetails',
    },
  };
});
