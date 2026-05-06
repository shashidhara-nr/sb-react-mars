import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCollectionHistory, CollectionHistoryFilters } from '@lib/api/collectionApi';

interface CollectionHistoryState {
  collectionHistories: any[];
  loading: boolean;
  error: string | null;
  debtorCode: string;
  filters: CollectionHistoryFilters;
  pageSize: 5 | 15 | 30 | 50 | 100;
  rowCount: number;
}

const initialState: CollectionHistoryState = {
  collectionHistories: [],
  loading: false,
  error: null,
  debtorCode: '',
  filters: {},
  pageSize: 15,
  rowCount: 0,
};

export const fetchCollectionHistory = createAsyncThunk(
  'collectionHistory/fetch',
  async (params: { debtorCode: string; position?: number; pageSize?: number; filters?: CollectionHistoryFilters }, { rejectWithValue }) => {
    try {
      const response = await getCollectionHistory(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collection history');
    }
  }
);

const collectionHistorySlice = createSlice({
  name: 'collectionHistory',
  initialState,
  reducers: {
    setDebtorInfo: (state, action: PayloadAction<{ debtorCode: string; debtorName: string }>) => {
      state.debtorCode = action.payload.debtorCode;
    },
    setFilters: (state, action: PayloadAction<Partial<CollectionHistoryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollectionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.collectionHistories = action.payload.collectionHistories || [];
        state.rowCount = action.payload.rowCount || 0;
        state.pageSize = action.payload.pageSize || 15;
      })
      .addCase(fetchCollectionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setDebtorInfo, setFilters, clearFilters } = collectionHistorySlice.actions;
export type { CollectionHistoryFilters };
export default collectionHistorySlice.reducer;
