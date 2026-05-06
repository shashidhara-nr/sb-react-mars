import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import type { AppDispatch, RootState } from 'store';
import type { FilterValues } from 'components/molecules/NonTransactionalFilterDialog';
import type { NonTransactionalAuthRuleRow } from 'lib/mock/mockNonTransactionalAuthRules';
import {
  clearNonTransactionalAuthRulesFiltersAndSearch,
  fetchNonTransactionalAuthRules,
  setNonTransactionalAuthRulesFilters,
  setNonTransactionalAuthRulesSearchText,
  type NonTransactionalAuthRulesFilters,
} from 'store/slices/nonTransactionalAuthRulesSlice';

export interface UseNonTransactionalAuthRulesResult {
  items: NonTransactionalAuthRuleRow[];
  filteredRows: NonTransactionalAuthRuleRow[];
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

export const useNonTransactionalAuthRules = (): UseNonTransactionalAuthRulesResult => {
  const dispatch = useAppDispatch();
  const { items, filters, searchText, loading, error } = useAppSelector(
    (state) => state.nonTransactionalAuthRules,
  );

  // Load non-transactional auth rules on first use.
  useEffect(() => {
    dispatch(fetchNonTransactionalAuthRules());
  }, [dispatch]);

  const filteredRows: NonTransactionalAuthRuleRow[] = useMemo(() => {
    const searchLower = searchText.trim().toLowerCase();
    const nameFilter = (filters.predefinedAuthRuleName ?? '').trim().toLowerCase();

    return items.filter((row) => {
      if (nameFilter && !row.predefinedAuthRule?.toLowerCase().includes(nameFilter)) {
        return false;
      }

      if (
        searchLower &&
        !(
          row.predefinedAuthRule?.toLowerCase().includes(searchLower) ||
          row.predefinedAuthRuleDescription?.toLowerCase().includes(searchLower)
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

  const updateFilters = useCallback(
    (next: Partial<FilterValues>) => {
      dispatch(setNonTransactionalAuthRulesFilters(next as NonTransactionalAuthRulesFilters));
    },
    [dispatch],
  );

  const updateSearchText = useCallback(
    (value: string) => {
      dispatch(setNonTransactionalAuthRulesSearchText(value));
    },
    [dispatch],
  );

  const clearFiltersAndSearch = useCallback(() => {
    dispatch(clearNonTransactionalAuthRulesFiltersAndSearch());
  }, [dispatch]);

  const reload = useCallback(() => {
    dispatch(fetchNonTransactionalAuthRules());
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

export default useNonTransactionalAuthRules;
