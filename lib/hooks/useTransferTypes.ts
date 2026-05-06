import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { AppDispatch } from 'store';
import {
  fetchTransferTypes,
  setFilters,
  setSearchText,
  setSelectedRows,
  clearFiltersAndSearch,
  deleteTransferTypesThunk,
} from '../../store/slices/setup-admin/transferTypes/transferTypesSlice';

import {
  selectTransferTypesData,
  selectFilteredData,
  selectFilters,
  selectSearchText,
  selectSelectedRows,
  selectIsLoading,
  selectIsError,
  selectError,
  selectHasFiltersOrSearch,
  selectSelectedRowIds,
} from '../../store/slices/setup-admin/transferTypes/transferTypesSelectors';

import { TransferType, TransferTypeFilters } from 'types/redux/transferTypes';

export interface UseTransferTypesOptions {
  autoFetch?: boolean;
}

export interface UseTransferTypesReturn {
  // Data
  data: TransferType[];
  filteredData: TransferType[];
  filters: TransferTypeFilters;
  searchText: string;
  selectedRows: TransferType[];
  
  // State
  isLoading?: boolean;
  isError?: boolean;
  error?: string | null;
  hasFiltersOrSearch: boolean;
  
  // Computed
  getFilteredByStatus: (statusFilter?: string) => TransferType[];
  selectedRowIds: string[];
  
  // Actions
  fetchData: () => void;
  applyFilters: (filters: TransferTypeFilters) => void;
  updateSearchText: (text: string) => void;
  selectRows: (rows: TransferType[]) => void;
  clearAllFilters: () => void;
  deleteSelected: (rows: TransferType[]) => void;
  
}

export const useTransferTypes = (
  options: UseTransferTypesOptions = {}
): UseTransferTypesReturn => {
  const { autoFetch = false } = options;
  const dispatch = useAppDispatch();

  // Selectors
  const filteredData = useAppSelector(selectFilteredData);
  const data = useAppSelector(selectTransferTypesData);
  const filters = useAppSelector(selectFilters);
  const searchText = useAppSelector(selectSearchText);
  const selectedRows = useAppSelector(selectSelectedRows);
  const isLoading = useAppSelector(selectIsLoading);
  const isError = useAppSelector(selectIsError);
  const error = useAppSelector(selectError);
  const hasFiltersOrSearch = useAppSelector(selectHasFiltersOrSearch);
  const selectedRowIds = useAppSelector(selectSelectedRowIds);

  // Memoized function to get filtered data by status
  const getFilteredByStatus = useCallback(
    (statusFilter?: string) => {
      if (!statusFilter) return filteredData;
      return filteredData.filter((row: { status: { value: string; }; }) => row.status.value === statusFilter);
    },
    [filteredData]
  );

  // Actions
  const fetchData = useCallback(() => {
    dispatch(fetchTransferTypes());
  }, [dispatch]);

  const applyFilters = useCallback(
    (filterValues: TransferTypeFilters) => {
      dispatch(setFilters(filterValues));
    },
    [dispatch]
  );

  const updateSearchText = useCallback(
    (text: string) => {
      dispatch(setSearchText(text));
    },
    [dispatch]
  );

  const selectRows = useCallback(
    (rows: TransferType[]) => {
      dispatch(setSelectedRows(rows));
    },
    [dispatch]
  );

  const clearAllFilters = useCallback(() => {
    dispatch(clearFiltersAndSearch());
  }, [dispatch]);

  const deleteSelected = useCallback(
    (rows: TransferType[]) => {
      const payload = rows.map(row => {
        const basePayload: any = {
          transferTypeKey: row.transferTypeKey ?? Number(row.id),
          name: row.transferTypeName,
        };
        
        // Include versionNumber if it exists (required for individual deletes)
        if (row.versionNumber !== undefined && row.versionNumber !== null) {
          basePayload.versionNumber = row.versionNumber;
        }
        
        return basePayload;
      });
      dispatch(deleteTransferTypesThunk(payload));
    },
    [dispatch]
  );


  // Auto-fetch data on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    // Data
    data,
    filteredData,
    filters,
    searchText,
    selectedRows,
    
    // State
    isLoading,
    isError,
    error,
    hasFiltersOrSearch,
    
    // Computed
    getFilteredByStatus,
    selectedRowIds,
    
    // Actions
    fetchData,
    applyFilters,
    updateSearchText,
    selectRows,
    clearAllFilters,
    deleteSelected,
  
  };
};
