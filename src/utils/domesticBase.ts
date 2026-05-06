// Domestic Base utilities: field builders for CreateJournyForm
import { AccountInfoOption } from 'components/common/AccountInfoDropdown';

export type FieldOption = { label: string; value: string };
export type RichAutocompleteOption = {
  label: string;
  value: string;
  subtitle?: string;
  metadata?: { label: string; value: string }[];
};

export type FieldConfig = {
  name: string;
  label: string;
  value?: any;
  type: 'text' | 'select' | 'multiChip' | 'phone' | 'amount' | 'radio' | 'accountInfo' | 'date' | 'button' | 'autocomplete' | 'headerLabel';
  required?: boolean;
  fullWidth?: boolean;
  rightBlank?: boolean;
  lookupBtn?: boolean;
  options?: FieldOption[];
  autocompleteRichOptions?: RichAutocompleteOption[];
  chip?: boolean;
  chipOptions?: FieldOption[];
  chipSelectedValues?: string[];
  chipTargetFieldName?: string;
  amountCurrency?: string;
  amountCurrencyOptions?: FieldOption[];
  amountCurrencyTargetName?: string;
  multiSelectedValues?: string[];
  multiTargetFieldName?: string;
  multiJoin?: string;
  helperText?: string;
  alwaysShowHelperText?: boolean;
  disabled?: boolean;
  showWhen?: { field: string; value: any };
  accountInfoOptions?: AccountInfoOption[];
  hideInEdit?: boolean;
  // Button-specific properties
  buttonVariant?: 'primary' | 'secondary' | 'tertiary' | 'text' | 'error' | 'primary-header-menu' | 'primary-on-colour' | 'secondary-on-colour' | 'tertiary-on-colour' | 'error-secondary' | 'error-tertiary';
  onClick?: () => void;
  buttonText?: string;
  startIcon?: any;
  endIcon?: any;
  buttonHeight?: string | number;
  buttonMarginTop?: string | number;
  placeholder?: string;
  headerIcon?: any; // For headerLabel type fields
};

export function buildPersonalFields(beneficiary: any): FieldConfig[] {
  return [
    {
      name: 'counterPartyName',
      label: 'Beneficiary name*',
      value: beneficiary?.counterPartyName || '',
      type: 'text',
      required: true,
      rightBlank: true,
    },{
      name: 'referenceIDX',
      label: 'Beneficiary code*',
      value: beneficiary?.referenceIDX || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
      name: 'counterPartyReference',
      label: 'Beneficiary reference',
      value: beneficiary?.counterPartyReference || '',
      type: 'text',
    },
  ];
}

export function buildAddressFields(
  beneficiary: any,
  countryOptions?: Array<{ label: string; value: string }>
): FieldConfig[] {
  // Fallback country options if not provided from API
  const defaultCountryOptions = [
    { label: 'South Africa', value: 'ZA' },
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
  ];

  return [
    {
      name: 'addressLine1',
      label: 'Address line 1*',
      value: beneficiary?.counterPartyAddress?.addressLine1 || '',
      type: 'text',
      required: true,
    },
    {
      name: 'addressLine2',
      label: 'Address line 2',
      value: beneficiary?.counterPartyAddress?.addressLine2 || '',
      type: 'text',
    },

    {
        name: 'townName',
        label: 'Town / City',
        value: beneficiary?.counterPartyAddress?.townName || '',
        type: 'text' as const,
        required: false,
      },
    {
      name: 'countrySubDivision',
      label: 'State / Province',
      value: beneficiary?.counterPartyAddress?.countrySubDivision || '',
      type: 'text',
    },
    {
      name: 'countryCode',
      label: 'Country / Region*',
      value: beneficiary?.counterPartyAddress?.countryCode || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      options: countryOptions && countryOptions.length > 0 ? countryOptions : defaultCountryOptions,
    },
  ];
}

export function buildPhoneEmailFields(beneficiary: any): FieldConfig[] {
  return [
    {
      name: 'phoneNumber',
      label: 'Phone number',
      value: beneficiary?.phoneNumber || '',
      type: 'phone',
      chip: true,
      chipOptions: [{ label: 'Use for communication', value: 'communication' }],
      chipSelectedValues: beneficiary?.phoneUsage || [],
      chipTargetFieldName: 'phoneUsage',
    },
    {
      name: 'email',
      label: 'Email address',
      value: beneficiary?.email || '',
      type: 'text',
      chip: true,
      chipOptions: [
        { label: 'Use for communication', value: 'communication' },
        { label: 'Use for alerts', value: 'alerts' },
      ],
      chipSelectedValues: beneficiary?.emailUsage || [],
      chipTargetFieldName: 'emailUsage',
    },
  ];
}

export function buildBankFields(
  beneficiary: any,
  countryOptions?: Array<{ label: string; value: string }>
): FieldConfig[] {
  // Fallback country options if not provided from API
  const defaultCountryOptions = [
    { label: 'South Africa', value: 'ZA' },
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
  ];

  return [
    {
      name: 'financialInstitutionName',
      label: 'Bank name*',
      value: beneficiary?.financialInstitutionName || '',
      type: 'text',
      required: true,
    },
    {
      name: 'bankBranchName',
      label: 'Branch name',
      value: beneficiary?.bankBranchName || '',
      type: 'text',
    },
    { name: 'bic', label: 'BIC (SWIFT)', value: beneficiary?.internationalBankBicCode || beneficiary?.bic || '', type: 'text' },
    {
      name: 'branchSortCode',
      label: 'Branch / Sort code*',
      value: beneficiary?.branchSortCode || '',
      type: 'text',
      required: true,
    },
    {
      name: 'bankBranchTownName',
      label: 'Town / City',
      value: beneficiary?.bankBranchAddress?.townName || '',
      type: 'text',
    },
    {
      name: 'bankCountryCode',
      label: 'Country / Region*',
      value: beneficiary?.bankBranchAddress?.countryCode || beneficiary?.bankCountryCode || '',
      type: 'select',
      required: true,
      options: countryOptions && countryOptions.length > 0 ? countryOptions : defaultCountryOptions,
    },
    {
      name: 'selectedBank',
      label: 'Select a bank',
      value: (beneficiary as any)?.selectedBank || '',
      type: 'select',
      lookupBtn: true,
      fullWidth: true,
      options: [{ label: 'Select a bank...', value: '' }],
    },
  ];
}

export function buildAccountFields(
  beneficiary: any,
  currencyOptions?: Array<{ label: string; value: string }>,
  accountTypeOptions?: Array<{ label: string; value: string }>
): FieldConfig[] {
  // Fallback currency options if not provided from API
  const defaultCurrencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pounds', value: 'GBP' },
    { label: 'JPY - Japanese Yen', value: 'JPY' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
  ];

  const fields: FieldConfig[] = [
    {
      name: 'accountNumber',
      label: 'Account number*',
      value: beneficiary?.accountNumber || '',
      type: 'text' as const,
      required: true,
      helperText: 'An account number or an IBAN are required.',
      alwaysShowHelperText: true,
    },
    {
      name: 'iban',
      label: 'IBAN*',
      value: beneficiary?.iban || '',
      type: 'text' as const,
      required: true,
      helperText: 'An account number or an IBAN are required.',
      alwaysShowHelperText: true,
    },
    {
      name: 'accountCurrency',
      label: 'Currency',
      value: beneficiary?.accountCurrency || '',
      type: 'select' as const,
      required: true,
      options: currencyOptions && currencyOptions.length > 0 ? currencyOptions : defaultCurrencyOptions,
    },
    {
      name: 'transactionLimit',
      label: 'Currency and transaction limit',
      value: (beneficiary as any)?.transactionLimit != null 
        ? Number((beneficiary as any).transactionLimit).toFixed(2) 
        : '',
      type: 'amount' as const,
      amountCurrency: (beneficiary as any)?.transactionLimitCurrency || 'USD',
      amountCurrencyOptions: currencyOptions && currencyOptions.length > 0 ? currencyOptions : defaultCurrencyOptions,
      required: true,
    },
  ];

  // Only include accountType field if API provides account type options
  if (accountTypeOptions && accountTypeOptions.length > 0) {
    fields.push({
      name: 'accountType',
      label: 'Account type*',
      value: beneficiary?.accountType || '',
      type: 'select' as const,
      required: true,
      options: accountTypeOptions,
    });
  }

  return fields;
}

export function buildCollectionFields(
  beneficiary: any,
  paymentTypeOptions?: Array<{ label: string; value: string }>
): FieldConfig[] {
  // Get all available payment types from paymentProfileListTO
  const allProfiles = beneficiary?.paymentProfileListTO?.paymentProfiles || [];
  
  // Use API options if provided, otherwise fallback to profiles from beneficiary object
  const options = paymentTypeOptions && paymentTypeOptions.length > 0
    ? paymentTypeOptions
    : allProfiles.map((profile: any) => ({
        label: profile.customerPaymentProfileName,
        value: profile.customerPaymentProfileName,
      }));
  
  // Get linked/selected payment types from linkedPaymentProfiles
  const linkedProfiles = beneficiary?.linkedPaymentProfiles || [];
  const selectedPaymentTypes = linkedProfiles.map((profile: any) => profile.customerPaymentProfileName);
  
  return [
    {
      name: 'paymentType',
      label: 'Payment type',
      type: 'multiChip',
      options,
      multiSelectedValues: selectedPaymentTypes,
      multiTargetFieldName: 'paymentType',
      multiJoin: ', ',
    },
  ];
}

export const domesticBase = {
  buildPersonalFields,
  buildAddressFields,
  buildPhoneEmailFields,
  buildBankFields,
  buildAccountFields,
  buildCollectionFields,
};
