// Domestic FX and/or International utilities: field builders for CreateJournyForm

export type FieldOption = { label: string; value: string };

export type FieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  value?: any;
  type: 'text' | 'select' | 'multiChip' | 'phone' | 'amount';
  required?: boolean;
  fullWidth?: boolean;
  rightBlank?: boolean;
  lookupBtn?: boolean;
  options?: FieldOption[];
  chip?: boolean;
  chipOptions?: FieldOption[];
  chipSelectedValues?: string[];
  chipTargetFieldName?: string;
  amountCurrency?: string;
  amountCurrencyOptions?: FieldOption[];
  multiSelectedValues?: string[];
  multiTargetFieldName?: string;
  multiJoin?: string;
  helperText?: string;
  alwaysShowHelperText?: boolean;
  disabled?: boolean;
  showWhen?: { field: string; value: any };
  hideInEdit?: boolean;
};

/* -------------------- INDIVIDUAL -------------------- */
export function buildIndividualPersonalFields(beneficiary: any): FieldConfig[] {
  return [
    {
      name: 'firstName',
      label: 'First name*',
      value: beneficiary?.firstName || '',
      type: 'text',
      required: true,
      fullWidth: false,
    },
    {
      name: 'lastName',
      label: 'Last name*',
      value: beneficiary?.lastName || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
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
    {
      name: 'nationality',
      label: 'Nationality*',
      value: beneficiary?.nationality || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      options: [
        { label: 'Australia', value: 'AU' },
        { label: 'Canada', value: 'CA' },
        { label: 'China', value: 'CN' },
        { label: 'France', value: 'FR' },
        { label: 'Germany', value: 'DE' },
        { label: 'India', value: 'IN' },
        { label: 'Japan', value: 'JP' },
        { label: 'South Africa', value: 'ZA' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'United States', value: 'US' },
      ],
    },
    {
      name: 'gender',
      label: 'Gender*',
      value: beneficiary?.gender || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      options: [
        { label: 'M', value: 'M' },
        { label: 'F', value: 'F' },
      ],
    },
    {
      name: 'identificationType',
      label: 'Identification type*',
      value: beneficiary?.identificationType || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      options: [
        { label: 'Identification number', value: 'Identification number' },
        { label: 'Passport number', value: 'Passport number' },
      ],
    },
    {
      name: 'identificationNumber',
      label: 'Identification number*',
      placeholder: 'Identification number',
      value: beneficiary?.identificationNumber || beneficiary?.idPassportNumber || '',
      type: 'text',
      required: true,
    },
    {
      name: 'passportCountry',
      label: 'Passport country / region*',
      value: beneficiary?.passportCountry || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      rightBlank: true,
      showWhen: { field: 'identificationType', value: 'Passport number' },
      options: [
        { label: 'South Africa', value: 'ZA' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'United States', value: 'US' },
      ],
    },
  ];
}

export function buildIndividualAddressFields(
  beneficiary: any,
  countryOptions?: Array<{ label: string; value: string }>
): FieldConfig[] {
  // Fallback country options if not provided from API
  const defaultCountryOptions = [
    { label: 'South Africa', value: 'ZA' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'United States', value: 'US' },
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
      name: 'addressLine3',
      label: 'Address line 3',
      value: beneficiary?.counterPartyAddress?.addressLine3 || '',
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
    {
      name: 'subUrb',
      label: 'Suburb',
      value: beneficiary?.counterPartyAddress?.subUrb || '',
      type: 'text',
    },
    {
      name: 'townName',
      label: 'Town / City*',
      value: beneficiary?.counterPartyAddress?.townName || '',
      type: 'text',
      required: true,
    },
    {
      name: 'postalCode',
      label: 'Post code / Zip code',
      value: beneficiary?.counterPartyAddress?.postalCode || '',
      type: 'text',
    },
    {
      name: 'countrySubDivision',
      label: '[State / Province]*',
      value: beneficiary?.counterPartyAddress?.countrySubDivision || '',
      type: 'text',
      required: true,
    },
  ];
}

export function buildIndividualPhoneEmailFields(beneficiary: any): FieldConfig[] {
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

export function buildIndividualBankFields(
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
      label: 'Branch / Sort code',
      value: beneficiary?.branchSortCode || '',
      type: 'text',
    },
    {
      name: 'bankAddressLine1',
      label: 'Address line 1*',
      value: beneficiary?.bankBranchAddress?.addressLine1 || '',
      type: 'text',
      required: true,
    },
    {
      name: 'bankAddressLine2',
      label: 'Address line 2',
      value: beneficiary?.bankBranchAddress?.addressLine2 || '',
      type: 'text',
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

export function buildIndividualAccountFields(
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

export function buildIndividualCollectionFields(
  beneficiary: any,
  paymentTypeOptions?: Array<{ label: string; value: string }>
): FieldConfig[] {
  // Get all available payment types from API options (preferred) or fallback to paymentProfileListTO
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

/* -------------------- ENTITY -------------------- */
export function buildEntityPersonalFields(beneficiary: any): FieldConfig[] {
  return [
    {
      name: 'counterPartyName',
      label: 'Beneficiary name*',
      value: beneficiary?.counterPartyName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'nationality',
      label: 'Nationality*',
      value: beneficiary?.nationality || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      options: [
        { label: 'South Africa', value: 'ZA' },
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'India', value: 'IN' },
        { label: 'China', value: 'CN' },
        { label: 'Germany', value: 'DE' },
        { label: 'France', value: 'FR' },
        { label: 'Australia', value: 'AU' },
        { label: 'Canada', value: 'CA' },
        { label: 'Japan', value: 'JP' },
      ],
    },
    {
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

export const buildEntityAddressFields = buildIndividualAddressFields;
export const buildEntityPhoneEmailFields = buildIndividualPhoneEmailFields;
export const buildEntityBankFields = buildIndividualBankFields;
export const buildEntityAccountFields = buildIndividualAccountFields;
export const buildEntityCollectionFields = buildIndividualCollectionFields;

/* -------------------- NOT APPLICABLE -------------------- */
export function buildNotApplicablePersonalFields(beneficiary: any): FieldConfig[] {
  return [
    {
      name: 'counterPartyName',
      label: 'Beneficiary name*',
      value: beneficiary?.counterPartyName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: true,
    },
    {
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

export function buildNotApplicableBankFields(
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
      name: 'bankAddressLine1',
      label: 'Address line 1*',
      value: beneficiary?.bankBranchAddress?.addressLine1 || '',
      type: 'text',
      required: true,
    },
    {
      name: 'bankAddressLine2',
      label: 'Address line 2',
      value: beneficiary?.bankBranchAddress?.addressLine2 || '',
      type: 'text',
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
      options: [
        { label: 'Select a bank...', value: '' },
        { label: 'Standard Bank', value: 'standard-bank' },
        { label: 'Bank 1', value: 'bank1' },
        { label: 'Bank 2', value: 'bank2' },
      ],
    },
  ];
}

export function buildNotApplicableAddressFields(
  beneficiary: any,
  countryOptions?: Array<{ label: string; value: string }>
): FieldConfig[] {
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
      fullWidth: false,
    },
    {
      name: 'addressLine2',
      label: 'Address line 2',
      value: beneficiary?.counterPartyAddress?.addressLine2 || '',
      type: 'text',
      rightBlank: false,
    },
    {
      name: 'countryCode',
      label: 'Country / Region*',
      value: beneficiary?.counterPartyAddress?.countryCode || '',
      type: 'select',
      required: true,
      lookupBtn: false,
      fullWidth: false,
      options: countryOptions && countryOptions.length > 0 ? countryOptions : defaultCountryOptions,
    },
  ];
}

export const buildNotApplicablePhoneEmailFields = buildIndividualPhoneEmailFields;
// export const buildNotApplicableBankFields = buildIndividualBankFields;
export const buildNotApplicableAccountFields = buildIndividualAccountFields;
export const buildNotApplicableCollectionFields = buildIndividualCollectionFields;

/* -------------------- GROUPED EXPORT -------------------- */
export const domesticFxInternational = {
  individual: {
    buildPersonalFields: buildIndividualPersonalFields,
    buildAddressFields: buildIndividualAddressFields,
    buildPhoneEmailFields: buildIndividualPhoneEmailFields,
    buildBankFields: buildIndividualBankFields,
    buildAccountFields: buildIndividualAccountFields,
    buildCollectionFields: buildIndividualCollectionFields,
  },
  entity: {
    buildPersonalFields: buildEntityPersonalFields,
    buildAddressFields: buildEntityAddressFields,
    buildPhoneEmailFields: buildEntityPhoneEmailFields,
    buildBankFields: buildEntityBankFields,
    buildAccountFields: buildEntityAccountFields,
    buildCollectionFields: buildEntityCollectionFields,
  },
  notApplicable: {
    buildPersonalFields: buildNotApplicablePersonalFields,
    buildAddressFields: buildNotApplicableAddressFields,
    buildPhoneEmailFields: buildNotApplicablePhoneEmailFields,
    buildBankFields: buildNotApplicableBankFields,
    buildAccountFields: buildNotApplicableAccountFields,
    buildCollectionFields: buildNotApplicableCollectionFields,
  },
};
