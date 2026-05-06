// Authorization Rules Configuration
export interface AuthorizationRuleConfig {
  id: string;
  title: string;
  operations: string[];
}

export const authorizationRulesConfig: AuthorizationRuleConfig[] = [
  {
    id: 'accountlimit',
    title: 'Account limit',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'agreement',
    title: 'Agreement',
    operations: ['Create', 'Repair','suspend', 'Delete', 'Update', 'Enable'],
  },
  {
    id: 'authorisation-profile',
    title: 'Authorisation profile',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'bop-third-party',
    title: 'BOP third party',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'beneficiary',
    title: 'Beneficiary',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'billers',
    title: 'Billers',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'bills',
    title: 'Bills',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'cash-deposit-limit',
    title: 'Cash deposit limit',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'cash-deposit-type',
    title: 'Cash deposit type',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'central-bank-exemption',
    title: 'Central bank exemption',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'collection-type',
    title: 'Collection type',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'customer-access-policy',
    title: 'Customer access policy',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'customer-credit-limit',
    title: 'Customer credit limit',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'customer-limit',
    title: 'Customer limit',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'customer-role',
    title: 'Customer role',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'customer-user',
    title: 'Customer user',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'debtor',
    title: 'Debtor',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'file-mapper-template',
    title: 'File mapper template',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'inward-payment-type',
    title: 'Inward payment type',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'lms-account-group',
    title: 'LMS account group',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'my-bills',
    title: 'My bills',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'password-credential-status',
    title: 'Password credential status',
    operations: ['Update'],
  },
  {
    id: 'payment-type',
    title: 'Payment type',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'person',
    title: 'Person',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'stop-payment',
    title: 'Stop payment',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'stop-payment-cancel',
    title: 'Stop payment cancel',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'stop-payment-cheque',
    title: 'Stop payment cheque',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'store',
    title: 'Store',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'transfer-type',
    title: 'Transfer type',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'unpaid-options',
    title: 'Unpaid options',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'user-limit',
    title: 'User limit',
    operations: ['Create', 'Repair', 'Delete', 'Update'],
  },
  {
    id: 'vasco-go3-token-credential-status',
    title: 'Vasco go3 token credential status',
    operations: ['Create'],
  },
];
