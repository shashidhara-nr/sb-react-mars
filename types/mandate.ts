/**
 * Debtor Mandate Details Type Definitions
 * Matches backend DebtorMandateDetailsTO structure
 */

export interface MandateDetails {
  entityKey?: number;
  mandateId: string;
  mandateType: 'Fixed' | 'Variable';
  frequency: string;
  beginDate: string | number | Date;  // Can be ISO string, timestamp, or Date
  endDate?: string | number | Date | null;
  debitDay: number;
  currency: string;
  status?: string;
  inactiveReason?: string | null;
  version?: number;
  debtorKey?: number | null;
  isEarMarked?: string | null;
  errorReason?: string | null;
  action?: 'Created' | 'Updated' | 'Deleted' | '';
  beginDateStr?: string | null;
  endDateStr?: string | null;
  minAmount?: string | null;
  maxAmount?: string | null;
  fixedAmount?: string | null;
  referenceDescription?: string | null;
}

export interface MandateValidationError {
  field: string;
  message: string;
  code: number;
}

export const MandateType = {
  FIXED: 'Fixed' as const,
  VARIABLE: 'Variable' as const,
};

export const MandateFrequency = {
  MONTHLY: 'Monthly',
  WEEKLY: 'Weekly',
  DAILY: 'Daily',
  ANNUALLY: 'Annually',
};

export const MandateAction = {
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
};

export const MandateStatus = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

// Validation error codes (from RoAMandatesValidator)
export const VALIDATION_CODES = {
  SUCCESS: 0,
  MANDATE_REQUIRED: 1,
  INVALID_DATES: 2,
  INVALID_AMOUNTS: 4,
  INVALID_DEBIT_PERIOD: 8,
  MANDATE_REQUIRED_FIELD: 16,
  MANDATE_REQUIRED_MAX_AMOUNT: 32,
  MANDATE_INVALID_CURRENCY: 64,
} as const;
