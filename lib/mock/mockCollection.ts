const statuses = [
  { value: 'Approved', color: 'success' },
  { value: 'Account dormant', color: 'warning' },
  { value: 'Awaiting approval', color: 'info' },
  { value: 'Declined', color: 'error' },
  { value: 'Date expired', color: 'info' },
  { value: 'Invalid account number', color: 'warning' },
  { value: 'Daily limit exceeded', color: 'info' },
  { value: 'Invalid account number', color: 'info' },
  { value: 'Awaiting approval', color: 'info' },
  { value: 'Declined', color: 'error' },
  { value: 'File validation in progress', color: 'default' },
  { value: 'File validation failed', color: 'error' },
  { value: 'Approved', color: 'success' },
  { value: 'Account dormant', color: 'warning' },
  { value: 'Awaiting approval', color: 'info' }
];


export const mockCollection = Array.from({ length: 200 }, (_, i) => {
  const status = statuses[i % statuses.length];
  return {
    id: `${i + 1}`,
    batchId: `Batch${String(i + 1).padStart(3, '0')}`,
    scheduleId: `Schedule${String(i + 1).padStart(3, '0')}`,
    dateCreated: new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB'),
    instructions: i + 1,
    amount: `£${(1000 + i * 50).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    collectionType:`Type ${i + 1}`,
    status,
    paymentId: `PAY${String(i + 1).padStart(4, '0')}`,
    valueDate: new Date(Date.now() - (i + 1) * 86400000).toLocaleDateString('en-GB'),
    expiryDate: new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString('en-GB'),
    links: {
      href: `/collections/details?mode=view&paymentId=${i + 1}`,
      text:
        status.value === 'Awaiting approval'
          ? 'sendReminder'
          : ['completed', 'declined', 'other'].includes(status.value.toLowerCase())
            ? 'viewCollection'
            : 'Managecollection'
    }
  };
});
