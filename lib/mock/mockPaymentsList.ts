export const mockPaymentsList = Array.from({ length: 200 }, (_, i) => {
  const statuses = [
    { value: 'complete', color: 'success' },
    { value: 'awaitingApproval', color: 'warning' },
    { value: 'declined', color: 'error' },
  ];
  const names = ['John Doe', 'Jane Smith', 'ABC Traders', 'Global Corp', 'Sunrise Ltd'];

  const idx = i + 1;
  const status = statuses[idx % statuses.length];
  const name = names[idx % names.length];

  return {
    id: idx,
    paymentId: `PMT-${String(idx).padStart(3, '0')}`,
    batchId: `BATCH-${String(idx).padStart(3, '0')}`,
    transactionId: `TXN-${String(idx).padStart(6, '0')}`,
    customerBatchReference: `CBR-${String(idx).padStart(4, '0')}`,
    debitReference: `DR-${String(idx).padStart(5, '0')}`,
    paymentType: ['Invoice', 'Salary', 'Refund'][idx % 3],
    beneficiaryName: name,
    valueDate: `2026-01-${String((idx % 28) + 1).padStart(2, '0')}`,
    dateValue: new Date(2026, 0, (idx % 28) + 1),
    accountNumber: 'XXXXXXX',
    amount: Math.floor(Math.random() * 30000) + 1000,
    currency: ['USD', 'EUR', 'GBP'][idx % 3],
    status,
    links: {
      href: `/find-transactions/detail?paymentId=PMT-${String(idx).padStart(3, '0')}&transactionType=payment`,
      text: 'viewDetails',
    },
  };
});

export const mockAuditTrail = Array.from({ length: 200 }, (_, i) => {
  const idx = i + 1;

  return {
    id: idx,
    userName: `user-${String(idx).padStart(3, '0')}`,
    eventType: `Event-${String(idx).padStart(3, '0')}`,
    description: `Description for event ${idx}`,
    dateTime: new Date(2025, 10, (idx % 28) + 1).toLocaleString(),
  };
});
