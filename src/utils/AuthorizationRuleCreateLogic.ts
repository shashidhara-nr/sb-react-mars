import type { RegisterOptions } from 'react-hook-form';

export type AuthorizationRuleFormValues = {
  authRuleName?: string;
  authRuleDescription?: string;
  authRuleConstruct?: string;
  amount?: string;
  currency?: string;
  selectedClass?: string;
  selectedCondition?: string;
  selectedOperand?: string;
  conditionOperator?: string;
};

export const REQUIRED_FIELDS = new Set<keyof AuthorizationRuleFormValues>([
  'authRuleName',
  'amount',
  'selectedClass',
  'selectedCondition',
  'selectedOperand',
]);

export const messages = {
  required: {
    authRuleName: 'Please enter an authorisation rule name',
    authRuleDescription: 'Please enter an authorisation rule description',
    amount: 'Please enter a transaction limit',
    currency: 'Please select a currency',
    selectedClass: 'Please select a class',
    selectedCondition: 'Please select a condition',
    selectedOperand: 'Please select a class',
    conditionOperator: 'Please select a condition operator',
  } as Record<string, string>,
  lengths: {
    authRuleNameMax: 'Authorisation rule name must not exceed 100 characters',
    authRuleDescriptionMax: 'Authorisation rule description must not exceed 500 characters',
  } as Record<string, string>,
  patterns: {
    alphaNumCode: 'Use letters and numbers only',
  } as Record<string, string>,
  amounts: {
    positive: 'Enter a positive amount',
    invalidNumber: 'Amount must be a valid number',
  } as Record<string, string>,
};

const re = {
  alphaNum: /^[a-zA-Z0-9_\s-]+$/,
};

export function validateField(
  name: keyof AuthorizationRuleFormValues,
  value: unknown,
  allValues?: AuthorizationRuleFormValues,
): true | string {
  const v = value as string | undefined | null;

  if (REQUIRED_FIELDS.has(name)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    const isEmpty = v === undefined || v === null || v === '' || String(v).trim() === '';
    if (isEmpty) return msg;
  }

  switch (name) {
    case 'authRuleName': {
      if (v && String(v).length > 100) return messages.lengths.authRuleNameMax;
      if (v && !re.alphaNum.test(String(v))) return messages.patterns.alphaNumCode;
      return true;
    }
    case 'authRuleDescription': {
      if (v && String(v).length > 500) return messages.lengths.authRuleDescriptionMax;
      return true;
    }
    case 'amount': {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        const num = typeof v === 'number' ? v : Number(String(v));
        if (!isFinite(num) || Number.isNaN(num)) return messages.amounts.invalidNumber;
        if (num < 0) return messages.amounts.positive;
      }
      return true;
    }
    case 'selectedClass':
    case 'selectedCondition':
    case 'selectedOperand': {
      if (!v || String(v).trim() === '') {
        return messages.required[name as string] ?? 'This field is required';
      }
      return true;
    }
    case 'currency': {
      return true;
    }
    case 'conditionOperator': {
      return true;
    }
    default:
      return true;
  }
}

export function getRulesForField(
  name: keyof AuthorizationRuleFormValues,
  getAllValues?: () => AuthorizationRuleFormValues,
  isRequired: boolean = true,
): RegisterOptions {
  const rules: RegisterOptions = {
    validate: (val: unknown) => validateField(name, val, getAllValues?.()),
  };

  if (isRequired && REQUIRED_FIELDS.has(name)) {
    rules.required = messages.required[name as string] ?? 'This field is required';
  }

  return rules;
}

const AuthorizationRuleCreateLogic = {
  REQUIRED_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default AuthorizationRuleCreateLogic;
