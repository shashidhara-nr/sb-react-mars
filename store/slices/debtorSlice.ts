import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UploadDebtorsResponse } from '@lib/api/debtorApi';

interface DebtorState {
  uploadResult: UploadDebtorsResponse | null;
  selectedCollectionTypes: string[];
  isUploading: boolean;
  uploadError: string | null;
  uploadedFileName: string | null;
}

const initialState: DebtorState = {
  uploadResult: null,
  selectedCollectionTypes: [],
  isUploading: false,
  uploadError: null,
  uploadedFileName: null,
};

const debtorSlice = createSlice({
  name: 'debtor',
  initialState,
  reducers: {
    setUploadedDebtors(state, action: PayloadAction<UploadDebtorsResponse>) {
      state.uploadResult = action.payload;
      state.uploadError = null;
    },
    setCollectionTypes(state, action: PayloadAction<string[]>) {
      state.selectedCollectionTypes = action.payload;
    },
    setUploading(state, action: PayloadAction<boolean>) {
      state.isUploading = action.payload;
    },
    setUploadError(state, action: PayloadAction<string>) {
      state.uploadError = action.payload;
      state.isUploading = false;
    },
    setUploadedFileName(state, action: PayloadAction<string>) {
      state.uploadedFileName = action.payload;
    },
    clearUpload(state) {
      state.uploadResult = null;
      state.selectedCollectionTypes = [];
      state.uploadError = null;
      state.isUploading = false;
      state.uploadedFileName = null;
    },
  },
});

export const {
  setUploadedDebtors,
  setCollectionTypes,
  setUploading,
  setUploadError,
  setUploadedFileName,
  clearUpload,
} = debtorSlice.actions;

export default debtorSlice.reducer;
