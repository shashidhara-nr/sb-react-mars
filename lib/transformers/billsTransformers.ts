import { BillApiItem, BillRow } from '../../types/bills';

const mapStatusToUI = (apiStatus: string): { 
  value: 'Active' | 'Needs Action' | 'Awaiting Approval' | 'Processing' | 'Inactive';
  color: 'success' | 'warning' | 'error' | 'info' | 'grey';
  customPalette?: any;
} => {
  const statusUpper = apiStatus.toUpperCase();
  
  switch (statusUpper) {
    case 'AUTHORISED':
    case 'ACTIVE':
      return {
        value: 'Active',
        color: 'success',
        customPalette: {
          success: { lighter: '#F5FAF7', light: '#BFE0CC', main: '#008545' },
        },
      };
    case 'PENDING':
      return {
        value: 'Awaiting Approval',
        color: 'warning',
        customPalette: {
          warning: { lighter: '#FFF9EB', light: '#FFEBC2', main: '#FFA726' },
        },
      };
    case 'DECLINED':
      return {
        value: 'Inactive',
        color: 'error',
        customPalette: {
          error: { lighter: '#FFF5F5', light: '#FFCDD2', main: '#D32F2F' },
        },
      };
    case 'PROCESSING':
      return {
        value: 'Processing',
        color: 'info',
        customPalette: {
          info: { lighter: '#E3F2FD', light: '#BBDEFB', main: '#2196F3' },
        },
      };
    case 'NEEDS ACTION':
      return {
        value: 'Needs Action',
        color: 'warning',
        customPalette: {
          warning: { lighter: '#FFF9EB', light: '#FFEBC2', main: '#FFA726' },
        },
      };
    default:
      return {
        value: 'Inactive',
        color: 'grey',
        customPalette: {
          grey: { lighter: '#FAFAFA', light: '#E0E0E0', main: '#9E9E9E' },
        },
      };
  }
};


const formatAmount = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency || 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount).replace(currency, 'R');
};


export const transformBillApiToRow = (apiBill: BillApiItem): BillRow => {
  const status = mapStatusToUI(apiBill.status);
  
  return {
    id: String(apiBill.billKey),
    billerId: String(apiBill.billerID),
    billerName: {
      name: apiBill.billerName,
      billerCode: String(apiBill.billID),
    },
    countryRegion: apiBill.country,
    transactionLimit: formatAmount(apiBill.transactionLimit, apiBill.transactionLimitCurrency),
    status,
    links: {
      href: '/setup-and-admin/bills/manage',
      text: 'MANAGE BILLER',
    },
  };
};

export const transformAllBillsToRows = (apiBills: BillApiItem[]): BillRow[] => {
  return apiBills.map(transformBillApiToRow);
};
