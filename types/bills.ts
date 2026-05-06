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

// Biller reference field type
export type BillerReferenceField = {
  id: string;
  name: string;
  value: string;
  dynamicReference?: boolean;
};

// Biller payload type for create/update operations
export type BillerPayload = {
  entityKey?: number;
  billerId?: string;
  billerName?: string;
  currency?: string;
  transactionLimit?: number | string;
  paymentTypes?: string[] | string;
  referenceFields?: BillerReferenceField[];
  phoneNumber?: string;
  phoneUsage?: string[];
  phoneAlertEnabled?: boolean;
  emailAddress?: string;
  emailUsage?: string[];
  emailAlertEnabled?: boolean;
  status?: string;
  createdBy?: string;
  createdDateTime?: string;
  lastModifiedBy?: string;
  lastModifiedDateTime?: string;
};

// Biller form values type for forms
export type BillerFormValues = {
  billerName?: string;
  billerId?: string;
  currency?: string;
  transactionLimit?: string | number;
  paymentTypes?: string[] | string;
  referenceFields?: BillerReferenceField[];
  phoneNumber?: string;
  phoneUsage?: string[];
  phoneAlertEnabled?: boolean;
  emailAddress?: string;
  emailUsage?: string[];
  emailAlertEnabled?: boolean;
};

export type BillApiItem = {
  billKey: number;
  billID: number;
  amount: number;
  billerID: number;
  billerName: string;
  country: string;
  currency: string;
  status: string;
  reference: string;
  dueDate: string;
  declineReason: string | null;
  billDescription: string;
  bicSwiftCode: string;
  accountCurrency: string;
  accountNumber: string;
  bankCountryCode: string;
  bankID: string;
  billIndicator: string;
  branchName: string;
  branchSortCode: string;
  channelName: string;
  channelReference: string;
  customerID: string;
  customerName: string;
  referenceIDX: string;
  transactionLimit: number;
  transactionLimitCurrency: string;
};

export type AllBillsApiResponse = {
  statusCode: number;
  messages: string[];
  myBillsList: BillApiItem[];
};

