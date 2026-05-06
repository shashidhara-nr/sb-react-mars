export interface BackendErrorResponse {
  errorCode?: string;
  messageCode?: string;
  message?: string;
  messageParams?: string[];
  domain?: string;
  constraint?: string;
  issueType?: 'ERROR' | 'WARNING';
}

export interface MappedFieldError {
  field: string;
  errorCode: string;
  message: string;
  reason: string;
  severity: 'error' | 'warning';
}

export interface ErrorMappingResult {
  hasErrors: boolean;
  hasWarnings: boolean;
  fieldErrors: MappedFieldError[];
  generalErrors: MappedFieldError[];
  canProceed: boolean;
}

// Helper function to substitute message parameters like {0}, {1}, etc.
function substituteMessageParams(message: string, params?: string[]): string {
  if (!params || params.length === 0) return message;
  
  let result = message;
  params.forEach((param, index) => {
    // Replace {0}, {1}, {2}, etc. with actual parameter values
    result = result.replace(new RegExp(`\\{${index}\\}`, 'g'), param);
  });
  return result;
}

// Simplified error mappings: code -> reason only
const ERROR_CODE_MAPPINGS: Record<string, string> = {
  '7': 'The CDI beneficiary reference is invalid',
  '9': 'Duplicate beneficiary reference - this reference is already assigned to another beneficiary',
  '22': 'Something went wrong while fetching bill information. Please contact our help-desk',
  '25': 'Something went wrong. Please contact our help-desk for assistance',
  '2063': 'One or more beneficiaries are bill presentment beneficiaries. If you are subscribed to MyBills, please go to the "MyBills" tab under the "Funds Transfer" menu to pay or view bills. If required please contact Client Services Team for further assistance',
  '2064': 'This is a MyBills beneficiary. If you are subscribed to MyBills, please go to the "Setup and Administration" menu and select the "MyBills" tab to create this beneficiary. If required please contact Client Services Team for further assistance.',
  '60300': 'Please enter a beneficiary code',
  '60301': 'Please enter the first line of the beneficiary address',
  '60302': 'Please select the beneficiary country',
  '60303': 'Please enter the first line of the credit bank address',
  '60304': 'Please enter the beneficiary credit account number',
  '60305': 'Please enter the BIC/SWIFT code for the beneficiary bank',
  '60306': 'Either the BIC (SWIFT) or the intermediary bank\'s BIC (SWIFT) and intermediary bank name are mandatory',
  '60307': 'Please enter either the credit account number or IBAN',
  '60310': 'Country code in credit BIC (SWIFT) does not match the credit bank country code',
  '60311': 'The entered BIC/SWIFT code is invalid. Please verify and re-enter',
  '60312': 'The entered intermediary BIC/SWIFT code is invalid. Please verify and re-enter',
  '60313': 'The IBAN check digits are invalid. Please verify the IBAN',
  '60324': 'The beneficiary BIC is located in a restricted country and cannot be used',
  '60325': 'The corresponding bank BIC/SWIFT code is invalid',
  '60330': 'Beneficiary is not in the set of allowed countries for this Instrument',
  '60693': 'Please note that the account type is invalid',
  '70004': 'Payment to this beneficiary is not permitted',
  '80001': 'Duplicate beneficiary code - this code is already assigned to another beneficiary',
  '110400': 'The IBAN format or checksum is invalid',
  '110401': 'The sort code was not found in the bank registry',
  '110402': 'The entered bank details do not match the bank registry information',
  '110410': 'Account number must be {0} characters.',
  '110414': 'The sort code was not found in the bank registry',
  '110416': 'The selected currency is not in the allowed currency group for this bank country',
  '110420': 'The bank details were not found in the bank registry',
  '110421': 'The entered bank details do not match the BIC registry information',
  '110423': 'Bank name or BIC does not match the registry data',
  '110424': 'Valid BIC codes are either 8 characters (bank code) or 11 characters (bank + branch)',
  '110425': 'The country code in the BIC (characters 5-6) does not match the selected bank country',
  '110426': 'The BIC (SWIFT) code format is invalid',
  '110430': 'The intermediary bank was not found in the registry',
  '110431': 'The entered intermediary bank details do not match the registry',
  '110432': 'The bank information differs from the official registry',
  '110433': 'Valid intermediary BIC codes are either 8 or 11 characters',
  '110434': 'The intermediary bank BIC (SWIFT) code format is invalid',
  '110440': 'Valid correspondent BIC codes are either 8 or 11 characters',
  '110441': 'The correspondent bank BIC (SWIFT) code format is invalid',
  '110450': 'A beneficiary with the same name, bank name, account number, and country already exists',
  '110451': 'A debtor with the same details already exists',
  '110460': 'Account Verification Service is unavailable or the account could not be validated',
  '110461': 'The entered name partially matches the bank-registered account holder name',
  '110462': 'The entered name does not match the bank-registered account holder name',
  '110463': 'Account Verification Service could not find this beneficiary',
  '111011': 'The beneficiary name contains invalid special characters',
  '111012': 'The beneficiary reference contains invalid special characters',
  '111400': 'A debtor with the same details has already been created',
  '120000': 'Collection requires a debtor reference to be provided',
  '120004': 'Invalid debtor bank country for collection instruction',
  '120014': 'Debtor bank country must be the same for all transactions in the collection',
  '120015': 'The first line of the debtor address must be provided',
  '120020': 'The debtor name is required for collection instructions',
  '120021': 'A valid debtor code must be provided for the collection',
  '120022': 'The debtor country is required for collection instructions',
  '140009': 'The beneficiary details do not match the expected values',
  '160002': 'Ad-hoc debtor is not permitted for this collection type',
  '160011': 'Debtor cannot be ad-hoc for instruments requiring a mandate',
  '160150': 'This account type only accepts numeric digits (0-9)',
  '160195': 'This account type accepts letters (A-Z) and digits (0-9)',
  '160202': 'Account number must be 11 or 13 characters for this bank/country',
  '200000': 'Sort code is required for UK/South African banks',
  '200001': 'The selected country does not match the country code in the IBAN (first 2 characters)',
  '200003': 'At least one of: BIC (SWIFT), sort code, or intermediary bank details must be provided',
  '200004': 'Please note that the account number is invalid.',
  '200005': 'Account number does not meet the required length validation',
  '200006': 'The selected currency does not match the actual currency of the account',
  '200007': 'The account number belongs to a closed account',
  '200008': 'At least one of account number or IBAN must be provided',
  '200010': 'The account number and sort code combination is invalid',
  '200011': 'USA/Canada bank accounts require between 11 and 13 digits',
  '200012': 'International account numbers must be between 1 and 15 characters',
  '200016': 'Check digit validation failed for the account number. Please check and amend the field',
  '200017': 'Spain/Europe (SEPA) requires account numbers to be exactly 9 or 11 characters long',
  '200019': 'The account number extracted from the IBAN does not match the entered account number',
  '200020': 'The IBAN structure does not meet international standards',
  '200021': 'European routing rules require account numbers to be exactly 9 or 11 characters',
  '200022': 'The sort code is not in the valid range for this country',
  '200024': 'The account number does not pass validation checks',
  '200025': 'Multi-country European rules require account numbers to be 9, 11, or 16 characters',
  '200026': 'Please enter a valid account number (cannot be all zeros)',
  '200027': 'Nigerian bank accounts require exactly 10 digits',
  '200028': 'Brazilian IBAN format requires exactly 21 characters',
  '300000': 'Please set up overall customer payment and transfer limit before creating transaction',
  '300001': 'Please set up overall customer payment and transfer limit before approving transaction',
  '300002': 'Please set up overall customer payment and transfer limit before authorising transaction',
  '300003': 'Please set up overall customer payment and transfer limit before repairing transaction',
  '300004': 'Please set up overall customer payment and transfer limit before auditing transaction',
  '300005': 'Please set up overall customer collection limit before creating transaction',
  '300006': 'Please set up overall customer collection limit before approving transaction',
  '300007': 'Please set up overall customer collection limit before authorising transaction',
  '300008': 'Please set up overall customer collection limit before repairing transaction',
  '300009': 'Please set up overall customer collection limit before auditing transaction',
  '400001': 'An overall customer payment limit already exists against this customer',
  '400002': 'An overall customer collection limit already exists against this customer',
  '400003': 'A FX limit already exists against this customer',
  '400004': 'An overall customer transfer limit already exists against this customer',
  '400005': 'The overall customer payment and transfer limit cannot be less than existing limits',
  '400006': 'The overall payment limit cannot be less than existing payment limits',
  '530001': 'The Mozambique NIB (Número de Identificação Bancária) check digit is invalid',
  '530002': 'The NIB must be exactly 12 digits',
  '700001': 'The beneficiary is marked as inactive',
  '700002': 'The beneficiary has been suspended',
  '700003': 'The beneficiary has been deleted',
  '700004': 'The selected authorisation profile must be in an active state, awaiting authorisation for create, awaiting audit for create or partially authorised for create status',
  '700005': 'The selected customer must be in an active status',
  '700006': 'The selected customer must be in an active state, awaiting authorisation for create, awaiting audit for create or partially authorised for create status',
  '700007': 'The selected payment type(s) must be in an active status',
  '700008': 'The selected payment type must be in an active status',
  '700009': 'The selected transfer type must be in an active status',
  '700010': 'The selected collection type must be in an active status',
  '700011': 'The beneficiary is on the blacklist',
  '700012': 'The beneficiary is on the watchlist',
  '700013': 'The selected collection type must be in an active state, awaiting authorisation for create, awaiting audit for create or partially authorised for create status',
  '700014': 'Unable to proceed as the specified credit limit account group is not active',
  '700015': 'The beneficiary is blocked from transactions',
  '770001': 'Direct debit requires an active mandate for this beneficiary',
  '770002': 'The direct debit mandate has expired',
  '770003': 'The mandate start date is in the future',
  '770004': 'The payment currency does not match the mandate currency',
  '770005': 'The payment amount exceeds the mandate maximum limit',
  '770006': 'The direct debit mandate has been temporarily suspended',
  '770007': 'The direct debit mandate has been cancelled',
  '770008': 'The mandate collection currency does not match the transaction currency',
  '770009': 'No mandate is linked to the selected account',
  '880000': 'Incorrect file format, please correct and resubmit',
  '880001': 'File format error found - mandatory field missing. Please correct and resubmit',
  '880003': 'File exceeds the maximum number of transactions allowed. Please correct and resubmit',
  '880004': 'One or more fields exceed the maximum character length. Please correct and resubmit',
  '880006': 'An internal server error occurred while processing the file',
  '899999': 'The sender information is invalid for NIP transaction',
  '900000': 'The transaction cannot be honored',
  '900001': 'The account is marked as dormant or inactive',
  '900002': 'NIP (Nigeria Interbank Payment System) validation failed - account not found',
  '900003': 'The account holder name does not match the provided name',
  '900004': 'The transaction request is currently being processed',
  '900005': 'The transaction is invalid',
  '900006': 'The transaction amount is invalid',
  '900007': 'The batch number provided is invalid',
  '900008': 'The session or record ID is invalid',
  '900009': 'The bank code is not recognized',
  '900010': 'The transaction channel is invalid',
  '900011': 'The payment method called is incorrect',
  '900012': 'No action was taken on the transaction',
  '900013': 'There are no records available to process',
  '900014': 'This transaction is a duplicate',
  '900015': 'The transaction format is incorrect',
  '900016': 'This transaction has been flagged as suspected fraud',
  '900017': 'Please contact the sending bank for more information',
  '900018': 'The account has insufficient balance for this debit',
  '900019': 'The sender is not permitted to perform this transaction',
  '900020': 'This transaction type is not permitted on this channel',
  '900021': 'The transaction amount exceeds the transfer limit',
  '900022': 'A security violation has been detected',
  '900023': 'The withdrawal frequency limit has been exceeded',
  '900024': 'The response was received outside the acceptable time window',
  '900025': 'The beneficiary bank is currently not available',
  '900026': 'An error occurred while routing the transaction',
  '900027': 'This transaction is a duplicate of an existing transaction',
  '900028': 'A system malfunction has occurred',
  '900029': 'The transaction timed out while waiting for a response',
  '900030': 'The account holder name does not match. The system-provided name should be used',
  '900031': 'Real-time account validation could not be performed because the destination system is not available',
  '900032': 'Account number must be exactly 12 characters for this bank',
  '900033': 'The entered account number is invalid. Please check and amend this field.',
  '900043': 'Account number must be 9 or 10 characters for this bank/country',
  '900044': 'Account number must be 11 or 12 characters for this bank/country',
  '900045': 'Account number length validation for specific bank/country requirements',
  '900046': 'Account number must be 10 or 11 characters for this bank/country',
  '900047': 'Account number must be 8, 10 or 11 characters for this bank/country',
  '900048': 'Please note that the account type is invalid',
  '1400012': 'Agent bank details are required for ad-hoc beneficiary payments',
  '1400031': 'The selected beneficiary is inactive and cannot be used',
  '1400033': 'Beneficiary details don\'t match predefined beneficiary information',
  '1400036': 'Ad-hoc beneficiary is not allowed for this payment type',
  '1400038': 'Complete address details are required for ad-hoc beneficiary',
  '1400040': 'Ad-hoc beneficiary is not allowed for this instruction or you do not have FAP permission',
  '1400041': 'Intermediary agent details are missing for ad-hoc beneficiary',
  '1400048': 'Agent details are required when creating an ad-hoc debtor for collection',
  '1400049': 'The debtor details provided do not match the expected debtor information',
  '1400053': 'This customer is not permitted to use ad-hoc debtors for collections',
  '1400054': 'Required debtor information is missing for creating an ad-hoc debtor',
  '1400055': 'The selected collection type does not allow ad-hoc debtors',
  '1400060': 'The debtor is inactive and requires authorisation or audit before use',
  '1400061': 'All beneficiary accounts must be held in the same country for the payment instruction',
  '1400062': 'The provided debtor details do not match the predefined debtor information',
  '1400065': 'Correspondent bank details are missing for ad-hoc beneficiary',
  'ERRAccountIsCompany': 'This beneficiary is a company beneficiary. Please use the Biller ID instead',
  'ERRACParticipant': 'The debtor branch does not make use of the AC Service. Please amend the collection before attempting to proceed',
  'ERRaddOneBeneficiary': 'You must add a beneficiary to the selected payment details',
  'ERRbeneficiaryBankcountryNotsameforAllBeneficiaries': 'All beneficiary accounts must be held in the same country for the payment instruction',
  'ERRbeneficiaryBic8Or11': 'The beneficiary BIC must be exactly 8 or 11 characters long',
  'ERRBeneWithMyBillsAccNum': 'This is a MyBills beneficiary',
  'ERRBeneWithSARSAccNum': 'This is a bill presentment beneficiary',
  'ERRBenRefExceededLimit': 'The beneficiary reference exceeds the maximum allowed length',
  'ERRBillerFxPayment': 'This company beneficiary does not allow foreign exchange payments',
  'ERRBothExceededLimit': 'Both account names and beneficiary references exceed maximum allowed lengths',
  'ERRCDIBeneficiaryValidation': 'Company beneficiary is not allowed for this payment type',
  'ERRChannel': 'This beneficiary cannot be paid through the BOL channel',
  'ERRChannelNotAllowed': 'This beneficiary cannot be paid through the BOL channel',
  'ERRcurrencyMismatch': 'The beneficiary account currency doesn\'t match the transfer currency',
  'ERRdebtorBankCountryNotsameforAllDebtors': 'All debtor accounts must be held in the same country for the collection instruction',
  'ERRdebtorBankCountrysameforAllDebtors': 'The debtor bank country must be the same for all transactions',
  'ERRDebtorReferenceExceeded': 'The debtor reference limit has been exceeded for the cycle',
  'ERRduplicateBeneficiary': 'A beneficiary with this name or code already exists. Please amend and resave the information',
  'ERRduplicateBeneficiaryCodeCombination': 'A beneficiary with this combination of code, account number, and currency already exists',
  'ERRebppBillerRedirection': 'This beneficiary must be paid using the MyBills payment method',
  'ERREBPPOnly': 'Electronic bill payment must be made to this beneficiary',
  'ERRinvalidBeneficiaryBankCountry': 'Invalid beneficiary bank country for payment instruction',
  'ERRinvalidBeneficiaryRestrictedCountry': 'The beneficiary BIC is located in a restricted country and cannot be used',
  'ERRinvalidBillerReference': 'The provided beneficiary reference is invalid',
  'ERRInvalidDebtor': 'The selected debtor(s) is not in the allowed list of countries for this payment',
  'ERRinvalidDebtorBankCountry': 'Invalid debtor bank country for collection instruction',
  'ERRInvalidDebtorForCollection': 'Invalid debtor bank country for collection instruction',
  'ERRinvalidDebtorRestrictedCountry': 'The debtor BIC is located in a restricted country and cannot be used',
  'ERRmandatoryBillerReference': 'An additional reference is mandatory for company beneficiary payments',
  'ERRpayalertduplicatedcellphonefaxnumber': 'The beneficiary cellphone or fax number is already registered',
  'ERRpayalertduplicatedemailaddress': 'The beneficiary email address is already registered',
  'ERRPayWithMyBillsAccNum': 'This beneficiary cannot be paid using an account number. Please use MyBills',
  'ERRPayWithSARSAccNum': 'This SARS beneficiary cannot be paid using an account number',
  'ERRReferenceValidationFailed': 'The beneficiary reference validation failed',
  'ERRTransactionlimit': 'The transfer amount exceeds the beneficiary transaction limit',
  'gERRbeneficiaryBankcountryNotsameforAllBeneficiaries': 'All beneficiary accounts must be held in the same country for the payment instruction',
  'gERRduplicateBeneficiary': 'The beneficiary name or code already exists. Please amend and resave the information',
  'gERRduplicateMandateInstruction': 'A mandate with the same combination of Contract reference, Sequence type, Debtor account number and Short name already exists',
  'gERRinvalidBeneficiaryBankCountry': 'Invalid beneficiary bank country for payment instruction',
  'gERRinvalidDebtorAccount': 'The debtor account number is invalid',
  'gERRSAaccountNumberLength': 'South African (Standard Bank) account numbers require exactly 9 digits',
  'gERRsameDebtor': 'The Ultimate debtor name may not be the same as the Debtor name',
  'U_COUNTERPARTY_DEBTOR': 'A debtor with these details already exists. Please amend and resave the information',
  'U_COUNTERPARTY2': 'The beneficiary code is already in use. Please select a unique code',
  'VALIDATION_ERROR_CMPAY:7': 'The reference does not match the biller expected format',
  'VALIDATION_ERROR_CMPAY:8': 'Unable to validate reference with the biller service',
  '120083': 'The version of the import file you have uploaded is no longer supported and will be rejected. Kindly update the version of the file before processing'
};

export function mapBackendErrors(
  backendErrors: BackendErrorResponse[]
): ErrorMappingResult {
  const fieldErrors: MappedFieldError[] = [];
  const generalErrors: MappedFieldError[] = [];
  let hasErrors = false;
  let hasWarnings = false;

  for (const error of backendErrors) {
    const errorCodeToUse = (error.errorCode || error.messageCode || 'UNKNOWN') as string;
    const reason = ERROR_CODE_MAPPINGS[errorCodeToUse] || 'Unknown error code - please contact support';
    const severity = error.issueType === 'WARNING' ? 'warning' : 'error';

    if (severity === 'error') hasErrors = true;
    else hasWarnings = true;

    // Substitute message parameters into the error message/reason
    // e.g., "Account number must be {0} characters." + ["13"] -> "Account number must be 13 characters."
    const messageWithParams = error.message 
      ? substituteMessageParams(error.message, error.messageParams)
      : substituteMessageParams(reason, error.messageParams);

    generalErrors.push({
      field: '',
      errorCode: errorCodeToUse || 'UNKNOWN',
      message: messageWithParams,
      reason,
      severity,
    });
  }

  const canProceed = !hasErrors;

  return {
    hasErrors,
    hasWarnings,
    fieldErrors,
    generalErrors,
    canProceed,
  };
}

export function getErrorsForField(
  fieldName: string,
  mappingResult: ErrorMappingResult
): MappedFieldError[] {
  return mappingResult.fieldErrors.filter(error => error.field === fieldName);
}

export function getErrorsBySeverity(
  mappingResult: ErrorMappingResult,
  severity: 'error' | 'warning'
): MappedFieldError[] {
  const allErrors = [...mappingResult.fieldErrors, ...mappingResult.generalErrors];
  return allErrors.filter(error => error.severity === severity);
}

export function getErrorsByCategory(
  errorCodes: string[]
): Record<string, string[]> {
  return { UNCATEGORIZED: errorCodes };
}

export function isWarning(errorCode: string): boolean {
  return false;
}

export function getErrorMessage(errorCode: string): string {
  return ERROR_CODE_MAPPINGS[errorCode] || `Error code: ${errorCode}`;
}

export function getAffectedFields(errorCode: string): string[] {
  return [];
}

const BeneficiaryBackendErrorMapper = {
  mapBackendErrors,
  getErrorsForField,
  getErrorsBySeverity,
  getErrorsByCategory,
  isWarning,
  getErrorMessage,
  getAffectedFields,
};

export default BeneficiaryBackendErrorMapper;
