/**
 * Transfer Creation Form Validation Logic
 * Follows the same pattern as other *CreateLogic.ts files
 */

import { Path, FieldValues, UseFormSetError } from 'react-hook-form';

export interface TransferFormValues extends FieldValues {
  transferType: string;
  sourceAccount: string;
  transferCurrency: string;
  debitCurrency: string;
  debitReference: string;
  destinationAccount: string;
  transferAmount: string;
  creditReference: string;
  paymentDate: any;
}

/**
 * Validation error messages
 */
export const transferValidationMessages = {
  required: {
    transferType: 'Please select a transfer type',
    sourceAccount: 'Please select a source account',
    transferCurrency: 'Please select a transfer currency',
    debitCurrency: 'Please select a debit currency',
    destinationAccount: 'Please select a destination account',
    transferAmount: 'Please enter a transfer amount',
    paymentDate: 'Please select a payment date',
  },
  patterns: {
    transferAmount: 'Transfer amount must be a valid number',
  },
  validation: {
    transferAmountPositive: 'Transfer amount must be greater than zero',
  },
};

/**
 * Set of required field names
 */
export const TRANSFER_REQUIRED_FIELDS = new Set<keyof TransferFormValues>([
  'transferType',
  'sourceAccount',
  'transferCurrency',
  'debitCurrency',
  'destinationAccount',
  'transferAmount',
  'paymentDate',
]);

/**
 * Validate individual field
 * @param name - Field name
 * @param value - Field value
 * @param allValues - All form values for conditional validation
 * @returns true if valid, error message string if invalid
 */
export const validateTransferField = (
  name: keyof TransferFormValues,
  value: any,
  allValues?: Partial<TransferFormValues>
): true | string => {
  // Check if field is required and empty
  if (TRANSFER_REQUIRED_FIELDS.has(name)) {
    if (!value || value === '' || value === null) {
      return transferValidationMessages.required[name] || 'This field is required';
    }
  }

  // Custom validation rules
  switch (name) {
    case 'transferAmount': {
      if (!value) return true;
      
      const numValue = parseFloat(value);
      
      // Check if it's a valid number
      if (isNaN(numValue)) {
        return transferValidationMessages.patterns.transferAmount;
      }
      
      // Check if it's positive
      if (numValue <= 0) {
        return transferValidationMessages.validation.transferAmountPositive;
      }
      
      return true;
    }

    default:
      return true;
  }
};

/**
 * Get validation rules for a specific field
 * Exported as getRulesForField to match the pattern expected by RHFTextfield and RHFSelectField
 * @param name - Field name
 * @param getAllValues - Function to get all form values (for conditional validation)
 * @returns react-hook-form RegisterOptions
 */
export const getRulesForField = (
  name: keyof TransferFormValues,
  getAllValues?: () => Partial<TransferFormValues>
) => {
  const required = TRANSFER_REQUIRED_FIELDS.has(name)
    ? transferValidationMessages.required[name] || 'This field is required'
    : false;

  return {
    required: required || undefined,
    validate: (val: any) => {
      const allValues = getAllValues?.();
      return validateTransferField(name, val, allValues);
    },
  };
};

/**
 * Deprecated: Use getRulesForField instead
 * Kept for backwards compatibility
 */
export const getTransferFieldRules = getRulesForField;

/**
 * Validate all form data
 * @param data - Form values to validate
 * @returns Object with field names as keys and error messages as values, or empty object if valid
 */
export const validateTransferForm = (
  data: Partial<TransferFormValues>
): Record<keyof TransferFormValues, string> => {
  const errors: any = {};

  // Check all required fields
  TRANSFER_REQUIRED_FIELDS.forEach((fieldName) => {
    const value = data[fieldName];
    const error = validateTransferField(fieldName, value, data);
    
    if (error !== true) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Set form errors using react-hook-form's setError
 * @param setError - react-hook-form's setError function
 * @param errors - Errors object from validation
 */
export const setTransferFormErrors = (
  setError: UseFormSetError<TransferFormValues>,
  errors: Record<keyof TransferFormValues, string>
) => {
  Object.entries(errors).forEach(([fieldName, errorMessage]) => {
    setError(fieldName as keyof TransferFormValues, {
      type: 'manual',
      message: errorMessage as string,
    });
  });
};
