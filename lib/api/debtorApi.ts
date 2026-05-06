import { get, post, put, del } from './httpClient';
import { API_ROUTES } from '../utils/apiRoute';

export interface DebtorListItem {
  id: string;
  debtorName: {
    name: string;
    accountNumber: string;
    branch: string;
    icon: string;
  };
  debtorCode?: string;
  debtorReference: string;
  collectionType: string;
  bicSwift: string;
  bankName: string;
  transactionLimit: string;
  status: {
    value: string;
    color: string;
  };
  links: {
    href: string;
    text: string;
  } | null;
  authoriseStatus: string;
}

// Complete debtor details (DebtorDetailTO from backend)
export interface DebtorDetailTO {
  entityKey: number;
  counterPartyName: string;
  referenceIDX?: string;
  counterPartyReference?: string;
  accountNumber: string;
  accountType?: string;
  accountTypeDesc?: string;
  iban?: string;
  financialInstitutionName?: string;
  bic?: string;
  bicSwiftCode?: string;
  branchSortCode?: string;
  bankName?: string;
  branchName?: string;
  collectionType?: string;
  authoriseStatus: string;
  statusCode?: string | null;
  action?: string;
  status?: string;
  entityCategory?: string;
  customerKey?: string;
  countryCode?: string;
  transactionLimit?: number;
  transactionLimitCurrency?: string;
  [key: string]: any;
}

// API Response structure from backend (counterPartyList is primary source)
export interface ApiDebtorItem {
  entityKey: number;
  counterPartyName: string;
  accountNumber: string;
  branchSortCode: string;
  bankName: string;
  bicSwiftCode: string;
  collectionType?: string;
  authoriseStatus: string;
  statusCode?: string | null;
  referenceIDX?: string;
  counterPartyReference?: string;
  accountType?: string;
  customerKey?: string;
  countryCode?: string;
  [key: string]: any;
}

export interface DebtorsResponse {
  counterPartyList: ApiDebtorItem[];
  debtorDetailTOs?: ApiDebtorItem[];
  lastPage: boolean;
  pageCount: number;
  position: number;
  pageSize: number;
  rowCount: number;
}

export const DEBTOR_SORT_COLUMN_MAP: Record<string, string> = {
  debtorName: 'counterPartyName',
  debtorCode: 'ReferenceIDX',
  debtorReference: 'counterPartyReference',
  collectionType: 'collectionType',
  bicSwift: 'FININSTITUTIONID',
  bankName: 'BankName',
  transactionLimit: 'TransactionLimit',
  status: 'authoriseStatus',
};

export interface DebtorsQueryParams {
  pageSize?: number;
  position?: number; // Backend uses position (offset) instead of page
  sortBy?: string;
  asc?: boolean | string; // Backend might expect string "true"/"false" or boolean
  // Filter parameters
  counterPartyName?: string;
  referenceIDX?: string;
  accountNumber?: string;
  bicSwiftCode?: string;
  branchSortCode?: string;
  countryCode?: string;
  accountType?: string;
  customerKey?: string;
  collectionType?: string;
  bankName?: string;
  status?: string;
  filterStatus?: string; // Status from filter drawer
}

export async function getDebtors(params?: DebtorsQueryParams): Promise<DebtorsResponse> {
  const queryParams = new URLSearchParams();
  const pageSize = params?.pageSize || 10;
  const position = params?.position || 0;
  
  queryParams.append('pageSize', pageSize.toString());
  queryParams.append('position', position.toString());
  
  // Add sort parameters (only if provided)
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  
  if (params?.asc !== undefined) {
    queryParams.append('asc', params.asc.toString());
  }
  
  // Add filter parameters if provided (skip empty values)
  if (params?.counterPartyName) {
    queryParams.append('counterPartyName', params.counterPartyName);
  }
  if (params?.referenceIDX) {
    queryParams.append('referenceIDX', params.referenceIDX);
  }
  if (params?.accountNumber) {
    queryParams.append('accountNumber', params.accountNumber);
  }
  if (params?.bicSwiftCode) {
    queryParams.append('bicSwiftCode', params.bicSwiftCode);
  }
  if (params?.branchSortCode) {
    queryParams.append('branchSortCode', params.branchSortCode);
  }
  if (params?.countryCode) {
    queryParams.append('countryCode', params.countryCode);
  }
  if (params?.accountType) {
    queryParams.append('accountType', params.accountType);
  }
  if (params?.customerKey) {
    queryParams.append('customerKey', params.customerKey);
  }
  if (params?.collectionType) {
    queryParams.append('collectionType', params.collectionType);
  }
  if (params?.bankName) {
    queryParams.append('bankName', params.bankName);
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.filterStatus) {
    queryParams.append('filterStatus', params.filterStatus);
  }
  
  const url = `${API_ROUTES.DEBTORS}?${queryParams.toString()}`;
  const response = await get<DebtorsResponse>(url);
  return response;
}

// Find debtor by entityKey (returns complete details)
export async function findDebtorById(entityKey: number | string): Promise<DebtorDetailTO> {
  const url = `${API_ROUTES.DEBTOR_BY_ID(entityKey)}`;
  const response = await get<DebtorDetailTO>(url);
  return response;
}

export async function createDebtor(data: any): Promise<any> {
  return post<any>(API_ROUTES.DEBTORS, data);
}

export async function updateDebtor(data: any): Promise<any> {
  return put<any>(API_ROUTES.DEBTORS, data);
}

// Get verified accounts details for debtors
export async function getBatchDetailsAVS(params?: any): Promise<any> {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  return get<any>(`${API_ROUTES.DEBTORS_BATCH_DETAILS_AVS}${queryParams}`);
}

// Delete single debtor - uses DELETE method with body
export async function deleteDebtor(payload: any): Promise<void> {
  return del<void>(API_ROUTES.DEBTORS, { data: [payload] });
}

// Delete multiple debtors - uses DELETE method with body
export async function deleteDebtors(simplifiedPayloads: Array<any>): Promise<any> {
  return del<any>(API_ROUTES.DEBTORS, { data: simplifiedPayloads });
}

// Print debtor transaction history (returns base64 PDF)
export interface PrintDebtorHistoryParams {
  debtorKey: number;
  ascOrder?: boolean;
  format?: 'pdf' | 'csv' | 'txt';
}

export async function printDebtorHistory(params: PrintDebtorHistoryParams): Promise<string> {
  const { debtorKey, ascOrder = false, format = 'pdf' } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('debtorKey', debtorKey.toString());
  queryParams.append('format', format.toLowerCase());
  if (ascOrder !== undefined) {
    queryParams.append('ascOrder', ascOrder.toString());
  }
  
  const url = `${API_ROUTES.DEBTORS_EXPORT_HISTORY}?${queryParams.toString()}`;
  const response = await get<string>(url);
  return response;
}

// Print debtor audit trail (returns base64 PDF)
export interface PrintDebtorAuditTrailParams {
  debtorKey: number;
  ascOrder?: boolean;
}

export async function printAuditTrail(params: PrintDebtorAuditTrailParams): Promise<string> {
  const { debtorKey, ascOrder = false } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('debtorKey', debtorKey.toString());
  if (ascOrder !== undefined) {
    queryParams.append('ascOrder', ascOrder.toString());
  }
  
  const url = `${API_ROUTES.DEBTORS}/printAuditTrail?${queryParams.toString()}`;
  const response = await get<string>(url);
  return response;
}

// Export debtor audit trail history (returns base64 CSV or TXT)
export interface ExportAuditTrailHistoryParams {
  debtorKey: number;
  exportFormat: 'csv' | 'txt';
  ascOrder?: boolean;
}

export async function exportAuditTrailHistory(params: ExportAuditTrailHistoryParams): Promise<string> {
  const { debtorKey, exportFormat, ascOrder = true } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('debtorKey', debtorKey.toString());
  queryParams.append('format', exportFormat.toLowerCase());
  const url = `${API_ROUTES.DEBTORS_EXPORT_HISTORY}?${queryParams.toString()}`;
  return get<string>(url);
}

// Print debtors report
export async function printDebtors(params: {
  debtorKeys?: number[];
  sortOrderAsc?: string | boolean;
  debtorType?: string;
}): Promise<string> {
  // Backend returns base64-encoded string
  const queryParams = new URLSearchParams();
  
  if (params.debtorKeys && params.debtorKeys.length > 0) {
    params.debtorKeys.forEach(key => {
      queryParams.append('debtorKeys', key.toString());
    });
  }
  
  if (params.sortOrderAsc !== undefined) {
    queryParams.append('sortOrderAsc', params.sortOrderAsc.toString());
  }
  
  if (params.debtorType) {
    queryParams.append('debtorType', params.debtorType);
  }
  
  const url = `${API_ROUTES.DEBTORS_PRINT}?${queryParams.toString()}`;
  return get<string>(url);
}

// Export debtors with proper payload structure
export interface ExportDebtorDetail {
  key: string;
  referenceIDX: string;
  bicSwiftCode: string;
  accountType: string;
  collectionType: string;
}

export interface ExportDebtorsPayload {
  details: ExportDebtorDetail[];
  standardFormat: boolean;
  debtorType: string;
  fileType: 'CSV' | 'TXT';
  asc: boolean;
  selectedFields: string[];
}

export async function exportDebtors(payload: ExportDebtorsPayload): Promise<string> {
  // Backend returns CSV or TXT as plain text
  return post<string>(API_ROUTES.DEBTORS_EXPORT, payload, {
    responseType: 'text' as any
  });
}

// Upload debtors from file
export interface UploadDebtorsPayload {
  fileData: string; // Base64 encoded file content
  fileFormat: string; // 'csv', 'pdf', etc.
  templateId: number | null; // Template ID for mapping, null if not using template
}

export interface IssueLogTO {
  issues: Array<{
    message: string;
    messageCode: string;
    domain: string;
    messageParams: any | null;
    constraint: any | null;
    issueType: string;
    issueReference: any | null;
    additionalReference: any | null;
  }>;
}

export interface AddressTO {
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  addressLine4?: string | null;
  addressLine5?: string | null;
  streetName?: string | null;
  buildingNumber?: string | null;
  postalCode?: string | null;
  townName?: string | null;
  countrySubDivision?: string | null;
  countryCode?: string | null;
  subUrb?: string | null;
  coreAddressTO?: any;
}

export interface CollectionProfile {
  customerPaymentProfileName: string;
  entityKey: number;
  manualEntryServiceName: string;
  payAlertsEnabled: boolean;
  active: boolean;
  hidebeneficiaryenabled: boolean;
}

export interface UploadedDebtorRecord {
  action?: string;
  versionNumber?: number;
  entityKey?: number | null;
  counterPartyName: string;
  referenceIDX?: string;
  counterPartyAddress?: AddressTO;
  counterPartyReference?: string | null;
  accountNumber: string;
  allowDirectAccountFlag?: any | null;
  billerBic?: any | null;
  accountType?: string | null;
  accountTypeDesc?: string | null;
  iban?: string | null;
  accountCurrency?: any | null;
  creditDebitIndicator?: any | null;
  counterPartyTransactionHistoryList?: any[];
  financialInstitutionName?: string;
  internationalBankBicCode?: string;
  bankBranchName?: string | null;
  bankBranchAddress?: AddressTO;
  branchSortCode?: string;
  intermediaryBankBicCode?: any | null;
  intermediaryBankName?: any | null;
  intermediaryBankTownName?: any | null;
  correspondingBankBicCode?: any | null;
  correspondingBankName?: any | null;
  correspondingBankTownName?: any | null;
  transactionLimit?: number | null;
  transactionLimitCurrency?: string | null;
  bankGroupId?: string | null;
  classification?: any | null;
  customerKey?: number | null;
  endorseStatusCode?: any | null;
  whenModified?: any | null;
  overrideIssues?: boolean;
  inFileStatus?: string;
  issueLogTO?: IssueLogTO | null;
  bankCountryCode?: any | null;
  fileData?: any | null;
  fileType?: any | null;
  auditTrails?: any[];
  originatingChannel?: string;
  authoriseStatus?: string;
  canAuthorise?: boolean;
  hasDAPPermission?: boolean;
  declineReason?: any | null;
  entityType?: any | null;
  initiator?: boolean;
  customerName?: any | null;
  customerStatus?: any | null;
  customerid?: any | null;
  auditSummaryChangeTOs?: any[];
  lastAuditDate?: any | null;
  customerCountry?: any | null;
  createdBy?: any | null;
  createdDateTime?: any | null;
  lastAuthorisedBy?: any | null;
  lastAuthorisedDateTime?: any | null;
  accountValidationWarnings?: boolean;
  bankKey?: any | null;
  surname?: any | null;
  gender?: any | null;
  identificationType?: any | null;
  nationality?: any | null;
  passportCountry?: any | null;
  identificationNumber?: any | null;
  deleteInd?: any | null;
  entityCategory?: any | null;
  reasonForExemption?: any | null;
  exemptFromChargesChk?: any | null;
  secondReference?: any | null;
  linkedCollectionProfiles?: CollectionProfile[];
  mandateDetails?: any[];
  mandateDetailsDuringCreate?: any[];
  mozMandateDetails?: any[];
  collectionHistory?: any[];
  collectionTypeNames?: string | null;
  collectionType?: any | null;
  bic?: any | null;
  debtorUpdateAuditList?: any[];
  addedCollectionTypesList?: any[];
  removedCollectionTypesList?: any[];
  mandateListFlag?: any | null;
  collectionHistoryListFlag?: any | null;
  debtorUpdatedFlag?: any | null;
  collectionTypesFlag?: any | null;
  removedCollectionsFlag?: any | null;
  addedCollectionsFlag?: any | null;
  fileMapperTemplateId?: any | null;
  nib?: any | null;
  nuit?: any | null;
  mandateID?: any | null;
}

export interface UploadDebtorsResponse {
  errorRecord: number;
  successfullRecords: number;
  validationMsg: any | null;
  schemaValidated?: boolean;
  issueLog: any | null;
  newRecords: UploadedDebtorRecord[];
  existingRecords: UploadedDebtorRecord[];
  inValidRecords: UploadedDebtorRecord[];
  errorRecords: UploadedDebtorRecord[];
  dupRecords: UploadedDebtorRecord[];
  potentialDupRecords: UploadedDebtorRecord[];
}

export async function uploadDebtors(payload: UploadDebtorsPayload, locale: string = 'en_US'): Promise<UploadDebtorsResponse> {
  const url = `${API_ROUTES.DEBTORS_UPLOAD}?locale=${locale}`;
  return post<UploadDebtorsResponse>(url, payload);
}

// Process debtor batch (submit valid debtors for approval)
export interface ProcessDebtorBatchPayload {
  newRecords: UploadedDebtorRecord[];
  existingRecords: UploadedDebtorRecord[];
}

export async function processDebtorBatch(payload: ProcessDebtorBatchPayload): Promise<any> {
  return post<any>(API_ROUTES.DEBTORS_PROCESS_BATCH, payload);
}
