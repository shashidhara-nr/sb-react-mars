import { PAYMENT_API_COLLECTION } from '@lib/utils/apiRoute';
import { get, post, put, del } from './httpClient';
import {
  PaymentTypeAccountResponse,
  PaymentTypeAccount,
  CreatePaymentTypeRequest,
  CreatePaymentTypeResponse,
  UpdatePaymentTypeRequest,
  PaymentTypeGetDetails,
  UnPaidProcessingOptionsResponse,
  UnPaidProcessingOption,
} from 'types/api/payment-types.res';

export type RestIssueLog = {
  issues?: Array<{
    message?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
} | null;

export interface PaymentTypeApiItem {
  paymentTypeKey: number;
  paymentTypeName: string;
  authorisationProfileName: string | null;
  serviceAgreementName: string | null;
  numberOfAccounts: number;
  statusCode: string | null;
  displayStatus: string | null;
  requiresInterimAudit: boolean;
  authoriseStatus: string | null;
  defaultCustomerHostToHost: boolean;
  payAlertAllowed: boolean;
  earlyClearingValidationAllowed: boolean;
  allowAdhocCounterParty: boolean;
  adhocCounterPartyLimit: number | null;
  adhocCounterPartyCurrency: string | null;
  hideBeneficiaryEnabled: boolean;
  consolidatedBatchIndicator: boolean;
  consolidatedInstrxnIndicator: boolean;
  itemizedBatchIndicator: boolean;
  itemizedInstrxnIndicator: boolean;
  [key: string]: unknown;
}

export interface PaymentTypesListResponse {
  restIssueLog: RestIssueLog;
  paymentTypes: PaymentTypeApiItem[];
}

export async function getPaymentTypesList(): Promise<PaymentTypesListResponse> {
  return get<PaymentTypesListResponse>(PAYMENT_API_COLLECTION.LIST);
}

export async function getAccountList(agreementKey: string): Promise<{ accountsList: PaymentTypeAccount[] }> {
  const url = `${PAYMENT_API_COLLECTION.ACCOUNTS}?agreementKey=${agreementKey}`;
  const data = await get<PaymentTypeAccountResponse>(url);
  return {
    accountsList: data.accounts ?? [],
  };
}


export async function createPaymentType(payload: CreatePaymentTypeRequest): Promise<CreatePaymentTypeResponse> {
  const url = PAYMENT_API_COLLECTION.CREATE;
  const data = await post<CreatePaymentTypeResponse>(url, payload);
  return data;
}

export async function updatePaymentType(
  paymentTypeKey: number,
  payload: UpdatePaymentTypeRequest
): Promise<CreatePaymentTypeResponse> {
  const url = `${PAYMENT_API_COLLECTION.LIST}/${paymentTypeKey}`;
  const data = await put<CreatePaymentTypeResponse>(url, payload);
  return data;
}

export async function getPaymentTypeDetails(paymentTypeKey: number): Promise<PaymentTypeGetDetails> {
  const url = `${PAYMENT_API_COLLECTION.LIST}/${paymentTypeKey}`;
  const data = await get<PaymentTypeGetDetails>(url);
  return data;
}

export async function getUnpaidProcessingOptions(): Promise<UnPaidProcessingOption[]> {
  const url = PAYMENT_API_COLLECTION.UNPAIDOPTION;
  const data = await get<UnPaidProcessingOptionsResponse>(url);
  const options = data.unpaidProcessingOptions;
  return options;
}

export type PaymentTypeDeleteRequestItem = {
  paymentTypeKey: number;
  name: string;
};

export async function deletePaymentTypesMulti(payload: PaymentTypeDeleteRequestItem[]): Promise<unknown> {
  return del(PAYMENT_API_COLLECTION.MULTI_DELETE, { data: payload } as any);
}