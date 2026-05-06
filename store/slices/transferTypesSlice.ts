import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockTransferTypes } from 'lib/mock/mockTransferTypes';
import {
  TransferType,
  TransferTypeFilters,
  TransferTypesState,
} from 'types/redux/transferTypes';

const initialState: TransferTypesState = {
  data: mockTransferTypes as TransferType[],
  filteredData: mockTransferTypes as TransferType[],
  agreements: [],
  filters: {},
  searchText: '',
  selectedRows: [],
  loading: false,
  error: null,
};

const transferTypesSlice = createSlice({
  name: 'transferTypes',
  initialState,
  reducers: {
    setTransferTypes(state, action: PayloadAction<TransferType[]>) {
      state.data = action.payload;
      state.filteredData = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setFilters(state, action: PayloadAction<TransferTypeFilters>) {
      state.filters = action.payload;
      applyFiltersAndSearch(state);
    },
    setSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
      applyFiltersAndSearch(state);
    },
    setSelectedRows(state, action: PayloadAction<TransferType[]>) {
      state.selectedRows = action.payload;
    },
    addSelectedRow(state, action: PayloadAction<TransferType>) {
      state.selectedRows.push(action.payload);
    },
    removeSelectedRow(state, action: PayloadAction<string>) {
      state.selectedRows = state.selectedRows.filter(
        (row) => row.id !== action.payload
      );
    },
    clearFiltersAndSearch(state) {
      state.filters = {};
      state.searchText = '';
      state.filteredData = state.data;
    },
    deleteTransferTypes(state, action: PayloadAction<string[]>) {
      state.data = state.data.filter((item) => !action.payload.includes(item.id!));
      state.selectedRows = [];
      applyFiltersAndSearch(state);
    },
    resetTransferTypes() {
      return initialState;
    },
  },
});

function applyFiltersAndSearch(state: TransferTypesState) {
  const searchLower = state.searchText.trim().toLowerCase();
  state.filteredData = state.data.filter((row: TransferType) => {
    if (
      state.filters.transferTypeName &&
      !row.transferTypeName
        .toLowerCase()
        .includes(state.filters.transferTypeName.toLowerCase())
    ) {
      return false;
    }
    if (
      state.filters.authorisationProfile &&
      !row.authorisationProfile
        .toLowerCase()
        .includes(state.filters.authorisationProfile.toLowerCase())
    ) {
      return false;
    }
    if (
      state.filters.customerAgreement &&
      !row.customerAgreement
        .toLowerCase()
        .includes(state.filters.customerAgreement.toLowerCase())
    ) {
      return false;
    }
    if (
      state.filters.numberOfAccounts &&
      state.filters.numberOfAccounts !== ''
    ) {
      const filterValue = state.filters.numberOfAccounts;
      if (
        !(
          (filterValue === '>3' && row.numberOfAccounts > 3) ||
          row.numberOfAccounts.toString() === filterValue.toString()
        )
      ) {
        return false;
      }
    }
    if (
      state.filters.status &&
      state.filters.status !== '' &&
      row.status.value !== state.filters.status
    ) {
      return false;
    }
    if (
      searchLower &&
      !(
        row.transferTypeName.toLowerCase().includes(searchLower) ||
        row.authorisationProfile.toLowerCase().includes(searchLower)
      )
    ) {
      return false;
    }
    return true;
  });
}

export const {
  setTransferTypes,
  setLoading,
  setError,
  setFilters,
  setSearchText,
  setSelectedRows,
  addSelectedRow,
  removeSelectedRow,
  clearFiltersAndSearch,
  deleteTransferTypes,
  resetTransferTypes,
} = transferTypesSlice.actions;

export default transferTypesSlice.reducer;
