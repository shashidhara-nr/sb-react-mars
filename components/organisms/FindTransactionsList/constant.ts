export const PAYMENTS_COLUMNS = [
  'paymentId',
  'batchId',
  'beneficiaryName',
  'valueDate',
  'accountNumber',
  'amount',
  { key: 'status', type: 'chip' },
  { key: 'quickLinks', type: 'link' },
] as const;

export const PAYMENTS_HEAD_CELL_CONFIG = [
  { id: 'paymentId', labelKey: 'paymentId', numeric: false },
  { id: 'batchId', labelKey: 'batchId', numeric: true },
  { id: 'beneficiaryName', labelKey: 'beneficiaryName', numeric: true },
  { id: 'valueDate', labelKey: 'valueDate', numeric: true },
  { id: 'accountNumber', labelKey: 'accountNumber', numeric: true },
  { id: 'amount', labelKey: 'amount', numeric: true },
  { id: 'status', labelKey: 'status', numeric: false, colWidth: '200px' },
  { id: 'quickLinks', labelKey: 'quickLinks', numeric: false, colWidth: '200px' },
] as const;

export const TRANSFERS_COLUMNS = [
  'instructionId',
  'batchId',
  'debitAccount',
  'valueDate',
  'accountNumber',
  'amount',
  { key: 'status', type: 'chip' },
  { key: 'quickLinks', type: 'link' },
] as const;

export const TRANSFERS_HEAD_CELL_CONFIG = [
  { id: 'instructionId', labelKey: 'instructionId', numeric: false },
  { id: 'batchId', labelKey: 'batchId', numeric: true },
  { id: 'debitAccount', labelKey: 'debitAccount', numeric: true },
  { id: 'valueDate', labelKey: 'valueDate', numeric: true },
  { id: 'accountNumber', labelKey: 'accountNumber', numeric: true },
  { id: 'amount', labelKey: 'amount', numeric: true },
  { id: 'status', labelKey: 'status', numeric: false, colWidth: '200px' },
  { id: 'quickLinks', labelKey: 'quickLinks', numeric: false, colWidth: '200px' },
] as const;

export const COLLECTIONS_COLUMNS = [
  'collectionId',
  'batchId',
  'debtorName',
  'valueDate',
  'accountNumber',
  'amount',
  { key: 'status', type: 'chip' },
  { key: 'quickLinks', type: 'link' },
] as const;

export const COLLECTIONS_HEAD_CELL_CONFIG = [
  { id: 'collectionId', labelKey: 'collectionId', numeric: false },
  { id: 'batchId', labelKey: 'batchId', numeric: true },
  { id: 'debtorName', labelKey: 'debtorName', numeric: true },
  { id: 'valueDate', labelKey: 'valueDate', numeric: true },
  { id: 'accountNumber', labelKey: 'accountNumber', numeric: true },
  { id: 'amount', labelKey: 'amount', numeric: true },
  { id: 'status', labelKey: 'status', numeric: false, colWidth: '200px' },
  { id: 'quickLinks', labelKey: 'quickLinks', numeric: false, colWidth: '200px' },
] as const;

export const AUDIT_COLUMNS = [
  'userName',
  'eventType',
  'description',
  'dateTime',
] as const;

export const AUDIT_HEAD_CELL_CONFIG = [
  { id: 'userName', labelKey: 'userName', numeric: false },
  { id: 'eventType', labelKey: 'eventType', numeric: true },
  { id: 'description', labelKey: 'description', numeric: true },
  { id: 'dateTime', labelKey: 'dateTime', numeric: true }
] as const;
