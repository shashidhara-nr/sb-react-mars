export const mockUserDetailsData = Array.from({ length: 200 }, (_, i) => ({
  id: `user${i + 1}`,
  userName: `user${i + 1}`,
  userId: `userId${i + 1}`,
  idNumber: `ID${String(i + 1).padStart(6, '0')}`,
  dob: `1990-01-${String((i % 28) + 1).padStart(2, '0')}`,
  email: `user${i + 1}@example.com`,
  adminRole: i % 2 === 0 ? 'admin' : 'user',
  status: { value: i % 2 === 0 ? 'Active' : 'Inactive', color: i % 2 === 0 ? 'success' : 'error' },
  links: { href: `/user-details/manage-user?userId=${i + 1}`, text: 'manageUser' },
}));

export const mockUserAccountsData = Array.from({ length: 200 }, (_, i) => ({
  id: `account${i + 1}`,
  userAccountName: `account${i + 1}`,
  userAccountId: `accountId${i + 1}`,
  userName: `user${i + 1}`,
  adminRole: i % 2 === 0 ? 'admin' : 'user',
  authClass: i % 3 === 0 ? 'classA' : 'classB',
  status: { value: i % 2 === 0 ? 'Active' : 'Inactive', color: i % 2 === 0 ? 'success' : 'error' },
  links: {
    href: `/user-accounts/manage-user-account?userAccountId=${i + 1}`,
    text: 'manageAccount',
  },
}));

export const mockUserCredentials = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  accountBalance: {
    name: `[Account name ${i + 1}]`,
    number: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
  },
  credentials: `cred${i + 1}`,
  state: i % 2 === 0 ? 'active' : 'inactive',
  lastUsedOn: `2024-06-${String((i % 28) + 1).padStart(2, '0')}`,
  lastStateChange: `2024-05-${String((i % 28) + 1).padStart(2, '0')}`,
  authorisationStatus: {
    value: i % 2 === 0 ? 'Approved' : 'Awaiting client feedback',
    color: i % 2 === 0 ? 'success' : 'warning',
  },
  links:
    i % 2 === 0
      ? {
          href: `/user-details/manage-user?userId=${i + 1}&mode=viewPassword`,
          text: 'viewPassword',
        }
      : { href: `/user-details/manage-user?userId=${i + 1}&mode=viewToken`, text: 'viewToken' },
}));

export const mockUserCredentialHistory = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  dateAndTime: `2024-06-${String((i % 28) + 1).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00:00Z`,
  credential: `cred${i + 1}`,
  userID: `userId${i + 1}`,
  previousState: i % 2 === 0 ? 'inactive' : 'active',
  newState: i % 2 === 0 ? 'active' : 'inactive',
  details: ` ${i % 2 === 0 ? 'inactive' : 'active'} to ${i % 2 === 0 ? 'active' : 'inactive'}`,
  status: { value: i % 2 === 0 ? 'active' : 'inactive', color: i % 2 === 0 ? 'success' : 'error' },
  links: {
    href: `/user-details/manage-user?userId=${i + 1}&mode=viewPassword`,
    text: 'active',
  },
}));

export const mockUserTokenHistory = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  orderNumber: `ORD${String(i + 1).padStart(5, '0')}`,
  createdOn: `2024-06-${String((i % 28) + 1).padStart(2, '0')}`,
  lastStateChangeDate: `2024-05-${String((i % 28) + 1).padStart(2, '0')}`,
  status: { value: i % 2 === 0 ? 'active' : 'inactive', color: i % 2 === 0 ? 'success' : 'error' },
  links: {
    href: `/user-details/manage-user?userId=${i + 1}&mode=viewPassword`,
    text: 'reOrderToken',
  },
}));
export const mockUserManagePassword = Array.from({ length: 5 }, (_, i) => ({
  id: `${i + 1}`,
  credentials: `ORD${String(i + 1).padStart(5, '0')}`,
  lastPasswordChanged: `2024-06-${String((i % 28) + 1).padStart(2, '0')}`,
  failedLoginAttempts: `2024-05-${String((i % 28) + 1).padStart(2, '0')}`,
  status: i % 2 === 0 ? 'Active' : 'Inactive',
}));
export const mockVasCogToken = Array.from({ length: 5 }, (_, i) => ({
  id: `${i + 1}`,
  credentials: `ORD${String(i + 1).padStart(5, '0')}`,
  status: i % 2 === 0 ? 'Active' : 'Inactive',
  errorCounter: 10,
  reSyncCounter: 10,
  backupUseCount: 10,
  backupReissueExtensionCounter: 10,
}));