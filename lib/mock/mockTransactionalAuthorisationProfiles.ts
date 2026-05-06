export type TransactionalAuthorisationProfileRow = {
  id: string;
  authorisationProfileName: {
    name: string;
  };
  authorisationProfileDescription: string;
  currency: string;
  status: {
    value: 'Active' | 'Needs Action' | 'Awaiting Approval' | 'Processing' | 'Inactive' | 'Unusable';
    color: 'success' | 'warning' | 'error' | 'info' | 'grey';
    bgColor?: string;
    textColor?: string;
    customPalette?: {
      success?: { lighter: string; light: string; main: string };
      warning?: { lighter: string; light: string; main: string };
      error?: { lighter: string; light: string; main: string };
      info?: { lighter: string; light: string; main: string };
      grey?: { lighter: string; light: string; main: string };
    };
  };
  links: { href: string; text: string };
};

const profileTemplates = [
  {
    name: 'High Value Transactions',
    description: 'Authorisation profile for transactions exceeding R500,000',
  },
  {
    name: 'Standard Payments',
    description: 'Default profile for routine business payments and transfers',
  },
  {
    name: 'International Wire Transfers',
    description: 'Profile for cross-border payments and foreign currency transactions',
  },
  {
    name: 'Salary Disbursements',
    description: 'Profile specifically designed for monthly payroll processing',
  },
  {
    name: 'Vendor Payments',
    description: 'Profile for supplier and contractor payment authorisations',
  },
  {
    name: 'Treasury Operations',
    description: 'Profile for treasury management and investment transactions',
  },
  {
    name: 'Low Value Payments',
    description: 'Streamlined profile for transactions under R10,000',
  },
  {
    name: 'Bulk Payment Processing',
    description: 'Profile for high-volume batch payment processing',
  },
];

const currencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD'];
const statuses = [
  { value: 'Active' as const, color: 'success' as const },
  { value: 'Inactive' as const, color: 'grey' as const },
  { value: 'Needs Action' as const, color: 'warning' as const },
  { value: 'Awaiting Approval' as const, color: 'info' as const },
  { value: 'Processing' as const, color: 'info' as const },
  { value: 'Unusable' as const, color: 'error' as const },
];

const customPalettes = {
  success: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
  grey: { grey: { lighter: '#F8F9FA', light: '#CED3D9', main: '#6C757D' } },
  warning: { warning: { lighter: '#FFF9E6', light: '#FFE49C', main: '#FFC107' } },
  info: { info: { lighter: '#E7F3FF', light: '#A3D4FF', main: '#0066CC' } },
  error: { error: { lighter: '#FFEBEE', light: '#FFCDD2', main: '#D32F2F' } },
};

export const mockTransactionalAuthorisationProfiles: TransactionalAuthorisationProfileRow[] = [];

// Generate 100 diverse entries
for (let i = 1; i <= 100; i++) {
  const template = profileTemplates[(i - 1) % profileTemplates.length];
  const currency = currencies[(i - 1) % currencies.length];
  const statusInfo = statuses[(i - 1) % statuses.length];

  mockTransactionalAuthorisationProfiles.push({
    id: String(i),
    authorisationProfileName: {
      name: i > 8 ? `${template.name} ${Math.floor((i - 1) / 8) + 1}` : template.name,
    },
    authorisationProfileDescription: template.description,
    currency: currency,
    status: {
      value: statusInfo.value,
      color: statusInfo.color,
      customPalette: customPalettes[statusInfo.color],
    },
    links: {
      href: '/setup-and-admin/transactional-authorisation-profile/manage',
      text: 'MANAGE PROFILE',
    },
  });
}
