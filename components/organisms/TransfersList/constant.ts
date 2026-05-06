export const TRANSFER_TYPE_OPTIONS = [
  { label: 'Transfer Type 1', value: 'type1', maxInstructions: 1},
  { label: 'Transfer Type 2', value: 'type2', maxInstructions: 2 },
  { label: 'Transfer Type 3', value: 'type3', maxInstructions: 3 },
];

export const CURRENCY_OPTIONS = [
  { label: 'ZAR - South African Rand', value: 'ZAR' },
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
];

export const TRANSFER_MODE_OPTIONS = [
  { value: 'single-to-multiple', label: 'Single to multiple accounts' },
  { value: 'multiple-to-single', label: 'Multiple to single account' },
];

export const ACCOUNT_LIST = [
  {
    id: 'acc1',
    name: 'Business Operating Account',
    masked: 'XXXXXXXX',
    accNumber: '1234567890',
    sortCode: 'XX-XX-XX',
    bic: 'XXXXXXXX',
    currency: 'ZAR',
    countryRegion: '[Country / Region]',
    balance: 'R X,XXX,XXX.XX',
  },
  {
    id: 'acc2',
    name: 'Savings Account',
    masked: 'XXXXXXXX',
    accNumber: '9876543210',
    sortCode: 'XX-XX-XX',
    bic: 'XXXXXXXX',
    currency: 'ZAR',
    countryRegion: '[Country / Region]',
    balance: 'R X,XXX,XXX.XX',
  },
  {
    id: 'acc3',
    name: 'USD Business Account',
    masked: 'XXXXXXXX',
    accNumber: '1112223334',
    sortCode: 'XX-XX-XX',
    bic: 'XXXXXXXX',
    currency: 'USD',
    countryRegion: '[Country / Region]',
    balance: '$ X,XXX,XXX.XX',
  },
  {
    id: 'acc4',
    name: 'Investment Account',
    masked: 'XXXXXXXX',
    accNumber: '5556667778',
    sortCode: 'XX-XX-XX',
    bic: 'XXXXXXXX',
    currency: 'ZAR',
    countryRegion: '[Country / Region]',
    balance: 'R X,XXX,XXX.XX',
  },
  {
    id: 'acc5',
    name: 'Reserve Account',
    masked: 'XXXXXXXX',
    accNumber: '9998887776',
    sortCode: 'XX-XX-XX',
    bic: 'XXXXXXXX',
    currency: 'EUR',
    countryRegion: '[Country / Region]',
    balance: '€ X,XXX,XXX.XX',
  },
];

// ============================================
// Color Constants
// ============================================
export const COLORS = {
  PRIMARY: '#0051ff',
  PRIMARY_LIGHT: 'rgba(0, 81, 255, 0.08)',
  PRIMARY_LIGHTER: 'rgba(0, 81, 255, 0.1)',
  BORDER: '#CED3D9',
  BORDER_LIGHT: '#E3E6EA',
  BACKGROUND_LIGHT: '#FAFBFC',
  BACKGROUND_WHITE: '#fff',
  TEXT_SECONDARY: 'rgba(0, 0, 0, 0.54)',
  ERROR: '#e31e46',
  ERROR_LIGHT: 'rgba(227, 30, 70, 0.08)',
} as const;

// ============================================
// Spacing Constants (in pixels)
// ============================================
export const SPACING = {
  XS: 8,
  SM: 12,
  MD: 16,
  LG: 24,
  XL: 32,
} as const;

// ============================================
// Border Radius Constants (in pixels)
// ============================================
export const BORDER_RADIUS = {
  SM: 6,
  MD: 8,
  LG: 12,
} as const;

// ============================================
// Font Sizes Constants (in pixels)
// ============================================
export const FONT_SIZES = {
  XS: 11,
  SM: 12,
  BASE: 14,
  MD: 15,
  LG: 16,
  XL: 18,
} as const;

// ============================================
// Component Dimensions
// ============================================
export const DIMENSIONS = {
  BATCH_ITEM_MIN_HEIGHT: 120,
  ACCORDION_MIN_HEIGHT: 56,
  BUTTON_HEIGHT: 48,
  FILTER_BUTTON_HEIGHT: 40,
  EDIT_BUTTON_PADDING: 0.5,
  DELETE_BUTTON_PADDING: 0.75,
} as const;

// ============================================
// Transition/Animation
// ============================================
export const TRANSITIONS = {
  STANDARD: 'all 0.2s ease',
  BACKGROUND_COLOR: 'background-color 0.2s ease',
  TRANSFORM: 'transform 0.2s ease',
} as const;

// ============================================
// Grid Configuration
// ============================================
export const GRID_CONFIG = {
  DETAILS_COLUMNS: 'repeat(2, 1fr)',
  DETAILS_GAP: SPACING.XL,
  DETAILS_ROW_GAP: SPACING.LG,
} as const;

// ============================================
// Field Configuration
// ============================================
export const FIELD_CONFIG = {
  LABEL_MARGIN_BOTTOM: SPACING.SM,
  VALUE_PADDING: `${SPACING.XS}px 12px`,
  BORDER_RADIUS: BORDER_RADIUS.SM,
} as const;

// ============================================
// Transfer Instructions Configuration
// ============================================

/**
 * Transfer account details for single transfer
 */
export interface ITransferAccountDetails {
  accountName: string;
  accountNumber: string;
  branchCode: string;
  bicSwift: string;
  countryRegion: string;
}

/**
 * Transfer From details with debit information
 */
export interface ITransferFrom extends ITransferAccountDetails {
  availableBalance: string;
  transferCurrency: string;
  debitCurrency: string;
  debitReference: string;
}

/**
 * Transfer To details with credit information
 */
export interface ITransferTo extends ITransferAccountDetails {
  creditAmount: string;
  creditReference: string;
}

/**
 * Single instruction: One Transfer From account to multiple Transfer To accounts
 */
export interface ITransferInstruction {
  instructionId?: string;
  instructionType: 'singleToMultiple';
  transferFrom: ITransferFrom;
  transferTo: ITransferTo[];
}

/**
 * Complete transfer object with all instructions
 */
export interface ITransferData {
  transferType: string;
  instructions: ITransferInstruction[];
}

/**
 * Transfer Type configuration defining the number of allowed instructions
 */
export interface ITransferTypeConfig {
  value: string;
  label: string;
  maxInstructions: number;
  description: string;
}

/**
 * Transfer Type configurations for Type 1, Type 2, and Type 3 transfers
 */
export const TRANSFER_TYPE_CONFIGS: ITransferTypeConfig[] = [
  {
    value: 'type1',
    label: 'Transfer Type 1',
    maxInstructions: 1,
    description: 'Single to Multiple - One transfer from, multiple transfer to',
  },
  {
    value: 'type2',
    label: 'Transfer Type 2',
    maxInstructions: 1,
    description: 'Single to Multiple - One transfer from, multiple transfer to',
  },
  {
    value: 'type3',
    label: 'Transfer Type 3',
    maxInstructions: 1,
    description: 'Single to Multiple - One transfer from, multiple transfer to',
  },
];

/**
 * Get maximum number of instructions allowed for a transfer type
 */
export const getMaxInstructionsForType = (transferType: string): number => {
  const config = TRANSFER_TYPE_CONFIGS.find((t) => t.value === transferType);
  return config?.maxInstructions ?? 1;
};

/**
 * Check if another instruction can be added for the given transfer type
 */
export const canAddInstruction = (transferType: string, currentInstructionCount: number): boolean => {
  const maxAllowed = getMaxInstructionsForType(transferType);
  return currentInstructionCount < maxAllowed;
};

export const TABLE_COLUMNS = [
  'batchId',
  'valueDate',
  'instructions',
  'amount',
  'transferType',
  { key: 'status', type: 'chip' },
  { key: 'quickLinks', type: 'link' },
] as const;

export const TABLE_HEAD_CELLS = [
  { id: 'batchId', label: 'batchId', numeric: false },
  { id: 'valueDate', label: 'valueDate', numeric: true, colWidth: '180px' },
  { id: 'instructions', label: 'instructions', numeric: true, colWidth: '180px' },
  { id: 'amount', label: 'amount', numeric: true, colWidth: '200px' },
  { id: 'transferType', label: 'transferType', numeric: true, colWidth: '200px' },
  { id: 'status', label: 'status', numeric: true, colWidth: '200px' },
  { id: 'quickLinks', label: 'quickLinks', numeric: true, colWidth: '200px' },
];

export const SEARCH_BY_OPTIONS = [
  { value: 'batchId', label: 'batchId' },
  { value: 'valueDate', label: 'valueDate' },
  { value: 'instructions', label: 'instructions' },
  { value: 'amount', label: 'amount' },
];

export const REPORT_TABLE_COLUMNS = [
  'dateRange',
  'batchId',
  'processedInstructions',
  'partiallyProcessedInstructions',
  { key: 'batchStatus', type: 'chip' }
] as const;

export const REPORT_HEAD_CELLS = [
  { id: 'dateRange', label: 'dateRange', numeric: false, colWidth: '180px' },
  { id: 'batchId', label: 'batchId', numeric: false, colWidth: '150px' },
  { id: 'processedInstructions', label: 'processedInstructions', numeric: true, colWidth: '200px' },
  { id: 'partiallyProcessedInstructions', label: 'partiallyProcessedInstructions', numeric: true, colWidth: '250px' },
  { id: 'batchStatus', label: 'batchStatus', numeric: false, colWidth: '180px' },
] as const;
