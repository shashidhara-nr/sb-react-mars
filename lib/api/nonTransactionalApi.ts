import { AUDIT_AND_APPROVE_COLLECTION } from '@lib/utils/apiRoute';
import { get, post } from './httpClient';

export interface EventTypeMapResponse {
  eventTypeMap: {
    [key: string]: string;
  };
}

export interface EventTypeOption {
  label: string;
  value: string;
  className?: string;
}

export interface NonTransactionalApiResponse {
  lastPage: boolean;
  pageCount: number;
  postition: number;
  pageSize: number;
  rowCount: number;
  authorisationList: AuthorisationItem[];
  limitExceeded: boolean;
  eventCount: number;
}

export interface AuthorisationItem {
  bankName: string | null;
  customerName: string;
  entityType: string;
  simpleEntityType: string | null;
  eventFunction: string | null;
  auditEventId: number;
  entityName: string;
  userKey: number;
  bankDepKey: number | null;
  userType: string;
  userName: string;
  personName: string | null;
  personId: string;
  personKey: number | null;
  userUnitKey: number;
  userUnitName: string;
  entityKey: number;
  entityBankKey: number | null;
  entityCustomerKey: number;
  targetEntityKey: number;
  action: string;
  date: number;
  canAuthorise: boolean;
  canDecline: boolean;
  declineReason: string | null;
  initiator: boolean;
  hasDAP: boolean;
  authoriseStatus: string;
  noOfActionsReport: number;
  supportTextReport: string | null;
  actionDateReport: string | null;
  customerId: number | null;
  auditRecordListTO: any;
  entityLinkedCustomerKey: number | null;
  actionReport: string | null;
}

export async function getNonTransactionalAuditApproveList(
  eventEntityType: string,
  initiatorUser: string
): Promise<NonTransactionalApiResponse> {
  const url = AUDIT_AND_APPROVE_COLLECTION.LIST(eventEntityType, initiatorUser);
  const response = await get<NonTransactionalApiResponse>(url);
  return response;
}

export async function getEventTypeList(): Promise<EventTypeMapResponse> {
  const url = AUDIT_AND_APPROVE_COLLECTION.EVENTLIST;
  const response = await get<EventTypeMapResponse>(url);
  return response;
}

/**
 * Transform the event type map response into an array of options
 * suitable for dropdown selection
 */
export function transformEventTypesToOptions(eventTypeMap: { [key: string]: string }): EventTypeOption[] {
  return Object.keys(eventTypeMap).map(key => ({
    label: key,
    value: key,
    className: eventTypeMap[key],
  }));
}

// Generic audit operation types and mapping
export type AuditApproveOperation = 
  | 'BENI_AUDIT' 
  | 'BENI_AUTHORISE' 
  | 'DEBITOR_AUDIT' 
  | 'DEBITOR_AUTHORISE' 
  | 'PAYMENT_AUDIT' 
  | 'PAYMENT_AUTHORISE';

const auditApproveOperationEndpoints: Record<AuditApproveOperation, string> = {
  BENI_AUDIT: AUDIT_AND_APPROVE_COLLECTION.BENI_AUDIT,
  BENI_AUTHORISE: AUDIT_AND_APPROVE_COLLECTION.BENI_AUTHORISE,
  DEBITOR_AUDIT: AUDIT_AND_APPROVE_COLLECTION.DEBITOR_AUDIT,
  DEBITOR_AUTHORISE: AUDIT_AND_APPROVE_COLLECTION.DEBITOR_AUTHORISE,
  PAYMENT_AUDIT: AUDIT_AND_APPROVE_COLLECTION.PAYMENT_AUDIT,
  PAYMENT_AUTHORISE: AUDIT_AND_APPROVE_COLLECTION.PAYMENT_AUTHORISE,
};

/**
 * Generic function to perform any audit or authorise operation
 */
export async function performAuditApproveOperation(
  operation: AuditApproveOperation,
  requestBody: { [key: string]: string }
): Promise<any> {
  const url = auditApproveOperationEndpoints[operation];
  return await post<any>(url, requestBody);
}

// Backward-compatible wrapper functions
export async function audit(requestBody: { [key: string]: string }): Promise<any> {
  return performAuditApproveOperation('BENI_AUDIT', requestBody);
}

export async function authorise(requestBody: { [key: string]: string }): Promise<any> {
  return performAuditApproveOperation('BENI_AUTHORISE', requestBody);
}

export async function auditDebtor(requestBody: { [key: string]: string }): Promise<any> {
  return performAuditApproveOperation('DEBITOR_AUDIT', requestBody);
}

export async function authoriseDebtor(requestBody: { [key: string]: string }): Promise<any> {
  return performAuditApproveOperation('DEBITOR_AUTHORISE', requestBody);
}

export async function auditPayment(requestBody: { [key: string]: string }): Promise<any> {
  return performAuditApproveOperation('PAYMENT_AUDIT', requestBody);
}

export async function authorisePayment(requestBody: { [key: string]: string }): Promise<any> {
  return performAuditApproveOperation('PAYMENT_AUTHORISE', requestBody);
}