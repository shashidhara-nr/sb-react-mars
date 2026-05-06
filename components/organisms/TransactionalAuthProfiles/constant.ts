export const TABLE_COLUMNS = [
    'authProfileName',
    'authProfileDescription',
    'currency',
    { key: 'status', type: 'chip' },
    { key: 'links', type: 'link' }
] as const;

export const TABLE_HEAD_CELLS = [
    { id: 'authProfileName', labelKey: 'authProfileName', numeric: false },
    { id: 'authProfileDescription', labelKey: 'authProfileDescription', numeric: true },
    { id: 'currency', labelKey: 'currency', numeric: true, colWidth: '120px' },
    { id: 'status', labelKey: 'status', numeric: true, colWidth: '120px' },
    { id: 'links', labelKey: 'quickLinks', numeric: false, disableSort: true, colWidth: '150px' },
] as const;
