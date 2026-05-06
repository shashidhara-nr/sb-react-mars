/**
 * Account Verification Request Form Validation Logic
 * Follows the same pattern as DebtorsCreateLogic.ts
 * Centralized business validation and RHF rule generation.
 */

import type { RegisterOptions, FieldValues } from 'react-hook-form';

export interface VerificationRequestFormValues extends FieldValues {
  lastName: string;
  idNumber: string;
  emailAddress: string;
  telephoneNumber: string;
  country: string;
  accountNumber: string;
  branchSortCode: string;
  bicSwift: string;
  description?: string;
}

/**
 * Required fields per business rules
 */
export const VERIFICATION_REQUIRED_FIELDS = new Set<keyof VerificationRequestFormValues>([
  'lastName',
  'idNumber',
  'emailAddress',
  'telephoneNumber',
  'country',
  'accountNumber',
  'branchSortCode',
  'bicSwift',
]);

/**
 * Common validation messages - edit here to change validation copy
 */
export const verificationValidationMessages = {
  required: {
    lastName: 'Last name / Company name is required',
    idNumber: 'ID number is required',
    emailAddress: 'Email address is required',
    telephoneNumber: 'Telephone number is required',
    country: 'Country is required',
    accountNumber: 'Account number is required',
    branchSortCode: 'Branch / Sort code is required',
    bicSwift: 'BIC (SWIFT) is required',
    description: 'Description is required',
  } as Record<string, string>,
  patterns: {
    emailAddress: 'Please enter a valid email address',
    idNumber: 'ID number must be valid',
    telephoneNumber: 'Please enter a valid phone number',
  } as Record<string, string>,
};

/**
 * Pattern helpers
 */
const re = {
  email: /^(?:[a-zA-Z0-9_'^&\-])+(?:\.(?:[a-zA-Z0-9_'^&\-])+)*@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/,
  phoneNumber: /^[+]?\d{7,15}$/,
};

/**
 * Field-level validator. Return `true` when valid, or a string message when invalid.
 * Edit this function to change business validation only.
 */
export function validateVerificationField(
  name: keyof VerificationRequestFormValues,
  value: any,
  allValues?: VerificationRequestFormValues,
): true | string {
  const v = value as string | number | undefined | null;

  // Required checks
  if (VERIFICATION_REQUIRED_FIELDS.has(name)) {
    const msg = verificationValidationMessages.required[name as string] ?? 'This field is required';
    if (v === undefined || v === null || String(v).trim() === '') return msg;
  }

  switch (name) {
    case 'emailAddress': {
      if (v && !re.email.test(String(v))) {
        return verificationValidationMessages.patterns.emailAddress;
      }
      return true;
    }
    case 'telephoneNumber': {
      if (v && !re.phoneNumber.test(String(v))) {
        return verificationValidationMessages.patterns.telephoneNumber;
      }
      return true;
    }
    default:
      return true;
  }
}

/**
 * Generate RHF `RegisterOptions` for a field, wiring business validation.
 * This lets UI components consume messages purely from business logic.
 */
export function getRulesForField(
  name: keyof VerificationRequestFormValues,
  getAllValues?: () => VerificationRequestFormValues,
): RegisterOptions {
  const requiredRule = VERIFICATION_REQUIRED_FIELDS.has(name)
    ? verificationValidationMessages.required[name as string] ?? 'This field is required'
    : undefined;

  return {
    required: requiredRule,
    validate: (val: any) => validateVerificationField(name, val, getAllValues?.()),
  } as RegisterOptions;
}

/**
 * Export as default object following the pattern
 */
const VerificationCreateLogic = {
  VERIFICATION_REQUIRED_FIELDS,
  verificationValidationMessages,
  validateVerificationField,
  getRulesForField,
};

export default VerificationCreateLogic;
