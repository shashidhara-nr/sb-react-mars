import { get } from './httpClient';

// ==================== Currency Holidays ====================

export interface CurrencyHolidayItem {
  countryCode: string;
  currencyCode: string;
  holidayDate: string | number;
  dayOfWeek: string;
  description: string;
}

export interface CurrencyHolidayListResponse {
  list?: CurrencyHolidayItem[];
  totalRowCount?: number;
  rowCount?: number;
  total?: number;
}

export interface GetCurrencyHolidaysParams {
  currencyCode?: string;
  countryCode?: string;
  search?: string;
  dayOfWeek?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  len?: number;
  offset?: number;
}

export async function getCurrencyHolidaysList(
  params: GetCurrencyHolidaysParams
): Promise<CurrencyHolidayListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.currencyCode) queryParams.append('currencyCode', params.currencyCode);
  if (params.countryCode) queryParams.append('countryCode', params.countryCode);
  if (params.search) queryParams.append('search', params.search);
  if (params.dayOfWeek) queryParams.append('dayOfWeek', params.dayOfWeek);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
  if (params.len) queryParams.append('len', params.len.toString());
  if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
  
  const url = `/bolapi/admin/v2/currencyholidays?${queryParams.toString()}`;
  return await get<CurrencyHolidayListResponse>(url);
}

export interface CurrencySummary {
  currencyCodes?: string[];
  list?: { currencyCode: string }[];
}

export async function getCurrencyHolidaySummary(): Promise<CurrencySummary> {
  return await get<CurrencySummary>('/bolapi/admin/v2/currencyholidays/summary');
}

// ==================== Country Holidays ====================

export interface BusinessCalendarDetail {
  date: number;
  dayOfTheWeek: string;
  description: string;
  entityKey: number;
  version: number;
  action: string | null;
  holiday: boolean;
}

export interface BusinessCalendarItem {
  businessCalendarName: string;
  entityKey: number;
  version: number;
  lastUpdatedDateAndTime: number;
  countryCode: string;
  dapPermission: boolean;
  businessCalendarDetail: BusinessCalendarDetail[];
}

export interface CountryHolidayItem {
  countryName: string;
  date: number | string;
  dayOfWeek: string;
  holidayNameDescription: string;
  entityKey?: number;
}

export interface CountryHolidayListResponse {
  list?: BusinessCalendarItem[];
  totalRowCount?: number;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface GetCountryHolidaysParams {
  countryCode: string;
  fromDate: number;
  holidayDescription?: string;
  dayOfWeek?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  len?: number;
  offset?: number;
}

export async function getCountryHolidaysList(
  params: GetCountryHolidaysParams
): Promise<CountryHolidayListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.countryCode) queryParams.append('countryCode', params.countryCode);
  if (params.fromDate !== undefined) queryParams.append('fromDate', params.fromDate.toString());
  if (params.holidayDescription) queryParams.append('holidayDescription', params.holidayDescription);
  if (params.dayOfWeek) queryParams.append('dayOfWeek', params.dayOfWeek);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.len) queryParams.append('len', params.len.toString());
  if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
  
  const url = `/bolapi/admin/v2/businesscalendars?${queryParams.toString()}`;
  return await get<CountryHolidayListResponse>(url);
}

export interface CountrySummary {
  countryCodes?: string[];
  list?: { countryCode: string; countryName: string }[];
}

export async function getCountryHolidaysSummary(): Promise<CountrySummary> {
  // Fetch all countries with countriesOnly=true parameter
  // This returns the list with only countryCode and countryName
  return await get<CountrySummary>('/admin/v1/businesscalendars?countriesOnly=true');
}
