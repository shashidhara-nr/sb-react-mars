/**
* BOP Third Parties Create Logic (TypeScript)
* Centralized business validation and RHF rule generation.
*/

import type { RegisterOptions } from 'react-hook-form';

export type BopThirdPartyFormValues = {
  // Personal/Individual fields
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  taxpayerReference?: string;
  vatReference?: string;
  customsClientNo?: string;
  idNumber?: string;
  idType?: string;
  // Entity fields
  entityName?: string;
  companyCategory?: string;
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  postCode?: string;
  suburb?: string;
  townName?: string;
  region?: string;
  countryCode?: string;
  // Postal Address fields
  postalAddressLine1?: string;
  postalAddressLine2?: string;
  postalPostCode?: string;
  postalSuburb?: string;
  postalTownName?: string;
  postalRegion?: string;
  postalCountryCode?: string;
  // Phone/Email fields
  phoneFirstName?: string;
  phoneLastName?: string;
  mobilePhoneNumber?: string;
  mobilePhoneUsage?: string[];
  alternatePhoneNumber?: string;
  alternatePhoneUsage?: string[];
  telephoneNumber?: string;
  mobileNumber?: string;
  faxNumber?: string;
  email?: string;
  emailUsage?: string[];
  // Entity contact fields
  contactName?: string;
  contactLastName?: string;
  contactFirstName?: string;
  jobTitle?: string;
  workPhoneNumber?: string;
  workPhoneUsage?: string[];
};

/** Required fields for individuals */
export const REQUIRED_FIELDS_INDIVIDUAL = new Set<keyof BopThirdPartyFormValues>([
  'firstName',
  'lastName',
  'dateOfBirth',
  'gender',
  'taxpayerReference',
  'idNumber',
  'idType',
  'addressLine1',
  'postCode',
  'suburb',
  'townName',
  'region',
  'countryCode',
  'contactFirstName',
  'contactLastName',
  'telephoneNumber',
  'mobileNumber',
  'faxNumber',
]);

/** Required fields for entities/companies */
export const REQUIRED_FIELDS_ENTITY = new Set<keyof BopThirdPartyFormValues>([
  'entityName',
  'taxpayerReference',
  'idNumber',
  'idType',
  'addressLine1',
  'postCode',
  'suburb',
  'townName',
  'region',
  'countryCode',
  'contactFirstName',
  'contactLastName',
  'telephoneNumber',
  'mobileNumber',
  'faxNumber',
]);

/** Required postal address fields (when postal address differs from physical) */
export const REQUIRED_POSTAL_FIELDS = new Set<keyof BopThirdPartyFormValues>([
  'postalAddressLine1',
  'postalPostCode',
  'postalSuburb',
  'postalTownName',
  'postalRegion',
  'postalCountryCode',
]);

/** Common messages — edit here to change validation copy */
export const messages = {
  required: {
    firstName: 'Please enter a first name',
    lastName: 'Please enter a last name',
    // dateOfBirth: 'Please enter a date of birth',
    gender: 'Please select a gender',
    taxpayerReference: 'Please enter a taxpayer reference',
    idNumber: 'Please enter an identification number',
    idType: 'Please select an identification type',
    entityName: 'Please enter an entity name',
    addressLine1: 'Please enter an address',
    postCode: 'Please enter a post code',
    suburb: 'Please enter a suburb',
    townName: 'Please enter a town/city name',
    region: 'Please enter a state/province',
    countryCode: 'Please select country/region',
    postalAddressLine1: 'Please enter postal address line 1',
    postalPostCode: 'Please enter postal post code',
    postalSuburb: 'Please enter postal suburb',
    postalTownName: 'Please enter postal town/city name',
    postalRegion: 'Please enter postal state/province',
    postalCountryCode: 'Please select postal country/region',
    contactFirstName: 'Please enter a contact first name',
    contactLastName: 'Please enter a contact last name',
    telephoneNumber: 'Please enter a telephone number',
    mobileNumber: 'Please enter a mobile number',
    faxNumber: 'Please enter a fax number',
    email: 'Please enter an email address',
    mobilePhoneNumber: 'Please enter a mobile phone number',
  } as Record<string, string>,
  lengths: {
    firstNameMax: 'First name must not exceed 100 characters',
    lastNameMax: 'Last name must not exceed 100 characters',
    entityNameMax: 'Entity name must not exceed 100 characters',
    addressLineMax: 'Address line must not exceed 250 characters',
    townNameMax: 'Town/City name must not exceed 100 characters',
    regionMax: 'Region must not exceed 100 characters',
    phoneNumberMax: 'Phone number must not exceed 20 characters',
    jobTitleMax: 'Job title must not exceed 100 characters',
  } as Record<string, string>,
  patterns: {
    alphaWithSpaces: 'Use letters and spaces only',
    email: 'Enter a valid email address',
    phone: 'Enter a valid phone number',
    // dateOfBirth: 'Enter a valid date (DD/MM/YYYY)',
    idNumber: 'Enter a valid ID number',
    alphaNumCode: 'Use letters and numbers only',
  } as Record<string, string>,
};

/** Pattern helpers */
const re = {
  alphaWithSpaces: /^[a-zA-Z\s]+$/,
  email:
    /^(?:[a-zA-Z0-9_'^&\-])+(?:\.(?:[a-zA-Z0-9_'^&\-])+)*@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/,
  phone: /^[+]?\d{7,15}$/,
  dateOfBirth: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/,
  idNumber: /^[a-zA-Z0-9]+$/,
};

/**
* Field-level validator. Return `true` when valid, or a string message when invalid.
* Edit this function to change business validation only.
*/
export function validateField(
  name: keyof BopThirdPartyFormValues,
  value: unknown,
  allValues?: BopThirdPartyFormValues,
  isEntity?: boolean,
): true | string {
  const v = value as string | undefined | null;

  // Determine required fields based on entity type
  const requiredFields = isEntity ? REQUIRED_FIELDS_ENTITY : REQUIRED_FIELDS_INDIVIDUAL;

  // Required checks for regular fields
  if (requiredFields.has(name)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    if (v === undefined || v === null || String(v).trim() === '') return msg;
  }

  // Required checks for postal address fields (conditionally required)
  if (REQUIRED_POSTAL_FIELDS.has(name)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    if (v === undefined || v === null || String(v).trim() === '') return msg;
  }

  switch (name) {
    case 'firstName':
    case 'lastName':
    case 'contactFirstName':
    case 'contactLastName': {
      if (v && String(v).length > 100) return messages.lengths.firstNameMax;
      if (v && !re.alphaWithSpaces.test(String(v))) return messages.patterns.alphaWithSpaces;
      return true;
    }
    case 'entityName': {
      if (v && String(v).length > 100) return messages.lengths.entityNameMax;
      return true;
    }
    case 'jobTitle': {
      if (v && String(v).length > 100) return messages.lengths.jobTitleMax;
      return true;
    }
    case 'dateOfBirth': {
      if (!v) return true;

      const dateStr = String(v).trim();

      // Check if it matches DD/MM/YYYY format
      if (!re.dateOfBirth.test(dateStr)) {
        return messages.patterns.dateOfBirth;
      }

      // Additional validation: check if date is actually valid
      const parts = dateStr.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      // Create date and verify it's valid (e.g., no 31/02/2026)
      const date = new Date(year, month - 1, day);
      if (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year
      ) {
        return true;
      }

      return messages.patterns.dateOfBirth;
    }
    case 'addressLine1':
    case 'addressLine2':
    case 'postalAddressLine1':
    case 'postalAddressLine2': {
      if (v && String(v).length > 250) return messages.lengths.addressLineMax;
      return true;
    }
    case 'townName':
    case 'postalTownName': {
      if (v && String(v).length > 100) return messages.lengths.townNameMax;
      return true;
    }
    case 'postCode':
    case 'postalPostCode': {
      if (v && String(v).length > 20) return 'Post code must not exceed 20 characters';
      return true;
    }
    case 'suburb':
    case 'postalSuburb': {
      if (v && String(v).length > 100) return 'Suburb must not exceed 100 characters';
      return true;
    }
    case 'region':
    case 'postalRegion': {
      if (v && String(v).length > 100) return messages.lengths.regionMax;
      return true;
    }
    case 'countryCode':
    case 'postalCountryCode': {
      // Country code validation - just ensure it's not empty (required check handles this)
      return true;
    }
    case 'email': {
      if (v && !re.email.test(String(v))) return messages.patterns.email;
      return true;
    }
    case 'telephoneNumber':
    case 'mobileNumber':
    case 'faxNumber':
    case 'mobilePhoneNumber':
    case 'alternatePhoneNumber':
    case 'workPhoneNumber': {
      if (v) {
        let s = String(v);
        // Remove spaces from the phone number
        s = s.replace(/\s/g, '');
        if (s.length > 20) return messages.lengths.phoneNumberMax;
        if (!re.phone.test(s)) return messages.patterns.phone;
      }
      return true;
    }
    case 'idNumber': {
      if (v && !re.idNumber.test(String(v))) return messages.patterns.idNumber;
      return true;
    }
    case 'taxpayerReference':
    case 'vatReference':
    case 'customsClientNo': {
      if (v && !re.idNumber.test(String(v))) return messages.patterns.alphaNumCode;
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
  name: keyof BopThirdPartyFormValues,
  getAllValues?: () => BopThirdPartyFormValues,
  isEntity?: boolean,
): RegisterOptions {
  const requiredFields = isEntity ? REQUIRED_FIELDS_ENTITY : REQUIRED_FIELDS_INDIVIDUAL;

  // Check if field is required (either regular required or postal required)
  const isRequired = requiredFields.has(name) || REQUIRED_POSTAL_FIELDS.has(name);
  const requiredRule = isRequired
    ? messages.required[name as string] ?? 'This field is required'
    : undefined;

  return {
    required: requiredRule,
    validate: (val: unknown) => validateField(name, val, getAllValues?.(), isEntity),
  } as RegisterOptions;
}

const BopThirdPartiesCreateLogic = {
  REQUIRED_FIELDS_INDIVIDUAL,
  REQUIRED_FIELDS_ENTITY,
  REQUIRED_POSTAL_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default BopThirdPartiesCreateLogic;
 