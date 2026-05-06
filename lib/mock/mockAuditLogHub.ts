const ENTITY_NAMES = [
  'John Doe Beneficiary',
  'Acme Corp Account',
  'Sarah Johnson User',
  'Tech Innovations Ltd',
  'Maria Garcia Beneficiary',
  'Global Commerce Account',
  'Alex Chen User',
  'Stellar Enterprises',
  'Emma Wilson Beneficiary',
  'Premier Finance Account',
];

const ENTITY_TYPES = ['beneficiaries', 'accounts', 'users', 'transfers', 'beneficiaries', 'accounts', 'users', 'transfers'];

const FUNCTIONS = [
  'ACHReturnedTransactions',
  'AccountBalances',
  'Entity Type Account Verification Online',
  'Accounts',
  'AdhocBilling',
  'Agreements',
  'AuditLog',
  'AuthorisationClasses',
  'AuthorisationEvents',
  'AuthorisationProfiles',
  'BOPThirdParties',
  'BankAuthorisationClasses',
  'BankAuthorisationStaticRule',
  'BankBranchCodes',
  'BankDepartments',
  'BankRoles',
  'TokenOrder',
  'BankUsers',
  'BankingRelationships',
  'BankingServices',
  'Banks',
  'Bank to Bank Information',
  'Beneficiaries',
  'BillerReports',
  'Billers',
  'BillingAccounts',
  'BillingAdvice',
  'Bills',
  'BranchCodes',
  'BusinessCalendars',
  'BusinessOnlineTrainingPortal',
  'CashCentre',
  'Cash deposit',
  'Cash deposit type',
  'Central bank exemption'
];

const USERNAMES = [
  'jsmith@company.com',
  'mwilson@company.com',
  'agarcia@company.com',
  'dchen@company.com',
  'rkumar@company.com',
  'jdoe@company.com',
  'lpatel@company.com',
  'mkhan@company.com',
  'sbrown@company.com',
  'treynolds@company.com',
];

const USER_IDS = [
  'USR001234',
  'USR005678',
  'USR009012',
  'USR003456',
  'USR007890',
  'USR001111',
  'USR002222',
  'USR003333',
  'USR004444',
  'USR005555',
];

const USER_ACCOUNTS = [
  'Corporate Main Account',
  'Operations Account',
  'Finance Account',
  'Treasury Account',
  'Management Account',
  'Payments Account',
  'Collections Account',
  'Settlement Account',
];

export const mockAuditLogHubData = Array.from({ length: 50 }, (_, i) => {
  const date = new Date(2024, 5, Math.floor(Math.random() * 30) + 1);
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const second = String(Math.floor(Math.random() * 60)).padStart(2, '0');

  return {
    id: `${i + 1}`,
    entityName: ENTITY_NAMES[i % ENTITY_NAMES.length],
    entityType: ENTITY_TYPES[i % ENTITY_TYPES.length],
    function: FUNCTIONS[i % FUNCTIONS.length],
    username: USERNAMES[i % USERNAMES.length],
    userId: USER_IDS[i % USER_IDS.length],
    userAccount: USER_ACCOUNTS[i % USER_ACCOUNTS.length],
    dateTime: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${hour}:${minute}:${second}`,
    links: { href: `/audit-log-hub/details?logId=${i + 1}`, text: 'viewLog' }
  };
});

export const mockAuditLogHubDetailData = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  auditRecords: `CC${String(i + 1).padStart(3, '0')}`
}));