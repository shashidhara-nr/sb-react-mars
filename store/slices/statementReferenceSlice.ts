import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { StatementReferenceResponse } from 'types/api/statement-reference.res';
import { getStatementReferences } from '@lib/api/statementReferenceApi';

export interface StatementReferenceState {
  data: StatementReferenceResponse | null;
  loading: boolean;
  error: string | null;
}

export interface FetchStatementReferencesParams {
  agreementKey: string | number;
  accountKeys: string;
  instrumentClassification: string;
}

export const fetchStatementReferences = createAsyncThunk(
  'statementReference/fetchStatementReferences',
  async (params: FetchStatementReferencesParams, { rejectWithValue }) => {
    try {
      const response = await getStatementReferences(
        params.agreementKey,
        params.accountKeys,
        params.instrumentClassification
      );
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: StatementReferenceState = {
  data: null,
  loading: false,
  error: null,
};

const statementReferenceSlice = createSlice({
  name: 'statementReference',
  initialState,
  reducers: {
    setStatementReference(state, action: PayloadAction<StatementReferenceResponse>) {
      state.data = action.payload;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearStatementReference(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    resetStatementReference() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatementReferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatementReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchStatementReferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const {
  setStatementReference,
  setLoading,
  setError,
  clearStatementReference,
  resetStatementReference,
} = statementReferenceSlice.actions;

export default statementReferenceSlice.reducer;
