import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AccountVerificationRequestData {
  creationMethod: string;
  serviceType: string;
  supportingCopy?: string;
  accountNumbers?: string[];
  formData?: any;
  status?: string;
  [key: string]: any;
}

export interface CreateAccountVerificationRequestState {
  verificationRequest: AccountVerificationRequestData;
}

const createInitialVerificationRequest = (): AccountVerificationRequestData => ({
  creationMethod: '',
  serviceType: '',
  supportingCopy: '',
  accountNumbers: [],
});

const initialState: CreateAccountVerificationRequestState = {
  verificationRequest: createInitialVerificationRequest(),
};

const createAccountVerificationRequestSlice = createSlice({
  name: 'createAccountVerificationRequest',
  initialState,
  reducers: {
    updateVerificationRequest: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      state.verificationRequest[field] = value;
    },
    resetVerificationRequest: (state) => {
      state.verificationRequest = createInitialVerificationRequest();
    },
    setVerificationRequest: (state, action: PayloadAction<Partial<AccountVerificationRequestData>>) => {
      state.verificationRequest = {
        ...state.verificationRequest,
        ...action.payload,
      };
    },
  },
});

export const { updateVerificationRequest, resetVerificationRequest, setVerificationRequest } =
  createAccountVerificationRequestSlice.actions;

export default createAccountVerificationRequestSlice.reducer;
