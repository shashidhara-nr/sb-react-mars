import { get } from './httpClient';
import { API_ROUTES } from '../utils/apiRoute';

export interface CollectionHistoryFilters {
  collectionId?: string;
  currency?: string;
  status?: string;
  amountFrom?: string;
  amountTo?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface CollectionHistoryQueryParams {
  debtorCode: string;
  position?: number;
  pageSize?: number;
  filters?: CollectionHistoryFilters;
}

export const getCollectionHistory = async (params: CollectionHistoryQueryParams) => {
  const { debtorCode, position = 0, pageSize = 15, filters } = params;
  
  const queryParams: Record<string, string> = {
    counterPartyReferenceIDX: debtorCode,
    position: position.toString(),
    pageSize: pageSize.toString(),
  };

  if (filters) {
    if (filters.collectionId) queryParams.collectionId = filters.collectionId;
    if (filters.currency) queryParams.currency = filters.currency;
    if (filters.status) queryParams.status = filters.status;
    if (filters.amountFrom) queryParams.amountFrom = filters.amountFrom;
    if (filters.amountTo) queryParams.amountTo = filters.amountTo;
    if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
    if (filters.dateTo) queryParams.dateTo = filters.dateTo;
  }

  const searchParams = new URLSearchParams(queryParams);
  const response = await get<any>(
    `${API_ROUTES.COLLECTION_HISTORY}?${searchParams.toString()}`
  );

  return response;
};

interface PrintCollectionHistoryParams {
  debtorCode: string;
  filters?: CollectionHistoryFilters;
  ascOrder?: boolean;
}

export const printCollectionHistory = async (params: PrintCollectionHistoryParams): Promise<Blob> => {
  const { debtorCode, filters, ascOrder = true } = params;
  
  const queryParams: Record<string, string> = {
    counterPartyReferenceIDX: debtorCode,
    ascOrder: ascOrder.toString(),
  };

  if (filters) {
    if (filters.collectionId) queryParams.collectionId = filters.collectionId;
    if (filters.currency) queryParams.currency = filters.currency;
    if (filters.status) queryParams.status = filters.status;
    if (filters.amountFrom) queryParams.amountFrom = filters.amountFrom;
    if (filters.amountTo) queryParams.amountTo = filters.amountTo;
    if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
    if (filters.dateTo) queryParams.dateTo = filters.dateTo;
  }

  const searchParams = new URLSearchParams(queryParams);
  const url = `${API_ROUTES.COLLECTION_HISTORY}/print?${searchParams.toString()}`;

  return get<Blob>(url, {
    responseType: 'blob'
  }, {
    'Accept': 'application/pdf, application/octet-stream, */*'
  });
};
