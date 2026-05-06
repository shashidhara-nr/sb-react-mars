// ============== LIMIT VALIDATION CONSTANTS ==============
export const LIMIT_VALIDATION_CONSTANTS = {
  // Mandatory limit types that cannot be deleted
  MANDATORY_LIMIT_TYPES: ['Overall'],

  // Status codes that block delete/update operations
  FORBIDDEN_STATUSES: ['ACA', 'ACT', 'R'],

  // Error codes
  ERROR_CODES: {
    MANDATORY_LIMIT_DELETE: 211007,
    INVALID_LIMIT_TYPE: 400,
    DUPLICATE_LIMIT_NAME: 409,
    INVALID_LIMIT_AMOUNT: 400,
    INVALID_CURRENCY: 400,
    INVALID_PERIOD: 400,
    NO_PERMISSION: 403,
    LIMIT_NOT_FOUND: 404,
    INVALID_STATUS: 409,
  },
};

// ============== TABLE CONFIGURATION ==============
export const ALL_RECORDS_TABLE_HEAD_CELLS = [
  { id: 'limitTypeName', labelKey: 'limitTypeName', numeric: false },
  { id: 'limitType', labelKey: 'limitType', numeric: false, disableSort: true },
  { id: 'limitCurrency', labelKey: 'currency', numeric: false, disableSort: true },
  { id: 'limitAmount', labelKey: 'limitAmount', numeric: true, disableSort: true },
  { id: 'limitPeriodDays', labelKey: 'limitPeriodDays', numeric: false, disableSort: true },
  { id: 'productType', labelKey: 'productType', numeric: false, disableSort: true },
  { id: 'debtStatus', labelKey: 'debtStatus', numeric: false, disableSort: true },
  { id: 'links', labelKey: 'quickLinks', numeric: true, disableSort: true }
] as const;

export const ALL_RECORDS_TABLE_COLUMNS = [
  'limitTypeName',
  'limitType',
  'limitCurrency',
  'limitAmount',
  'limitPeriodDays',
  'productType',
  { key: 'debtStatus', type: 'chip' },
  { key: 'links', type: 'link' }
] as const;

export const TAB_LIST = ['allRecords', 'needsAction', 'active'] as const;