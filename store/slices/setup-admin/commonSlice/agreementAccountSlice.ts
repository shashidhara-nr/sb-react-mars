import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAccountList as getTransferTypeAccountList } from '@lib/api/transferTypesApi';
import { getAccountList as getPaymentTypeAccountList } from '@lib/api/paymentTypesApi';
import { getCollectionTypesAccountList } from '@lib/api/collectionTypesApi';
import { TransferTypeAccount } from 'types/api/transfer-types.res';
import { PaymentTypeAccount } from 'types/api/payment-types.res';

export interface FetchAccountsParams {
  agreementKey: string;
  accountType: string;
}

export interface FetchPaymentTypeAccountsParams {
  agreementKey: string;
}

export interface FetchCollectionTypeAccountsParams {
  agreementKey: string;
}

export interface AccountsState {
  data: TransferTypeAccount[];
  accounts: (PaymentTypeAccount | TransferTypeAccount)[];
  accountType: 'payment' | 'collection' | 'transfer' | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  data: [],
  accounts: [],
  accountType: null,
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk<
  TransferTypeAccount[],
  FetchAccountsParams,
  { rejectValue: string }
>(
  'agreementAccount/fetchAccounts',
  async ({ agreementKey, accountType }, { rejectWithValue }) => {
    try {
      const response = await getTransferTypeAccountList(agreementKey, accountType);
      return response.accountsList;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while fetching accounts');
    }
  }
);

export const fetchPaymentTypeAccounts = createAsyncThunk<
  PaymentTypeAccount[],
  FetchPaymentTypeAccountsParams,
  { rejectValue: string }
>(
  'agreementAccount/fetchPaymentTypeAccounts',
  async ({ agreementKey }, { rejectWithValue }) => {
    try {
      const response = await getPaymentTypeAccountList(agreementKey);
      return response.accountsList;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while fetching payment type accounts');
    }
  }
);

export const fetchCollectionTypeAccounts = createAsyncThunk<
  TransferTypeAccount[],
  FetchCollectionTypeAccountsParams,
  { rejectValue: string }
>(
  'agreementAccount/fetchCollectionTypeAccounts',
  async ({ agreementKey }, { rejectWithValue }) => {
    try {
      const response = await getCollectionTypesAccountList(agreementKey);
      return response.accountsList;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while fetching collection type accounts');
    }
  }
);

const agreementAccountSlice = createSlice({
  name: 'agreementAccount',
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
        state.accountType = 'transfer';
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload ?? 'Failed to fetch accounts';
      })
      .addCase(fetchPaymentTypeAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentTypeAccounts.fulfilled, (state, action: PayloadAction<PaymentTypeAccount[]>) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.accountType = 'payment';
        state.error = null;
      })
      .addCase(fetchPaymentTypeAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.accounts = [];
        state.error = action.payload ?? 'Failed to fetch payment type accounts';
      })
      .addCase(fetchCollectionTypeAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCollectionTypeAccounts.fulfilled, (state, action: PayloadAction<TransferTypeAccount[]>) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.accountType = 'collection';
        state.error = null;
      })
      .addCase(fetchCollectionTypeAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.accounts = [];
        state.error = action.payload ?? 'Failed to fetch collection type accounts';
      });
  },
});

export const { resetAccounts, clearAccountsError } = agreementAccountSlice.actions;

export default agreementAccountSlice.reducer;
