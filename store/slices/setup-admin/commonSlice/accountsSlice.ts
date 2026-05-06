import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAccountList } from '@lib/api/transferTypesApi';
import { TransferTypeAccount } from 'types/api/transfer-types.res';

export interface FetchAccountsParams {
  agreementKey: string;
  accountType: string;
}

export interface AccountsState {
  data: TransferTypeAccount[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  data: [],
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk<
  TransferTypeAccount[],
  FetchAccountsParams,
  { rejectValue: string }
>(
  'accounts/fetchAccounts',
  async ({ agreementKey, accountType }, { rejectWithValue }) => {
    try {
      const response = await getAccountList(agreementKey, accountType);
      return response.accountsList;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while fetching accounts');
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    resetAccounts() {
      return initialState;
    },
    clearAccountsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<TransferTypeAccount[]>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload ?? 'Failed to fetch accounts';
      });
  },
});

export const { resetAccounts, clearAccountsError } = accountsSlice.actions;

export default accountsSlice.reducer;
