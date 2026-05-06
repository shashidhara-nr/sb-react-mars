export type CreditLimits = {
  id: number;
  creditLimitName: string;
  creditLimitType: string;
  fromDate: string;
  toDate: string;
  productType: string;
  status: {
    value: string;
    color: string;
  };
  links: {
    href: string;
    text: string;
  };
};
export type CreditLimitsAllData = CreditLimits[];

export type HeaderCellItem = {
  label: string;
  id: string;
  labelKey: string;
  numeric: boolean;
  colWidth?: string;
};
export type CreditLimitHeaderCell = HeaderCellItem[];

export type FilterValues = {
  limitType: string;
  status: string;
  date: string;
};

export type CreditLimitFilter = {
  creditLimitType?: string;
  status?: string;
  fromDate?: string;
};

export type CreditLimitToast = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

export type CreditLimitState = {
  columns: any;
  headCells: CreditLimitHeaderCell;
  rowButton: boolean;
  rows: CreditLimitsAllData;
  pageSize: number;
  rowCount: number;
};
