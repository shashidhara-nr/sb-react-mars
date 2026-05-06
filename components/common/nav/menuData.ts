import { Certificate } from "crypto";

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  children?: NavItem[];
};

export const menuData: NavItem[] = [
  // High-level grouping entries
  {
    id: 'tp',
    label: 'Transactional participants',
    children: [
      { id: 'tp_beneficiaries', label: 'Beneficiaries', href: '/setup-and-admin/beneficiary' },
      { id: 'tp_unusable_beneficiaries', label: 'Unusable beneficiaries', href: '/setup-and-admin/beneficiary/unusable' },
      { id: 'tp_debtors', label: 'Debtors', href: '/setup-and-admin/debtors' },
      { id: 'tp_unusable_debtors', label: 'Unusable debtors', href: '/setup-and-admin/debtors/unusable' },
      { id: 'tp_unpaid_options', label: 'Unpaid Options', href: '/setup-and-admin/unpaid-options' },
      {
        id: 'tp_bop_third_parties',
        label: 'BOP Third Parties',
        href: '/setup-and-admin/bop-third-parties',
      },
      { id: 'tp_bills', label: 'Bills', href: '/setup-and-admin/bills' },
    ],
  },
  { id: 'pp', label: 'People and permissions',
    children: [
      {id: 'user_roles', label: 'User-roles', href: '/user-roles'},
      {id: 'user_details', label: 'User details', href: '/user-details'},
      {id: 'user_accounts', label: 'User accounts', href: '/user-accounts'}
    ]
   },
  {
    id: 'ap',
    label: 'Authorisation profiles',
    children: [
      {
        id: 'ap_transactional_auth_profile',
        label: 'Transactional',
        href: '/setup-and-admin/transactional-authorisation-profile',
      },
      {
        id: 'ap_non_transactional_auth_profile',
        label: 'Non-transactional',
        href: '/setup-and-admin/non-transactional',
      },
    ],
  },
  {
    id: 'tt',
    label: 'Transaction types',
    children: [
      { id: 'payment', label: 'Payment types', href: '/setup-and-admin/payment-types' },
      { id: 'transfer', label: 'Transfer types', href: '/setup-and-admin/transfer-types' },
      { id: 'collection', label: 'Collection types', href: '/setup-and-admin/collection-types' },
    ],
  },
  { id: 'as', label: 'Account settings', 
    children: [
      {id: 'company', label: 'Company details', href: '/company-details'},
      {id: 'billing', label: 'Billing accounts', href: '/billing-accounts'},
      {id: 'limits', label: 'Limits', href: '/limits'},
      {id: 'billing_advice', label: 'Billing advice', href: '/billing-advice-list'},
      {id: 'credits', label: 'Credit limits', href: '/credit-limits'},
      {id: 'banking', label: 'Banking accounts', href: '/banking-accounts'}
      
      
    ] 
  },
  { id: 'ops', 
    label: 'Operational settings',
    children: [
      {id: 'branch', label: 'Branch codes', href: '/branch-codes'},
      {id: 'rates', label: 'Currency rates', href: '/currency-rates'},
      {id: 'cut-off', label: 'Cut-off times', href: '/cutoff-times'},
      {id: 'participating', label: 'Participating Banks', href: '/participating-banks'},
      {id: 'country', label: 'Country Holidays', href: '/holiday-calendar/country'},
      {id: 'currency', label: 'Currency Holidays', href: '/holiday-calendar/currency'},
      {id: 'error-codes', label: 'Error code', href: '/setup-and-admin/error-codes'},
    ] 
  },
  { id: 'audit', label: 'Audit logs', 
    children: [
      {id: 'billing', label: 'Audit logs', href: '/audit-log-hub'}
    ] 
   },
];

// Approve drawer children
export const approveMenuData: NavItem[] = [
  { id: 'transactional', label: 'Transactional'  },
  { id: 'non_transactional', label: 'Non-transactional', href: '/audit-and-approve/non-transactional' },
];

// Transact drawer children
export const transactMenuData: NavItem[] = [
  { id: 'payments', label: 'Payments' },
  { id: 'collections', label: 'Collections', href: '/collection' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'find_transaction', label: 'Find a transaction' },
  { id: 'reports', label: 'Reports' },
];
