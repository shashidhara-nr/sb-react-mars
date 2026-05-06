import styles from './CollectionsList.module.scss';

export const TABLE_COLUMNS = [
  'paymentId',
  'valueDate',
  'instructions',
  'amount',
  'collectionType',
  { key: 'status', type: 'chip' },
  { key: 'quickLinks', type: 'link' },
] as const;

export const TABLE_HEAD_CELLS = [
    { id: 'paymentId', labelKey: 'paymentId', numeric: true },
    { id: 'valueDate', labelKey: 'valueDate', numeric: false, colWidth: '180px' },
    { id: 'instructions', labelKey: 'instructions', numeric: false, colWidth: '180px' },
    { id: 'amount', labelKey: 'amount', numeric: true, colWidth: '200px' },
    { id: 'collectionType', labelKey: 'collectionType', numeric: false, colWidth: '200px' },
    { id: 'status', labelKey: 'status', numeric: false, colWidth: '200px' },
    { id: 'quickLinks', labelKey: 'quickLinks', numeric: false, colWidth: '200px', className: styles.quickLinksCell },
] as const;

export const REPORT_COLUMNS = [
  'dateRange',
  'batchId',
  'processed',
  'partiallyProcessed',
  { key: 'status', type: 'chip' },
] as const;

export const REPORT_HEAD_CELLS = [
    { id: 'dateRange', labelKey: 'dateRange', numeric: false },
    { id: 'batchId', labelKey: 'batchId', numeric: true },
    { id: 'processed', labelKey: 'processed', numeric: true },
    { id: 'partiallyProcessed', labelKey: 'partiallyProcessed', numeric: true },
    { id: 'status', labelKey: 'status', numeric: false, colWidth: '200px' },
] as const;

export const HISTORY_TABLE_COLUMNS = [
    'beneficiaryName',
    'beneficiaryCode',
    { key: 'links', type: 'link' }
] as const;

export const HISTORY_TABLE_HEAD_CELLS = [
    { id: 'beneficiaryName', labelKey: 'beneficiaryName', numeric: false },
    { id: 'beneficiaryCode', labelKey: 'beneficiaryCode', numeric: true, colWidth: '220px' },
    { id: 'links', labelKey: 'quickLinks', numeric: false, disableSort: true, colWidth: '170px' },
] as const;