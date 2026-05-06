export const ALL_RECORDS_TABLE_COLUMNS = [
    'paymentId',
    'valueDate',
    'instructions',
    'amount',
    'collectionType',
    { key: 'status', type: 'chip' },
    { key: 'links', type: 'link' },

] as const;

export const REST_OF_RECORDS_TABLE_COLUMNS = [
    'paymentId',
    'valueDate',
    'instructions',
    'amount',
    'collectionType',
    { key: 'status', type: 'chip' },
    { key: 'links', type: 'link' },
    
] as const;

export const ALL_RECORDS_TABLE_HEAD_CELLS = [
    { id: 'paymentId', labelKey: 'paymentId', numeric: false, colWidth: '150px' },
    { id: 'valueDate', labelKey: 'valueDate', numeric: true, colWidth: '120px' },
    { id: 'instructions', labelKey: 'instructions', numeric: true, colWidth: '180px' },
    { id: 'amount', labelKey: 'amount', numeric: true, colWidth: '100px' },
    { id: 'collectionType', labelKey: 'collectionType', numeric: false, colWidth: '180px' },
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
