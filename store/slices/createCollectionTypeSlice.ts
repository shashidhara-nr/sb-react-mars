import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CollectionTypeFormState } from 'components/molecules/CollectionTypeForm/CollectionTypeForm';
import { FileUploadOptionsState } from 'components/molecules/FileUploadOption';
import { StatementReferencingState } from 'components/molecules/StatementReferencingOptions/StatementReferencingOptions';
import { HostToHostOptionsState } from 'components/molecules/HostToHostOptions/HostToHostOptions';
import { CollectionModelState } from 'components/molecules/CollectionModelOptions/CollectionModelOptions';
import { getCollectionTypesAccountList, createCollectionType as createCollectionTypeApi, CreateCollectionTypeResponse } from '@lib/api/collectionTypesApi';
import { CollectionTypePayload } from '@lib/transformers/collectionTypesTransformers';
import { TransferTypeAccount } from 'types/api/transfer-types.res';

export interface FetchCollectionTypeAccountsParams {
  agreementKey: string;
}

export interface CreateCollectionTypeState {
  form: CollectionTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  collectionModel: CollectionModelState;
  customerAgreementId: string;
  selectedAccountId: string;
  accounts: TransferTypeAccount[];
  accountsLoading: boolean;
  accountsError: string | null;
  creating: boolean;
  createError: string | null;
  createSuccess: boolean;
  createdCollectionType: CreateCollectionTypeResponse | null;
}

const initialState: CreateCollectionTypeState = {
  form: {
    name: '',
    authorisationProfile: null,
    allowAdHoc: false,
    hostToHostDefault: false,
    currency: 'ZAR',
    adHocLimit: '',
    enforceAuditing: false,
    auditReportType: undefined,
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
    creditConsolidated: {
      selected: false,
      references: [],
      editableReference: false,
    },
    debitItemised: {
      selected: true,
      references: ['Statement ref 1', 'Statement ref 2', 'Statement ref 3', 'Statement ref 4'],
      editableReference: false,
    },
    debitConsolidated: {
      selected: false,
      references: [],
      editableReference: false
    }
  },
  hostToHostOptions: {
    batchErrorRejection: 'rejectBatch',
    cutoffBreach: 'rejectBatch',
    allowEditingAfterUpload: false,
    defaultFundingOption: 'Populated',
  },
  collectionModel: {
    countryOrRegion: '',
    fixedDateValue: false,
    upfrontValue: false,
    valueOfSuccess: false,
    defaultSource: 'Host',
  },
  customerAgreementId: '',
  selectedAccountId: '',
  accounts: [],
  accountsLoading: false,
  accountsError: null,
  creating: false,
  createError: null,
  createSuccess: false,
  createdCollectionType: null,
};

export const fetchCollectionTypeAccounts = createAsyncThunk<
  TransferTypeAccount[],
  FetchCollectionTypeAccountsParams,
  { rejectValue: string }
>(
  'createCollectionType/fetchCollectionTypeAccounts',
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

export const createCollectionType = createAsyncThunk<
  CreateCollectionTypeResponse,
  CollectionTypePayload,
  { rejectValue: string }
>(
  'createCollectionType/createCollectionType',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createCollectionTypeApi(payload);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while creating collection type');
    }
  }
);

const createCollectionTypeSlice = createSlice({
  name: 'createCollectionType',
  initialState,
  reducers: {
    saveForm(state, action: PayloadAction<CollectionTypeFormState>) {
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
    saveCollectionModel(state, action: PayloadAction<CollectionModelState>) {
      state.collectionModel = action.payload;
    },
    saveCustomerAgreement(state, action: PayloadAction<{ customerAgreementId: string; selectedAccountId: string }>) {
      state.customerAgreementId = action.payload.customerAgreementId;
      state.selectedAccountId = action.payload.selectedAccountId;
    },
    resetCreateCollectionType() {
      return initialState;
    },
    clearAccountsError(state) {
      state.accountsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollectionTypeAccounts.pending, (state) => {
        state.accountsLoading = true;
        state.accountsError = null;
      })
      .addCase(fetchCollectionTypeAccounts.fulfilled, (state, action: PayloadAction<TransferTypeAccount[]>) => {
        state.accountsLoading = false;
        state.accounts = action.payload;
        state.accountsError = null;
      })
      .addCase(fetchCollectionTypeAccounts.rejected, (state, action) => {
        state.accountsLoading = false;
        state.accounts = [];
        state.accountsError = action.payload ?? 'Failed to fetch collection type accounts';
      })
      .addCase(createCollectionType.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createCollectionType.fulfilled, (state, action: PayloadAction<CreateCollectionTypeResponse>) => {
        state.creating = false;
        state.createdCollectionType = action.payload;
        state.createError = null;
        state.createSuccess = true;
      })
      .addCase(createCollectionType.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload ?? 'Failed to create collection type';
        state.createSuccess = false;
      });
  },
});

export const {
  saveForm,
  saveFileUploadOptions,
  saveStatementReferencing,
  saveHostToHostOptions,
  saveCollectionModel,
  saveCustomerAgreement,
  resetCreateCollectionType,
  clearAccountsError,
} = createCollectionTypeSlice.actions;

export default createCollectionTypeSlice.reducer;
