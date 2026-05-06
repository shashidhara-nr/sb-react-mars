import { RootState } from 'store';
import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectTransferTypesState = (state: RootState) => state.transferTypes;

export const selectTransferTypesData = (state: RootState) => state.transferTypes.data;

export const selectFilteredData = (state: RootState) => state.transferTypes.filteredData;

export const selectFilters = (state: RootState) => state.transferTypes.filters;

export const selectSearchText = (state: RootState) => state.transferTypes.searchText;

export const selectSelectedRows = (state: RootState) => state.transferTypes.selectedRows;

export const selectIsLoading = (state: RootState) => state.transferTypes.isLoading;

export const selectIsError = (state: RootState) => state.transferTypes.isError;

export const selectError = (state: RootState) => state.transferTypes.error;

export const selectAgreements = (state: RootState) => state.transferTypes.agreements;

// Memoized selectors
export const selectHasFiltersOrSearch = createSelector(
  [selectFilters, selectSearchText],
  (filters, searchText) => {
    const hasAnyFilterValue = Object.values(filters).some((value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'number') return Number.isFinite(value);
      return String(value).trim().length > 0;
    });

    return hasAnyFilterValue || searchText.trim().length > 0;
  }
);

export const selectFilteredByStatus = createSelector(
  [selectFilteredData, (_state: RootState, statusFilter?: string) => statusFilter],
  (filteredData, statusFilter) => {
    if (!statusFilter) return filteredData;
    return filteredData.filter((row) => row.status.value === statusFilter);
  }
);

export const selectSelectedRowIds = createSelector(
  [selectSelectedRows],
  (selectedRows) => selectedRows.map((row) => row.id!).filter(Boolean)
);
