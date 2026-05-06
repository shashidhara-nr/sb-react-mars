export interface PaymentTypeAccount {
  accountKey: number;
  accountNumber: string;
  accountName: string;
  sortCode: string;
  bic: string | null;
  currencyCode: string;
  currencyDisplayName: string | null;
  countryCode: string;
  countryDisplayName: string | null;
  shortNames: string | null;
}

export interface PaymentTypeAccountResponse{
  restIssueLog: null|string,
  accounts: PaymentTypeAccount[]
}

// Statement Reference Interface
export interface StatementReferenceTO {
  statementReferenceType: string;
  postingOptions: string;
  statmentReferenceEditable: string;
  appliedtoDebitStatementReference: string;
  statementReference: string;
  shortName: string;
}

// Debit Account List Interface
export interface DebitAccountList {
  lastPage: boolean;
  pageCount: number;
  postition: number;
  pageSize: number;
  rowCount: number;
  accounts: PaymentTypeAccount[] | null;
}

// Create Payment Type Request Interface
export interface CreatePaymentTypeRequest {
  name: string;
  versionNumber: number;
  customerKey: number;
  authProfileName: string;
  authProfileKey: number;
  canAuthorise: boolean;
  authoriseStatus: string;
  agreementAuthoriseStatus: string;
  endorseStatusCode: string;
  agreementKey: number;
  agreementName: string;
  agreementSuspended: boolean;
  agreementAction: string;
  action: string;
  initiator: boolean;
  requiresInterimAudit: boolean;
  auditReportType: string;
  hasDAPPermission: boolean;
  defaultCustomerHostToHost: boolean;
  allowEditingHostToHost: boolean;
  allowEditingFileUpload: boolean;
  payAlertsEnabled: boolean;
  earlyClearingValidation: boolean;
  hideBeneficiaryEnabled: boolean;
  cutOffTimeBreachOption: string;
  cutOffTimeOptionHostToHost: string;
  allowAdhocCounterParty: boolean;
  adhocCounterPartyLimit: string;
  adHocCounterPartyLimitCurrency: string;
  consolidatedBatchIndicator: boolean;
  consolidatedInstrxnIndicator: boolean;
  itemizedBatchIndicator: boolean;
  itemizedInstrxnIndicator: boolean;
  unpaidOptionKey: number;
  declineReason: string | null;
  fileUploadPostingOption: string;
  fileUploadRejectionOption: string;
  rejectionOptionHostToHost: string;
  accountKeys: string[];
  accountKeyValues: string[] | number[];
  debitAccountList: Record<string, unknown>;
  statementReferenceListTO: StatementReferenceTO[];
  customerPaymentTypeShortNamesTO: unknown[];
}

// Create Payment Type Response Interface
export interface CreatePaymentTypeResponse {
  action: string;
  versionNumber: number;
  agreementKey: number;
  agreementName: string;
  agreementAuthoriseStatus: string;
  accountKeys: string[] | number[];
  customerKey: number;
  name: string;
  authProfileKey: number;
  authProfileName: string;
  endorseStatusCode: string;
  paymentTypeKey: number;
  requiresInterimAudit: boolean;
  debitAccountList: DebitAccountList;
  unpaidOptionKey: number;
  adhocCounterPartyLimit: string;
  adHocCounterPartyLimitCurrency: string;
  allowAdhocCounterParty: boolean;
  allowEditingFileUpload: boolean;
  auditReportType: string;
  cutOffTimeBreachOption: string;
  fileUploadRejectionOption: string;
  authoriseStatus: string;
  canAuthorise: boolean;
  hasDAPPermission: boolean;
  declineReason: string | null;
  initiator: boolean;
  statementReferenceListTO: StatementReferenceTO[];
  allowEditingHostToHost: boolean;
  payAlertsEnabled: boolean;
  hideBeneficiaryEnabled: boolean;
  defaultCustomerHostToHost: boolean;
  rejectionOptionHostToHost: string;
  cutOffTimeOptionHostToHost: string;
  fileUploadPostingOption: string;
  h2hFundingOptions: unknown;
  agreementSuspended: boolean;
  agreementAction: string;
  customerPaymentTypeShortNamesTO: unknown[];
  customerPaymentTypeUnpaidTO: unknown;
  consolidatedBatchIndicator: string;
  consolidatedInstrxnIndicator: string;
  itemizedBatchIndicator: string;
  itemizedInstrxnIndicator: string;
  custPaymentTypeShortNameDefaultsTOs: unknown;
  earlyClearingValidation: boolean;
  allowEditingCustomerReference: string | null;
  enforceAuditing: string | null;
  accountKeyValues: string[] | number[];
  defaultAdhocLimits: string[];
}

// Update Payment Type Request Interface (similar to create but with paymentTypeKey)
export interface UpdatePaymentTypeRequest extends CreatePaymentTypeRequest {
  paymentTypeKey?: number;
}

// Extended Account interface for Get Details response
export interface PaymentTypeGetDetailsAccount {
  accountKey: number;
  accountNumber: string;
  accountName: string;
  bic: string;
  sortCode: string;
  currencyDisplayName: string | null;
  currencyCode: string;
  countryDisplayName: string | null;
  countryCode: string;
  country: string | null;
  currency: string | null;
  unpaidOptionKey: number | null;
  legacyType: string | null;
  legacyCode: string | null;
  accountDescription: string | null;
  accountOwnerName: string | null;
  processingOption: string | null;
  reconciliationOption: string | null;
  attributeValue: string | null;
  bicswift: string | null;
}

// Debit Account List for Get Details response
export interface PaymentTypeGetDetailsDebitAccountList {
  lastPage: boolean;
  pageCount: number;
  postition: number;
  pageSize: number;
  rowCount: number;
  accounts: PaymentTypeGetDetailsAccount[];
}

// Statement Reference for Get Details response
export interface PaymentTypeGetDetailsStatementReference {
  statementReferenceType: string;
  postingOptions: string;
  statmentReferenceEditable: string;
  appliedtoDebitStatementReference: string | null;
  statementReference: string;
  shortName: string | null;
}

// Payment Type Get Details Response Interface
export interface PaymentTypeGetDetails {
  action: string | null;
  versionNumber: number;
  agreementKey: number;
  agreementName: string;
  agreementAuthoriseStatus: string;
  accountKeys: string[];
  customerKey: number;
  name: string;
  authProfileKey: number;
  authProfileName: string;
  endorseStatusCode: string;
  paymentTypeKey: number;
  requiresInterimAudit: boolean;
  debitAccountList: PaymentTypeGetDetailsDebitAccountList;
  unpaidOptionKey: number | null;
  adhocCounterPartyLimit: string;
  adHocCounterPartyLimitCurrency: string;
  allowAdhocCounterParty: boolean;
  allowEditingFileUpload: boolean;
  auditReportType: string;
  cutOffTimeBreachOption: string;
  fileUploadRejectionOption: string;
  authoriseStatus: string;
  canAuthorise: boolean;
  hasDAPPermission: boolean;
  declineReason: string | null;
  initiator: boolean;
  statementReferenceListTO: PaymentTypeGetDetailsStatementReference[];
  allowEditingHostToHost: boolean;
  payAlertsEnabled: boolean;
  hideBeneficiaryEnabled: boolean;
  defaultCustomerHostToHost: boolean;
  rejectionOptionHostToHost: string;
  cutOffTimeOptionHostToHost: string;
  fileUploadPostingOption: string;
  h2hFundingOptions: string;
  agreementSuspended: boolean;
  agreementAction: string;
  customerPaymentTypeShortNamesTO: unknown ;
  customerPaymentTypeUnpaidTO: unknown;
  consolidatedBatchIndicator: string;
  consolidatedInstrxnIndicator: string;
  itemizedBatchIndicator: string;
  itemizedInstrxnIndicator: string;
  custPaymentTypeShortNameDefaultsTOs: unknown[];
  earlyClearingValidation: boolean;
  allowEditingCustomerReference: string | null;
  enforceAuditing: string | null;
  accountKeyValues: number[];
  defaultAdhocLimits: string[];
}

export interface UnPaidProcessingOption {
  unpaidOptionKey: number;
  unpaidOptionName: string;
  unpaidOptionDesc: string | null;
  onUsOption: string;
  offUsOption: string;
  status: string;
  displayStatus: string | null;
}
export interface UnPaidProcessingOptionsResponse {
  restIssueLog: null | string;
  unpaidProcessingOptions: UnPaidProcessingOption[];
}