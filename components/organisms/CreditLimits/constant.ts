import { CreditLimitToast } from "types/creditLimits";

export const ALL_RECORDS_TABLE_HEAD_CELLS = [
  { id: 'creditLimitName', labelKey: 'creditLimitName', numeric: false },
  { id: 'creditLimitType', labelKey: 'creditLimitType', numeric: false, colWidth: '250px' },
  { id: 'fromDate', labelKey: 'fromDate', numeric: false, colWidth: '200px' },
  { id: 'toDate', labelKey: 'toDate', numeric: false, colWidth: '200px' },
  { id: 'status', labelKey: 'status', numeric: false, disableSort: true, colWidth: '200px' },
  { id: 'links', labelKey: 'quickLinks', numeric: true, disableSort: true, colWidth: '170px' },
] as const;

export const ALL_RECORDS_TABLE_COLUMNS = [
  'creditLimitName',
  'creditLimitType',
  'fromDate',
  'toDate',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

export const TAB_LIST = ['allRecords', 'needsAction', 'active', 'inactive'] as const;


export const DEFAULT_SNACKBAR: CreditLimitToast = { open: false, message: '', severity: 'success' };