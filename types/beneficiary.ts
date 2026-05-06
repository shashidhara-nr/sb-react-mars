// Beneficiary Address Type
export interface CounterPartyAddress {
  addressLine1: string;
  addressLine2: string;
  addressLine3?: string;
  addressLine4?: string;
  addressLine5?: string;
  streetName?: string;
  buildingNumber?: string;
  postalCode: string;
  townName: string;
  countrySubDivision?: string;
  countryCode: string;
  subUrb?: string;
  coreAddressTO?: string;
}

// Beneficiary Audit Trail
export interface AuditTrail {
  dateAndTime: string;
  userName: string;
  event: string;
  description?: string;
  parameters?: any[];
  msgDomain?: string;
  msgCategory?: number;
  msgSubCategory?: string;
}

// Beneficiary Audit Summary
export interface AuditSummaryChangeTO {
  updatedDate: string;
  fieldName: string;
  originalValue?: string;
  updatedValue?: string;
}

// Issue Log
export interface IssueLogTO {
  issues?: any[];
}

// Alert Details
export interface AlertDetail {
  alertId: string;
  alertType: string;
  notify?: string;
  titleAndName?: string;
  emailOrNumber?: string;
  entityKey?: number;
  whenModified?: string;
  alertStatus?: string;
  dateAndTimeSent?: string;
  instructionKey?: number;
  transactionId?: number;
}

export interface AlertDetailsListTO {
  lastPage?: boolean;
  pageCount?: number;
  postition?: number;
  pageSize?: number;
  rowCount?: number;
  alertDetailsList?: AlertDetail[];
}

// Additional Reference
export interface BeneficiaryAdditionalReference {
  entityKey?: number;
  billerId?: number;
  referenceDisplay?: string;
  referenceDisplay2?: string;
  hintText?: string;
  hintText2?: string;
  actualHintText?: string;
  referenceSequence?: number;
  referenceMandatory?: string;
  classification?: string;
  bankGroupId?: string;
  creditDebitIndicator?: string;
  validationResponse?: string;
}

export interface BeneficiaryAdditionalReferenceListTO {
  lastPage?: boolean;
  pageCount?: number;
  postition?: number;
  pageSize?: number;
  rowCount?: number;
  additionalRefList?: BeneficiaryAdditionalReference[];
  overallValidationResponse?: string;
  customerId?: string;
  billerId?: number;
  txnIdRefValidation?: number;
  instructionReference?: string;
  additionalReferenceMap?: {
    [key: string]: string;
  };
  requestId?: string;
}

// Main Beneficiary Payload
export interface CreateBeneficiaryPayload {
  status: string;
  firstName: string;
  lastName: string;
  idPassportNumber: string;
  paymentType?: string;
  collection?: string | string[];
  bankAccountVerificationStatus?: string;
  bankName?: string;
  branchName?: string;
  transactionLimit?: string | number;
  branchCode?: string;
  currency: string;
  town: string;
  action?: string;
  beneficiaryType?: string;
  creationMethod?: string;
  versionNumber?: number;
  entityKey?: number;
  counterPartyName?: string;
  referenceIDX?: string;
  counterPartyAddress: CounterPartyAddress;
  counterPartyReference?: string;
  accountNumber: string;
  allowDirectAccountFlag?: string;
  billerBic?: string;
  accountType?: string;
  accountTypeDesc?: string;
  iban?: string;
  accountCurrency?: string;
  creditDebitIndicator?: string;
  counterPartyTransactionHistoryList?: any[];
  financialInstitutionName: string;
  internationalBankBicCode?: string;
  bankBranchName?: string;
  bankBranchAddress?: CounterPartyAddress;
  branchSortCode?: string;
  intermediaryBankBicCode?: string;
  intermediaryBankName?: string;
  intermediaryBankTownName?: string;
  correspondingBankBicCode?: string;
  correspondingBankName?: string;
  correspondingBankTownName?: string;
  transactionLimitCurrency?: string;
  bankGroupId?: string;
  classification?: string;
  customerKey?: number;
  endorseStatusCode?: string;
  whenModified?: number;
  overrideIssues?: boolean;
  inFileStatus?: string;
  issueLogTO?: IssueLogTO;
  bankCountryCode?: string;
  fileData?: string;
  fileType?: string;
  auditTrails?: AuditTrail[];
  originatingChannel?: string;
  authoriseStatus?: string;
  canAuthorise?: boolean;
  hasDAPPermission?: boolean;
  declineReason?: string;
  declineUserName?: string;
  declineTimestamp?: number | string;
  entityType?: string;
  initiator?: boolean;
  customerName?: string;
  customerStatus?: string;
  customerid?: string;
  auditSummaryChangeTOs?: AuditSummaryChangeTO[];
  lastAuditDate?: string;
  customerCountry?: string;
  createdBy?: string;
  createdDateTime?: string;
  lastAuthorisedBy?: string;
  lastAuthorisedDateTime?: string;
  accountValidationWarnings?: boolean;
  bankKey?: number;
  surname: string;
  gender?: string;
  identificationType?: string;
  nationality?: string;
  passportCountry?: string;
  identificationNumber?: string;
  deleteInd?: string;
  entityCategory?: string;
  reasonForExemption?: string;
  exemptFromChargesChk?: string;
  secondReference?: string;
  linkedPaymentProfiles?: any[];
  cdiNumber?: string;
  cdiName?: string;
  ignoreCDIBenRefWarnings?: boolean;
  payAlert?: string;
  alertDetailsListTO?: AlertDetailsListTO;
  payAlertAllowed?: boolean;
  payAlertFapEnabled?: boolean;
  paymentTypeNames?: string;
  entityName?: string;
  supportText?: string;
  msgCategory?: number;
  bic: string;
  cdiCheck?: string;
  serviceLevelMobile?: boolean;
  beneficiaryAdditionalReferenceTO?: BeneficiaryAdditionalReference;
  beneficiaryAdditionalReferenceListTO?: BeneficiaryAdditionalReferenceListTO;
  billerConcatenatedReference?: string;
  validationIndicator?: boolean;
  originalBillerId?: string;
  transactionIDRefValidation?: number;
  instructionReference?: string;
  firstReferenceLabelValue?: string;
  secondReferenceLabelValue?: string;
  adhocAllowDirectAccountFlag?: string;
  billerRefValRequestId?: string;
  fileMapperTemplateId?: number;
  cdiUpdateIndicator?: boolean;
  residencyStatus?: string;
  accountGroup?: string;
  mandateDetails?: any[]; // Mandate details for debtors
  mandateDetailsDuringCreate?: any[]; // Mandate details during create flow
  mozMandateDetails?: any[]; // Mozambique mandate details
  collectionHistory?: any[]; // Collection history
  mandateListFlag?: string | null; // Mandate list flag
  collectionHistoryListFlag?: string | null; // Collection history list flag
  mandateID?: string | null; // Mandate ID
  collectionTypesList?: any[]; // Collection types list
  collections?: string | string[]; // Selected collections (can be string or array)
  collectionProfiles?: string | string[]; // Collection profiles (can be string or array)
  accountTypeCheckReq?: boolean;
  counterPartyStreetName?: string;
  counterPartyPostalCode?: string;
  counterPartyTownName?: string;
  counterPartyCountrySubDivision?: string;
  phoneNumber?: string;
  email?: string;
  phoneUsage?: string[];
  emailUsage?: string[];
  selectedBankBranch?: string;
  verifiedAccount?:any;
}

// Helper function to build payload from form data
export const buildBeneficiaryPayload = (
  formData: {
    firstName: string;
    lastName: string;
    beneficiaryCode: string;
    beneficiaryReference: string;
    postalCode: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    country: string;
    phoneNumber: string;
    email: string;
  },
  bankData: {
    bankName: string;
    bic: string;
    accountNumber: string;
    branchCode: string;
    bankAccountVerificationStatus: string;
    accountName: string;
    iban: string;
    accountType: string;
    paymentType: string;
  },
  phoneUsage: string[],
  emailUsage: string[],
  collections?: string[]
): CreateBeneficiaryPayload => {
  return {
    currency: 'ZAR',
    town: formData.city,
    action: 'CREATE',
    counterPartyName: `${formData.firstName} ${formData.lastName}`,
    referenceIDX: formData.beneficiaryCode,
    counterPartyReference: formData.beneficiaryReference,
    counterPartyAddress: {
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      postalCode: formData.postalCode,
      townName: formData.city,
      countrySubDivision: formData.province,
      countryCode: formData.country,
    },
    accountNumber: bankData.accountNumber,
    iban: bankData.iban,
    accountCurrency: 'ZAR',
    financialInstitutionName: bankData.bankName,
    internationalBankBicCode: bankData.bic,
    branchSortCode: bankData.branchCode,
    accountType: bankData.accountType,
    bic: bankData.bic,
    surname: formData.lastName,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    phoneUsage: phoneUsage,
    emailUsage: emailUsage,
    entityType: 'INDIVIDUAL',
    residencyStatus: 'RESIDENT',
    endorseStatusCode: 'PENDING',
    authoriseStatus: 'PENDING',
    createdDateTime: new Date().toISOString(),
    status: '',
    firstName: formData.firstName,
    lastName: formData.lastName,
    idPassportNumber: '',
    collection: collections && collections.length ? collections.join(', ') : undefined,
  };
};
