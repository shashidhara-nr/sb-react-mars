import { API_ROUTES } from '@lib/utils/apiRoute';
import { del, get, post, put } from './httpClient';
import { TransferTypeAccount, TransferTypeAccountListResponse } from 'types/api/transfer-types.res';
import { CollectionTypePayload, transformApiResponseToManageForm, ManageCollectionTypeFormData } from '@lib/transformers/collectionTypesTransformers';

export interface CollectionTypesListItem {
  accountNumber?: number | null;
  sortCode?: string | null;
  accountName?: string | null;
  bic?: string | null;
  currency?: string | null;
  countryCode?: string | null;
  collectionTypeName?: string | null;
  authorisationProfile?: string | null;
  customerAgreementsName?: string | null;
  numberOfAccounts?: number | null;
  status?: string | null;
  statusCode?: string | null;
  collectionTypeKey?: number | null;
  authoriseStatus?: string | null;
  customerAgreementsKey?: number | null;
  defaultCustomerHostToHost?: boolean | null;
  earlyClearingValidation?: boolean | null;
  allowAdhocCounterParty?: boolean | null;
  adhocCounterPartyLimit?: number | null;
  adhocCounterPartyCurrency?: string | null;
}

interface CollectionTypeApiSubList {
  bicCodeforPrint?: string | null;
  collectionTypeList?: CollectionTypesListItem[];
  customerId?: number | null;
  customerName?: string | null;
  customerStatus?: string | null;
  lastPage?: boolean;
  pageCount?: number;
  pageSize?: number;
  postition?: number;
  rowCount?: number;
}

export interface CollectionTypeListApiResponse {
  collectionTypeList: CollectionTypeApiSubList;
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  hasMore?: boolean;
}

export async function getCollectionTypesList(): Promise<CollectionTypeApiSubList> {
  const url = `${API_ROUTES.COLLECTION_TYPES}`;
  const data = await get<CollectionTypeListApiResponse>(url);
  return data.collectionTypeList;
}

export async function getCollectionTypesAccountList(agreementKey: string): Promise<{ accountsList: TransferTypeAccount[] }> {
  const url = `${API_ROUTES.COLLECTION_TYPES_ACCOUNTS}?agreementKey=${agreementKey}`;
  const data = await get<TransferTypeAccountListResponse>(url);
  return {
    accountsList: data.accounts ?? [] as TransferTypeAccount[],
  };
}

interface DeleteCollectionTypeTransferObject {
  collectionTypeKey: number;
}

interface DeleteCollectionTypeResponseItem {
  statusCode: number;
  transferObject: DeleteCollectionTypeTransferObject;
}

export async function deleteCollectionTypes(payload: { collectionTypeKey: string | number; collectionTypeName: string }[]): Promise<number[]> {
  const url = `${API_ROUTES.COLLECTION_TYPES_DELETE}`;
  const data = await del<DeleteCollectionTypeResponseItem[]>(url, { data: payload });
  return data.map(item => item.transferObject.collectionTypeKey);
}

export interface CreateCollectionTypeResponse {
  collectionTypeKey: number;
  collectionTypeName: string;
  agreementKey: number;
  agreementName: string;
  authProfileKey: number;
  authProfileName: string;
  accountKeys: string[];
  authoriseStatus: string;
  endorseStatusCode: string;
  action: string;
  [key: string]: unknown;
}

export async function createCollectionType(payload: CollectionTypePayload): Promise<CreateCollectionTypeResponse> {
  const url = API_ROUTES.COLLECTION_TYPES_CREATE;
  const data = await post<CreateCollectionTypeResponse>(url, payload);
  return data;
}

export async function updateCollectionType(payload: CollectionTypePayload): Promise<CreateCollectionTypeResponse> {
  const url = API_ROUTES.COLLECTION_TYPES_UPDATE;
  const data = await put<CreateCollectionTypeResponse>(url, payload);
  return data;
}

export async function getCollectionTypeById(id: string | number): Promise<ManageCollectionTypeFormData> {
  const url = API_ROUTES.COLLECTION_TYPES_BY_ID(id);
  const data = await get<CollectionTypePayload>(url);
  return transformApiResponseToManageForm(data);
}