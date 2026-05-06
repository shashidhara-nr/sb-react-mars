export type BillRow = {
  id: string;
  billerId: string;
  billerName: {
    name: string;
    billerCode: string;
  };
  countryRegion: string;
  transactionLimit: string;
  status: {
    value: 'Active' | 'Needs Action' | 'Awaiting Approval' | 'Processing' | 'Inactive';
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

export const mockBills: BillRow[] = [
  {
    id: '1',
    billerId: 'BILL001',
    billerName: { name: 'Electric Company', billerCode: 'EC001' },
    countryRegion: 'United States',
    transactionLimit: 'R 5,000.00',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '2',
    billerId: 'BILL002',
    billerName: { name: 'Water Supply Inc', billerCode: 'WS002' },
    countryRegion: 'Canada',
    transactionLimit: 'R 2,500.00',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/bills/send-reminder', text: 'SEND REMINDER' },
  },
  {
    id: '3',
    billerId: 'BILL003',
    billerName: { name: 'Internet Services Ltd', billerCode: 'IS003' },
    countryRegion: 'United Kingdom',
    transactionLimit: 'R 1,000.00',
    status: {
      value: 'Processing',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '4',
    billerId: 'BILL004',
    billerName: { name: 'Gas Corporation', billerCode: 'GC004' },
    countryRegion: 'Australia',
    transactionLimit: 'R 7,500.00',
    status: {
      value: 'Needs Action',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '5',
    billerId: 'BILL005',
    billerName: { name: 'Telephone Services', billerCode: 'TS005' },
    countryRegion: 'United States',
    transactionLimit: 'R 3,000.00',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '6',
    billerId: 'BILL006',
    billerName: { name: 'Medical Insurance Co', billerCode: 'MIC006' },
    countryRegion: 'Germany',
    transactionLimit: 'R 10,000.00',
    status: {
      value: 'Inactive',
      color: 'error',
      customPalette: { error: { lighter: '#FBE6E6', light: '#F6C2C2', main: '#e31e46' } },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '7',
    billerId: 'BILL007',
    billerName: { name: 'Property Management', billerCode: 'PM007' },
    countryRegion: 'France',
    transactionLimit: 'R 8,000.00',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '8',
    billerId: 'BILL008',
    billerName: { name: 'Subscriptions Plus', billerCode: 'SP008' },
    countryRegion: 'Spain',
    transactionLimit: 'R 1,500.00',
    status: {
      value: 'Awaiting Approval',
      color: 'warning',
      customPalette: { warning: { lighter: '#FFE9C7', light: '#FF8A00', main: '#FF8A00' } },
    },
    links: { href: '/setup-and-admin/bills/send-reminder', text: 'SEND REMINDER' },
  },
  {
    id: '9',
    billerId: 'BILL009',
    billerName: { name: 'Retail Store Payments', billerCode: 'RSP009' },
    countryRegion: 'Netherlands',
    transactionLimit: 'R 12,000.00',
    status: {
      value: 'Processing',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '10',
    billerId: 'BILL010',
    billerName: { name: 'Travel & Tourism', billerCode: 'TAT010' },
    countryRegion: 'Italy',
    transactionLimit: 'R 4,500.00',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '11',
    billerId: 'BILL011',
    billerName: { name: 'Manufacturing Supply', billerCode: 'MS011' },
    countryRegion: 'Japan',
    transactionLimit: 'R 15,000.00',
    status: {
      value: 'Needs Action',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
  {
    id: '12',
    billerId: 'BILL012',
    billerName: { name: 'Education Services', billerCode: 'ES012' },
    countryRegion: 'Singapore',
    transactionLimit: 'R 6,000.00',
    status: {
      value: 'Active',
      color: 'success',
      customPalette: {
        success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
      },
    },
    links: { href: '/setup-and-admin/bills/manage', text: 'MANAGE BILLER' },
  },
];

export type UpcomingBillRow = {
  id: string;
  billId: string;
  billerName: string;
  countryRegion: string;
  amount: string;
  dueDate: string;
  reference: string;
  status: {
    value: 'Pending' | 'Overdue' | 'Paid' | 'Cancelled' | 'Scheduled' | 'Awaiting payment';
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
  allLinks?: Array<{ href: string; text: string }>;
};

export const mockUpcomingBills: UpcomingBillRow[] = [
  {
    id: '1',
    billId: 'BL001',
    billerName: 'Electric Company',
    countryRegion: 'United States',
    amount: '$150.00',
    dueDate: '20/03/2026',
    reference: 'REF123',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '2',
    billId: 'BL002',
    billerName: 'Water Supply Inc',
    countryRegion: 'Canada',
    amount: '$89.50',
    dueDate: '28/03/2026',
    reference: 'REF124',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '3',
    billId: 'BL003',
    billerName: 'Internet Services Ltd',
    countryRegion: 'United Kingdom',
    amount: '$59.99',
    dueDate: '26/03/2026',
    reference: 'REF125',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '4',
    billId: 'BL004',
    billerName: 'Gas Corporation',
    countryRegion: 'Australia',
    amount: '$120.75',
    dueDate: '30/03/2026',
    reference: 'REF126',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '5',
    billId: 'BL005',
    billerName: 'Telephone Services',
    countryRegion: 'United States',
    amount: '$79.99',
    dueDate: '15/03/2026',
    reference: 'REF127',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '6',
    billId: 'BL006',
    billerName: 'Medical Insurance Co',
    countryRegion: 'Germany',
    amount: '$450.00',
    dueDate: '05/04/2026',
    reference: 'REF128',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '7',
    billId: 'BL007',
    billerName: 'Property Management',
    countryRegion: 'France',
    amount: '$1,200.00',
    dueDate: '01/04/2026',
    reference: 'REF129',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '8',
    billId: 'BL008',
    billerName: 'Subscriptions Plus',
    countryRegion: 'Spain',
    amount: '$49.99',
    dueDate: '25/03/2026',
    reference: 'REF130',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '9',
    billId: 'BL009',
    billerName: 'Retail Store Payments',
    countryRegion: 'Netherlands',
    amount: '$350.00',
    dueDate: '31/03/2026',
    reference: 'REF131',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
  {
    id: '10',
    billId: 'BL010',
    billerName: 'Travel & Tourism',
    countryRegion: 'Italy',
    amount: '$275.50',
    dueDate: '10/04/2026',
    reference: 'REF132',
    status: {
      value: 'Awaiting payment',
      color: 'info',
      customPalette: { info: { lighter: '#BFDCFC', light: '#00cafb', main: '#00cafb' } },
    },
    links: { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
    allLinks: [
      { href: '/setup-and-admin/bills/pay', text: 'PAY BILL' },
      { href: '/setup-and-admin/bills/decline', text: 'DECLINE BILL' },
    ],
  },
];
