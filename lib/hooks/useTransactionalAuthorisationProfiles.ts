import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import type { RootState, AppDispatch } from '../../store';
import type { TransactionalAuthorisationProfileRow } from 'lib/mock/mockTransactionalAuthorisationProfiles';
import type { FilterValues } from 'components/molecules/FilterTransactionalAuthorisationProfileDrawer/FilterTransactionalAuthorisationProfileDrawer';
import {
  fetchTransactionalAuthorisationProfiles,
  setTransactionalAuthorisationProfileFilters,
  setTransactionalAuthorisationProfileSearchText,
  clearTransactionalAuthorisationProfileFiltersAndSearch,
  TransactionalAuthorisationProfileFilters,
} from '../../store/slices/transactionalAuthorisationProfilesSlice';

export interface UseTransactionalAuthorisationProfilesResult {
  items: TransactionalAuthorisationProfileRow[];
  filteredRows: TransactionalAuthorisationProfileRow[];
  filters: Partial<FilterValues>;
  searchText: string;
  hasFiltersOrSearch: boolean;
  loading: boolean;
  error: string | null;
  updateFilters: (next: Partial<FilterValues>) => void;
  updateSearchText: (value: string) => void;
  clearFiltersAndSearch: () => void;
  reload: () => void;
}

export const useTransactionalAuthorisationProfiles = (): UseTransactionalAuthorisationProfilesResult => {
  const dispatch = useAppDispatch();
  const { items, filters, searchText, loading, error } = useAppSelector(
    (state) => state.transactionalAuthorisationProfiles,
  );

  // Load transactional authorisation profiles on first use.
  useEffect(() => {
    dispatch(fetchTransactionalAuthorisationProfiles());
  }, [dispatch]);

  const filteredRows: TransactionalAuthorisationProfileRow[] = useMemo(() => {
    const searchLower = searchText.trim().toLowerCase();

    return items.filter((row) => {
      if (
        filters.authorisationProfileName &&
        !(
          row.authorisationProfileName.name &&
          row.authorisationProfileName.name
            .toLowerCase()
            .includes(filters.authorisationProfileName.toLowerCase())
        )
      ) {
        return false;
      }

      if (
        filters.currency &&
        !(row.currency && row.currency.toLowerCase().includes(filters.currency.toLowerCase()))
      ) {
        return false;
      }

      if (filters.status && row.status.value !== filters.status) {
        return false;
      }

      if (
        searchLower &&
        !(
          row.authorisationProfileName.name &&
          row.authorisationProfileName.name.toLowerCase().includes(searchLower)
        )
      ) {
        return false;
      }

      return true;
    });
  }, [items, filters, searchText]);

  const hasFiltersOrSearch = useMemo(
    () =>
      Object.entries(filters).some(([, value]) => String(value ?? '').trim().length > 0) ||
      searchText.trim().length > 0,
    [filters, searchText],
  );

  const updateFilters = useCallback((next: Partial<FilterValues>) => {
    dispatch(setTransactionalAuthorisationProfileFilters(next as TransactionalAuthorisationProfileFilters));
  }, [dispatch]);

  const updateSearchText = useCallback((value: string) => {
    dispatch(setTransactionalAuthorisationProfileSearchText(value));
  }, [dispatch]);

  const clearFiltersAndSearch = useCallback(() => {
    dispatch(clearTransactionalAuthorisationProfileFiltersAndSearch());
  }, [dispatch]);

  const reload = useCallback(() => {
    dispatch(fetchTransactionalAuthorisationProfiles());
  }, [dispatch]);

  return {
    items,
    filteredRows,
    filters,
    searchText,
    hasFiltersOrSearch,
    loading,
    error,
    updateFilters,
    updateSearchText,
    clearFiltersAndSearch,
    reload,
  };
};

export default useTransactionalAuthorisationProfiles;
