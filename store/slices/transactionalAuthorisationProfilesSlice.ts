import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  mockTransactionalAuthorisationProfiles,
  TransactionalAuthorisationProfileRow,
} from 'lib/mock/mockTransactionalAuthorisationProfiles';
import type { FilterValues } from 'components/molecules/FilterTransactionalAuthorisationProfileDrawer/FilterTransactionalAuthorisationProfileDrawer';

export type TransactionalAuthorisationProfileFilters = Partial<FilterValues>;

export interface TransactionalAuthorisationProfilesState {
  items: TransactionalAuthorisationProfileRow[];
  loading: boolean;
  error: string | null;
  filters: TransactionalAuthorisationProfileFilters;
  searchText: string;
}

const initialState: TransactionalAuthorisationProfilesState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
  searchText: '',
};

// TODO: Replace mock source with real API call when available.
export const fetchTransactionalAuthorisationProfiles = createAsyncThunk(
  'transactionalAuthorisationProfiles/fetchTransactionalAuthorisationProfiles',
  async () => {
    return mockTransactionalAuthorisationProfiles as TransactionalAuthorisationProfileRow[];
  },
);

const transactionalAuthorisationProfilesSlice = createSlice({
  name: 'transactionalAuthorisationProfiles',
  initialState,
  reducers: {
    setTransactionalAuthorisationProfileFilters(
      state,
      action: PayloadAction<TransactionalAuthorisationProfileFilters>,
    ) {
      state.filters = action.payload;
    },
    setTransactionalAuthorisationProfileSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
    },
    clearTransactionalAuthorisationProfileFiltersAndSearch(state) {
      state.filters = {};
      state.searchText = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionalAuthorisationProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactionalAuthorisationProfiles.fulfilled,
        (state, action: PayloadAction<TransactionalAuthorisationProfileRow[]>,
        ) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchTransactionalAuthorisationProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load transactional authorisation profiles';
      });
  },
});

export const {
  setTransactionalAuthorisationProfileFilters,
  setTransactionalAuthorisationProfileSearchText,
  clearTransactionalAuthorisationProfileFiltersAndSearch,
} = transactionalAuthorisationProfilesSlice.actions;

export default transactionalAuthorisationProfilesSlice.reducer;
