import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FilterValues } from 'components/molecules/NonTransactionalFilterDialog';
import {
  mockNonTransactionalAuthRules,
  type NonTransactionalAuthRuleRow,
} from 'lib/mock/mockNonTransactionalAuthRules';

export type NonTransactionalAuthRulesFilters = Partial<FilterValues>;

export interface NonTransactionalAuthRulesState {
  items: NonTransactionalAuthRuleRow[];
  loading: boolean;
  error: string | null;
  filters: NonTransactionalAuthRulesFilters;
  searchText: string;
}

const initialState: NonTransactionalAuthRulesState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
  searchText: '',
};

// TODO: Replace mock source with real API call when available.
export const fetchNonTransactionalAuthRules = createAsyncThunk(
  'nonTransactionalAuthRules/fetchNonTransactionalAuthRules',
  async () => {
    return mockNonTransactionalAuthRules as NonTransactionalAuthRuleRow[];
  },
);

const nonTransactionalAuthRulesSlice = createSlice({
  name: 'nonTransactionalAuthRules',
  initialState,
  reducers: {
    setNonTransactionalAuthRulesFilters(
      state,
      action: PayloadAction<NonTransactionalAuthRulesFilters>,
    ) {
      state.filters = action.payload;
    },
    setNonTransactionalAuthRulesSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
    },
    clearNonTransactionalAuthRulesFiltersAndSearch(state) {
      state.filters = {};
      state.searchText = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNonTransactionalAuthRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchNonTransactionalAuthRules.fulfilled,
        (state, action: PayloadAction<NonTransactionalAuthRuleRow[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchNonTransactionalAuthRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load non-transactional authorisation rules';
      });
  },
});

export const {
  setNonTransactionalAuthRulesFilters,
  setNonTransactionalAuthRulesSearchText,
  clearNonTransactionalAuthRulesFiltersAndSearch,
} = nonTransactionalAuthRulesSlice.actions;

export default nonTransactionalAuthRulesSlice.reducer;
