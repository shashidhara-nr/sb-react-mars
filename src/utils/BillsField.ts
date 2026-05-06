// Bills field utilities: constants and field builders for biller forms
import { FieldConfig, FieldOption } from './domesticBase';
import { AccountInfoOption } from 'components/common/AccountInfoDropdown';

// Static options for selects used in Bills flow
export const CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
] as const;

export const CURRENCY_OPTIONS: FieldOption[] = CURRENCIES.map((c) => ({
  label: c.code,
  value: c.code,
}));

// Mock payment types
export const PAYMENT_TYPES = [
  { id: 'PT001', name: 'List item 1' },
  { id: 'PT002', name: 'List item 2' },
  { id: 'PT003', name: 'List item 3' },
  { id: 'PT004', name: 'List item 4' },
  { id: 'PT005', name: 'List item 5' },
];

export const PAYMENT_TYPE_OPTIONS: FieldOption[] = PAYMENT_TYPES.map((pt) => ({
  label: pt.name,
  value: pt.id,
}));

// Mock reference types
export const REFERENCE_TYPES = [
  { id: 'RT001', name: 'Employee number' },
  { id: 'RT002', name: 'Identification number' },
  { id: 'RT003', name: 'Phone number' },
  { id: 'RT004', name: 'Other reference type' },
];

export const REFERENCE_TYPE_OPTIONS: FieldOption[] = REFERENCE_TYPES.map((rt) => ({
  label: rt.name,
  value: rt.id,
}));

// Mock billers for search dropdown  
export const MOCK_BILLERS: AccountInfoOption[] = [
  { 
    value: 'BL001', 
    name: 'Standard Bank Biller', 
    masked: 'BL001', 
    accNumber: 'BL001', 
    sortCode: '', 
    bic: '', 
    balances: [{ label: 'Country / Region', value: 'South Africa' }] 
  },
  { 
    value: 'BL002', 
    name: 'Municipal Services', 
    masked: 'BL002', 
    accNumber: 'BL002', 
    sortCode: '', 
    bic: '', 
    balances: [{ label: 'Country / Region', value: 'North America' }] 
  },
  { 
    value: 'BL003', 
    name: 'Utility Provider', 
    masked: 'BL003', 
    accNumber: 'BL003', 
    sortCode: '', 
    bic: '', 
    balances: [{ label: 'Country / Region', value: 'Africa' }] 
  },
  { 
    value: 'BL004', 
    name: 'Telkom SA', 
    masked: 'BL004', 
    accNumber: 'BL004', 
    sortCode: '', 
    bic: '', 
    balances: [{ label: 'Country / Region', value: 'South Africa' }] 
  },
  { 
    value: 'BL005', 
    name: 'City Power', 
    masked: 'BL005', 
    accNumber: 'BL005', 
    sortCode: '', 
    bic: '', 
    balances: [{ label: 'Country / Region', value: 'South' }] 
  },
];

// Mock pay alerts data
export const MOCK_PAY_ALERTS = [
  {
    id: '1',
    alertId: '1',
    alertType: 'Number',
    titleAndName: '[title and name]',
    addressOrNumber: '[+XX XXXX XXXXXX]',
    notify: true,
  },
  {
    id: '2',
    alertId: '2',
    alertType: 'Number',
    titleAndName: '[title and name]',
    addressOrNumber: '[+XX XXXX XXXXXX]',
    notify: true,
  },
  {
    id: '3',
    alertId: '3',
    alertType: 'Number',
    titleAndName: '[title and name]',
    addressOrNumber: '[+XX XXXX XXXXXX]',
    notify: true,
  },
  {
    id: '4',
    alertId: '4',
    alertType: 'Number',
    titleAndName: '[title and name]',
    addressOrNumber: '[+XX XXXX XXXXXX]',
    notify: true,
  },
  {
    id: '5',
    alertId: '5',
    alertType: 'Number',
    titleAndName: '[title and name]',
    addressOrNumber: '[+XX XXXX XXXXXX]',
    notify: true,
  },
];

export function buildBillerDetailsFields(biller: any): FieldConfig[] {
  const isInitialCreateState =
    !biller?.billerName &&
    !biller?.billerId &&
    (biller?.transactionLimit === '0.00' || biller?.transactionLimit === 0 || biller?.transactionLimit === undefined);

  const fields: FieldConfig[] = [
    {
      name: 'billerName',
      label: 'Search accounts',
      value: biller?.billerName || '',
      type: 'accountInfo',
      required: true,
      fullWidth: true,
      accountInfoOptions: MOCK_BILLERS,
    },
    {
      name: 'transactionLimit',
      label: 'Currency and transaction limit *',
      value: isInitialCreateState ? '' : String(biller?.transactionLimit ?? ''),
      type: 'amount',
      required: true,
      fullWidth: false,
      amountCurrency: biller?.currency || 'ZAR',
      amountCurrencyOptions: CURRENCY_OPTIONS as FieldOption[],
      amountCurrencyTargetName: 'currency',
    },
  ];
  return fields;
  
}

export function buildPaymentTypeFields(biller: any): FieldConfig[] {
  const selectedTypes = Array.isArray(biller?.paymentTypes) 
    ? biller.paymentTypes 
    : typeof biller?.paymentTypes === 'string'
    ? biller.paymentTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return [
    {
      name: 'paymentTypes',
      label: 'Payment type(s)*',
      type: 'multiChip',
      required: true,
      options: PAYMENT_TYPE_OPTIONS,
      multiSelectedValues: selectedTypes,
      multiTargetFieldName: 'paymentTypes',
      multiJoin: ',',
    },
  ];
}

export function buildReferenceFields(biller: any, onAddReference?: () => void): FieldConfig[] {
  const selectedRefs = Array.isArray(biller?.referenceFields) 
    ? biller.referenceFields 
    : typeof biller?.referenceFields === 'string'
    ? biller.referenceFields.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return [
    {
      name: 'referenceFields',
      label: 'Select reference type(s)',
      type: 'multiChip',
      required: false,
      options: REFERENCE_TYPE_OPTIONS,
      multiSelectedValues: selectedRefs,
      multiTargetFieldName: 'referenceFields',
      multiJoin: ',',
      fullWidth: false,
    },
    {
      name: 'addReferenceBtn',
      label: '',
      type: 'button',
      buttonText: '+ ADD REFERENCE TYPE(S)',
      buttonVariant: 'secondary',
      onClick: onAddReference,
      fullWidth: false,
      buttonHeight: '48px',
      buttonMarginTop: '8px',
    },
  ];
}

export function buildPayAlertsFields(biller: any): FieldConfig[] {
  return [
    {
      name: 'phoneNumber',
      label: 'Phone number',
      value: biller?.phoneNumber || '',
      type: 'phone',
      chip: true,
      chipOptions: [{ label: 'Use for alerts', value: 'alerts' }],
      chipSelectedValues: biller?.phoneAlertEnabled ? ['alerts'] : [],
      chipTargetFieldName: 'phoneUsage',
    },
    {
      name: 'emailAddress',
      label: 'Email address',
      value: biller?.emailAddress || '',
      type: 'text',
      chip: true,
      chipOptions: [{ label: 'Use for alerts', value: 'alerts' }],
      chipSelectedValues: biller?.emailAlertEnabled ? ['alerts'] : [],
      chipTargetFieldName: 'emailUsage',
    },
  ];
}

export function getTranslatedCurrencies(t: any) {
  return [
    { code: 'ZAR', name: t('currencyZAR') },
    { code: 'USD', name: t('currencyUSD') },
    { code: 'EUR', name: t('currencyEUR') },
    { code: 'GBP', name: t('currencyGBP') },
  ];
}

export function getTranslatedCurrencyOptions(t: any): FieldOption[] {
  const translatedCurrencies = getTranslatedCurrencies(t);
  return translatedCurrencies.map((c) => ({
    label: `${c.code} - ${c.name}`,
    value: c.code,
  }));
}

// Translation helper functions for multilingual support
export function getTranslatedPaymentTypes(t: any): typeof PAYMENT_TYPES {
  return [
    { id: 'PT001', name: t('paymentTypeOption1') },
    { id: 'PT002', name: t('paymentTypeOption2') },
    { id: 'PT003', name: t('paymentTypeOption3') },
    { id: 'PT004', name: t('paymentTypeOption4') },
    { id: 'PT005', name: t('paymentTypeOption5') },
  ];
}

export function getTranslatedPaymentTypeOptions(t: any): FieldOption[] {
  const translatedTypes = getTranslatedPaymentTypes(t);
  return translatedTypes.map((pt) => ({
    label: pt.name,
    value: pt.id,
  }));
}

export function getTranslatedReferenceTypes(t: any) {
  return [
    { id: 'RT001', name: t('referenceTypeEmployee') },
    { id: 'RT002', name: t('referenceTypeIdentification') },
    { id: 'RT003', name: t('referenceTypePhone') },
    { id: 'RT004', name: t('referenceTypeOther') },
  ];
}

export function getTranslatedReferenceTypeOptions(t: any): FieldOption[] {
  const translatedTypes = getTranslatedReferenceTypes(t);
  return translatedTypes.map((rt) => ({
    label: rt.name,
    value: rt.id,
  }));
}

export function getBillerRichAutocompleteOptions(t?: any): Array<{
  label: string;
  value: string;
  subtitle?: string;
  metadata?: { label: string; value: string }[];
}> {
  return [
    {
      label: 'Standard Bank',
      value: 'BL001',
      subtitle: 'BL001',
      metadata: [{ label: 'Country/Region', value: 'South Africa' }],
    },
    {
      label: 'Municipal Services',
      value: 'BL002',
      subtitle: 'BL002',
      metadata: [{ label: 'Country/Region', value: 'Nigeria' }],
    },
    {
      label: 'Utility Company',
      value: 'BL003',
      subtitle: 'BL003',
      metadata: [{ label: 'Country/Region', value: 'South Africa' }],
    },
    {
      label: 'Telkom SA',
      value: 'BL004',
      subtitle: 'BL004',
      metadata: [{ label: 'Country/Region', value: 'Ghana' }],
    },
    {
      label: 'City Power',
      value: 'BL005',
      subtitle: 'BL005',
      metadata: [{ label: 'Country/Region', value: 'Tanzania' }],
    },
  ];
}

export function buildBillerDetailsFieldsTranslated(
  t: any,
  biller: any,
  mode: 'edit' | 'review' = 'edit',
): FieldConfig[] {
  const isInitialCreateState =
    !biller?.billerName &&
    !biller?.billerId &&
    (biller?.transactionLimit === '0.00' || biller?.transactionLimit === 0 || biller?.transactionLimit === undefined);
  const reviewField=mode === 'review' ? [
          {
            name: 'billerId',
            label: t('tableColumnBillerId'),
            value: biller?.billerId || '',
            type: 'text' as const,
            required: false,
            fullWidth: false,
            disabled: true,
          },
        ] : [];
  const fields: FieldConfig[] = [
    {
      name: 'billerName',
      label: t('billerName'),
      value: biller?.billerName || '',
      type: 'autocomplete',
      required: true,
      fullWidth: mode !== 'review',
      autocompleteRichOptions: getBillerRichAutocompleteOptions(),
    },
   ...reviewField,
    {
      name: 'transactionLimit',
      label: t('labelCurrencyTransactionLimit'),
      value: isInitialCreateState ? '' : String(biller?.transactionLimit ?? ''),
      type: 'amount',
      required: true,
      fullWidth: false,
      amountCurrency: biller?.currency || 'ZAR',
      amountCurrencyOptions: getTranslatedCurrencyOptions(t) as FieldOption[],
      amountCurrencyTargetName: 'currency',
    },
  ];
  return fields;
}

export function buildPaymentTypeFieldsTranslated(t: any, biller: any): FieldConfig[] {
  const selectedTypes = Array.isArray(biller?.paymentTypes) 
    ? biller.paymentTypes 
    : typeof biller?.paymentTypes === 'string'
    ? biller.paymentTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return [
    {
      name: 'paymentTypes',
      label: t('labelPaymentTypes'),
      type: 'multiChip',
      required: true,
      options: getTranslatedPaymentTypeOptions(t),
      multiSelectedValues: selectedTypes,
      multiTargetFieldName: 'paymentTypes',
      multiJoin: ',',
    },
  ];
}

export function buildReferenceFieldsTranslated(t: any, biller: any, onAddReference?: () => void): FieldConfig[] {
  const selectedRefs = Array.isArray(biller?.referenceFields) 
    ? biller.referenceFields 
    : typeof biller?.referenceFields === 'string'
    ? biller.referenceFields.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return [
    {
      name: 'referenceFields',
      label: t('labelSelectReferenceTypes'),
      type: 'multiChip',
      required: false,
      options: getTranslatedReferenceTypeOptions(t),
      multiSelectedValues: selectedRefs,
      multiTargetFieldName: 'referenceFields',
      multiJoin: ',',
      fullWidth: false,
    },
    {
      name: 'addReferenceBtn',
      label: '',
      type: 'button',
      buttonText: t('buttonAddReferenceTypes'),
      buttonVariant: 'secondary',
      onClick: onAddReference,
      fullWidth: false,
      buttonHeight: '48px',
      buttonMarginTop: '8px',
    },
  ];
}

export function buildPayAlertsFieldsTranslated(t: any, biller: any): FieldConfig[] {
  return [
    {
      name: 'phoneNumber',
      label: t('labelPhoneNumber'),
      value: biller?.phoneNumber || '',
      type: 'phone',
      chip: true,
      chipOptions: [{ label: t('chipUseForAlerts'), value: 'alerts' }],
      chipSelectedValues: biller?.phoneAlertEnabled ? ['alerts'] : [],
      chipTargetFieldName: 'phoneUsage',
    },
    {
      name: 'emailAddress',
      label: t('labelEmailAddress'),
      value: biller?.emailAddress || '',
      type: 'text',
      chip: true,
      chipOptions: [{ label: t('chipUseForAlerts'), value: 'alerts' }],
      chipSelectedValues: biller?.emailAlertEnabled ? ['alerts'] : [],
      chipTargetFieldName: 'emailUsage',
    },
  ];
}

// Helper function to get translated reference input field config
export function getTranslatedReferenceInputField(t: any, typeId: string) {
  switch (typeId) {
    case 'RT001': // Employee number
      return { 
        label: t('labelReferenceFieldEmployeeNumber'), 
        placeholder: t('placeholderReferenceFieldEmployeeNumber'), 
        type: 'text' as const 
      };
    case 'RT002': // Identification number
      return { 
        label: t('labelReferenceFieldIdentificationNumber'), 
        placeholder: t('placeholderReferenceFieldIdentificationNumber'), 
        type: 'text' as const 
      };
    case 'RT003': // Phone number
      return { 
        label: t('labelReferenceFieldPhoneNumber'), 
        placeholder: t('placeholderReferenceFieldPhoneNumber'), 
        type: 'tel' as const 
      };
    case 'RT004': // Other reference type
      return { 
        label: t('labelReferenceFieldOther'), 
        placeholder: t('placeholderReferenceFieldOther'), 
        type: 'text' as const 
      };
    default:
      return { 
        label: t('labelReferenceFieldOther'), 
        placeholder: '', 
        type: 'text' as const 
      };
  }
}

// Utility function to get all translatable field labels for reference
export function getTranslatableFieldLabels() {
  return {
    billerName: 'labelSearchAccounts',
    transactionLimit: 'labelCurrencyTransactionLimit',
    paymentTypes: 'labelPaymentTypes',
    referenceFields: 'labelSelectReferenceTypes',
    addReferenceBtn: 'buttonAddReferenceTypes',
    phoneNumber: 'labelPhoneNumber',
    emailAddress: 'labelEmailAddress',
    useForAlerts: 'chipUseForAlerts',
    referenceFieldEmployeeNumber: 'labelReferenceFieldEmployeeNumber',
    referenceFieldIdentificationNumber: 'labelReferenceFieldIdentificationNumber',
    referenceFieldPhoneNumber: 'labelReferenceFieldPhoneNumber',
    referenceFieldOther: 'labelReferenceFieldOther',
  };
}

export const BillsField = {
  CURRENCIES,
  CURRENCY_OPTIONS,
  PAYMENT_TYPES,
  PAYMENT_TYPE_OPTIONS,
  REFERENCE_TYPES,
  REFERENCE_TYPE_OPTIONS,
  MOCK_BILLERS,
  MOCK_PAY_ALERTS,
  buildBillerDetailsFields,
  buildPaymentTypeFields,
  buildReferenceFields,
  buildPayAlertsFields,
  getTranslatedCurrencies,
  getTranslatedCurrencyOptions,
  getTranslatedPaymentTypes,
  getTranslatedPaymentTypeOptions,
  getTranslatedReferenceTypes,
  getTranslatedReferenceTypeOptions,
  getBillerRichAutocompleteOptions,
  getTranslatedReferenceInputField,
  buildBillerDetailsFieldsTranslated,
  buildPaymentTypeFieldsTranslated,
  buildReferenceFieldsTranslated,
  buildPayAlertsFieldsTranslated,
  getTranslatableFieldLabels,
};
