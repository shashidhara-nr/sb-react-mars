/**
 * Transactional Authorization Profile Create Logic (TypeScript)
 * Centralized business validation and RHF rule generation.
 */

import type { RegisterOptions } from 'react-hook-form';

export type TransactionalAuthProfileFormValues = {
  profileName?: string;
  description?: string;
  currency?: string;
  allowOwnAuthorisation?: boolean;
  // Dynamic rule fields - using index pattern
  [key: string]: any; // For dynamic rule fields like transactionLimit-0, construct-0, etc.
};

/** Required fields per business rules */
export const REQUIRED_FIELDS = new Set<keyof TransactionalAuthProfileFormValues>([
  'profileName',
  'currency',
]);

/** Common messages — edit here to change validation copy */
export const messages = {
  required: {
    profileName: 'Authorisation profile name is required',
    currency: 'Currency is required',
  } as Record<string, string>,
  lengths: {
    profileNameMin: 'Profile name must be at least 3 characters',
    profileNameMax: 'Profile name must not exceed 100 characters',
    descriptionMax: 'Description must not exceed 300 characters',
    constructMax: 'Rule construct must not exceed 500 characters',
  } as Record<string, string>,
  patterns: {
    alphaNumSpace: 'Use letters, numbers, and spaces only',
    currency: 'Please select a valid currency',
  } as Record<string, string>,
  amounts: {
    positive: 'Enter a positive amount',
    invalidNumber: 'Amount must be a valid number',
  } as Record<string, string>,
};

/** Pattern helpers */
const re = {
  alphaNumSpace: /^[a-zA-Z0-9\s_-]+$/,
};

const allowedCurrencies = new Set(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'ZAR']);

/**
 * Field-level validator. Return `true` when valid, or a string message when invalid.
 * Edit this function to change business validation only.
 */
export function validateField(
  name: string,
  value: unknown,
  allValues?: TransactionalAuthProfileFormValues,
): true | string {
  const v = value as string | number | boolean | undefined | null;

  // Handle dynamic field names (e.g., transactionLimit-0, construct-1, etc.)
  const baseFieldName = name.split('-')[0];

  // Required checks
  if (REQUIRED_FIELDS.has(name as keyof TransactionalAuthProfileFormValues)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      return msg;
    }
  }

  // Check base field name for dynamic fields
  switch (baseFieldName) {
    case 'profileName': {
      if (v) {
        const s = String(v);
        if (s.length < 3) return messages.lengths.profileNameMin;
        if (s.length > 100) return messages.lengths.profileNameMax;
        if (!re.alphaNumSpace.test(s)) return messages.patterns.alphaNumSpace;
      }
      return true;
    }

    case 'description': {
      if (v && String(v).length > 300) return messages.lengths.descriptionMax;
      return true;
    }

    case 'currency': {
      if (v && !allowedCurrencies.has(String(v))) {
        return messages.patterns.currency;
      }
      return true;
    }

    case 'transactionLimit': {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        const num = typeof v === 'number' ? v : Number(String(v));
        if (!isFinite(num) || Number.isNaN(num)) return messages.amounts.invalidNumber;
        if (num < 0) return messages.amounts.positive;
      }
      return true;
    }

    case 'construct': {
      if (v && String(v).length > 500) return messages.lengths.constructMax;
      return true;
    }

    case 'class':
    case 'condition':
    case 'class2': {
      // Optional fields, no validation needed
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
  name: string,
  getAllValues?: () => TransactionalAuthProfileFormValues,
): RegisterOptions {
  const requiredRule = REQUIRED_FIELDS.has(name as keyof TransactionalAuthProfileFormValues)
    ? messages.required[name as string] ?? 'This field is required'
    : undefined;

  return {
    required: requiredRule,
    validate: (val: unknown) => validateField(name, val, getAllValues?.()),
  } as RegisterOptions;
}

const TransactionalAuthProfileCreateLogic = {
  REQUIRED_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default TransactionalAuthProfileCreateLogic;
