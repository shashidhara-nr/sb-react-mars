// BOP Third Parties field utilities: constants and field builders for CreateJournyForm
import { FieldConfig, FieldOption } from './domesticBase';
import BopThirdPartiesCreateLogic from './BopThirdPartiesCreateLogic';

// Static options for selects used in BOP Third Parties flow
export const ID_TYPES = [
  { key: 1, value: 'Passport' },
  { key: 2, value: 'National ID' },
  { key: 3, value: 'Driver License' },
  { key: 4, value: 'Other' },
] as const;

export const COMMUNICATION_PERMISSIONS: FieldOption[] = [
  { label: 'Use for communication', value: 'communication' },
  { label: 'Use for alerts', value: 'alerts' },
];

export const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'ZA', name: 'South Africa' },
] as const;

export const COUNTRY_OPTIONS: FieldOption[] = COUNTRIES.map((c) => ({
  label: c.name,
  value: c.code,
}));

export const ID_TYPE_OPTIONS: FieldOption[] = ID_TYPES.map((t) => ({
  label: t.value,
  value: t.value,
}));

export const GENDER_OPTIONS: FieldOption[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const COMPANY_CATEGORY_OPTIONS: FieldOption[] = [
  { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Close Corporation', value: 'close_corporation' },
  { label: 'Listed Company', value: 'listed_company' },
  { label: 'Non-Profit Organization', value: 'non_profit' },
  { label: 'Other', value: 'other' },
];

export function buildPersonalFieldsBopThirdParty(thirdParty: any): FieldConfig[] {
  return [
    {
      name: 'firstName',
      label: 'First name*',
      value: thirdParty?.firstName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'lastName',
      label: 'Last name*',
      value: thirdParty?.lastName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'dateOfBirth',
      label: 'Date of birth*',
      placeholder: 'Date of birth*',
      value: thirdParty?.dateOfBirth || '',
      type: 'date',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'gender',
      label: 'Gender*',
      value: thirdParty?.gender || '',
      type: 'select',
      required: true,
      options: GENDER_OPTIONS,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'taxpayerReference',
      label: 'Taxpayer number*',
      value: thirdParty?.taxpayerReference || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'vatReference',
      label: 'VAT reference',
      value: thirdParty?.vatReference || '',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'customsClientNo',
      label: 'Customer client number',
      value: thirdParty?.customsClientNo || '',
      type: 'text',
      fullWidth: false,
      rightBlank: true,
    },
    {
      name: 'idNumber',
      label: 'Identification number*',
      value: thirdParty?.idNumber || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'idType',
      label: 'Identification type*',
      value: thirdParty?.idType || '',
      type: 'select',
      required: true,
      fullWidth: false,
      rightBlank: false,
      options: ID_TYPE_OPTIONS,
    },
  ];
}

export function buildAddressFieldsBopThirdParty(thirdParty: any): FieldConfig[] {
  return [
    {
      name: 'addressLine1',
      label: 'Address line 1*',
      value: thirdParty?.address?.addressLine1 || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'addressLine2',
      label: 'Address line 2',
      value: thirdParty?.address?.addressLine2 || '',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postCode',
      label: 'Post code / Zip code*',
      value: thirdParty?.address?.postCode || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'suburb',
      label: 'Suburb*',
      value: thirdParty?.address?.suburb || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'townName',
      label: 'Town / City*',
      value: thirdParty?.address?.townName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'region',
      label: 'State / Province*',
      value: thirdParty?.address?.region || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'countryCode',
      label: 'Country / Region*',
      value: thirdParty?.address?.countryCode || '',
      type: 'select',
      required: true,
      options: COUNTRY_OPTIONS,
      fullWidth: false,
    },
  ];
}

export function buildPostalAddressFieldsBopThirdParty(thirdParty: any): FieldConfig[] {
  return [
    {
      name: 'postalAddressLine1',
      label: 'Address line 1*',
      value: thirdParty?.postalAddress?.addressLine1 || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalAddressLine2',
      label: 'Address line 2',
      value: thirdParty?.postalAddress?.addressLine2 || '',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalPostCode',
      label: 'Post code / Zip code*',
      value: thirdParty?.postalAddress?.postCode || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalSuburb',
      label: 'Suburb*',
      value: thirdParty?.postalAddress?.suburb || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalTownName',
      label: 'Town / City*',
      value: thirdParty?.postalAddress?.townName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalRegion',
      label: 'State / Province*',
      value: thirdParty?.postalAddress?.region || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalCountryCode',
      label: 'Country / Region*',
      value: thirdParty?.postalAddress?.countryCode || '',
      type: 'select',
      required: true,
      options: COUNTRY_OPTIONS,
      fullWidth: false,
    },
  ];
}

export function buildPhoneEmailFieldsBopThirdParty(thirdParty: any): FieldConfig[] {
  return [
    {
      name: 'contactFirstName',
      label: 'Contact first name*',
      value: thirdParty?.contact?.contactFirstName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'contactLastName',
      label: 'Contact last name*',
      value: thirdParty?.contact?.contactLastName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'telephoneNumber',
      label: 'Telephone number*',
      value: thirdParty?.contact?.telephoneNumber || '',
      type: 'phone',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'mobileNumber',
      label: 'Mobile number*',
      value: thirdParty?.contact?.mobileNumber || '',
      type: 'phone',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'faxNumber',
      label: 'Fax number*',
      value: thirdParty?.contact?.faxNumber || '',
      type: 'phone',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'email',
      label: 'Email address',
      value: thirdParty?.contact?.email || '',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
  ];
}

export function buildEntityDetailsFields(entity: any, isCompany: boolean = false): FieldConfig[] {
  const fields: FieldConfig[] = [
    {
      name: 'entityName',
      label: 'Entity name*',
      value: entity?.entityName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: !isCompany,
    },
  ];

  if (isCompany) {
    fields.push({
      name: 'companyCategory',
      label: 'Company category',
      value: entity?.companyCategory || '',
      type: 'select',
      options: COMPANY_CATEGORY_OPTIONS,
      fullWidth: false,
      rightBlank: false,
    });
  }

  fields.push(
    {
      name: 'taxpayerReference',
      label: 'Taxpayer reference*',
      value: entity?.taxpayerReference || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'vatReference',
      label: 'VAT reference',
      value: entity?.vatReference || '',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'customsClientNo',
      label: 'Customs client no.',
      value: entity?.customsClientNo || '',
      type: 'text',
      fullWidth: false,
      rightBlank: true,
    },
    {
      name: 'idNumber',
      label: 'Identification number*',
      value: entity?.idNumber || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'idType',
      label: 'Identification type*',
      value: entity?.idType || '',
      type: 'select',
      required: true,
      fullWidth: false,
      rightBlank: false,
      options: ID_TYPE_OPTIONS,
    },
  );

  return fields;
}

export function buildEntityPhoneEmailFields(entity: any): FieldConfig[] {
  return [
    {
      name: 'contactFirstName',
      label: 'Contact first name*',
      value: entity?.contact?.contactFirstName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'contactLastName',
      label: 'Contact last name*',
      value: entity?.contact?.contactLastName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'telephoneNumber',
      label: 'Telephone number*',
      value: entity?.contact?.telephoneNumber || '',
      type: 'phone',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'mobileNumber',
      label: 'Mobile number*',
      value: entity?.contact?.mobileNumber || '',
      type: 'phone',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'faxNumber',
      label: 'Fax number*',
      value: entity?.contact?.faxNumber || '',
      type: 'phone',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'email',
      label: 'Email address',
      value: entity?.contact?.email || '',
      type: 'text',
      fullWidth: false,
      rightBlank: false,
    },
  ];
}
 
