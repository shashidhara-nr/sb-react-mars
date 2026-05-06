export const ALL_RECORDS_TABLE_COLUMNS = [
    'unpaidOption',
    'postingOption',
    'postingAccount',
    { key: 'status', type: 'chip' },
    { key: 'links', type: 'link' }
] as const;

export const ALL_RECORDS_TABLE_HEAD_CELLS = [
    { id: 'unpaidOption', labelKey: 'unpaidOption', numeric: false },
    { id: 'postingOption', labelKey: 'postingOption', numeric: true, colWidth: '180px' },
    { id: 'postingAccount', labelKey: 'postingAccount', numeric: true, colWidth: '200px' },
    { id: 'status', labelKey: 'status', numeric: true, colWidth: '120px' },
    { id: 'links', labelKey: 'quickLinks', numeric: false, disableSort: true, colWidth: '180px' },
] as const;
