// Transactional Authorization Profile field utilities: constants and field builders for CreateJournyForm
import { CommanField, CommanFieldOption } from '../../components/common/CreateJournyForm';

// Static options for selects used in Transactional Auth Profile flow
export const CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
] as const;

const CURRENCY_FLAG_COUNTRY_MAP: Record<(typeof CURRENCIES)[number]['code'], string> = {
  ZAR: 'ZA',
  USD: 'US',
  EUR: 'EU',
  GBP: 'GB',
};

const toFlagEmoji = (countryCode: string): string =>
  countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');

export const CURRENCY_OPTIONS: CommanFieldOption[] = CURRENCIES.map((c) => ({
  label: `${toFlagEmoji(CURRENCY_FLAG_COUNTRY_MAP[c.code])} ${c.name} (${c.code})`,
  value: c.code,
}));

export const CURRENCY_SYMBOL_OPTIONS: CommanFieldOption[] = [
  { label: 'R', value: 'ZAR' },
  { label: '$', value: 'USD' },
  { label: '€', value: 'EUR' },
  { label: '£', value: 'GBP' },
];

export const CLASS_OPTIONS: CommanFieldOption[] = [
  { label: 'Select a class', value: '' },
  { label: 'Amount', value: 'Amount' },
  { label: 'Frequency', value: 'Frequency' },
  { label: 'Time Period', value: 'Time Period' },
  { label: 'User Type', value: 'User Type' },
];

export const CONDITION_OPTIONS: CommanFieldOption[] = [
  { label: 'Select a condition', value: '' },
  { label: 'Greater than', value: 'Greater than' },
  { label: 'Less than', value: 'Less than' },
  { label: 'Equal to', value: 'Equal to' },
  { label: 'Between', value: 'Between' },
];

export const VALUE_OPTIONS: CommanFieldOption[] = [
  { label: 'Select a value', value: '' },
  { label: 'Value 1', value: 'Value1' },
  { label: 'Value 2', value: 'Value2' },
  { label: 'Value 3', value: 'Value3' },
];

export function buildProfileDetailsFields(profile: any): CommanField[] {
  return [
    {
      name: 'profileName',
      label: 'Authorisation profile name',
      value: profile?.profileName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      placeholder: 'Authorisation profile name',
    },
    {
      name: 'description',
      label: 'Authorisation profile description',
      value: profile?.description || '',
      type: 'text',
      required: false,
      fullWidth: false,
      placeholder: 'Authorisation profile description',
      helperText: '0/300',
      alwaysShowHelperText: true,
    },
    {
      name: 'currency',
      label: 'Currency*',
      value: profile?.currency || 'ZAR',
      type: 'select',
      required: true,
      fullWidth: false,
      rightBlank: false,
      options: CURRENCY_OPTIONS,
    },
    {
      name: 'allowOwnAuthorisation',
      label: 'User can authorise own payment',
      value: profile?.allowOwnAuthorisation || false,
      type: 'checkbox',
      required: false,
      fullWidth: false,
    },
  ];
}

export function buildRuleFields(rule: any, ruleIndex: number): CommanField[] {
  return [
    {
      name: `transactionLimit-${ruleIndex}`,
      label: 'Transaction limit',
      value: String(rule?.transactionLimit ?? ''),
      type: 'amount',
      required: false,
      fullWidth: false,
      amountCurrency: rule?.currency || 'ZAR',
    },
    {
      name: `construct-${ruleIndex}`,
      label: 'Authorisation rule construct',
      value: rule?.construct || '',
      type: 'text',
      required: false,
      fullWidth: true,
      placeholder: 'Rule construct',
    },
  ];
}

export function buildConditionFields(
  condition: any,
  ruleIndex: number,
  conditionIndex: number,
): CommanField[] {
  return [
    {
      name: `class-${ruleIndex}-${conditionIndex}`,
      label: 'Class',
      value: condition?.class || '',
      type: 'select',
      required: false,
      fullWidth: false,
      options: CLASS_OPTIONS,
    },
    {
      name: `condition-${ruleIndex}-${conditionIndex}`,
      label: 'Condition',
      value: condition?.condition || '',
      type: 'select',
      required: false,
      fullWidth: false,
      options: CONDITION_OPTIONS,
    },
    {
      name: `class2-${ruleIndex}-${conditionIndex}`,
      label: 'Value',
      value: condition?.class2 || '',
      type: 'select',
      required: false,
      fullWidth: false,
      options: VALUE_OPTIONS,
    },
  ];
}

export const TransactionalAuthProfileField = {
  CURRENCIES,
  CURRENCY_OPTIONS,
  CURRENCY_SYMBOL_OPTIONS,
  CLASS_OPTIONS,
  CONDITION_OPTIONS,
  VALUE_OPTIONS,
  buildProfileDetailsFields,
  buildRuleFields,
  buildConditionFields,
};
