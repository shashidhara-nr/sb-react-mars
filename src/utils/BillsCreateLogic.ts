/**
 * Bills Create Logic (TypeScript)
 * Centralized business validation and RHF rule generation for billers.
 */

import type { RegisterOptions } from 'react-hook-form';

export type BillerFormValues = {
  billerName?: string;
  billerId?: string;
  currency?: string;
  transactionLimit?: string | number;
  paymentTypes?: string[] | string;
  referenceFields?: Array<{ id: string; name: string; value: string }>;
  phoneNumber?: string;
  phoneUsage?: string[];
  phoneAlertEnabled?: boolean;
  emailAddress?: string;
  emailUsage?: string[];
  emailAlertEnabled?: boolean;
};

/** Required fields per business rules */
export const REQUIRED_FIELDS = new Set<keyof BillerFormValues>([
  'billerName',
  'billerId',
  'currency',
  'transactionLimit',
  'paymentTypes',
]);

/** Common messages — edit here to change validation copy */
export const messages = {
  required: {
    billerName: 'Please select a biller account',
    billerId: 'Please enter a biller ID',
    currency: 'Required',
    transactionLimit: 'Required',
    paymentTypes: 'Please select at least one payment type',
  } as Record<string, string>,
  lengths: {
    billerNameMax: 'Biller name must not exceed 100 characters',
    billerIdMax: 'Biller ID must not exceed 50 characters',
    phoneMax: 'Phone number must not exceed 15 characters',
    emailMax: 'Email address must not exceed 100 characters',
  } as Record<string, string>,
  patterns: {
    alphaNum: 'Use letters and numbers only',
    email: 'Enter a valid email address',
    phone: 'Enter a valid phone number (e.g., +27 82 123 4567)',
    positiveNumber: 'Enter a valid positive number',
  } as Record<string, string>,
  amounts: {
    positive: 'Enter a positive amount',
    invalidNumber: 'Amount must be a valid number',
  } as Record<string, string>,
  paymentTypes: {
    atLeastOne: 'Select at least one payment type',
  } as Record<string, string>,
};

/** Pattern helpers */
const re = {
  alphaNum: /^[a-zA-Z0-9_\-\s]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?\d{7,15}$/,
  positiveNumber: /^\d+(\.\d{1,2})?$/,
};

const allowedCurrencies = new Set(['USD', 'EUR', 'GBP', 'ZAR']);

/**
 * Field-level validator. Return `true` when valid, or a string message when invalid.
 * Edit this function to change business validation only.
 */
export function validateField(
  name: keyof BillerFormValues,
  value: unknown,
  allValues?: BillerFormValues,
): true | string {
  const v = value as string | number | undefined | null;

  // Required checks
  if (REQUIRED_FIELDS.has(name)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    if (v === undefined || v === null || String(v).trim() === '') {
      // Special case for arrays
      if (name === 'paymentTypes' && Array.isArray(value)) {
        if (value.length === 0) return msg;
      } else {
        return msg;
      }
    }
  }

  switch (name) {
    case 'billerName': {
      if (v && String(v).length > 100) return messages.lengths.billerNameMax;
      return true;
    }
    case 'billerId': {
      const str = String(v || '');
      if (str && str.length > 50) return messages.lengths.billerIdMax;
      if (str && !re.alphaNum.test(str)) return messages.patterns.alphaNum;
      return true;
    }
    case 'emailAddress': {
      const str = String(v || '');
      if (str) {
        if (str.length > 100) return messages.lengths.emailMax;
        if (!re.email.test(str)) return messages.patterns.email;
      }
      return true;
    }
    case 'phoneNumber': {
      const str = String(v || '');
      if (str) {
        if (str.length > 15) return messages.lengths.phoneMax;
        if (!re.phone.test(str.replace(/\s/g, ''))) return messages.patterns.phone;
      }
      return true;
    }
    case 'currency': {
      if (v && !allowedCurrencies.has(String(v))) {
        return 'Select a valid currency';
      }
      return true;
    }
    case 'transactionLimit': {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        const numStr = String(v).replace(/,/g, '');
        if (!re.positiveNumber.test(numStr)) {
          return messages.patterns.positiveNumber;
        }
        const num = typeof v === 'number' ? v : Number(numStr);
        if (!isFinite(num) || Number.isNaN(num)) return messages.amounts.invalidNumber;
        if (REQUIRED_FIELDS.has('transactionLimit') && num === 0) {
          return messages.required.transactionLimit;
        }
        if (num < 0) return messages.amounts.positive;
      }
      return true;
    }
    case 'paymentTypes': {
      if (Array.isArray(v)) {
        if (REQUIRED_FIELDS.has('paymentTypes') && v.length === 0) {
          return messages.paymentTypes.atLeastOne;
        }
        const invalid = v.some((x) => typeof x !== 'string' || String(x).trim() === '');
        if (invalid) return 'Invalid payment type selection';
        return true;
      }
      if (typeof v === 'string') {
        const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
        if (REQUIRED_FIELDS.has('paymentTypes') && arr.length === 0) {
          return messages.paymentTypes.atLeastOne;
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
  name: keyof BillerFormValues,
  getAllValues?: () => BillerFormValues,
): RegisterOptions {
  const requiredRule = REQUIRED_FIELDS.has(name)
    ? messages.required[name as string] ?? 'This field is required'
    : undefined;

  return {
    required: requiredRule,
    validate: (val: unknown) => validateField(name, val, getAllValues?.()),
  } as RegisterOptions;
}

const BillsCreateLogic = {
  REQUIRED_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default BillsCreateLogic;
