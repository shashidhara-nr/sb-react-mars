/**
 * Limit Error Handling Utilities
 * Utilities for error message formatting and display handling
 */

import { LIMIT_CONSTANTS } from './limitValidation';

export interface ErrorResponse {
  code: number;
  message: string;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
}

export interface DisplayError {
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  isMandatoryError: boolean;
  code?: number;
  fieldErrors?: Record<string, string>;
  showContactAdmin?: boolean;
}

/**
 * Format API error response for display
 */
export const formatErrorResponse = (
  error: any,
  defaultMessage: string = 'An error occurred'
): DisplayError => {
  const code = error?.code || error?.status || 500;
  const message = error?.message || defaultMessage;

  // Special handling for error 211007 (mandatory limit delete)
  if (code === LIMIT_CONSTANTS.ERROR_CODES.MANDATORY_LIMIT_DELETE) {
    return {
      title: 'Cannot Delete Mandatory Limit',
      message,
      severity: 'warning',
      isMandatoryError: true,
      code,
      showContactAdmin: true,
    };
  }

  // Status-based error formatting
  if (code === LIMIT_CONSTANTS.ERROR_CODES.NO_PERMISSION) {
    return {
      title: 'Permission Denied',
      message: 'You do not have permission to perform this action',
      severity: 'error',
      isMandatoryError: false,
      code,
    };
  }

  if (code === LIMIT_CONSTANTS.ERROR_CODES.LIMIT_NOT_FOUND) {
    return {
      title: 'Limit Not Found',
      message: 'The limit you are trying to access does not exist',
      severity: 'error',
      isMandatoryError: false,
      code,
    };
  }

  if (code === LIMIT_CONSTANTS.ERROR_CODES.INVALID_STATUS) {
    return {
      title: 'Invalid Limit Status',
      message,
      severity: 'warning',
      isMandatoryError: false,
      code,
    };
  }

  if (
    code === LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_TYPE ||
    code === LIMIT_CONSTANTS.ERROR_CODES.DUPLICATE_LIMIT_NAME ||
    code === LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_AMOUNT ||
    code === LIMIT_CONSTANTS.ERROR_CODES.INVALID_CURRENCY ||
    code === LIMIT_CONSTANTS.ERROR_CODES.INVALID_PERIOD
  ) {
    return {
      title: 'Validation Error',
      message,
      severity: 'error',
      isMandatoryError: false,
      code,
      fieldErrors: error?.fieldErrors,
    };
  }

  // Generic error
  return {
    title: 'Error',
    message,
    severity: 'error',
    isMandatoryError: false,
    code,
  };
};

/**
 * Get user-friendly error message for error codes
 */
export const getErrorMessageForCode = (code: number): string => {
  const messages: Record<number, string> = {
    [LIMIT_CONSTANTS.ERROR_CODES.MANDATORY_LIMIT_DELETE]:
      'Customer payment and transfer limit is mandatory and cannot be deleted.',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_TYPE]:
      'Please select a valid limit type.',
    [LIMIT_CONSTANTS.ERROR_CODES.DUPLICATE_LIMIT_NAME]:
      'A limit with this name already exists. Please choose a different name.',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_LIMIT_AMOUNT]:
      'Please enter a valid limit amount (positive number, max 15 digits).',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_CURRENCY]:
      'Please select a valid currency.',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_PERIOD]:
      'Please enter a valid period (1-365 days).',
    [LIMIT_CONSTANTS.ERROR_CODES.NO_PERMISSION]:
      'You do not have permission to perform this action.',
    [LIMIT_CONSTANTS.ERROR_CODES.LIMIT_NOT_FOUND]:
      'The limit could not be found.',
    [LIMIT_CONSTANTS.ERROR_CODES.INVALID_STATUS]:
      'This limit cannot be modified due to its current status.',
    [LIMIT_CONSTANTS.ERROR_CODES.INTERNAL_ERROR]:
      'An internal server error occurred. Please try again later.',
  };

  return messages[code] || 'An unexpected error occurred.';
};

/**
 * Format field errors for display
 */
export const formatFieldErrors = (
  fieldErrors: Record<string, string> | undefined
): string => {
  if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
    return '';
  }

  return Object.entries(fieldErrors)
    .map(([field, error]) => `• ${formatFieldName(field)}: ${error}`)
    .join('\n');
};

/**
 * Convert field names to readable format
 */
export const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Build complete error message with field errors
 */
export const buildCompleteErrorMessage = (
  baseMessage: string,
  fieldErrors?: Record<string, string>
): string => {
  const formattedFieldErrors = formatFieldErrors(fieldErrors);
  if (formattedFieldErrors) {
    return `${baseMessage}\n\n${formattedFieldErrors}`;
  }
  return baseMessage;
};

/**
 * Determine if error requires admin contact
 */
export const shouldContactAdmin = (code: number): boolean => {
  const adminContactCodes = [
    LIMIT_CONSTANTS.ERROR_CODES.MANDATORY_LIMIT_DELETE,
    LIMIT_CONSTANTS.ERROR_CODES.NO_PERMISSION,
    LIMIT_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
  ];
  return adminContactCodes.includes(code);
};

/**
 * Create a standardized error object
 */
export const createErrorObject = (
  code: number,
  customMessage?: string,
  fieldErrors?: Record<string, string>
): ErrorResponse => {
  return {
    code,
    message: customMessage || getErrorMessageForCode(code),
    fieldErrors,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handle API error response
 */
export const handleApiError = (error: any): DisplayError => {
  if (!error) {
    return {
      title: 'Error',
      message: 'An unknown error occurred',
      severity: 'error',
      isMandatoryError: false,
    };
  }

  // Check if it's an error object from our validation
  if (error.code && error.message) {
    return formatErrorResponse(error, error.message);
  }

  // Check if it's an API response error
  if (error.response?.data) {
    return formatErrorResponse(error.response.data);
  }

  // Check if it's a string error
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      severity: 'error',
      isMandatoryError: false,
    };
  }

  // Default error
  return {
    title: 'Error',
    message: error.message || 'An unexpected error occurred',
    severity: 'error',
    isMandatoryError: false,
  };
};
