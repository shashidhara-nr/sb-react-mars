export const EVENT_TYPES = {
  BENEFICIARIES: 'beneficiaries',
  BENEFICIARY: 'beneficiary',
  PAYMENT_TYPE: 'payment type',
  TRANSFER_TYPE: 'transfer type',
  COLLECTION_TYPE: 'collection type',
  THIRD_PARTIES: 'third parties',
  BILL: 'bill',
  UNPAID_OPTION: 'unpaid option',
  DEBTORS: 'debtors',
  DEBTOR: 'debtor',
  AUTHORISATION_PROFILE: 'authorisation profile',
} as const;



export const EVENT_FUNCTIONS = {
  UPDATE: 'update',
  CREATE: 'create',
  DELETE: 'delete',
} as const;


export const DEFAULTS = {
  CURRENCY: 'ZAR',
  COUNTRY_CODE: 'ZA',
  AUTHORISATION_PROFILE: 'Standard',
  TRANSACTION_LIMIT: '0',
  AD_HOC_LIMIT: '10000',
  ACCOUNT_TYPE: 'Current',
  ENTITY_TYPE: 'Individual',
  BILLER_ID: 'BL001',
  TRANSACTION_LIMIT_DECIMAL: '0.00',
} as const;

export const FILE_UPLOAD_DEFAULTS = {
  ERROR_REJECTION: 'rejectBatch',
  CUTOFF_BREACH: 'rejectBatch',
  POSTING: 'consolidated',
} as const;


export const HOST_TO_HOST_DEFAULTS = {
  BATCH_ERROR_REJECTION: 'rejectBatch',
  CUTOFF_BREACH: 'rejectBatch',
  DEFAULT_FUNDING_OPTION: 'Populated',
} as const;

export const UNPAID_PROCESSING_DEFAULTS = {
  UNPAID_OPTION_NAME: 'Populated',
  ON_US: 'Itemised',
  OFF_US: 'Itemised',
} as const;

export const COLLECTION_MODEL_DEFAULTS = {
  DEFAULT_SOURCE: 'Value on success',
  BATCH_UPLOAD_DEFAULT: 'batch',
} as const;

export const UNPAID_OPTION_DEFAULTS = {
  POSTING_OPTION: 'Itemized',
  POSTING_ACCOUNT: 'Use nominated account',
  SELECTED_NOMINATED_ACCOUNT: 'acc1',
} as const;

export const PLACEHOLDERS = {
  DEBTOR_REF: '[Debtor ref]',
  ADDRESS_LINE_1: '[Address line 1]',
  ADDRESS_LINE_2: '[Address line 2]',
  BANK_NAME: '[Bank name]',
  BRANCH_NAME: '[Branch name]',
  BIC: '[BIC]',
  BRANCH_SORT_CODE: '[Branch / Sort code]',
  ACCOUNT_NUMBER: '[Account number]',
  IBAN: '[IBAN]',
  COLLECTION_TYPE_1: '[Collection type 1]',
  AGREEMENT_ID: '[Agreement ID]',
  AGREEMENT_NAME: '[Agreement Name]',
  ACCOUNT_ID: '[Account ID]',
  ACCOUNT_NAME: '[Account Name]',
  SORT_CODE: '[Sort Code]',
  COUNTRY: '[Country]',
  COUNTRY_REGION: '[Country / Region]',
  TRANSFER_TYPE_NAME: '[Transfer type name]',
  SELECTED_AUTH_PROFILE: '[Selected authorisation profile]',
  SELECTED_CUSTOMER_AGREEMENT: '[Selected customer agreement]',
  UNPAID_OPTION_NAME: '[Unpaid option name]',
  RESIDENT_NON_RESIDENT: '[Resident / Non-resident]',
  BENEFICIARY_TYPE: '[Beneficiary type]',
  FIRST_NAME: '[First name]',
  LAST_NAME: '[Last name]',
  BENEFICIARY_CODE: '[Beneficiary code]',
  BENEFICIARY_REF: '[Beneficiary ref]',
  ADDRESS: '[Address]',
  POST_ZIP_CODE: '[Post / Zip code]',
  REGION_PROVINCE: '[Region name, e.g. Province]',
  PAYMENT_TYPE_LIST: '[Payment type 1], [Payment type 2], [Payment type 3]',
  STATEMENT_REF_1: '[Statement ref. 1]',
  STATEMENT_REF_2: '[Statement ref. 2]',
  STATEMENT_REF_3: '[Statement ref. 3]',
  STATEMENT_REF_4: '[Statement ref. 4]',
  CURRENCY: '[Currency]',
} as const;

export const ACCOUNT_IDS = {
  DEFAULT_PAYER: 'default_payer',
  DEFAULT_PAYMENT: 'default_payment',
} as const;

export const UI_CONSTANTS = {
  DIALOG_Z_INDEX: 1500,
  DIALOG_MAX_WIDTH: 'sm',
  DIALOG_BORDER_RADIUS: 1,
  AVATAR_SIZE: 28,
  ICON_SIZE_SMALL: 18,
  ICON_SIZE_MEDIUM: 20,
  ICON_SIZE_LARGE: 22,
  ICON_SIZE_XLARGE: 24,
  ICON_SIZE_AVATAR: 58,
  SPACING_SMALL: 2,
  SPACING_MEDIUM: 3,
  SPACING_LARGE: 4,
  BORDER_COLOR: '#E0E5EB',
  BG_COLOR_WHITE: '#FFFFFF',
  TEXT_COLOR_PRIMARY: '#222E37',
  TEXT_COLOR_SECONDARY: '#5C6C80',
  BORDER_RADIUS: '16px',
  MIN_HEIGHT: 160,
  FONT_SIZE_SMALL: '14px',
  FONT_SIZE_MEDIUM: '16px',
  FONT_WEIGHT_NORMAL: 400,
  FONT_WEIGHT_MEDIUM: 500,
  FONT_WEIGHT_SEMIBOLD: 600,
} as const;

export const BIC_PLACEHOLDER = 'XXXXXXXX';

export const DEFAULT_STATEMENT_REFERENCES = [
  PLACEHOLDERS.STATEMENT_REF_1,
  PLACEHOLDERS.STATEMENT_REF_2,
  PLACEHOLDERS.STATEMENT_REF_3,
  PLACEHOLDERS.STATEMENT_REF_4,
];

export type PanelMode = 'details' | 'auditors';

export const AUDIT_STATUS_MAPPING_FOR_PAYLOAD: { [key: string]: { [key: string]: string } } = {
  PaymentType: {
    "C":"D",
    "R":"R",
    "D":"D",
    "U":"R",
    "N":"C"
  },
  Beneficiary: {
    "C": "ACI",
    "R": "ACR",
    "D": "ACI",
    "U": "ACI",
    "N": "ACI"
  },
  TransferType: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACR",
  },
  CollectionType: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACR",
  },
  ThirdParties: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACR",
  },
  Bill: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACR",
  },
  UnpaidOption: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACR",
  },
  Debtor: {
    "C":"D",
    "R":"U",
    "D":"D",
    "U":"U",
    "N":"C"
  },
  AuthorisationProfile: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACR",
  },
}
export const APPROVE_STATUS_MAPPING_FOR_PAYLOAD: { [key: string]: { [key: string]: string } } = {
  PaymentType: {
    "C":"D",
    "R":"R",
    "D":"D",
    "U":"R",
    "N":"C"
  },
  Beneficiary: {
    "C": "ACI",
    "R": "ACA",
    "D": "ACI",
    "U": "ACA",
    "N":"ACI",
  },
  TransferType: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACA",
  },
  CollectionType: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACA",
  },
  ThirdParties: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACA",
  },
  Bill: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACA",
  },
  UnpaidOption: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACA",
  },
  Debtor: {
    "C":"D",
    "R":"R",
    "D":"D",
    "U":"R",
    "N":"C"
  },
  AuthorisationProfile: {
    "C":"ACI",
    "R":"ACR",
    "D":"ACI",
    "U":"ACA",
  },
}
