// Company utilities: build field configurations for CreateJournyForm

import { CreateBeneficiaryPayload } from "types/beneficiary";

export type FieldOption = { label: string; value: string };

export type FieldConfig = {
	name: string;
	label: string;
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
	isCountrySelect?: boolean;
	hideInEdit?: boolean;
	hideInReview?: boolean;
};

export function buildPersonalFields(
company: any, beneficiary: any, currencyOptions?: Array<{ label: string; value: string; }>, countryOptions?: { label: string; value: string; }[]): FieldConfig[] {
	// Fallback currency options if not provided from API
	const defaultCurrencyOptions = [
		{ label: 'USD - US Dollar', value: 'USD' },
		{ label: 'EUR - Euro', value: 'EUR' },
		{ label: 'GBP - British Pounds', value: 'GBP' },
		{ label: 'JPY - Japanese Yen', value: 'JPY' },
		{ label: 'AUD - Australian Dollar', value: 'AUD' },
	];
	return [
		{
			name: 'counterPartyName',
			label: 'Company name*',
			value: company?.counterPartyName || '',
			type: 'text',
			required: true,
			fullWidth: false,
		},
		{
			name: 'billerID',
			label: 'Biller ID*',
			value: company?.billerID || '',
			type: 'text',
			required: true,
			rightBlank: false,
		},
		{
			name: 'countryCode',
			label: 'Country / Region*',
			value: company?.counterPartyAddress?.countryCode || '',
			type: 'select',
			required: true,
			lookupBtn: false,
			options: countryOptions && countryOptions.length > 0
				? [{ label: 'Select a country...', value: '' }, ...countryOptions]
				: [
					{ label: 'Select a country...', value: '' },
					{ label: 'South Africa', value: 'ZA' },
					{ label: 'United States', value: 'US' },
					{ label: 'United Kingdom', value: 'UK' },
				],
			rightBlank: true,
		},
		{
			name: 'selectedCompany',
			label: 'Select a Company',
			value: (beneficiary as any)?.selectedCompany || '',
			type: 'select',
			lookupBtn: true,
			fullWidth: true,
			hideInReview: true,
			options: [
				{ label: 'Select a company...', value: '' },
			],
		},
		{
			name: 'cdinumber',
			label: 'CDI number',
			value: beneficiary?.cdinumber || '',
			type: 'text',
			rightBlank: false,
			hideInEdit: true,
			hideInReview: true,
		},
		{
			name: 'cin',
			label: 'CIN',
			value: beneficiary?.cin || '',
			type: 'text',
			rightBlank: false,
			hideInEdit: true,
			hideInReview: true,
		},
		{
			name: 'currency',
			label: 'Currency',
			value: company?.currency || '',
			type: 'select',
			rightBlank: true,
			options: currencyOptions && currencyOptions.length > 0 ? [...currencyOptions] : defaultCurrencyOptions,
		},
		{
			name: 'referenceIDX',
			label: 'Beneficiary code',
			value: beneficiary?.referenceIDX || '',
			type: 'text',
			rightBlank: false,
		},
		{
			name: 'counterPartyReference',
			label: 'Beneficiary reference',
			value: beneficiary?.counterPartyReference || '',
			type: 'text',
		},
		{
			name: 'transactionLimit',
			label: 'Currency and transaction limit',
			value: company?.transactionLimit != null 
				? Number(company.transactionLimit).toFixed(2) 
				: '',
			type: 'amount',
			amountCurrency: company?.transactionLimitCurrency || 'USD',
			amountCurrencyOptions: currencyOptions && currencyOptions.length > 0 ? currencyOptions : defaultCurrencyOptions,
		},
	];
}

export function buildPhoneEmailFields(company: any): FieldConfig[] {
	return [
		{
			name: 'phoneNumber',
			label: 'Phone number',
			value: company?.phoneNumber || '',
			type: 'phone',
			chip: true,
			chipOptions: [{ label: 'Use for communication', value: 'communication' }],
			chipSelectedValues: company?.phoneUsage || [],
			chipTargetFieldName: 'phoneUsage',
		},
		{
			name: 'email',
			label: 'Email address',
			value: company?.email || '',
			type: 'text',
			chip: true,
			chipOptions: [
				{ label: 'Use for communication', value: 'communication' },
				{ label: 'Use for alerts', value: 'alerts' },
			],
			chipSelectedValues: company?.emailUsage || [],
			chipTargetFieldName: 'emailUsage',
		},
	];
}

export function buildCollectionFields(company: any): FieldConfig[] {
	const allProfiles = company?.paymentProfileListTO?.paymentProfiles || [];
	const linkedProfiles = company?.linkedPaymentProfiles || [];
	const selectedPaymentTypes = linkedProfiles.map((profile: any) => profile.customerPaymentProfileName);
	
	return [
		{
			name: 'paymentType',
			label: 'Payment type',
			type: 'multiChip',
			options: allProfiles.map((profile: any) => ({
				label: profile.customerPaymentProfileName,
				value: profile.customerPaymentProfileName,
			})),
			multiSelectedValues: selectedPaymentTypes,
			multiTargetFieldName: 'paymentType',
			multiJoin: ', ',
		},
	];
}

export function buildCompanyFields(t: any, company: any): FieldConfig[] {
  return [
	{
	  name: 'companyName',
	  label: t('companyName'),
	  value: company?.companyName || '',
	  type: 'text',
	  required: true,
	  fullWidth: false,
	  rightBlank: false,
	},
	{
	  name: 'companyId',
	  label: t('companyId'),
	  value: company?.companyId || '',
	  type: 'text',
	  required: true,
	  rightBlank: false,
	},
	{
	  name: 'companyRegistrationNumber',
	  label: t('companyRegistrationNumber'),
	  value: company?.companyRegistrationNumber || '',
	  type: 'text',
	},
	{
	  name: 'referenceCurrency',
	  label: t('referenceCurrency'),
	  value: company?.referenceCurrency || '',
	  type: 'text',
	},
	{
	  name: 'companyTaxNumber',
	  label: t('companyTaxNumber'),
	  value: company?.companyTaxNumber || '',
	  type: 'text',
	  required: true,
	  fullWidth: false,
	  rightBlank: false,
	},
	{
	  name: 'companyVatNumber',
	  label: t('companyVatNumber'),
	  value: company?.companyVatNumber || '',
	  type: 'text',
	  required: true,
	  rightBlank: false,
	},
	{
	  name: 'systemId',
	  label: t('systemId'),
	  value: company?.systemId || '',
	  type: 'text',
	},
	{
	  name: 'operationsMode',
	  label: t('operationsMode'),
	  value: company?.operationsMode || '',
	  type: 'text',
	}
  ];
}

export function buildCompanyAddressFields(t: any, company: any): FieldConfig[] {
  return [
	{
	  name: 'physicalPostCod',
	  label: t('postCode'),
	  value: company?.postCode || '',
	  type: 'text',
	  required: true,
	  fullWidth: false,
	  rightBlank: false,
	},
	{
	  name: 'physicalCountry',
	  label: t('country'),
	  value: company?.country || '',
	  type: 'select',
	  required: true,
	  rightBlank: false,
	  isCountrySelect: true,
	  options: [
		{ label: 'South Africa', value: 'ZA' },
		{ label: 'United States', value: 'US' },
		{ label: 'United Kingdom', value: 'UK' },
	  ],
	},
	{
	  name: 'addressLine1',
	  label: t('addressLine1'),
	  value: company?.addressLine1 || '',
	  type: 'text',
	  required: true,
	  rightBlank: false,
	},
	{
	  name: 'addressLine2',
	  label: t('addressLine2'),
	  value: company?.addressLines || '',
	  type: 'text',
	},
	{
	  name: 'townCity',
	  label: t('townCity'),
	  value: company?.townCity || '',
	  type: 'text',
	},
	{
	  name: 'regionName',
	  label: t('regionName'),
	  value: company?.regionName || '',
	  type: 'text',
	  required: true,
	  fullWidth: false,
	  rightBlank: false,
	}
	
  ];
}

export function buildCompanyPostalAddressFields(t: any, company: any): FieldConfig[] {
  return [
    {
      name: 'postalPostCode',
      label: t('postCode'),
      value: company?.postCode || '',
      type: 'text',
      required: true,
    },
    {
      name: 'postalCountry',
      label: t('country'),
      value: company?.country || '',
      type: 'select',
      required: true,
      isCountrySelect: true,
      options: [
        { label: 'South Africa', value: 'ZA' },
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
      ],
    },
    {
      name: 'postalAddressLine1',
      label: t('addressLine1'),
      value: company?.addressLine1 || '',
      type: 'text',
      required: true,
    },
    {
      name: 'postalAddressLine2',
      label: t('addressLine2'),
      value: company?.addressLine2 || '',
      type: 'text',
    },
    {
      name: 'postalTownCity',
      label: t('townCity'),
      value: company?.townCity || '',
      type: 'text',
    },
    {
      name: 'postalRegionName',
      label: t('regionName'),
      value: company?.regionName || '',
      type: 'text',
      required: true,
    }
  ];
}

export function buildCompanyCommunicationFields(t: any, company: any): FieldConfig[] {
  return [
	{
	  name: 'principlePointOfContact',
	  label: t('principlePointOfContact'),
	  value: company?.principlePointOfContact || '',
	  type: 'text',
	  required: true,
	  fullWidth: false,
	  rightBlank: false,
	},
	{
	  name: 'jobTitle',
	  label: t('jobTitle'),
	  value: company?.jobTitle || '',
	  type: 'text',
	  required: true,
	  rightBlank: false,
	},
	{
	  name: 'mobilePhoneNumber',
	  label: t('mobilePhoneNumber'),
	  value: company?.mobilePhoneNumber || '',
	  type: 'phone',
	},
	{
	  name: 'workPhoneNumber',
	  label: t('workPhoneNumber'),
	  value: company?.workPhoneNumber || '',
	  type: 'phone',
	  chip: true,
	},
	{
	  name: 'emailAddress',
	  label: t('emailAddress'),
	  value: company?.emailAddress || '',
	  type: 'text',
	  required: true,
	  fullWidth: false,
	  rightBlank: false,
	}
  ];
}

export function buildCompanyPasswordRenewalScheduleFields(t: any, company: any): FieldConfig[] {
  // Extract just the number if the value contains "days"
  const frequencyValue = company?.frequency 
    ? String(company.frequency).replace(/\s*days\s*$/i, '').trim()
    : '';
  
  return [
	{
	  name: 'frequency',
	  label: t('passwordChangeFrequency') || 'Password change frequency',
	  value: frequencyValue,
	  type: 'text',
	  required: true, 
	  fullWidth: true,
	  rightBlank: false,
	  helperText: 'Enter a number from 1 up to 180',
	  alwaysShowHelperText: true,
	}
	];
}

export const company = {
	buildPersonalFields,
	buildPhoneEmailFields,
	buildCollectionFields,
	buildCompanyFields,
	buildCompanyAddressFields,
	buildCompanyPasswordRenewalScheduleFields,
	buildCompanyPostalAddressFields
};

export function buildPaymentTypeFields(
  beneficiary: CreateBeneficiaryPayload, 
  paymentTypeOptions: { label: string; value: string; }[]
): FieldConfig[] {
  // Get all available payment types from paymentProfileListTO
  const allProfiles = (beneficiary as any)?.paymentProfileListTO?.paymentProfiles || [];
  
  // Use API options if provided, otherwise fallback to profiles from beneficiary object
  const options = paymentTypeOptions && paymentTypeOptions.length > 0
    ? paymentTypeOptions
    : allProfiles.map((profile: any) => ({
        label: profile.customerPaymentProfileName,
        value: profile.customerPaymentProfileName,
      }));
  
  // Get linked/selected payment types from linkedPaymentProfiles
  const linkedProfiles = (beneficiary as any)?.linkedPaymentProfiles || [];
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

