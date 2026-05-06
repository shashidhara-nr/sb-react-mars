export type UnpaidOptionRow = {
  id: string;
  unpaidOption: string;
  postingOption: string;
  postingAccount: string;
  status: {
    value: 'Active' | 'Needs Action' | 'Awaiting Approval' | 'Inactive';
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

export const mockUnpaidOptions: UnpaidOptionRow[] = [
  {
    id: '1',
    unpaidOption: 'Standard Unpaid Process',
    postingOption: 'Itemized',
    postingAccount: '1234567890',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '2',
    unpaidOption: 'Premium Return Option',
    postingOption: 'Consolidate per agent bank',
    postingAccount: '2345678901',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '3',
    unpaidOption: 'Express Unpaid Handling',
    postingOption: 'Consolidate across all agent banks',
    postingAccount: '3456789012',
    status: {
      value: 'Inactive',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '4',
    unpaidOption: 'Basic Return Process',
    postingOption: 'All',
    postingAccount: '4567890123',
    status: {
      value: 'Needs Action',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '5',
    unpaidOption: 'Delayed Return Option',
    postingOption: 'Itemized',
    postingAccount: '5678901234',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '6',
    unpaidOption: 'Corporate Unpaid Handler',
    postingOption: 'Consolidate per agent bank',
    postingAccount: '6789012345',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '7',
    unpaidOption: 'Quick Return Service',
    postingOption: 'Consolidate across all agent banks',
    postingAccount: '7890123456',
    status: {
      value: 'Inactive',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '8',
    unpaidOption: 'Advanced Unpaid Process',
    postingOption: 'All',
    postingAccount: '8901234567',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '9',
    unpaidOption: 'Priority Return Handler',
    postingOption: 'Itemized',
    postingAccount: '9012345678',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '10',
    unpaidOption: 'Standard Review Process',
    postingOption: 'Consolidate per agent bank',
    postingAccount: '0123456789',
    status: {
      value: 'Inactive',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '11',
    unpaidOption: 'Automated Unpaid System',
    postingOption: 'Consolidate across all agent banks',
    postingAccount: '1234509876',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '12',
    unpaidOption: 'Enhanced Return Option',
    postingOption: 'All',
    postingAccount: '2345610987',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: { success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '13',
    unpaidOption: 'Smart Unpaid Processing',
    postingOption: 'Itemized',
    postingAccount: '3456721098',
    status: {
      value: 'Needs Action',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '14',
    unpaidOption: 'Custom Return Handler',
    postingOption: 'Consolidate per agent bank',
    postingAccount: '4567832109',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
  {
    id: '15',
    unpaidOption: 'Enterprise Unpaid Solution',
    postingOption: 'Consolidate across all agent banks',
    postingAccount: '5678943210',
    status: {
      value: 'Inactive',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/unpaid-options/manage', text: 'MANAGE UNPAID OPTION' },
  },
];
