export type DebtorRow = {
  id: string;
  debtorName: {
    name: string;
    accountNumber: string;
    debtorCode: string;
  };
  debtorReference: string;
  accountNumber: string;
  collectionType: string;
  bicSwift: string;
  bankName: string;
  transactionLimit: string;
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

export const mockDebtors: DebtorRow[] = [
  {
    id: '1',
    debtorName: { name: 'John Doe', accountNumber: 'ACC001', debtorCode: 'REF123' },
    debtorReference: 'REF123',
    accountNumber: 'ACC001',
    collectionType: 'Direct Debit',
    bicSwift: 'HSBCGB2L',
    bankName: 'HSBC',
    transactionLimit: '$10,000',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '2',
    debtorName: { name: 'Jane Smith', accountNumber: 'ACC002', debtorCode: 'REF456' },
    debtorReference: 'REF456',
    accountNumber: 'ACC002',
    collectionType: 'Standing Order',
    bicSwift: 'BARCGB22',
    bankName: 'Barclays',
    transactionLimit: '$5,000',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '3',
    debtorName: { name: 'Acme Corp', accountNumber: 'ACC003', debtorCode: 'REF789' },
    debtorReference: 'REF789',
    accountNumber: 'ACC003',
    collectionType: 'Wire Transfer',
    bicSwift: 'NWBKGB2L',
    bankName: 'Natwest',
    transactionLimit: '$20,000',
    status: {
      value: 'Inactive',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '4',
    debtorName: { name: 'Globex LLC', accountNumber: 'ACC004', debtorCode: 'REF321' },
    debtorReference: 'REF321',
    accountNumber: 'ACC004',
    collectionType: 'Direct Debit',
    bicSwift: 'LOYDGB2L',
    bankName: 'Lloyds',
    transactionLimit: '$12,500',
    status: {
      value: 'Needs Action',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '5',
    debtorName: { name: 'Soylent Inc', accountNumber: 'ACC005', debtorCode: 'REF654' },
    debtorReference: 'REF654',
    accountNumber: 'ACC005',
    collectionType: 'Standing Order',
    bicSwift: 'CITIGB2L',
    bankName: 'Citi',
    transactionLimit: '$7,500',
    status: {
      value: 'Processing',
      color: 'grey',
      customPalette: { grey: { lighter: '#F8F8FA', light: '#CED3D9', main: '#697786' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '6',
    debtorName: { name: 'Initech', accountNumber: 'ACC006', debtorCode: 'REF987' },
    debtorReference: 'REF987',
    accountNumber: 'ACC006',
    collectionType: 'Wire Transfer',
    bicSwift: 'BOFAGB22',
    bankName: 'Bank of America',
    transactionLimit: '$30,000',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '7',
    debtorName: { name: 'Umbrella Corp', accountNumber: 'ACC007', debtorCode: 'REF147' },
    debtorReference: 'REF147',
    accountNumber: 'ACC007',
    collectionType: 'Direct Debit',
    bicSwift: 'ABBYGB2L',
    bankName: 'Abbey',
    transactionLimit: '$9,000',
    status: {
      value: 'Unusable',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '8',
    debtorName: { name: 'Wayne Enterprises', accountNumber: 'ACC008', debtorCode: 'REF258' },
    debtorReference: 'REF258',
    accountNumber: 'ACC008',
    collectionType: 'Standing Order',
    bicSwift: 'DEUTGB2L',
    bankName: 'Deutsche Bank',
    transactionLimit: '$8,000',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '9',
    debtorName: { name: 'Stark Industries', accountNumber: 'ACC009', debtorCode: 'REF369' },
    debtorReference: 'REF369',
    accountNumber: 'ACC009',
    collectionType: 'Wire Transfer',
    bicSwift: 'CHASGB2L',
    bankName: 'JPMorgan Chase',
    transactionLimit: '$50,000',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '10',
    debtorName: { name: 'Hooli', accountNumber: 'ACC010', debtorCode: 'REF741' },
    debtorReference: 'REF741',
    accountNumber: 'ACC010',
    collectionType: 'Direct Debit',
    bicSwift: 'BNPAGB2L',
    bankName: 'BNP Paribas',
    transactionLimit: '$6,500',
    status: {
      value: 'Inactive',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '11',
    debtorName: {
      name: 'Vehement Capital Partners',
      accountNumber: 'ACC011',
      debtorCode: 'REF852',
    },
    debtorReference: 'REF852',
    accountNumber: 'ACC011',
    collectionType: 'Standing Order',
    bicSwift: 'REVOIE23',
    bankName: 'Revolut',
    transactionLimit: '$3,000',
    status: {
      value: 'Processing',
      color: 'grey',
      customPalette: { grey: { lighter: '#F8F8FA', light: '#CED3D9', main: '#697786' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '12',
    debtorName: { name: 'Massive Dynamic', accountNumber: 'ACC012', debtorCode: 'REF963' },
    debtorReference: 'REF963',
    accountNumber: 'ACC012',
    collectionType: 'Wire Transfer',
    bicSwift: 'FTSBGB2L',
    bankName: 'First Trust',
    transactionLimit: '$25,000',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '13',
    debtorName: { name: 'Pied Piper', accountNumber: 'ACC013', debtorCode: 'REF159' },
    debtorReference: 'REF159',
    accountNumber: 'ACC013',
    collectionType: 'Direct Debit',
    bicSwift: 'TSIBGB2L',
    bankName: 'TSB',
    transactionLimit: '$4,200',
    status: {
      value: 'Needs Action',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '14',
    debtorName: { name: 'Wonka Industries', accountNumber: 'ACC014', debtorCode: 'REF753' },
    debtorReference: 'REF753',
    accountNumber: 'ACC014',
    collectionType: 'Standing Order',
    bicSwift: 'RBOSGB2L',
    bankName: 'RBS',
    transactionLimit: '$11,000',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
  {
    id: '15',
    debtorName: { name: 'Cyberdyne Systems', accountNumber: 'ACC015', debtorCode: 'REF357' },
    debtorReference: 'REF357',
    accountNumber: 'ACC015',
    collectionType: 'Wire Transfer',
    bicSwift: 'BOFSGB2L',
    bankName: 'Santander',
    transactionLimit: '$14,000',
    status: {
      value: 'Unusable',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/debtors/manage', text: 'MANAGE DEBTOR' },
  },
];