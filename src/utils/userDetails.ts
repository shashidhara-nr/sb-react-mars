// Company utilities: build field configurations for CreateJournyForm

import { countries } from 'components/lib/Forms/SelectCountry/countries';

export type FieldOption = { label: string; value: string };

export type FieldConfig = {
  name: string;
  label: string;
  value?: any;
  type: 'text' | 'select' | 'multiChip' | 'phone' | 'amount' | 'date' | 'checkbox';
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
  multiSelectedValues?: string[];
  multiTargetFieldName?: string;
  multiJoin?: string;
  helperText?: string;
  alwaysShowHelperText?: boolean;
  placeholder?: string;

};

// Validation rules provider for user personal fields
export function getUserPersonalFieldsValidationRules(
  fieldName: string,
  t: any,
): Record<string, any> {
  const requiredFields = ['userId', 'firstName', 'lastName', 'identificationNumber'];

  if (requiredFields.includes(fieldName)) {
    return {
      required: {
        value: true,
        message: t(`${fieldName}Required`) || `${fieldName} is required`,
      },
    };
  }

  // Add custom validation rules for specific fields
  switch (fieldName) {
    case 'userId':
      return {
        required: { value: true, message: t('userIdRequired') || 'User ID is required' },
        minLength: {
          value: 3,
          message: t('userIdMinLength') || 'User ID must be at least 3 characters',
        },
        maxLength: {
          value: 20,
          message: t('userIdMaxLength') || 'User ID must not exceed 20 characters',
        },
      };
    case 'firstName':
      return {
        required: { value: true, message: t('firstNameRequired') || 'First Name is required' },
        minLength: {
          value: 2,
          message: t('firstNameMinLength') || 'First Name must be at least 2 characters',
        },
        maxLength: {
          value: 50,
          message: t('firstNameMaxLength') || 'First Name must not exceed 50 characters',
        },
      };
    case 'lastName':
      return {
        required: { value: true, message: t('lastNameRequired') || 'Last Name is required' },
        minLength: {
          value: 2,
          message: t('lastNameMinLength') || 'Last Name must be at least 2 characters',
        },
        maxLength: {
          value: 50,
          message: t('lastNameMaxLength') || 'Last Name must not exceed 50 characters',
        },
      };
    case 'identificationNumber':
      return {
        required: {
          value: true,
          message: t('identificationNumberRequired') || 'Identification Number is required',
        },
        minLength: {
          value: 5,
          message:
            t('identificationNumberMinLength') ||
            'Identification Number must be at least 5 characters',
        },
        maxLength: {
          value: 20,
          message:
            t('identificationNumberMaxLength') ||
            'Identification Number must not exceed 20 characters',
        },
      };
    case 'identificationType':
      return {
        required: {
          value: true,
          message: t('identificationTypeRequired') || 'Identification Type is required',
        },
      };
    case 'language':
      return {
        required: { value: true, message: t('languageRequired') || 'Language is required' },
      };
    default:
      return {};
  }

}

// Validation rules provider for phone and email fields
export function getPhoneEmailFieldsValidationRules(fieldName: string, t: any): Record<string, any> {
  // More flexible regex for international phone numbers supporting formats like +27, (27), etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  switch (fieldName) {
    case 'mobilePhoneNumber':
      return {
        required: {
          value: true,
          message: t('mobilePhoneNumberRequired') || 'Mobile phone number is required',
        },
        validate: (value: any) => {
          if (!value) return t('mobilePhoneNumberRequired') || 'Mobile phone number is required';
          const cleanedValue = value.replace(/[\D]/g, '');
          if (cleanedValue.length < 9)
            return (
              t('mobilePhoneNumberMinLength') || 'Mobile phone number must be at least 9 digits'
            );
          if (cleanedValue.length > 15)
            return (
              t('mobilePhoneNumberMaxLength') || 'Mobile phone number must not exceed 15 digits'
            );
          if (!phoneRegex.test(value))
            return t('mobilePhoneNumberInvalid') || 'Mobile phone number format is invalid';
          return true;
        },
      };
    case 'homePhoneNumber':
      return {
        required: {
          value: true,
          message: t('homePhoneNumberRequired') || 'Home phone number is required',
        },
        validate: (value: any) => {
          if (!value) return t('homePhoneNumberRequired') || 'Home phone number is required';
          const cleanedValue = value.replace(/[\D]/g, '');
          if (cleanedValue.length < 9)
            return t('homePhoneNumberMinLength') || 'Home phone number must be at least 9 digits';
          if (cleanedValue.length > 15)
            return t('homePhoneNumberMaxLength') || 'Home phone number must not exceed 15 digits';
          if (!phoneRegex.test(value))
            return t('homePhoneNumberInvalid') || 'Home phone number format is invalid';
          return true;
        },
      };
    case 'emailAddress':
      return {
        required: {
          value: true,
          // message: t('emailAddressRequired') || 'Email address is required',
        },
        validate: (value: any) => {
          if (!value) return t('emailAddressRequired') || 'Email address is required';
          if (value.length > 100)
            return t('emailAddressMaxLength') || 'Email address must not exceed 100 characters';
          if (!emailRegex.test(value))
            return t('emailAddressInvalid') || 'Email address format is invalid';
          return true;
        },
      };
    default:
      return {};
  }
}

export function buildUserPersonalFields(t: any, user: any): FieldConfig[] {
  return [
    {
      name: 'userId',
      label: t('userId'),
      value: user?.userId || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: true,
    },
    {
      name: 'firstName',
      label: t('firstName'),
      value: user?.firstName || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
      name: 'lastName',
      label: t('lastName'),
      value: user?.lastName || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
      name: 'dateOfBirth',
      label: t('dateOfBirth'),
      value: user?.dateOfBirth || '',
      type: 'date',
      required: false,
      rightBlank: true,
    },
    {
      name: 'identificationType',
      label: t('identificationType'),
      value: user?.identificationType || '',
      type: 'select',
      options: [
        { label: 'ID 1', value: 'ID 1' },
        { label: 'ID 2', value: 'ID 2' },
        { label: 'ID 2', value: 'ID 3' },
      ],
    },
    {
      name: 'identificationNumber',
      label: t('identificationNumber'),
      value: user?.identificationNumber || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'language',
      label: t('language'),
      value: user?.language || '',
      options: [
        { label: 'english', value: 'english' },
        { label: 'spanish', value: 'spanish' },
        { label: 'french', value: 'french' },
      ],
      type: 'select',
      required: true,
      rightBlank: false,
    },
    {
      name: 'gender',
      label: t('gender'),
      value: user?.gender || '',
      type: 'select',
      options: [
        { label: 'male', value: 'male' },
        { label: 'female', value: 'female' },
      ],
    },
  ];
}

export function buildUserAddressFields(t: any, user: any): FieldConfig[] {
  return [
    {
      name: 'postCode',
      label: t('postCode'),
      value: user?.postCode || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'selectAddress',
      label: t('selectAddress'),
      value: user?.selectAddress || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
      name: 'addressLine1',
      label: t('addressLine1'),
      value: user?.addressLine1 || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
      name: 'addressLine2',
      label: t('addressLine2'),
      value: user?.addressLine2 || '',
      type: 'text',
    },
    {
      name: 'townCity',
      label: t('townCity'),
      value: user?.townCity || '',
      type: 'text',
      required: true,
    },
    {
      name: 'stateProvince',
      label: t('stateProvince'),
      value: user?.stateProvince || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'countryRegion',
      label: t('countryRegion'),
      value: user?.countryRegion || '',
      type: 'select',
      required: true,
      rightBlank: true,
      options: [
        { value: 'AI', label: 'Anguilla' },
        { value: 'AL', label: 'Albania' },
        { value: 'AM', label: 'Armenia' },
        { value: 'AO', label: 'Angola' },
      ],
    },
    {
      name: 'postalAddressCheck',
      label: 'Select to add a different address for postal communication',
      value: user?.postalAddressCheck || false,
      type: 'checkbox',
      required: true,
    },
  ];
}
export function buildUserPostalAddressFields(t: any, user: any): FieldConfig[] {
  return [
    {
      name: 'postalPostCode',
      label: t('postCode'),
      value: user?.postCode || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalSelectAddress',
      label: t('selectAddress'),
      value: user?.selectAddress || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
      name: 'postalAddressLine1',
      label: t('addressLine1'),
      value: user?.addressLine1 || '',
      type: 'text',
      required: true,
      rightBlank: false,
    },
    {
      name: 'postalAddressLine2',
      label: t('addressLine2'),
      value: user?.addressLine2 || '',
      type: 'text',
    },
    {
      name: 'postalTownCity',
      label: t('townCity'),
      value: user?.townCity || '',
      type: 'text',
      required: true,
    },
    {
      name: 'postalStateProvince',
      label: t('stateProvince'),
      value: user?.regionName || '',
      type: 'text',
      required: true,
      fullWidth: false,
      rightBlank: false,
    },
    {
      name: 'postalCountryRegion',
      label: t('countryRegion'),
      value: user?.country || '',
      type: 'select',
      required: true,
      rightBlank: true,
      options: [
        { value: 'AI', label: 'Anguilla' },
        { value: 'AL', label: 'Albania' },
        { value: 'AM', label: 'Armenia' },
        { value: 'AO', label: 'Angola' },
      ],
    },
  ];
}

export function buildUserPhoneEmailFields(t: any, user: any): FieldConfig[] {
  return [
    {
      name: 'mobilePhoneNumber',
      label: t('mobilePhoneNumber'),
      value: user?.mobilePhoneNumber || '',
      type: 'phone',
      chip: true,
      chipOptions: [
        { label: t('useForCommunication'), value: 'useForCommunication' },
        { label: t('useForAlerts'), value: 'useForAlerts' },
      ],
      chipSelectedValues: user?.phoneUsage || [],
      chipTargetFieldName: 'mobileCommunicationPermissions',
      // chipTargetFieldName: 'phoneUsage',
      required: true,
    },
    {
      name: 'homePhoneNumber',
      label: t('homePhoneNumber'),
      value: user?.homePhoneNumber || '',
      type: 'phone',
      chip: true,
      chipOptions: [{ label: t('useForCommunication'), value: 'useForCommunication' }],
      chipSelectedValues: user?.mobileCommunicationPermissions || [],
      chipTargetFieldName: 'mobileCommunicationPermissions',
    },
    {
      name: 'emailAddress',
      label: t('emailAddress'),
      value: user?.emailAddress || '',
      type: 'text',
      chip: true,
      // required: fa,
      chipOptions: [
        { label: t('useForCommunication'), value: 'useForCommunication' },
        { label: t('useForAlerts'), value: 'useForAlerts' },
      ],
      chipSelectedValues: user?.emailUsage || [],
      chipTargetFieldName: 'emailUsage',
      rightBlank: false,
    },
  ];
}

export const userDetails = {
  buildUserPersonalFields,
  buildUserAddressFields,
  buildUserPhoneEmailFields,
};
