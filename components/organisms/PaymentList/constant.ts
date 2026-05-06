export const ALL_RECORDS_TABLE_COLUMNS = [
    'batchId',
    'dateCreated',
    'numberOfInstructions',
    'amount',
    { key: 'status', type: 'chip' },
    { key: 'links', type: 'link' }
] as const;

export const REST_OF_RECORDS_TABLE_COLUMNS = [
    'paymentId',
    'valueDate',
    'numberOfInstructions',
    'amount',
    { key: 'status', type: 'chip' },
    { key: 'links', type: 'link' }
] as const;

export const ALL_RECORDS_TABLE_HEAD_CELLS = [
    { id: 'batchId', labelKey: 'batchId', numeric: false, colWidth: '150px' },
    { id: 'dateCreated', labelKey: 'dateCreated', numeric: true, colWidth: '120px' },
    { id: 'numberOfInstructions', labelKey: 'numberOfInstructions', numeric: true, colWidth: '180px' },
    { id: 'amount', labelKey: 'amount', numeric: true, colWidth: '100px' },
    { id: 'status', labelKey: 'status', numeric: true, colWidth: '150px' },
    { id: 'links', labelKey: 'quickLinks', numeric: false, disableSort: true, colWidth: '200px' },
] as const;

export const REST_OF_RECORDS_TABLE_HEAD_CELLS = [
    { id: 'paymentId', labelKey: 'paymentId', numeric: false, colWidth: '150px' },
    { id: 'valueDate', labelKey: 'valueDate', numeric: true, colWidth: '120px' },
    { id: 'numberOfInstructions', labelKey: 'numberOfInstructions', numeric: true, colWidth: '180px' },
    { id: 'amount', labelKey: 'amount', numeric: true, colWidth: '100px' },
    { id: 'status', labelKey: 'status', numeric: true, colWidth: '150px' },
    { id: 'links', labelKey: 'quickLinks', numeric: false, disableSort: true, colWidth: '200px' },
] as const;

export const RECURRING_PAYMENTS_TABLE_COLUMNS = [
    'scheduleId',
    'dateCreated',
    'numberOfInstructions',
    'amount',
    'expiryDate',
    { key: 'status', type: 'chip' },
    { key: 'links', type: 'link' }
] as const;

export const RECURRING_PAYMENTS_TABLE_HEAD_CELLS = [
    { id: 'scheduleId', labelKey: 'scheduleId', numeric: false, colWidth: '150px' },
    { id: 'dateCreated', labelKey: 'dateCreated', numeric: true, colWidth: '120px' },
    { id: 'numberOfInstructions', labelKey: 'numberOfInstructions', numeric: true, colWidth: '180px' },
    { id: 'amount', labelKey: 'amount', numeric: true, colWidth: '100px' },
    { id: 'expiryDate', labelKey: 'expiryDate', numeric: true, colWidth: '120px' },
    { id: 'status', labelKey: 'status', numeric: true, colWidth: '150px' },
    { id: 'links', labelKey: 'quickLinks', numeric: false, disableSort: true, colWidth: '200px' },
] as const;

export const REPORTS_PAYMENTS_TABLE_COLUMNS = [
    'dateRange',
    'batchId',
    'processedInstructions',
    'partiallyProcessedInstructions',
    { key: 'batchStatus', type: 'chip' }
] as const;

export const REPORTS_PAYMENTS_TABLE_HEAD_CELLS = [
    { id: 'dateRange', labelKey: 'dateRange', numeric: false, colWidth: '150px' },
    { id: 'batchId', labelKey: 'batchId', numeric: true, colWidth: '120px' },
    { id: 'processedInstructions', labelKey: 'processedInstructions', numeric: true, colWidth: '180px' },
    { id: 'partiallyProcessedInstructions', labelKey: 'partiallyProcessedInstructions', numeric: true, colWidth: '100px' },
    { id: 'batchStatus', labelKey: 'batchStatus', numeric: true, colWidth: '150px' }
] as const;

export const HISTORY_TABLE_COLUMNS = [
    'beneficiaryName',
    'beneficiaryCode',
    { key: 'links', type: 'link' }
] as const;

export const HISTORY_TABLE_HEAD_CELLS = [
    { id: 'beneficiaryName', labelKey: 'beneficiaryName', numeric: false },
    { id: 'beneficiaryCode', labelKey: 'beneficiaryCode', numeric: true, colWidth: '180px' },
    { id: 'links', labelKey: 'quickLinks', numeric: false, disableSort: true, colWidth: '170px' },
] as const;