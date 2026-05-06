// mockPayments.ts

const collectionStatuses = [
  { value: 'Needs action', color: 'warning' },
  { value: 'Awaiting Approval', color: 'info' },
  { value: 'Processing', color: 'primary' },
  { value: 'Complete', color: 'success' },
  { value: 'Decline', color: 'error' }
];

export const mockCollectionTrackList = Array.from({ length: 200 }, (_, i) => {
  const status = collectionStatuses[i % collectionStatuses.length];

  return {
    id: `${i + 1}`,
    paymentId: `Payment${String(i + 1).padStart(5, '0')}`,
    valueDate: `2026-01-${String((i % 30) + 1).padStart(2, '0')}`,
    instruction: `Instruction for collection ${i + 1}`,
    amount: (Math.random() * 10000).toFixed(2),
    collectionType: ['Direct Debit', 'Standing Order', 'Wire Transfer'][i % 3],
    status,
    links: {
      href: `/collections/manage?mode=view&authProfileId=${i + 1}`,
      text: 'manageCollection'
    }
  };
});


// @lib/mock/mockReports.ts

const reportStatuses = [
  { value: 'Needs action', color: 'warning' },
  { value: 'Awaiting Approval', color: 'info' },
  { value: 'Processing', color: 'primary' },
  { value: 'Complete', color: 'success' },
  { value: 'Decline', color: 'error' }
];

export const mockReports = Array.from({ length: 30 }, (_, i) => {
  const status = reportStatuses[i % reportStatuses.length];

  return {
    id: i + 1,
    dateRange: `0${(i % 3) + 1}/MM/YYYY`,
    batchId: `BATCH-${1000 + i}`,
    processed: 5 + (i % 5),
    partiallyProcessed: i % 3,
    status
  };
});