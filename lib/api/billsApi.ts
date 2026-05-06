import { API_ROUTES } from '@lib/utils/apiRoute';
import { post } from './httpClient';

// Type definitions for the Bills API
export interface AlertDetail {
  alertId: string;
  alertType: string;
  emailOrNumber: string;
  notify: string;
  alertStatus: string;
  titleAndName: string;
}

export interface AlertDetailsListTO {
  alertDetailsList: AlertDetail[];
}

export interface SubmitBillerRequest {
  billerName: string;
  billerID: string;
  country: string;
  transactionLimit: number;
  transactionLimitCurrency: string;
  authoriseStatus: string;
  status: string;
  billerAction: string;
  repairAction: string;
  declineReason: string | null;
  dynamicLableList: any | null;
  paymentProfileListTO: any | null;
  alertDetailsListTO: AlertDetailsListTO | null;
}

export interface SubmitBillerResponse {
  statusCode?: number;
  message?: string;
  billerKey?: number;
  [key: string]: any;
}

/**
 * Submit a biller for approval
 * @param payload - The biller data to submit
 * @returns Response from the bills API
 */
export async function submitBillerForApproval(
  payload: SubmitBillerRequest
): Promise<SubmitBillerResponse> {
  const data = await post<SubmitBillerResponse>(API_ROUTES.SUBMIT_BILLER, payload);
  return data;
}
