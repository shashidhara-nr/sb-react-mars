interface PaginationResponse {
  lastPage: boolean;
  pageCount: number;
  postition: number;
  pageSize: number;
  rowCount: number;
}
export interface TransferTypeAccount {
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

export interface TransferTypeAccountListResponse extends PaginationResponse {
  accounts: TransferTypeAccount[];
}

export interface Agreement {
  agreementKey: number;
  agreementName: string;
}

export interface TransferTypeAgreementListResponse extends PaginationResponse {
  agreements: Agreement[];
}

export interface AuthorizationProfile {
  authProfileKey: number | string;
  authProfileName: string;
}

export interface AuthorisationProfileListResponse extends PaginationResponse {
  authProfiles: AuthorizationProfile[];
}

export interface CreateTransferTypeRequest {
  name: string;
  agreementKey: number;
  authProfileKey: number;
  accountKeys: string[];
  creditAccountKeys: string[];
  requiresInterimAudit: boolean;
}

export interface CreateTransferTypeResponse {
  action: string | null;
  versionNumber: number;
  auditReportType: string | null;
  requiresInterimAudit: boolean;
  fileUploadRejectionOption: string | null;
  cutOffTimeBreachOption: string | null;
  allowEditingFileUpload: boolean;
  rejectionOptionHostToHost: string | null;
  allowEditingHostToHost: boolean;
  defaultCustomerHostToHost: boolean;
  cutOffTimeOptionHostToHost: string | null;
  agreementKey: number;
  agreementName: string | null;
  accountKeys: string[];
  customerKey: number;
  name: string;
  authProfileKey: number;
  creditAccountKeys: string[];
  endorseStatusCode: string;
  authProfileName: string | null;
  transferTypeKey: number;
  debitAccountList: unknown;
  creditAccountList: unknown;
  authoriseStatus: string;
  canAuthorise: boolean;
  hasDAPPermission: boolean;
  declineReason: string | null;
  initiator: boolean;
  agreementAuthoriseStatus: string | null;
  agreementSuspended: boolean;
  agreementAction: string | null;
  accountKeyValues: number[];
  creditAccountKeyValues: number[];
}

export interface TransferTypeGetDetailsResponse {
  action: string | null;
  versionNumber: number;
  auditReportType: string | null;
  requiresInterimAudit: boolean;
  fileUploadRejectionOption: string | null;
  cutOffTimeBreachOption: string | null;
  allowEditingFileUpload: boolean;
  rejectionOptionHostToHost: string | null;
  allowEditingHostToHost: boolean;
  defaultCustomerHostToHost: boolean;
  cutOffTimeOptionHostToHost: string | null;
  agreementKey: number;
  agreementName: string | null;
  accountKeys: number[];
  customerKey: number | null;
  name: string | null;
  authProfileKey: number;
  creditAccountKeys: number[];
  endorseStatusCode: string;
  authProfileName: string | null;
  transferTypeKey: number;
  debitAccountList: unknown;
  creditAccountList: unknown;
  authoriseStatus: string;
  canAuthorise: boolean;
  hasDAPPermission: boolean;
  declineReason: string | null;
  initiator: boolean;
  agreementAuthoriseStatus: string | null;
  agreementSuspended: boolean;
  agreementAction: string | null;
  accountKeyValues: number[];
  creditAccountKeyValues: number[];
}

export interface UpdateTransferTypeRequest {
  versionNumber: string | number,
  transferTypeKey: number | string,
  name: string,
  agreementKey: number | string,
  authProfileKey: number | string,
  accountKeys: string | number[],
  creditAccountKeys: string | number[],
  requiresInterimAudit: boolean
}

export interface DeleteTransferTypePayload {
  transferTypeKey: number,
  name: string,
  versionNumber: number
}

export type DeleteTransferTypeMultiPayload = Omit<DeleteTransferTypePayload, 'versionNumber'>;

export type DeleteTransferTypeRequest = DeleteTransferTypePayload[] | DeleteTransferTypeMultiPayload[];