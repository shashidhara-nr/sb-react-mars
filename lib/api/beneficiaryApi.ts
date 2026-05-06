
import { get, post, put, del } from './httpClient';
import { API_ROUTES } from '../utils/apiRoute';

export interface BeneficiaryListItem {
  id: string;
  counterPartyName: {
    name: string;
    accountNumber: string;
    branch: string;
    icon: string;
  };
  bankName: string;
  bicSwiftCode: string;
  paymentCategory: string;
  status: {
    value: string;
    color: string;
  };
  links: {
    href: string;
    text: string;
  };
  authoriseStatus: string;
  beneficiaryCode?: string;
}

export interface BeneficiaryDetailTO {
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
  classification?: string; 
  authoriseStatus: string;
  action?: string;
  status?: string;
  entityCategory?: string;
  beneficiaryType?: string;
  surname?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  transactionLimit?: number;
  transactionLimitCurrency?: string;
  paymentProfiles?: string;
  paymentType?: string[];
  counterPartyAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    addressLine4?: string;
    addressLine5?: string;
    streetName?: string;
    buildingNumber?: string;
    postalCode?: string;
    townName?: string;
    countrySubDivision?: string;
    countryCode?: string;
    subUrb?: string;
  };
  bankBranchAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    townName?: string;
    countryCode?: string;
  };
  linkedPaymentProfiles?: Array<any>;
  alertDetailsListTO?: {
    alertDetailsList?: Array<any>;
  };
  counterPartyTransactionHistoryList?: Array<any>;
  auditTrails?: Array<any>;
  [key: string]: any;
}

export interface ApiBeneficiaryItem {
  entityKey: number;
  counterPartyName: string;
  accountNumber: string;
  branchSortCode: string;
  bankName: string;
  bicSwiftCode: string;
  paymentCategory?: string;
  authoriseStatus: string;
  referenceIDX?: string;
  insClassification?: string;
  currency?: string;
  paymentProfiles?: string;
  [key: string]: any;
}

export interface BeneficiariesResponse {
  beneficiaryDetailPerfList: ApiBeneficiaryItem[];
  lastPage: boolean;
  pageCount: number;
  postition: number;
  pageSize: number;
  rowCount: number;
}

export const BENEFICIARY_SORT_COLUMN_MAP: Record<string, string> = {
  accountDetails: 'BeneficiaryName',
  bankName: 'beneficiaryBankName',
  bicSwiftCode: 'bicSwiftCode',
  paymentCategory: 'insClassification',
  status: 'authoriseStatus',
};

export interface BeneficiariesQueryParams {
  pageSize?: number;
  position?: number; 
  sortBy?: string;
  asc?: string; 
  counterPartyName?: string;
  accountNumber?: string;
  referenceIDX?: string;
  paymentCategory?: string;
  statusCode?: string;
  searchText?: string;
}

export async function getBeneficiaries(params?: BeneficiariesQueryParams): Promise<BeneficiariesResponse> {
  const queryParams = new URLSearchParams();
  const pageSize = params?.pageSize || 10;
  const position = params?.position || 0;
  
  queryParams.append('pageSize', pageSize.toString());
  queryParams.append('position', position.toString());

  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  
  if (params?.asc !== undefined) {
    queryParams.append('asc', params.asc);
  }

  if (params?.counterPartyName) {
    queryParams.append('counterPartyName', params.counterPartyName);
  }
  if (params?.accountNumber) {
    queryParams.append('accountNumber', params.accountNumber);
  }
  if (params?.referenceIDX) {
    queryParams.append('referenceIDX', params.referenceIDX);
  }
  if (params?.paymentCategory) {
    queryParams.append('paymentCategory', params.paymentCategory);
  }
  if (params?.statusCode) {
    queryParams.append('statusCode', params.statusCode);
  }
  if (params?.searchText) {
    queryParams.append('searchText', params.searchText);
  }
  
  const url = `${API_ROUTES.BENEFICIARIES}?${queryParams.toString()}`;
  const response = await get<BeneficiariesResponse>(url);
  return response;
}

export async function getBeneficiaryById(id: string): Promise<BeneficiaryListItem> {
  return get<BeneficiaryListItem>(`${API_ROUTES.BENEFICIARIES}/${id}`);
}

export async function findBeneficiaryById(entityKey: number | string): Promise<BeneficiaryDetailTO> {
  const url = `${API_ROUTES.BENEFICIARIES}/${entityKey}`;
  const response = await get<BeneficiaryDetailTO>(url);
  return response;
}

export async function createBeneficiary(data: Partial<BeneficiaryListItem>): Promise<BeneficiaryListItem> {
  return post<BeneficiaryListItem>(API_ROUTES.BENEFICIARIES, data);
}

export async function updateBeneficiary(data: any): Promise<any> {
  return put<any>(API_ROUTES.BENEFICIARIES, data);
}

export async function deleteBeneficiary(id: string): Promise<void> {
  return del<void>(`${API_ROUTES.BENEFICIARIES}/${id}`);
}

export async function deleteBeneficiaries(simplifiedPayloads: Array<any>): Promise<any> {
  return del<any>(API_ROUTES.BENEFICIARIES, { data: simplifiedPayloads });
}

export async function getBeneficiaryPaymentProfiles(): Promise<any> {
  return get<any>(API_ROUTES.BENEFICIARIES_PAYMENT_PROFILES);
}

export async function getBeneficiaryAccountTypes({swiftBICCode}: { swiftBICCode?: string }): Promise<any> {
  const queryParams = swiftBICCode ? `?swiftBICCode=${swiftBICCode}` : '';
  return get<any>(`${API_ROUTES.BENEFICIARIES_ACCOUNT_TYPES}${queryParams}`);
}

export async function auditBeneficiaries(data: { entityKeys: number[] }): Promise<any> {
  return post<any>(API_ROUTES.BENEFICIARIES_AUDIT, data);
}

export async function authoriseBeneficiaries(data: { entityKeys: number[]; action?: string }): Promise<any> {
  return post<any>(API_ROUTES.BENEFICIARIES_AUTHORISE, data);
}

export async function beneficiaryAction(
  key: string | number,
  action: string,
  data?: any
): Promise<any> {
  return post<any>(API_ROUTES.BENEFICIARIES_ACTION(key, action), data);
}

export async function getBatchDetailsAVS(params?: any): Promise<any> {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  return get<any>(`${API_ROUTES.BENEFICIARIES_BATCH_DETAILS_AVS}${queryParams}`);
}

export async function uploadBeneficiaries(data: FormData): Promise<any> {
  return post<any>(API_ROUTES.BENEFICIARIES_UPLOAD, data);
}

export async function getActiveFileMapperTemplates(): Promise<any> {
  return get<any>(API_ROUTES.BENEFICIARIES_ACTIVE_TEMPLATES);
}

export async function printBeneficiaries(data: {
  beneficiaryKeys?: number[];
  sortOrderAsc?: string;
  benType?: string;
}): Promise<string> {
  return get<string>(API_ROUTES.BENEFICIARIES_PRINT, {
    params: data
  });
}

export async function exportBeneficiaries(data: {
  details?: Array<{
    key?: string;
    referenceIDX?: string;
    bicSwiftCode?: string;
    accountType?: string;
    paymentProfile?: string;
  }>;
  standardFormat?: boolean;
  beneficiaryType?: string;
  fileType?: string;
  asc?: boolean;
  selectedFields?: Array<string>;
}): Promise<string> {
  return post<string>(API_ROUTES.BENEFICIARIES_EXPORT, data, {
    responseType: 'text' as any
  });
}

export async function searchBillers(params: {
  searchTerm?: string;
  [key: string]: any;
}): Promise<any> {
  const queryParams = `?${new URLSearchParams(params).toString()}`;
  return get<any>(`${API_ROUTES.BENEFICIARIES_BILLERS}${queryParams}`);
}

export async function getBillerByBillerId(params: { billerId: string }): Promise<any> {
  const queryParams = `?${new URLSearchParams(params).toString()}`;
  return get<any>(`${API_ROUTES.BENEFICIARIES_BILLERS_BY_ID}${queryParams}`);
}

export async function printPaymentHistory(params: {
  beneficiaryKey: number | string;
  ascOrder: boolean;
}): Promise<string> {
  const queryParams = new URLSearchParams();
  queryParams.append('beneficiaryKey', params.beneficiaryKey.toString());
  queryParams.append('ascOrder', params.ascOrder.toString());
  queryParams.append('noCache', crypto.randomUUID());
  
  const url = `${API_ROUTES.BENEFICIARIES_PRINT_HISTORY}?${queryParams.toString()}`;
  return get<string>(url);
}

export async function printAuditTrail(params: {
  beneficiaryKey: number | string;
  ascOrder: boolean;
}): Promise<string> {
  const queryParams = new URLSearchParams();
  queryParams.append('ascOrder', params.ascOrder.toString());
  queryParams.append('noCache', crypto.randomUUID());
  
  const url = `${API_ROUTES.BENEFICIARIES_AUDIT_TRAIL_PRINT}/${params.beneficiaryKey}?${queryParams.toString()}`;
  return get<string>(url);
}

export async function exportAuditTrailHistory(params: {
  beneficiaryKey: number | string;
  exportFormat: 'csv' | 'txt';
  ascOrder: boolean;
}): Promise<string> {
  const queryParams = new URLSearchParams();
  queryParams.append('beneficiaryKey', params.beneficiaryKey.toString());
  queryParams.append('exportFormat', params.exportFormat);
  queryParams.append('ascOrder', params.ascOrder.toString());
  queryParams.append('noCache', crypto.randomUUID());
  
  const url = `${API_ROUTES.BENEFICIARIES_EXPORT_HISTORY}?${queryParams.toString()}`;
  return get<string>(url);
}

export async function getCountries(): Promise<any[]> {
  return await get<any[]>(API_ROUTES.COUNTRIES);
}

export async function getPaymentTypes(): Promise<any[]> {
  return await get<any[]>(API_ROUTES.PAYMENT_TYPES);
}

export async function getCurrencies(): Promise<any[]> {
  return await get<any[]>(API_ROUTES.CURRENCIES);
}