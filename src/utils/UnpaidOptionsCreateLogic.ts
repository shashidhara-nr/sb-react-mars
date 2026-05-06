/**
 * Unpaid Options Create Logic (TypeScript)
 * Centralized business validation and RHF rule generation.
 */

import type { RegisterOptions } from 'react-hook-form';

export type UnpaidOptionFormValues = {
  unpaidOptionName?: string;
  postingOption?: string;
  postingAccount?: string;
  selectedNominatedAccount?: string;
};

/** Required fields per business rules */
export const REQUIRED_FIELDS = new Set<keyof UnpaidOptionFormValues>([
  'unpaidOptionName',
  'postingOption',
  'postingAccount',
  'selectedNominatedAccount', // Required when postingAccount is 'Use nominated account'
]);

/** Common messages — edit here to change validation copy */
export const messages = {
  required: {
    unpaidOptionName: 'Please enter an unpaid option name',
    postingOption: 'Please select a posting option',
    postingAccount: 'Please select a posting account',
    selectedNominatedAccount: 'Please select a nominated account',
  } as Record<string, string>,
};

const validPostingOptions = new Set(['Itemized', 'Consolidate per agent bank', 'Consolidate across all agent banks']);
const validPostingAccounts = new Set(['Use nominated account', 'Use the ordering account']);

/**
 * Field-level validator. Return `true` when valid, or a string message when invalid.
 * Edit this function to change business validation only.
 */
export function validateField(
  name: keyof UnpaidOptionFormValues,
  value: unknown,
  allValues?: UnpaidOptionFormValues,
): true | string {
  const v = value as string | undefined | null;

  // Special handling for selectedNominatedAccount - only required if postingAccount is 'Use nominated account'
  if (name === 'selectedNominatedAccount') {
    const postingAccount = allValues?.postingAccount;
    if (postingAccount === 'Use nominated account') {
      if (v === undefined || v === null || String(v).trim() === '') {
        return messages.required.selectedNominatedAccount;
      }
    }
    return true;
  }

  // Required checks for other fields
  if (REQUIRED_FIELDS.has(name)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    if (v === undefined || v === null || String(v).trim() === '') return msg;
  }

  switch (name) {
    case 'unpaidOptionName': {
      if (v && String(v).length > 100) return 'Unpaid option name must not exceed 100 characters';
      return true;
    }
    case 'postingOption': {
      if (v && !validPostingOptions.has(String(v))) {
        return 'Please select a valid posting option';
      }
      return true;
    }
    case 'postingAccount': {
      if (v && !validPostingAccounts.has(String(v))) {
        return 'Please select a valid posting account';
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
  name: keyof UnpaidOptionFormValues,
  getAllValues?: () => UnpaidOptionFormValues,
): RegisterOptions {
  // Special handling for selectedNominatedAccount - only required conditionally
  if (name === 'selectedNominatedAccount') {
    return {
      validate: (val: unknown) => {
        const allVals = getAllValues?.();
        const postingAccount = allVals?.postingAccount;
        
        // Only required if postingAccount is 'Use nominated account'
        if (postingAccount === 'Use nominated account') {
          if (!val || String(val).trim() === '') {
            return messages.required.selectedNominatedAccount;
          }
        }
        
        return true;
      },
    } as RegisterOptions;
  }

  const requiredRule = REQUIRED_FIELDS.has(name)
    ? messages.required[name as string] ?? 'This field is required'
    : undefined;

  return {
    required: requiredRule,
    validate: (val: unknown) => validateField(name, val, getAllValues?.()),
  } as RegisterOptions;
}

const UnpaidOptionsCreateLogic = {
  REQUIRED_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default UnpaidOptionsCreateLogic;
