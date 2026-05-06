import { API_ROUTES,TRANSFER_API_COLLECTION } from "@lib/utils/apiRoute";
import { del, get, post, put } from './httpClient';
import { Agreement, TransferTypeListItem } from "types/redux/transferTypes";
import {
  TransferTypeAccountListResponse,
  TransferTypeAccount, 
  TransferTypeAgreementListResponse, 
  AuthorizationProfile, 
  AuthorisationProfileListResponse,
  CreateTransferTypeRequest,
  CreateTransferTypeResponse,
  TransferTypeGetDetailsResponse,
  UpdateTransferTypeRequest,
  DeleteTransferTypeRequest
} from "types/api/transfer-types.res";
interface TransferTypeListObject {
    transferTypeList?: TransferTypeListItem[];
    [key : string]: any;
}

interface agreementListObject {
    agreements?: Agreement[];
    [key : string]: any;
}

export interface TransferTypeListApiResponse {
    agreementListTO?: agreementListObject;
    transferTypeList?: TransferTypeListObject;
    [key : string]: any;
}

export async function getTransferTypesList(): Promise<{agreements?: Agreement[]; transferTypes: TransferTypeListItem[]}> {
  const url = `${API_ROUTES.TRANSFER_TYPES}`;
  const data = await get<TransferTypeListApiResponse>(url);
  return {
    agreements: data?.agreementListTO?.agreements ?? [] as Agreement[],
    transferTypes: data.transferTypeList?.transferTypeList ?? [] as TransferTypeListItem[],
  };
}

export async function getAccountList(agreementKey: string, accountType: string): Promise<{ accountsList: TransferTypeAccount[] }> {
  const url = `${TRANSFER_API_COLLECTION.ACCOUNTS}?agreementKey=${agreementKey}&accountType=${accountType}`;
  const data = await get<TransferTypeAccountListResponse>(url);
  return {
    accountsList: data.accounts ?? [] as TransferTypeAccount[],
  };
}

export async function getAgreementList(service: string): Promise<{ agreementsList: Agreement[] }> {
  const url = `${TRANSFER_API_COLLECTION.CUSTOMER_AGREEMENTS}?bankingService=${service}`;
  const data = await get<TransferTypeAgreementListResponse>(url);
  return {
    agreementsList: data.agreements ?? [] as Agreement[],
  };
}
export async function getAuthorisationProfileList(): Promise<{ authProfileList: AuthorizationProfile[] }> {
  const url = `${TRANSFER_API_COLLECTION.AUTH_PROFILE}`;
  const data = await get<AuthorisationProfileListResponse>(url);
  return {
    authProfileList: data.authProfiles ?? [] as AuthorizationProfile[],
  };
}

export async function createTransferType(payload: CreateTransferTypeRequest): Promise<CreateTransferTypeResponse> {
  const url = `${TRANSFER_API_COLLECTION.ADD}`;
  const data = await post<CreateTransferTypeResponse>(url, payload);
  return data;
}

export async function getTransferTypeById(transferTypeKey: number): Promise<TransferTypeGetDetailsResponse> {
  const url = TRANSFER_API_COLLECTION.GET_BY_ID(transferTypeKey);
  const data = await get<TransferTypeGetDetailsResponse>(url);
  return data;
}
export async function updateTransferType(transferTypeKey: number, payload: UpdateTransferTypeRequest): Promise<CreateTransferTypeResponse> {
  const url = TRANSFER_API_COLLECTION.UPDATE(transferTypeKey);
  const data = await put<CreateTransferTypeResponse>(url, payload);
  return data;
}


export async function deleteTransferTypes(payload: DeleteTransferTypeRequest): Promise<unknown> {
  const url = TRANSFER_API_COLLECTION.DELETE;
  const data = await del<unknown>(url, { data: payload });
  return data;
}

