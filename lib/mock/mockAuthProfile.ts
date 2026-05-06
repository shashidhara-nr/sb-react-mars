// mockPayments.ts


const statuses = [
  { value: 'Active', color: 'success' },
  { value: 'Inactive', color: 'warning' }
];

export const mockAuthProfiles = Array.from({ length: 200 }, (_, i) => {
  const status = statuses[i % statuses.length];
  return {
    id: `${i + 1}`,
    authProfileName: `AuthProfile${String(i + 1).padStart(3, '0')}`,
    authProfileDescription: `Description for AuthProfile${String(i + 1).padStart(3, '0')}`,
    currency: ['USD', 'EUR', 'GBP'][i % 3],
    status,
    links: {
      href: `/auth-profiles/details?mode=view&authProfileId=${i + 1}`,
      text: 'manageProfile'
    }
  };
});
