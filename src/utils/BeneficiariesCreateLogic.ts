/**
 * Beneficiaries Create Logic (TypeScript)
 * Centralized business validation and RHF rule generation, similar to DebtorsCreateLogic.
 */

import type { RegisterOptions } from 'react-hook-form';

export type BeneficiaryFormValues = {
  counterPartyName?: string;
  surname?: string;
  referenceIDX?: string;
  counterPartyReference?: string;
  billerID?: string;
  beneficiaryType?: string;
  entityCategory?: string;
  addressLine1?: string;
  addressLine2?: string;
  townName?: string;
  countrySubDivision?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
  financialInstitutionName?: string;
  branchName?: string;
  bic?: string;
  branchSortCode?: string;
  bankCountryCode?: string;
  bankAddressLine1?: string;
  accountNumber?: string;
  iban?: string;
  accountType?: string;
  transactionLimit?: string;
  transactionLimitCurrency?: string;
  paymentType?: string[];
  firstName?: string;
  lastName?: string;
  beneficiaryName?: string;
  bankCode?: string;
  branchCode?: string;
  accountName?: string;
  bankCountry?: string; // 'LOCAL' or an ISO country code
  currency?: string;
  address?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  reference?: string;
  gender?: string;
  identificationType?: string;
  identificationNumber?: string;
  passportCountry?: string;
  nationality?: string;
  alertDetails?: Record<string, unknown>;
  additionalReferences?: Array<Record<string, unknown>>;
};

/** Required fields per business rules */
export const REQUIRED_FIELDS = new Set<keyof BeneficiaryFormValues>([
  'counterPartyName',
  'referenceIDX',
  'billerID',
  'addressLine1',
  'countryCode',
  'financialInstitutionName',
  'bankCountryCode',
  'bankAddressLine1',
  'branchSortCode',
  'accountType',
  'currency',
  'transactionLimit',
]);

/* Common messages — edit here to change validation copy */
export const messages = {
  required: {
    counterPartyName: 'Please enter a beneficiary name',
    firstName: 'Please enter a first name',
    lastName: 'Please enter a last name',
    referenceIDX: 'Please enter a beneficiary code',
    billerID: 'Please enter a biller ID',
    addressLine1: 'Please enter an address',
    countryCode: 'Please enter a country/region',
    financialInstitutionName: 'Bank name is required',
    bankCountryCode: 'Please enter a country/region',
    bankAddressLine1: 'Address line 1 is required',
    accountNumber: 'An account number or an IBAN are required.',
    iban: 'An account number or an IBAN are required.',
    branchSortCode: 'Please enter a branch/sort code',
    accountType: 'Please select an account type',
    currency: 'Please select a currency',
    transactionLimit: 'Please enter a transaction limit and currency',
    transactionLimitCurrency: 'Please select a currency',
    beneficiaryName: 'Please enter a beneficiary name',
    bankCode: 'Bank name is required',
    address: 'Please enter an address',
    city: 'Town / City is required',
    country: 'Please enter a country/region',
    bankCountry: 'Please enter a country/region',
    reference: 'Please enter a beneficiary code',
    currencyIntl: 'Currency is required for international beneficiaries',
    gender: 'Please select a gender',
    nationality: 'Please select a nationality',
    identificationType: 'Please select an identification type',
    identificationNumber: 'Please enter an identification number',
    passportCountry: 'Please select a passport country/region',
    countrySubDivision: 'Please select a state/province',
    townName: 'Please enter a town/city',
  } as Record<string, string>,
  lengths: {
    beneficiaryNameMax: 'Beneficiary name must not exceed 100 characters',
    accountNumberMax: 'Account number must not exceed 20 characters',
    branchSortCodeMax: 'Branch / Sort code must not exceed 20 characters',
    accountNameMax: 'Account name must not exceed 100 characters',
  } as Record<string, string>,
  patterns: {
    alphaNumCode: 'Use letters and numbers only',
    email: 'Enter a valid email address',
    phone: 'Enter a valid phone number',
    bic: 'Enter a valid BIC (8 or 11 characters)',
    iban: 'Enter a valid IBAN',
    branchSortCode: 'Please enter a branch/sort code',
    accountNumber: 'Enter a valid account number',
    accountType: 'Enter a valid account type',
    currency: 'Select a valid currency',
    postalCode: 'Enter a valid postal code',
  } as Record<string, string>,
  amounts: {
    positive: 'Enter a positive amount',
    currencyRequired: 'Select a currency for the amount',
    invalidNumber: 'Amount must be a valid number',
  } as Record<string, string>,
};

/** Pattern helpers */
const re = {
  alphaNum: /^[a-zA-Z0-9_\s-]+$/,
  email:
    /^(?:[a-zA-Z0-9_'^&\-])+(?:\.(?:[a-zA-Z0-9_'^&\-])+)*@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/,
  phone: /^[+]?\d{7,15}$/,
  bic: /^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$/,
  iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/,
  branchSortCode: /^[A-Za-z0-9-]{3,20}$/,
  accountNumber: /^[A-Za-z0-9]{4,34}$/,
  accountType: /^[A-Za-z ()]{2,50}$/,
  postalCode: /^[A-Za-z0-9 -]{3,10}$/,
  currencyCode: /^[A-Z]{3}$/,
};

// Accept any ISO-like 3-letter currency code to avoid over-restricting
// UI-provided options; still conditionally require for international.

/**
 * Field-level validator. Return `true` when valid, or a string message when invalid.
 * Edit this function to change business validation only.
 */
export function validateField(
  name: keyof BeneficiaryFormValues,
  value: unknown,
  allValues?: BeneficiaryFormValues,
): true | string {
  const v = value as string | undefined | null;

  // Check beneficiary type for conditional required fields
  const beneficiaryType = allValues?.beneficiaryType;
  const isCompany = beneficiaryType === 'Company';
  const isDomesticFXInternational = beneficiaryType === 'Domestic FX and/or International';
  const entityCategory = allValues?.entityCategory;
  const isIndividual = isDomesticFXInternational && entityCategory === 'Individual';
  const isEntity = isDomesticFXInternational && entityCategory === 'Entity';

  // For Company type: skip ALL validation for non-required fields
  if (isCompany) {
    const companyRequiredFields = ['counterPartyName', 'billerID', 'countryCode'];
    if (!companyRequiredFields.includes(name)) {
      // This field has no validation for Company type
      return true;
    }
  }

  // Individual-specific required fields
  if (isIndividual) {
    const isEmpty = v === undefined || v === null || v === '' || String(v).trim() === '';

    if (name === 'firstName' && isEmpty) return messages.required.firstName;
    if (name === 'lastName' && isEmpty) return messages.required.lastName;
    if (name === 'gender' && isEmpty) return messages.required.gender;
    if (name === 'nationality' && isEmpty) return messages.required.nationality;
    if (name === 'countrySubDivision' && isEmpty) return messages.required.countrySubDivision;
    if (name === 'townName' && isEmpty) return messages.required.townName;
    if (name === 'identificationType' && isEmpty) return messages.required.identificationType;
    if (name === 'identificationNumber' && isEmpty) {
      return messages.required.identificationNumber;
    }
    if (
      name === 'passportCountry' &&
      allValues?.identificationType === 'Passport number' &&
      isEmpty
    ) {
      return messages.required.passportCountry;
    }
  }

  // Required checks - apply conditionally based on beneficiary type
  if (REQUIRED_FIELDS.has(name)) {
    // For Company type, only these fields are required
    const companyRequiredFields = ['counterPartyName', 'billerID', 'countryCode'];
    
    const shouldSkipRequired = isCompany && !companyRequiredFields.includes(name) ||
      (isIndividual && name === 'branchSortCode');
    
    if (!shouldSkipRequired) {
      // Field is required for this beneficiary type
      const msg = messages.required[name as string] ?? 'This field is required';
      const isEmpty = v === undefined || v === null || v === '' || String(v).trim() === '';
      if (isEmpty) return msg;
    }
  }

  switch (name) {
    case 'counterPartyName':
    case 'firstName': {
      if (v && String(v).length > 100) return messages.lengths.beneficiaryNameMax;
      return true;
    }
    case 'lastName': {
      if (v && String(v).length > 100) return messages.lengths.beneficiaryNameMax;
      return true;
    }
    case 'beneficiaryName': {
      if (v && String(v).length > 100) return messages.lengths.beneficiaryNameMax;
      return true;
    }
    case 'referenceIDX': {
      if (v && !re.alphaNum.test(String(v))) return messages.patterns.alphaNumCode;
      return true;
    }
    case 'billerID': {
      if (v && !re.alphaNum.test(String(v))) return messages.patterns.alphaNumCode;
      return true;
    }
    case 'email': {
      if (v && !re.email.test(String(v))) return messages.patterns.email;
      return true;
    }
    case 'phoneNumber': {
      if (v && !re.phone.test(String(v))) return messages.patterns.phone;
      return true;
    }
    case 'accountNumber': {
      if (v) {
        const s = String(v);
        if (s.length > 20) return messages.lengths.accountNumberMax;
        if (!re.accountNumber.test(s)) return messages.patterns.accountNumber;
      }
      return true;
    }
    case 'bic': {
      if (v && !re.bic.test(String(v))) return messages.patterns.bic;
      return true;
    }
    case 'iban': {
      if (v && !re.iban.test(String(v))) return messages.patterns.iban;
      return true;
    }
    case 'branchSortCode': {
      if (v && !re.branchSortCode.test(String(v))) return messages.patterns.branchSortCode;
      return true;
    }
    case 'branchCode': {
      if (v && !re.branchSortCode.test(String(v))) return messages.patterns.branchSortCode;
      return true;
    }
    case 'bankCode': {
      if (v && !re.alphaNum.test(String(v))) return messages.patterns.alphaNumCode;
      return true;
    }
    case 'accountType': {
      if (v && !re.accountType.test(String(v))) return messages.patterns.accountType;
      return true;
    }
    case 'accountName': {
      if (v && String(v).length > 100) return messages.lengths.accountNameMax;
      return true;
    }
    case 'currency': {
      // Currency is conditionally required for international (non-LOCAL)
      const isInternational = (allValues?.bankCountry || '').toUpperCase() !== 'LOCAL';
      if (isInternational) {
        if (!v || String(v).trim() === '') return messages.required.currencyIntl;
      }
      if (v && !re.currencyCode.test(String(v))) return messages.patterns.currency;
      return true;
    }
    case 'postalCode': {
      if (v && !re.postalCode.test(String(v))) return messages.patterns.postalCode;
      return true;
    }
    case 'reference': {
      if (v && !re.alphaNum.test(String(v))) return messages.patterns.alphaNumCode;
      return true;
    }
    case 'transactionLimit': {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        const num = typeof v === 'number' ? v : Number(String(v));
        if (!isFinite(num) || Number.isNaN(num)) return messages.amounts.invalidNumber;
        if (num < 0) return messages.amounts.positive;
        const curr = allValues?.transactionLimitCurrency;
        if (!curr || String(curr).trim() === '') return messages.amounts.currencyRequired;
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
  name: keyof BeneficiaryFormValues,
  getAllValues?: () => BeneficiaryFormValues,
): RegisterOptions {
  // Get beneficiaryType and entityCategory to determine conditional requirements
  const allVals = getAllValues?.();
  const beneficiaryType = allVals?.beneficiaryType;
  const entityCategory = allVals?.entityCategory;
  const isCompany = beneficiaryType === 'Company';
  const isIndividual =
    beneficiaryType === 'Domestic FX and/or International' && entityCategory === 'Individual';

  // Special handling for accountNumber and iban - only required if BOTH are empty
  // BUT not required at all for Company type
  if (name === 'accountNumber' || name === 'iban') {
    if (isCompany) {
      // For Company, these fields are not required
      return {} as RegisterOptions;
    }
    return {
      validate: (val: unknown) => {
        const allVals = getAllValues?.();
        const accountNumber = allVals?.accountNumber;
        const iban = allVals?.iban;

        // If either field has a value, validation passes
        if (accountNumber || iban) {
          return true;
        }

        // Both are empty - show error
        return 'An account number or an IBAN are required.';
      },
    } as RegisterOptions;
  }

  // For Individual entity category: firstName and lastName are required
  if (isIndividual && (name === 'firstName' || name === 'lastName')) {
    const requiredRule = messages.required[name as string] ?? 'This field is required';
    return {
      required: requiredRule,
      validate: (val: unknown) => validateField(name, val, getAllValues?.()),
    } as RegisterOptions;
  }

  if (
    isIndividual &&
    [
      'nationality',
      'gender',
      'identificationType',
      'identificationNumber',
    ].includes(name)
  ) {
    const requiredRule = messages.required[name as string] ?? 'This field is required';
    return {
      required: requiredRule,
      validate: (val: unknown) => validateField(name, val, getAllValues?.()),
    } as RegisterOptions;
  }

  if (isIndividual && name === 'passportCountry') {
    return {
      validate: (val: unknown) => validateField(name, val, getAllValues?.()),
    } as RegisterOptions;
  }

  // For Company type: only counterPartyName, billerID, and countryCode are required
  if (isCompany) {
    const companyRequiredFields = ['counterPartyName', 'billerID', 'countryCode'];
    if (!companyRequiredFields.includes(name)) {
      // This field is not required for Company type
      return {} as RegisterOptions;
    }
    // This field IS required for Company type
    const requiredRule = messages.required[name as string] ?? 'This field is required';
    return {
      required: requiredRule,
      validate: (val: unknown) => validateField(name, val, getAllValues?.()),
    } as RegisterOptions;
  }

  // For non-Company types (or when type not yet selected): use validate only
  // This ensures all validation logic including required checks are handled
  // consistently in validateField function
  const rules: RegisterOptions = {
    validate: (val: unknown) => validateField(name, val, getAllValues?.()),
  };
  return rules;
}

const BeneficiariesCreateLogic = {
  REQUIRED_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default BeneficiariesCreateLogic;
