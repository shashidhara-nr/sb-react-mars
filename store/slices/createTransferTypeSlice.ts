import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TransferTypeFormState } from 'components/molecules/TransferTypeForm';
import { FileUploadOptionsState } from 'components/molecules/FileUploadOption';
import { StatementReferencingState } from 'components/molecules/StatementReferencingOptions/StatementReferencingOptions';
import { HostToHostOptionsState } from 'components/molecules/HostToHostOptions/HostToHostOptions';
import { CollectionModelState } from 'components/molecules/CollectionModelOptions/CollectionModelOptions';
import { createTransferType } from '@lib/api/transferTypesApi';
import type { CreateTransferTypeRequest, CreateTransferTypeResponse } from 'types/api/transfer-types.res';

export interface CreateTransferTypeState {
  form: TransferTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  collectionModel: CollectionModelState;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  createdTransferTypeKey: number | null;
}

const initialState: CreateTransferTypeState = {
  form: {
    transferTypeName: '',
    authorisationProfile: '',
    enforceAuditing: false,
    payerCustomerAgreement: '',
    payerAccount: '',
    paymentCustomerAgreement: '',
    paymentAccount: '',
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
      selected: false,
      references: [],
      editableReference: false,
    },
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
  isSubmitting: false,
  submitError: null,
  submitSuccess: false,
  createdTransferTypeKey: null,
};

export const submitTransferType = createAsyncThunk<
  CreateTransferTypeResponse,
  void,
  { rejectValue: string; state: { createTransferType: CreateTransferTypeState } }
>(
  'createTransferType/submit',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const formData = state.createTransferType.form;

      const payload: CreateTransferTypeRequest = {
        name: formData.transferTypeName,
        agreementKey: parseInt(formData.payerCustomerAgreement),
        authProfileKey: parseInt(formData.authorisationProfile),
        accountKeys: [formData.payerAccount],
        creditAccountKeys: [formData.paymentAccount],
        requiresInterimAudit: formData.enforceAuditing ?? false,
      };

      const response = await createTransferType(payload);

      return response;
    } catch (error: any) {
      console.error('Error creating transfer type:', error);
      return rejectWithValue(error?.message ?? 'Failed to create transfer type');
    }
  }
);

const createTransferTypeSlice = createSlice({
  name: 'createTransferType',
  initialState,
  reducers: {
    saveForm(state, action: PayloadAction<TransferTypeFormState>) {
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
    resetCreateTransferType() {
      return initialState;
    },
    clearSubmitStatus(state) {
      state.submitError = null;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTransferType.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitTransferType.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        state.submitError = null;
        state.createdTransferTypeKey = action.payload.transferTypeKey;
      })
      .addCase(submitTransferType.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = false;
        state.submitError = action.payload ?? 'An error occurred';
      });
  },
});

export const {
  saveForm,
  saveFileUploadOptions,
  saveStatementReferencing,
  saveHostToHostOptions,
  saveCollectionModel,
  resetCreateTransferType,
  clearSubmitStatus,
} = createTransferTypeSlice.actions;

export default createTransferTypeSlice.reducer;
