import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CollectionTypeFormState } from 'components/molecules/CollectionTypeForm/CollectionTypeForm';
import { updateCollectionType as updateCollectionTypeApi, CreateCollectionTypeResponse } from '@lib/api/collectionTypesApi';
import { CollectionTypePayload } from '@lib/transformers/collectionTypesTransformers';
import { FileUploadOptionsState } from 'components/molecules/FileUploadOption';
import { StatementReferencingState } from 'components/molecules/StatementReferencingOptions/StatementReferencingOptions';
import { HostToHostOptionsState } from 'components/molecules/HostToHostOptions/HostToHostOptions';
import { CollectionModelState } from 'components/molecules/CollectionModelOptions/CollectionModelOptions';

export interface ManageCollectionTypeState {
  form: CollectionTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  collectionModel: CollectionModelState;
  customerAgreement: {
    agreementId: string;
    agreementName: string;
    selectedAccountId: string;
  };
  loaded: boolean;
}

const initialState: ManageCollectionTypeState = {
  form: {
    name: '[Collection type name]',
    authorisationProfile: 'authorisation profile 4',
    allowAdHoc: true,
    hostToHostDefault: false,
    currency: 'ZAR',
    adHocLimit: 'ZAR X,XXX,XXX.XX',
    enforceAuditing: true,
    auditReportType: 'full',
  },
  fileUploadOptions: {
    errorRejection: 'rejectBatch',
    cutoffBreach: 'rejectBatch',
    posting: 'consolidated',
    allowEditingAfterUpload: false,
  },
  statementReferencing: {
   
    creditItemised: {
      selected: true,
      references: ['[Statement ref. 1]', '[Statement ref. 2]', '[Statement ref. 3]', '[Statement ref. 4]'],
      editableReference: true,
    },
    creditConsolidated: {
      selected: true,
      references: ['[Statement ref. 1]', '[Statement ref. 2]', '[Statement ref. 3]', '[Statement ref. 4]'],
      editableReference: true,
    },
    debitItemised: {
      selected: true,
      references: ['[Statement ref. 1]', '[Statement ref. 2]', '[Statement ref. 3]', '[Statement ref. 4]'],
      editableReference: true,
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
  customerAgreement: {
    agreementId: 'a1',
    agreementName: '',
    selectedAccountId: 'current',
  },
  loaded: false,
};

export const updateCollectionType = createAsyncThunk<
  CreateCollectionTypeResponse,
  CollectionTypePayload,
  { rejectValue: string }
>(
  'manageCollectionType/updateCollectionType',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await updateCollectionTypeApi(payload);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while updating collection type');
    }
  }
);

const manageCollectionTypeSlice = createSlice({
  name: 'manageCollectionType',
  initialState,
  reducers: {
    loadCollectionType(state, action: PayloadAction<Partial<ManageCollectionTypeState>>) {
      return {
        ...state,
        ...action.payload,
        loaded: true,
      };
    },
    updateForm(state, action: PayloadAction<CollectionTypeFormState>) {
      state.form = action.payload;
    },
    updateFileUploadOptions(state, action: PayloadAction<FileUploadOptionsState>) {
      state.fileUploadOptions = action.payload;
    },
    updateStatementReferencing(state, action: PayloadAction<StatementReferencingState>) {
      state.statementReferencing = action.payload;
    },
    updateHostToHostOptions(state, action: PayloadAction<HostToHostOptionsState>) {
      state.hostToHostOptions = action.payload;
    },
    updateCollectionModel(state, action: PayloadAction<CollectionModelState>) {
      state.collectionModel = action.payload;
    },
    updateCustomerAgreement(state, action: PayloadAction<{ agreementId: string; agreementName: string; selectedAccountId: string }>) {
      state.customerAgreement = action.payload;
    },
    resetManageCollectionType() {
      return initialState;
    },
  },
});

export const {
  loadCollectionType,
  updateForm,
  updateFileUploadOptions,
  updateStatementReferencing,
  updateHostToHostOptions,
  updateCollectionModel,
  updateCustomerAgreement,
  resetManageCollectionType,
} = manageCollectionTypeSlice.actions;

export default manageCollectionTypeSlice.reducer;
