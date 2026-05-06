/**
 * Mandate Validation Utility
 * Implements validation rules from RoAMandatesValidator.java
 */

import { MandateDetails, MandateValidationError, VALIDATION_CODES } from '../../types/mandate';

/**
 * Get the number of days in a specific month
 */
function getDaysInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  return new Date(year, month, 0).getDate();
}

/**
 * Get day of month from a date
 */
function getDayOfMonth(date: Date): number {
  return date.getDate();
}

/**
 * Check if two dates are in the same month and year
 */
function isSameMonthAndYear(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * Convert mandate date to Date object
 * Handles ISO strings, timestamps, and Date objects
 */
function toDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  
  if (value instanceof Date) return value;
  
  if (typeof value === 'number') {
    // Timestamp
    return new Date(value);
  }
  
  if (typeof value === 'string') {
    // ISO string
    return new Date(value);
  }
  
  return null;
}

/**
 * Validate a single mandate
 * Returns validation code (bitwise flags)
 */
export function validateMandate(
  mandate: MandateDetails,
  accountCurrency?: string
): number {
  let validationCode = VALIDATION_CODES.SUCCESS;

  const beginDate = toDate(mandate.beginDate);
  const endDate = toDate(mandate.endDate);

  // 1. INVALID_DATES_CODE: beginDate must be before or equal to endDate
  if (beginDate && endDate && beginDate.getTime() > endDate.getTime()) {
    validationCode |= VALIDATION_CODES.INVALID_DATES;
  }

  // 2. INVALID_AMOUNTS_CODE: minAmount must not exceed maxAmount
  const minAmount = mandate.minAmount ? parseFloat(mandate.minAmount) : 0;
  const maxAmount = mandate.maxAmount ? parseFloat(mandate.maxAmount) : 0;

  if (
    minAmount > 0 &&
    maxAmount > 0 &&
    minAmount > maxAmount &&
    mandate.minAmount &&
    mandate.maxAmount
  ) {
    validationCode |= VALIDATION_CODES.INVALID_AMOUNTS;
  }

  // 3. INVALID_DEBIT_PERIOD_CODE: Debit day validation
  if (beginDate && endDate && beginDate.getTime() < endDate.getTime()) {
    // Check if debitDay exceeds days in begin or end month
    const beginMonthDays = getDaysInMonth(beginDate);
    const endMonthDays = getDaysInMonth(endDate);

    if (
      mandate.debitDay > beginMonthDays ||
      mandate.debitDay > endMonthDays
    ) {
      validationCode |= VALIDATION_CODES.INVALID_DEBIT_PERIOD;
    }

    // If begin and end dates are in same month/year, debitDay must be in range
    if (isSameMonthAndYear(beginDate, endDate)) {
      const beginDay = getDayOfMonth(beginDate);
      const endDay = getDayOfMonth(endDate);

      if (mandate.debitDay < beginDay || mandate.debitDay > endDay) {
        validationCode |= VALIDATION_CODES.INVALID_DEBIT_PERIOD;
      }
    }
  }

  // 4. MANDATE_REQUIRED_FIELD_CODE: Check required fields
  if (
    !beginDate ||
    !mandate.currency ||
    !mandate.mandateId?.trim() ||
    (mandate.mandateType === 'Fixed' && !mandate.fixedAmount?.trim()) ||
    (mandate.mandateType === 'Variable' &&
      (!mandate.minAmount?.trim() || !mandate.maxAmount?.trim()))
  ) {
    validationCode |= VALIDATION_CODES.MANDATE_REQUIRED_FIELD;
  }

  // 5. MANDATE_REQUIRED_MAX_AMOUNT_CODE: Variable type requires max amount
  if (mandate.mandateType === 'Variable' && !mandate.maxAmount?.trim()) {
    validationCode |= VALIDATION_CODES.MANDATE_REQUIRED_MAX_AMOUNT;
  }

  // 6. MANDATE_INVALID_CURRENCY_CODE: Currency must match account currency
  if (
    accountCurrency &&
    mandate.currency &&
    accountCurrency !== mandate.currency
  ) {
    validationCode |= VALIDATION_CODES.MANDATE_INVALID_CURRENCY;
  }

  return validationCode;
}

/**
 * Check if a validation code contains a specific error code
 */
export function containsValidationCode(
  aggregatedCode: number,
  specificCode: number
): boolean {
  return (aggregatedCode & specificCode) !== VALIDATION_CODES.SUCCESS;
}

/**
 * Get user-friendly error messages for validation codes
 */
export function getValidationErrors(
  validationCode: number
): MandateValidationError[] {
  const errors: MandateValidationError[] = [];

  if (containsValidationCode(validationCode, VALIDATION_CODES.INVALID_DATES)) {
    errors.push({
      field: 'dates',
      message: 'Invoice begin date must be before or equal to invoice end date',
      code: VALIDATION_CODES.INVALID_DATES,
    });
  }

  if (containsValidationCode(validationCode, VALIDATION_CODES.INVALID_AMOUNTS)) {
    errors.push({
      field: 'amounts',
      message: 'Minimum amount cannot exceed maximum amount',
      code: VALIDATION_CODES.INVALID_AMOUNTS,
    });
  }

  if (containsValidationCode(validationCode, VALIDATION_CODES.INVALID_DEBIT_PERIOD)) {
    errors.push({
      field: 'debitDay',
      message: 'Invalid debit day for the selected date range',
      code: VALIDATION_CODES.INVALID_DEBIT_PERIOD,
    });
  }

  if (containsValidationCode(validationCode, VALIDATION_CODES.MANDATE_REQUIRED_FIELD)) {
    errors.push({
      field: 'required',
      message: 'All mandatory fields must be completed',
      code: VALIDATION_CODES.MANDATE_REQUIRED_FIELD,
    });
  }

  if (containsValidationCode(validationCode, VALIDATION_CODES.MANDATE_REQUIRED_MAX_AMOUNT)) {
    errors.push({
      field: 'maxAmount',
      message: 'Maximum amount is required for variable mandate type',
      code: VALIDATION_CODES.MANDATE_REQUIRED_MAX_AMOUNT,
    });
  }

  if (containsValidationCode(validationCode, VALIDATION_CODES.MANDATE_INVALID_CURRENCY)) {
    errors.push({
      field: 'currency',
      message: 'Mandate currency must match the debtor account currency',
      code: VALIDATION_CODES.MANDATE_INVALID_CURRENCY,
    });
  }

  return errors;
}

/**
 * Validate all mandates and return aggregated validation result
 */
export function validateAllMandates(
  mandates: MandateDetails[],
  accountCurrency?: string
): {
  isValid: boolean;
  errors: Map<number, MandateValidationError[]>; // Map of index -> errors
  aggregatedCode: number;
} {
  if (!mandates || mandates.length === 0) {
    return {
      isValid: true,
      errors: new Map(),
      aggregatedCode: VALIDATION_CODES.SUCCESS,
    };
  }

  let aggregatedCode = VALIDATION_CODES.SUCCESS;
  const errors = new Map<number, MandateValidationError[]>();

  mandates.forEach((mandate, index) => {
    const code = validateMandate(mandate, accountCurrency);
    aggregatedCode |= code;

    if (code !== VALIDATION_CODES.SUCCESS) {
      errors.set(index, getValidationErrors(code));
    }
  });

  return {
    isValid: aggregatedCode === VALIDATION_CODES.SUCCESS,
    errors,
    aggregatedCode,
  };
}

/**
 * Check if a mandate field is required based on mandate type
 */
export function isFieldRequired(field: string, mandateType: string): boolean {
  const alwaysRequired = ['mandateId', 'beginDate', 'currency', 'mandateType', 'frequency', 'debitDay'];
  
  if (alwaysRequired.includes(field)) {
    return true;
  }

  if (field === 'fixedAmount' && mandateType === 'Fixed') {
    return true;
  }

  if ((field === 'minAmount' || field === 'maxAmount') && mandateType === 'Variable') {
    return true;
  }

  return false;
}
