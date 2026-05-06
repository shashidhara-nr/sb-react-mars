import { get, post, put } from './httpClient';
import { API_ROUTES } from '../utils/apiRoute';

/**
 * Limit detail object from API response
 */
export interface LimitDetail {
  entityKey: number;
  accountKey: number;
  limitTypeName: string;
  limitType: string;
  limitCurrency: string;
  limitAmount: number;
  limitPeriod: number;
  limitPeriodDays?: number;
  productType: string;
  status: string;
  authoriseStatus: string;
  debtStatus?: { value: string; color?: string };
  version: number;
  canAuthorise: boolean;
  limitAppliedTo: string;
  customerUserName: string;
  links?: { href: string; text: string };
  id?: number;
}

/**
 * Limits API response structure
 */
export interface LimitsListResponse {
  limits: LimitDetail[];
  totalRecords: number;
  pageSize: number;
  position: number;
  totalPages: number;
}

/**
 * Query parameters for fetching limits list
 */
export interface LimitsQueryParams {
  customerKey: number | string; // Required
  pageSize?: number;
  position?: number;
  accountKey?: number;
  limitTypeName?: string;
  limitType?: string;
  limitPeriod?: number;
  productType?: string;
  authoriseStatus?: string;
  limitCurrency?: string;
  sortBy?: string;
  asc?: boolean;
}

/**
 * Fetch limits list with optional filters and pagination
 *
 * @param params - Query parameters including filters, pagination, and sorting (customerKey is required)
 * @returns Promise with limits list response
 *
 * @example
 * // Get all limits for specific customer
 * getLimits({ customerKey: 373731 });
 *
 * @example
 * // Get active limits with pagination
 * getLimits({
 *   customerKey: 373731,
 *   authoriseStatus: 'ACT',
 *   pageSize: 10,
 *   position: 0
 * });
 *
 * @example
 * // Filter and sort
 * getLimits({
 *   customerKey: 373731,
 *   productType: 'Payment',
 *   authoriseStatus: 'ACT',
 *   sortBy: 'limitAmount',
 *   asc: false,
 *   pageSize: 10,
 *   position: 0
 * });
 */
export async function getLimits(params: LimitsQueryParams): Promise<LimitsListResponse> {
  const queryParams = new URLSearchParams();
  
  // Required parameter - must be provided
  const customerKey = params.customerKey;
  if (!customerKey) {
    throw new Error('customerKey is required');
  }
  queryParams.append('customerKey', customerKey.toString());
  
  // Pagination
  const pageSize = params.pageSize || 15;
  const position = params.position || 0;
  queryParams.append('pageSize', pageSize.toString());
  queryParams.append('position', position.toString());
  
  // Optional filters
  if (params.accountKey !== undefined) {
    queryParams.append('accountKey', params.accountKey.toString());
  }
  if (params.limitTypeName) {
    queryParams.append('limitTypeName', params.limitTypeName);
  }
  if (params.limitType) {
    queryParams.append('limitType', params.limitType);
  }
  if (params.limitPeriod !== undefined) {
    queryParams.append('limitPeriod', params.limitPeriod.toString());
  }
  if (params.productType) {
    queryParams.append('productType', params.productType);
  }
  if (params.authoriseStatus) {
    queryParams.append('authoriseStatus', params.authoriseStatus);
  }
  if (params.limitCurrency) {
    queryParams.append('limitCurrency', params.limitCurrency);
  }
  
  // Sorting
  if (params.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params.asc !== undefined) {
    queryParams.append('asc', params.asc.toString());
  }
  
  const url = `${API_ROUTES.LIMITS}?${queryParams.toString()}`;
  const response = await get<LimitsListResponse>(url);
  return response;
}

/**
 * Get main active limits (filtered by authoriseStatus=ACT)
 * This is typically used for the "Active" tab
 *
 * @param customerKey - Customer identifier from login
 * @param pageSize - Optional records per page
 * @param position - Optional zero-based page index
 * @param limitCurrency - Optional currency filter (e.g., 'GBP', 'USD')
 * @param sortBy - Optional sort field
 * @param asc - Optional sort direction (true for ascending, false for descending)
 * @returns Promise with active limits
 */
export async function getActiveLimits(
  customerKey: number | string,
  pageSize: number = 15,
  position: number = 0,
  limitCurrency?: string,
  sortBy?: string,
  asc?: boolean
): Promise<LimitsListResponse> {
  return getLimits({
    customerKey,
    authoriseStatus: 'ACT',
    pageSize,
    position,
    ...(limitCurrency && { limitCurrency }),
    ...(sortBy && { sortBy }),
    ...(asc !== undefined && { asc }),
  });
}

/**
 * Get limits awaiting customer repair (filtered by authoriseStatus=ACR)
 * This is typically used for the "Needs Action" tab
 *
 * @param customerKey - Customer identifier from login
 * @param pageSize - Optional records per page
 * @param position - Optional zero-based page index
 * @param limitCurrency - Optional currency filter (e.g., 'GBP', 'USD')
 * @param sortBy - Optional sort field
 * @param asc - Optional sort direction (true for ascending, false for descending)
 * @returns Promise with limits awaiting repair
 */
export async function getNeedsActionLimits(
  customerKey: number | string,
  pageSize: number = 15,
  position: number = 0,
  limitCurrency?: string,
  sortBy?: string,
  asc?: boolean
): Promise<LimitsListResponse> {
  return getLimits({
    customerKey,
    authoriseStatus: 'ACR',
    pageSize,
    position,
    ...(limitCurrency && { limitCurrency }),
    ...(sortBy && { sortBy }),
    ...(asc !== undefined && { asc }),
  });
}

/**
 * Get limits by specific filters
 * Common usage: filter by product type, currency, status, etc.
 *
 * @param customerKey - Customer identifier from login
 * @param filters - Filter criteria
 * @param pageSize - Records per page
 * @param position - Zero-based page index
 * @returns Promise with filtered limits
 *
 * @example
 * // Get Payment limits in ARS
 * getFilteredLimits(373731, {
 *   productType: 'Payment',
 *   limitCurrency: 'ARS'
 * });
 */
export async function getFilteredLimits(
  customerKey: number | string,
  filters: Partial<LimitsQueryParams> = {},
  pageSize: number = 15,
  position: number = 0
): Promise<LimitsListResponse> {
  return getLimits({
    customerKey,
    pageSize,
    position,
    ...filters,
  });
}

/**
 * Get a specific limit by entityKey
 * Typically used when fetching details for editing or viewing
 *
 * @param entityKey - The unique limit identifier
 * @returns Promise with limit detail
 */
export async function getLimitById(entityKey: number | string): Promise<LimitDetail> {
  const response = await get<LimitDetail>(`${API_ROUTES.LIMITS}/${entityKey}`);
  return response;
}

/**
 * Create a new limit
 * Typically used when adding a new limit from the management form
 *
 * @param limitData - The limit data to create
 * @returns Promise with created limit details
 */
export async function createLimit(limitData: Partial<LimitDetail>): Promise<LimitDetail> {
  const response = await post<LimitDetail>(API_ROUTES.LIMITS, limitData);
  return response;
}

/**
 * Update an existing limit
 * Requires entityKey and version for optimistic locking
 *
 * @param limitData - The limit data to update (must include entityKey and version)
 * @returns Promise with updated limit details
 */
export async function updateLimit(limitData: Partial<LimitDetail>): Promise<LimitDetail> {
  if (!limitData.entityKey) {
    throw new Error('entityKey is required for updating a limit');
  }
  const response = await put<LimitDetail>(API_ROUTES.LIMITS, limitData);
  return response;
}

/**
 * Common authoriseStatus values
 */
export enum LimitAuthoriseStatus {
  ACTIVE = 'ACT',
  AWAITING_CUSTOMER_REPAIR = 'ACR',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

/**
 * Common sortBy fields
 */
export enum LimitSortField {
  LIMIT_TYPE_NAME = 'limitTypeName',
  LIMIT_AMOUNT = 'limitAmount',
  LIMIT_CURRENCY = 'limitCurrency',
  PRODUCT_TYPE = 'productType',
  STATUS = 'status',
  AUTHORISE_STATUS = 'authoriseStatus',
}
