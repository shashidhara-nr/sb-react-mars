import { ApiDebtorItem, getDebtors } from '@lib/api/debtorApi';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CollectionFilters {
  debtorName: string;
  debtorCode: string;
}

interface CollectionState {
  debtors: any[];
  loading: boolean;
  error: string | null;
  filters: CollectionFilters;
  pageCount: number;
  position: number;
  pageSize: 5 | 15 | 30 | 50 | 100;
  rowCount: number;
  sortBy: string;
  sortAsc: boolean;
}

const initialState: CollectionState = {
  debtors: [],
  loading: false,
  error: null,
  filters: {
    debtorName: '',
    debtorCode: '',
  },
  pageCount: 0,
  position: 0,
  pageSize: 15,
  rowCount: 0,
  sortBy: 'debtorName',
  sortAsc: true,
};

export const fetchDebtors = createAsyncThunk(
  'collection/fetchDebtors',
  async (params: any, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { collection: CollectionState };
      const { filters } = state.collection;

      const sortByMap: Record<string, string> = {
        debtorName: 'counterPartyName',
        debtorCode: 'referenceIDX',
      };
      
      const sortBy = params?.sortBy || state.collection.sortBy;
      const backendSortBy = sortByMap[sortBy] || sortBy;
      
      const queryParams = {
        pageSize: params?.pageSize || state.collection.pageSize,
        position: params?.position || state.collection.position,
        sortBy: backendSortBy,
        asc: params?.asc !== undefined ? params.asc : state.collection.sortAsc,
        counterPartyName: filters.debtorName || '',
        referenceIDX: filters.debtorCode || '',
      };

      const response = await getDebtors(queryParams);
      
      let debtorsList: ApiDebtorItem[] = [];
      if (response.counterPartyList && response.counterPartyList.length > 0) {
        debtorsList = response.counterPartyList;
      } else if (response.debtorDetailTOs && response.debtorDetailTOs.length > 0) {
        debtorsList = response.debtorDetailTOs;
      }
      
      return {
        debtors: debtorsList,
        pageCount: response.pageCount,
        position: response.position,
        pageSize: response.pageSize as (5 | 15 | 30 | 50 | 100),
        rowCount: response.rowCount,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setDebtors(state, action: PayloadAction<any[]>) {
      state.debtors = action.payload;
    },
    updateFilter(state, action: PayloadAction<{ key: keyof CollectionFilters; value: string }>) {
      state.filters[action.payload.key] = action.payload.value;
    },
    clearFilters(state) {
      state.filters = {
        debtorName: '',
        debtorCode: '',
      };
    },
    setSort(state, action: PayloadAction<{ sortBy: string; sortAsc: boolean }>) {
      state.sortBy = action.payload.sortBy;
      state.sortAsc = action.payload.sortAsc;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDebtors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDebtors.fulfilled, (state, action) => {
        state.loading = false;
        state.debtors = action.payload.debtors;
        state.pageCount = action.payload.pageCount;
        state.position = action.payload.position;
        state.pageSize = action.payload.pageSize;
        state.rowCount = action.payload.rowCount;
        state.error = null;
      })
      .addCase(fetchDebtors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setDebtors, updateFilter, clearFilters, setSort } = collectionSlice.actions;

export default collectionSlice.reducer;
