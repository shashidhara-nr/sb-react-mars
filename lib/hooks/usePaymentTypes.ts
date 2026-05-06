import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchPaymentTypes,
  selectPaymentTypes,
  selectPaymentTypesError,
  selectPaymentTypesLoading,
} from '../../store/slices/paymentTypesSlice';
import type { PaymentTypeApiItem } from '../api/paymentTypesApi';

export type PaymentTypeStatusValue = 'Active' | 'Awaiting Approval' | 'Draft';
export type PaymentTypeStatusColor = 'success' | 'warning' | 'default';

export interface PaymentTypeListRow {
  id: string;
  paymentTypeKey: number;
  paymentTypeName: string;
  authorisationProfile: string;
  customerAgreement: string;
  numberOfAccounts: number;
  payAlerts: 'Yes' | 'No';
  status: { value: PaymentTypeStatusValue; color: PaymentTypeStatusColor };
  links: { href: string; text: string };
}

function mapStatus(item: PaymentTypeApiItem): { value: PaymentTypeStatusValue; color: PaymentTypeStatusColor } {
  const display = (item.displayStatus || '').trim();
  if (display === 'Active') return { value: 'Active', color: 'success' };
  if (display === 'Awaiting Approval') return { value: 'Awaiting Approval', color: 'warning' };
  if (display === 'Draft') return { value: 'Draft', color: 'default' };

  const authorise = (item.authoriseStatus || '').toUpperCase();
  const statusCode = (item.statusCode || '').toUpperCase();

  // Best-effort mapping based on typical backend conventions.
  if (authorise === 'ACT') return { value: 'Active', color: 'success' };
  if (statusCode === 'D' || authorise === 'DRF' || authorise === 'DRAFT') return { value: 'Draft', color: 'default' };
  if (statusCode === 'N' || authorise === 'PEN' || authorise === 'PENDING' || authorise === 'AWT') {
    return { value: 'Awaiting Approval', color: 'warning' };
  }

  return { value: 'Active', color: 'success' };
}

function mapItemToRow(item: PaymentTypeApiItem): PaymentTypeListRow {
  const status = mapStatus(item);

  return {
    id: String(item.paymentTypeKey),
    paymentTypeKey: item.paymentTypeKey,
    paymentTypeName: item.paymentTypeName || '',
    authorisationProfile: item.authorisationProfileName || '',
    customerAgreement: item.serviceAgreementName || '',
    numberOfAccounts: Number(item.numberOfAccounts || 0),
    payAlerts: item.payAlertAllowed ? 'Yes' : 'No',
    status,
    links: { href: '#', text: 'managePaymentType' },
  };
}

export interface UsePaymentTypesOptions {
  autoFetch?: boolean;
}

export interface UsePaymentTypesReturn {
  items: PaymentTypeApiItem[];
  rows: PaymentTypeListRow[];
  isLoading: boolean;
  error: string | null;
  fetch: () => void;
}

export function usePaymentTypes(options: UsePaymentTypesOptions = {}): UsePaymentTypesReturn {
  const { autoFetch = false } = options;

  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => selectPaymentTypes(state));
  const isLoading = useAppSelector((state) => selectPaymentTypesLoading(state));
  const error = useAppSelector((state) => selectPaymentTypesError(state));

  const fetch = useCallback(() => {
    dispatch(fetchPaymentTypes());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  const rows = useMemo(() => (items || []).map(mapItemToRow), [items]);

  return { items, rows, isLoading, error, fetch };
}
