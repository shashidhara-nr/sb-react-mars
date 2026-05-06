/**
 * Limit Validation Utilities
 * Handles all validation logic for create, update, and delete operations
 * Based on backend requirements and error code 211007 flow
 */

// ============== CONSTANTS ==============
export const LIMIT_CONSTANTS = {
  // Limit Type Names
  LIMIT_TYPE_NAMES: {
    OVERALL: 'Overall',
    DOMESTIC_PAYMENT: 'Domestic Payment',
    INTERNATIONAL_PAYMENT: 'International Payment',
    TRANSFER: 'Transfer',
    COLLECTION: 'Collection',
  },

  // Limit Types
  LIMIT_TYPES: {
    OVERALL_PAYMENT: 'OVERALL_PAYMENT',
    OVERALL_TRANSFER: 'OVERALL_TRANSFER',
    PAYMENT: 'PAYMENT',
    TRANSFER: 'TRANSFER',
    COLLECTION: 'COLLECTION',
  },

  // Authorization Statuses (Cannot delete/modify)
  FORBIDDEN_STATUSES: ['ACA', 'ACT', 'R'],
  STATUS_CODES: {
    NEW: 'N',
    AWAITING_AUTHORIZATION: 'ACA',
    AUTHORIZATION_COMPLETED: 'ACT',
    REPAIR: 'R',
    CANCELLED: 'C',
    UPDATED: 'U',
  },

  // Error Codes
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
    INTERNAL_ERROR: 500,
  },

  // Period Validation (days)
  PERIOD_VALIDATION: {
    MIN: 1,
    MAX: 365,
  },

  // Amount Validation
  AMOUNT_VALIDATION: {
    MIN: 0,
    MAX_DIGITS: 15,
  },
};

// ============== TYPES ==============
export interface LimitTO {
  id: number | string;
  limitTypeName: string;
  limitType: string;
  limitCurrency: string;
  limitAmount: number | string;
  limitPeriodDays: number | string;
  productType: string;
  debtStatus?: { value: string; color: string };
  status?: string;
  correctLimitTypeName?: string;
  correctStatus?: string;
  hasDeletePermission?: boolean;
  isSelected?: boolean;
  links?: { href: string; text: string };
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  code?: number;
  fieldErrors?: Record<string, string>;
}

// ============== DELETE VALIDATION ==============

/**
 * Check if a limit is mandatory (Overall type limits)
 */
export const isMandatoryLimit = (limit: LimitTO): boolean => {
  const limitTypeName = limit.correctLimitTypeName || limit.limitTypeName;
  return (
    limitTypeName === LIMIT_CONSTANTS.LIMIT_TYPE_NAMES.OVERALL &&
    (limit.limitType === LIMIT_CONSTANTS.LIMIT_TYPES.OVERALL_PAYMENT ||
      limit.limitType === LIMIT_CONSTANTS.LIMIT_TYPES.OVERALL_TRANSFER)
  );
};

/**
 * Check if limit status prevents deletion/modification
 */
export const isLockedStatus = (status: string): boolean => {
  return LIMIT_CONSTANTS.FORBIDDEN_STATUSES.includes(status);
};

/**
 * Get current limit status
 */
export const getCurrentStatus = (limit: LimitTO): string => {
  return limit.correctStatus || limit.debtStatus?.value || 'Unknown';
};

/**
 * Validate delete operation - Main validation function
 */
export const validateDeleteLimit = (limit: LimitTO): ValidationResult => {
  // Check 1: Is it a mandatory limit?
  if (isMandatoryLimit(limit)) {
    return {
      valid: false,
      message:
        'Customer payment and transfer limit is mandatory and cannot be deleted.',
      code: LIMIT_CONSTANTS.ERROR_CODES.MANDATORY_LIMIT_DELETE,
    };
  }

  // Check 2: Check authorization/locked status
  const status = getCurrentStatus(limit);
  if (isLockedStatus(status)) {
    return {
      valid: false,
      message: `Cannot delete limit with status: ${status}`,
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_STATUS,
    };
  }

  // Check 3: Check user permissions
  if (limit.hasDeletePermission === false) {
    return {
      valid: false,
      message: 'You do not have permission to delete this limit',
      code: LIMIT_CONSTANTS.ERROR_CODES.NO_PERMISSION,
    };
  }

  // All checks passed
  return { valid: true };
};

/**
 * Validate multiple limits for bulk delete
 */
export const validateBulkDeleteLimits = (
  limits: LimitTO[]
): { valid: boolean; invalidLimits: LimitTO[]; validLimits: LimitTO[] } => {
  const validLimits: LimitTO[] = [];
  const invalidLimits: LimitTO[] = [];

  limits.forEach((limit) => {
    const validation = validateDeleteLimit(limit);
    if (validation.valid) {
      validLimits.push(limit);
    } else {
      invalidLimits.push(limit);
    }
  });

  return {
    valid: invalidLimits.length === 0,
    validLimits,
    invalidLimits,
  };
};

// ============== CREATE VALIDATION ==============

/**
 * Validate limit type
 */
export const validateLimitType = (limitType: string): ValidationResult => {
  const validTypes = Object.values(LIMIT_CONSTANTS.LIMIT_TYPES);
  if (!validTypes.includes(limitType)) {
    return {
      valid: false,
      message: 'Invalid limit type',
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_TYPE,
    };
  }
  return { valid: true };
};

/**
 * Validate limit amount
 */
export const validateLimitAmount = (
  amount: number | string
): ValidationResult => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return {
      valid: false,
      message: 'Limit amount must be a valid number',
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_AMOUNT,
    };
  }

  if (numAmount <= 0) {
    return {
      valid: false,
      message: 'Limit amount must be greater than zero',
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_AMOUNT,
    };
  }

  const amountStr = Math.floor(numAmount).toString();
  if (amountStr.length > LIMIT_CONSTANTS.AMOUNT_VALIDATION.MAX_DIGITS) {
    return {
      valid: false,
      message: `Limit amount cannot exceed ${LIMIT_CONSTANTS.AMOUNT_VALIDATION.MAX_DIGITS} digits`,
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_AMOUNT,
    };
  }

  return { valid: true };
};

/**
 * Validate currency
 */
export const validateCurrency = (
  currency: string,
  availableCurrencies?: string[]
): ValidationResult => {
  if (!currency || currency.trim() === '') {
    return {
      valid: false,
      message: 'Currency is required',
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_CURRENCY,
    };
  }

  if (
    availableCurrencies &&
    !availableCurrencies.includes(currency.toUpperCase())
  ) {
    return {
      valid: false,
      message: 'Invalid currency',
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_CURRENCY,
    };
  }

  return { valid: true };
};

/**
 * Validate period (in days)
 */
export const validatePeriod = (period: number | string): ValidationResult => {
  const numPeriod = typeof period === 'string' ? parseInt(period, 10) : period;

  if (isNaN(numPeriod)) {
    return {
      valid: false,
      message: 'Period must be a valid number',
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_PERIOD,
    };
  }

  if (
    numPeriod < LIMIT_CONSTANTS.PERIOD_VALIDATION.MIN ||
    numPeriod > LIMIT_CONSTANTS.PERIOD_VALIDATION.MAX
  ) {
    return {
      valid: false,
      message: `Period must be between ${LIMIT_CONSTANTS.PERIOD_VALIDATION.MIN} and ${LIMIT_CONSTANTS.PERIOD_VALIDATION.MAX} days`,
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_PERIOD,
    };
  }

  return { valid: true };
};

/**
 * Validate limit name uniqueness
 */
export const validateLimitName = (
  name: string,
  existingLimits?: LimitTO[]
): ValidationResult => {
  if (!name || name.trim() === '') {
    return {
      valid: false,
      message: 'Limit name is required',
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_TYPE,
    };
  }

  if (existingLimits) {
    const isDuplicate = existingLimits.some(
      (limit) =>
        limit.limitTypeName?.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      return {
        valid: false,
        message: 'Limit name already exists',
        code: LIMIT_CONSTANTS.ERROR_CODES.DUPLICATE_LIMIT_NAME,
      };
    }
  }

  return { valid: true };
};

/**
 * Validate create limit - comprehensive validation
 */
export const validateCreateLimit = (
  formData: any,
  existingLimits?: LimitTO[],
  availableCurrencies?: string[]
): ValidationResult => {
  const fieldErrors: Record<string, string> = {};

  // Validate limit type
  if (formData.limitType) {
    const typeValidation = validateLimitType(formData.limitType);
    if (!typeValidation.valid) {
      fieldErrors['limitType'] = typeValidation.message || '';
    }
  }

  // Validate limit name
  if (formData.limitTypeName) {
    const nameValidation = validateLimitName(
      formData.limitTypeName,
      existingLimits
    );
    if (!nameValidation.valid) {
      fieldErrors['limitTypeName'] = nameValidation.message || '';
    }
  }

  // Validate amount
  if (formData.limitAmount) {
    const amountValidation = validateLimitAmount(formData.limitAmount);
    if (!amountValidation.valid) {
      fieldErrors['limitAmount'] = amountValidation.message || '';
    }
  }

  // Validate currency
  if (formData.limitCurrency) {
    const currencyValidation = validateCurrency(
      formData.limitCurrency,
      availableCurrencies
    );
    if (!currencyValidation.valid) {
      fieldErrors['limitCurrency'] = currencyValidation.message || '';
    }
  }

  // Validate period
  if (formData.limitPeriodDays) {
    const periodValidation = validatePeriod(formData.limitPeriodDays);
    if (!periodValidation.valid) {
      fieldErrors['limitPeriodDays'] = periodValidation.message || '';
    }
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return {
    valid: !hasErrors,
    fieldErrors: hasErrors ? fieldErrors : undefined,
    message: hasErrors
      ? 'Please fix the validation errors'
      : 'Validation passed',
  };
};

// ============== UPDATE VALIDATION ==============

/**
 * Check if limit status allows updates
 */
export const canUpdateLimit = (status: string): boolean => {
  return !isLockedStatus(status);
};

/**
 * Validate update limit operation
 */
export const validateUpdateLimit = (
  limit: LimitTO,
  updatedFields: any
): ValidationResult => {
  const status = getCurrentStatus(limit);

  // Check if status allows updates
  if (!canUpdateLimit(status)) {
    return {
      valid: false,
      message: `Cannot update limit with status: ${status}. Only limits in draft or new status can be updated.`,
      code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_STATUS,
    };
  }

  // For mandatory Overall limits, restrict which fields can be updated
  if (isMandatoryLimit(limit)) {
    const restrictedFields = ['limitType', 'limitTypeName', 'productType'];
    const attemptedRestrictedUpdate = restrictedFields.some(
      (field) => updatedFields[field] !== undefined
    );

    if (attemptedRestrictedUpdate) {
      return {
        valid: false,
        message:
          'For mandatory limits, only amount and currency can be updated',
        code: LIMIT_CONSTANTS.ERROR_CODES.INVALID_STATUS,
      };
    }
  }

  // Validate amount if being updated
  if (updatedFields.limitAmount) {
    const amountValidation = validateLimitAmount(updatedFields.limitAmount);
    if (!amountValidation.valid) {
      return amountValidation;
    }
  }

  // Validate currency if being updated
  if (updatedFields.limitCurrency) {
    const currencyValidation = validateCurrency(updatedFields.limitCurrency);
    if (!currencyValidation.valid) {
      return currencyValidation;
    }
  }

  return { valid: true };
};

// ============== HELPER FUNCTIONS ==============

/**
 * Format error message for display
 */
export const getErrorMessage = (code: number, defaultMessage: string): string => {
  const errorMessages: Record<number, string> = {
    [LIMIT_CONSTANTS.ERROR_CODES.MANDATORY_LIMIT_DELETE]:
      'Customer payment and transfer limit is mandatory and cannot be deleted.',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_TYPE]: 'Invalid limit type',
    [LIMIT_CONSTANTS.ERROR_CODES.DUPLICATE_LIMIT_NAME]: 'Limit name already exists',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_AMOUNT]: 'Invalid limit amount',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_CURRENCY]: 'Invalid currency',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_PERIOD]: 'Invalid period',
    [LIMIT_CONSTANTS.ERROR_CODES.NO_PERMISSION]: 'You do not have permission',
    [LIMIT_CONSTANTS.ERROR_CODES.LIMIT_NOT_FOUND]: 'Limit not found',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_STATUS]:
      'Cannot perform this action on limit with current status',
  };

  return errorMessages[code] || defaultMessage;
};

/**
 * Get all invalid limits from a list
 */
export const getInvalidLimitsForDelete = (limits: LimitTO[]): LimitTO[] => {
  return limits.filter((limit) => {
    const validation = validateDeleteLimit(limit);
    return !validation.valid;
  });
};

/**
 * Get validation error details
 */
export const getValidationErrorDetails = (
  validation: ValidationResult
): { title: string; message: string; isMandatoryError: boolean } => {
  const isMandatoryError =
    validation.code === LIMIT_CONSTANTS.ERROR_CODES.MANDATORY_LIMIT_DELETE;

  return {
    title: isMandatoryError ? 'Cannot Delete' : 'Validation Error',
    message:
      validation.message ||
      'An error occurred during validation',
    isMandatoryError,
  };
};
