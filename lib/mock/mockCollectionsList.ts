export const mockCollectionHistory = Array.from({ length: 200 }, (_, i) => {
  return {
    id: `${i + 1}`,
    beneficiaryName: `Beneficiary ${i + 1}`,
    beneficiaryCode: `BEN-${String(i + 1).padStart(3, '0')}`,
    links: {
      href: `/collections/history-detail?mode=view&collectionId=${i + 1}`,
      text: 'viewCollectionHistory'
    }
  };
});

export const mockCollectionsList = Array.from({ length: 200 }, (_, i) => {
  const statuses = [
    { value: 'complete', color: 'success' },
    { value: 'awaitingApproval', color: 'warning' },
    { value: 'declined', color: 'error' },
  ];

  const idx = i + 1;
  const status = statuses[idx % statuses.length];

  return {
    id: idx,
    collectionId: `COLL-${String(idx).padStart(3, '0')}`,
    paymentId: `PMT-${String(idx).padStart(3, '0')}`,
    paymentType: ['Invoice', 'Salary', 'Refund'][idx % 3],
    debitReference: `DEBIT-REF-${String(idx).padStart(3, '0')}`,
    customerBatchReference: `BATCH-REF-${String(idx).padStart(3, '0')}`,
    batchId: `BATCH-${String(idx).padStart(3, '0')}`,
    debtorName: `DEBIT-${String(idx).padStart(3, '0')}`,
    valueDate: `2026-01-${String((idx % 28) + 1).padStart(2, '0')}`,
    dateValue: new Date(2026, 0, (idx % 28) + 1),
    accountNumber: 'XXXXXXX',
    amount: Math.floor(Math.random() * 30000) + 1000,
    currency: ['USD', 'EUR', 'GBP'][idx % 3],
    status,
    links: {
      href: `/find-transactions/detail?collectionId=COLL-${String(idx).padStart(3, '0')}&transactionType=collection`,
      text: 'viewDetails',
    },
  };
});
