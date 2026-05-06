/**
 * Debtors Create Logic (TypeScript)
 * Centralized business validation and RHF rule generation.
 */

import type { RegisterOptions } from 'react-hook-form';

export type DebtorFormValues = {
  counterPartyName?: string;
  referenceIDX?: string;
  counterPartyReference?: string;
  addressLine1?: string;
  addressLine2?: string;
  countryCode?: string;
  phoneNumber?: string;
  phoneUsage?: string[];
  email?: string;
  emailUsage?: string[];
  financialInstitutionName?: string;
  branchName?: string;
  bic?: string;
  branchSortCode?: string;
  town?: string;
  bankCountryCode?: string;
  selectedBank?: string;
  accountNumber?: string;
  iban?: string;
  currency?: string;
  transactionLimit?: string | number;
  transactionLimitCurrency?: string;
  accountType?: string;
  collectionType?: string[] | string;
  collections?: string[] | string; // alias used by DebtorsField
};

/** Required fields per business rules */
export const REQUIRED_FIELDS = new Set<keyof DebtorFormValues>([
  'counterPartyName',
  'referenceIDX',
  'addressLine1',
  'countryCode',
  'financialInstitutionName',
  'bankCountryCode',
  // Newly required fields per page.tsx
  'branchSortCode',
  // accountNumber and iban are handled with custom validation (either/or logic)
  'currency',
  'transactionLimit',
  'transactionLimitCurrency',
  // accountType removed - conditionally required based on API response (accountTypeOptions.length > 0)
  'collectionType',
  'collections',
]);

/** Common messages — edit here to change validation copy */
export const messages = {
  required: {
    counterPartyName: 'Please enter a debtor name',
    referenceIDX: 'Please enter a debtor code',
    counterPartyReference: 'Please enter a debtor reference',
    addressLine1: 'Please enter an address',
    countryCode: 'Please enter country/region',
    financialInstitutionName: 'Bank name is required',
    bankCountryCode: 'Bank country is required',
    branchSortCode: 'Please enter a branch/sort code',
    accountNumber: 'An account number or an IBAN are required.',
    iban: 'An account number or an IBAN are required.',
    currency: 'Please select a currency',
    transactionLimit: 'Please enter a transaction limit',
    transactionLimitCurrency: 'Please select a transaction limit currency',
    accountType: 'Please select an account type',
    collectionType: 'Please select a collection type',
    collections: 'Please select a collection type',
  } as Record<string, string>,
  lengths: {
    debtorNameMax: 'Debtor name must not exceed 100 characters',
    accountNumberMax: 'Account number must not exceed 20 characters',
  } as Record<string, string>,
  patterns: {
    alphaNumCode: 'Use letters and numbers only',
    email: 'Enter a valid email address',
    phone: 'Enter a valid phone number',
    bic: 'Enter a valid BIC (8 or 11 characters)',
    iban: 'An account number or an IBAN are required.',
    branchSortCode: 'Please enter a branch/sort code',
    accountNumber: 'An account number or an IBAN are required.',
    accountType: 'Enter a valid account type',
    currency: 'Select a valid currency',
  } as Record<string, string>,
  amounts: {
    positive: 'Enter a positive amount',
    currencyRequired: 'Select a currency for the amount',
    invalidNumber: 'Amount must be a valid number',
  } as Record<string, string>,
  collections: {
    atLeastOne: 'Select at least one collection type',
  } as Record<string, string>,
};

/** Pattern helpers */
const re = {
  alphaNum: /^[a-zA-Z0-9_-]+$/,
  email:
    /^(?:[a-zA-Z0-9_'^&\-])+(?:\.(?:[a-zA-Z0-9_'^&\-])+)*@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/,
  phone: /^[+]?\d{7,15}$/,
  bic: /^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$/,
  // A pragmatic IBAN check (length + charset). For strictness, replace with library if needed.
  iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/,
  branchSortCode: /^[A-Za-z0-9-]{3,20}$/,
  accountNumber: /^[A-Za-z0-9]{4,34}$/,
  // Account type can contain letters, numbers, spaces, parentheses, slashes, and dashes
  // Examples: "CURRENT (CHEQUE) ACCOUNTS", "Current / Cheque", "01-Current / Cheque"
  accountType: /^[A-Za-z0-9 ()/\-]{2,100}$/,
  currencyCode: /^[A-Z]{3}$/,
};

/**
 * Field-level validator. Return `true` when valid, or a string message when invalid.
 * Edit this function to change business validation only.
 */
export function validateField(
  name: keyof DebtorFormValues,
  value: unknown,
  allValues?: DebtorFormValues,
): true | string {
  const v = value as string | number | undefined | null;

  // Required checks
  if (REQUIRED_FIELDS.has(name)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    if (v === undefined || v === null || String(v).trim() === '') return msg;
  }

  switch (name) {
    case 'counterPartyName': {
      if (v && String(v).length > 100) return messages.lengths.debtorNameMax;
      return true;
    }
    case 'referenceIDX': {
      return true;
    }
    case 'email': {
      if (v && !re.email.test(String(v))) return messages.patterns.email;
      return true;
    }
    case 'phoneNumber': {
      if (v && !re.phone.test(String(v))) return messages.patterns.phone;
      return true;
    }
    case 'bic': {
      if (v && !re.bic.test(String(v))) return messages.patterns.bic;
      return true;
    }
    case 'iban': {
      if (v && !re.iban.test(String(v))) return messages.patterns.iban;
      return true;
    }
    case 'branchSortCode': {
      if (v && !re.branchSortCode.test(String(v))) return messages.patterns.branchSortCode;
      return true;
    }
    case 'financialInstitutionName': {
      // Bank name - just needs to be non-empty (handled by required check above)
      return true;
    }
    case 'bankCountryCode': {
      // Bank country - just needs to be selected (handled by required check above)
      return true;
    }
    case 'accountNumber': {
      if (v) {
        const s = String(v);
        if (s.length > 20) return messages.lengths.accountNumberMax;
        if (!re.accountNumber.test(s)) return messages.patterns.accountNumber;
      }
      return true;
    }
    case 'accountType': {
      if (v && !re.accountType.test(String(v))) return messages.patterns.accountType;
      return true;
    }
    case 'currency':
    case 'transactionLimitCurrency': {
      // Accept any 3-letter ISO currency code from API
      if (v && !re.currencyCode.test(String(v))) return messages.patterns.currency;
      return true;
    }
    case 'transactionLimit': {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        const num = typeof v === 'number' ? v : Number(String(v));
        if (!isFinite(num) || Number.isNaN(num)) return messages.amounts.invalidNumber;
        if (num < 0) return messages.amounts.positive;
        const curr = allValues?.transactionLimitCurrency;
        if (!curr || String(curr).trim() === '') return messages.amounts.currencyRequired;
      }
      return true;
    }
    case 'collectionType': {
      if (Array.isArray(v)) {
        // If required in UI, enforce at least one
        if (REQUIRED_FIELDS.has('collectionType') && v.length === 0) {
          return messages.collections.atLeastOne;
        }
        // Ensure all are non-empty strings
        const invalid = v.some((x) => typeof x !== 'string' || String(x).trim() === '');
        if (invalid) return 'Invalid collection type selection';
        return true;
      }
      if (typeof v === 'string') {
        // Accept comma-separated entries; if required, ensure non-empty
        const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
        if (REQUIRED_FIELDS.has('collectionType') && arr.length === 0) {
          return messages.collections.atLeastOne;
        }
        return true;
      }
      // Allow empty if not required
      return true;
    }
    case 'collections': {
      if (Array.isArray(v)) {
        if (REQUIRED_FIELDS.has('collections') && v.length === 0) {
          return messages.collections.atLeastOne;
        }
        const invalid = v.some((x) => typeof x !== 'string' || String(x).trim() === '');
        if (invalid) return 'Invalid collection type selection';
        return true;
      }
      if (typeof v === 'string') {
        const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
        if (REQUIRED_FIELDS.has('collections') && arr.length === 0) {
          return messages.collections.atLeastOne;
        }
        return true;
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
  name: keyof DebtorFormValues,
  getAllValues?: () => DebtorFormValues,
): RegisterOptions {
  // Special handling for accountNumber and iban - only required if BOTH are empty
  if (name === 'accountNumber' || name === 'iban') {
    return {
      validate: (val: unknown) => {
        const allVals = getAllValues?.();
        const accountNumber = allVals?.accountNumber;
        const iban = allVals?.iban;
        
        // If either field has a value, validation passes
        if (accountNumber || iban) {
          return true;
        }
        
        // Both are empty - show error
        return 'An account number or an IBAN are required.';
      },
    } as RegisterOptions;
  }

  // Special handling for transactionLimitCurrency - always required and validated with transaction limit
  if (name === 'transactionLimitCurrency') {
    const requiredRule = REQUIRED_FIELDS.has(name)
      ? messages.required[name as string] ?? 'This field is required'
      : undefined;
      
    return {
      required: requiredRule,
      validate: (val: unknown) => {
        const allVals = getAllValues?.();
        const limit = allVals?.transactionLimit;
        
        // If transaction limit has a value, currency must also have a value
        if (limit !== undefined && limit !== null && String(limit).trim() !== '') {
          if (!val || String(val).trim() === '') {
            return messages.amounts.currencyRequired;
          }
        }
        
        // Validate format if value exists
        return validateField(name, val, allVals);
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

const DebtorsCreateLogic = {
  REQUIRED_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default DebtorsCreateLogic;