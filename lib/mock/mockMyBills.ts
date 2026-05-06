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

export const mockMyBillsData = Array.from({ length: 200 }, (_, i) => {
  const status = statuses[i % statuses.length];
  return {
    id: `${i + 1}`,
    billerId: `${i + 1}`,
    billerName: `Biller-Name${String(i + 1).padStart(2, '0')}`,
    country: 'South Africa',
    amount: `BIC${String(i + 1).padStart(4, '0')}`,
    dueDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], // YYYY-MM-DD
    reference: (Math.random() * 10000).toFixed(2),
    status,
    links: { href: `/my-bills/details?billerId=${i + 1}`, text: 'viewAdvice' }
  }
});

