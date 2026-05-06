import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaymentTypeFormState } from 'components/molecules/PaymentTypeForm/PaymentTypeForm';
import { FileUploadOptionsState } from 'components/molecules/FileUploadOption';
import { StatementReferencingState } from 'components/molecules/StatementReferencingOptions/StatementReferencingOptions';
import { HostToHostOptionsState } from 'components/molecules/HostToHostOptions/HostToHostOptions';
import { UnpaidProcessingState } from 'components/molecules/UnpaidProcessingOptions/UnpaidProcessingOptions';
import { getAccountList, createPaymentType as createPaymentTypeApi } from '@lib/api/paymentTypesApi';
import { 
  PaymentTypeAccount, 
  CreatePaymentTypeRequest, 
  CreatePaymentTypeResponse 
} from 'types/api/payment-types.res';

export interface FetchPaymentTypeAccountsParams {
  agreementKey: string;
}
export interface CreatePaymentTypeState {
  form: PaymentTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  unpaidProcessing: UnpaidProcessingState;
  accounts: PaymentTypeAccount[];
  accountsLoading: boolean;
  accountsError: string | null;
  creating: boolean;
  createError: string | null;
  createSuccess: boolean;
  createdPaymentType: CreatePaymentTypeResponse | null;
}

const initialState: CreatePaymentTypeState = {
  form: {
    name: '',
    authorisationProfile: null,
    allowAdHoc: true,
    currency: 'ZAR',
    adHocLimit: '',
    payAlertsAllowed: false,
    hostToHostDefault: false,
  },
  fileUploadOptions: {
    errorRejection: 'rejectBatch',
    cutoffBreach: 'rejectBatch',
    posting: 'consolidated',
    allowEditingAfterUpload: false,
  },
  statementReferencing: {
    creditItemised: {
      selected: false,
      references: [],
      editableReference: false,
    },
    debitItemised: {
      selected: false,
      references: [],
      editableReference: false,
    },
    debitConsolidated: {
      selected: false,
      references: [],
      editableReference: false,
    },
    creditConsolidated: {
      selected: true,
      references: ['Statement ref 1', 'Statement ref 2', 'Statement ref 3', 'Statement ref 4'],
      editableReference: false,
    },
  },
  hostToHostOptions: {
    batchErrorRejection: 'rejectBatch',
    cutoffBreach: 'rejectBatch',
    allowEditingAfterUpload: false,
    defaultFundingOption: 'Populated',
  },
  unpaidProcessing: {
    unpaidOptionName: 'Populated',
    rows: [
      { id: 1, name: '[Unpaid option name]', onUs: 'Itemised', offUs: 'Itemised' },
      { id: 2, name: '[Unpaid option name]', onUs: 'Itemised', offUs: 'Itemised' },
    ],
  },
  accounts: [],
  accountsLoading: false,
  accountsError: null,
  creating: false,
  createError: null,
  createSuccess: false,
  createdPaymentType: null,
};

export const fetchPaymentTypeAccounts = createAsyncThunk<
  PaymentTypeAccount[],
  FetchPaymentTypeAccountsParams,
  { rejectValue: string }
>(
  'createPaymentType/fetchPaymentTypeAccounts',
  async ({ agreementKey }, { rejectWithValue }) => {
    try {
      const response = await getAccountList(agreementKey);
      return response.accountsList;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while fetching payment type accounts');
    }
  }
);

/**
 * Async thunk to create a new Payment Type
 */
export const createPaymentType = createAsyncThunk<
  CreatePaymentTypeResponse,
  CreatePaymentTypeRequest,
  { rejectValue: string }
>(
  'createPaymentType/createPaymentType',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createPaymentTypeApi(payload);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while creating payment type');
    }
  }
);

const createPaymentTypeSlice = createSlice({
  name: 'createPaymentType',
  initialState,
  reducers: {
    saveForm(state, action: PayloadAction<PaymentTypeFormState>) {
      state.form = action.payload;
    },
    saveFileUploadOptions(state, action: PayloadAction<FileUploadOptionsState>) {
      state.fileUploadOptions = action.payload;
    },
    saveStatementReferencing(state, action: PayloadAction<StatementReferencingState>) {
      state.statementReferencing = action.payload;
    },
    saveHostToHostOptions(state, action: PayloadAction<HostToHostOptionsState>) {
      state.hostToHostOptions = action.payload;
    },
    saveUnpaidProcessing(state, action: PayloadAction<UnpaidProcessingState>) {
      state.unpaidProcessing = action.payload;
    },
    resetCreatePaymentType() {
      return initialState;
    },
    clearAccountsError(state) {
      state.accountsError = null;
    },
    clearCreateError(state) {
      state.createError = null;
    },
    resetCreateStatus(state) {
      state.creating = false;
      state.createError = null;
      state.createSuccess = false;
      state.createdPaymentType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment Type Accounts
      .addCase(fetchPaymentTypeAccounts.pending, (state) => {
        state.accountsLoading = true;
        state.accountsError = null;
      })
      .addCase(fetchPaymentTypeAccounts.fulfilled, (state, action: PayloadAction<PaymentTypeAccount[]>) => {
        state.accountsLoading = false;
        state.accounts = action.payload;
        state.accountsError = null;
      })
      .addCase(fetchPaymentTypeAccounts.rejected, (state, action) => {
        state.accountsLoading = false;
        state.accounts = [];
        state.accountsError = action.payload ?? 'Failed to fetch payment type accounts';
      })
      // Create Payment Type
      .addCase(createPaymentType.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createPaymentType.fulfilled, (state, action: PayloadAction<CreatePaymentTypeResponse>) => {
        state.creating = false;
        state.createSuccess = true;
        state.createdPaymentType = action.payload;
        state.createError = null;
      })
      .addCase(createPaymentType.rejected, (state, action) => {
        state.creating = false;
        state.createSuccess = false;
        state.createError = action.payload ?? 'Failed to create payment type';
        state.createdPaymentType = null;
      });
  },
});

export const {
  saveForm,
  saveFileUploadOptions,
  saveStatementReferencing,
  saveHostToHostOptions,
  saveUnpaidProcessing,
  resetCreatePaymentType,
  clearAccountsError,
  clearCreateError,
  resetCreateStatus,
} = createPaymentTypeSlice.actions;

export default createPaymentTypeSlice.reducer;
