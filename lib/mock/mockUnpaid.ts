const statuses = [
  { value: 'Active', color: 'success' },
  { value: 'Inactive', color: 'warning' }
];

export const mockUnpaid = Array.from({ length: 200 }, (_, i) => {
  const status = statuses[i % statuses.length];
  return {
    id: `${i + 1}`,
    unpaidOption: `Unpaid Option ${i + 1}`,
    postingOption: `Posting Option ${i + 1}`,
    postingAccount: `Posting Account ${i + 1}`,
    status,
    links: {
      href: `/unpaid/details?mode=view&unpaidId=${i + 1}`,
      text: 'manageUnpaidOption'
    }
  };
});
