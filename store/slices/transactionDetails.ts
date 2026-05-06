import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { transactionDetailsPayload } from 'types/transactionDetails';

export const transactionDetails = createAsyncThunk('transactionDetails/transactionDetails',
  async (payload: transactionDetailsPayload, { rejectWithValue }) => {
    try {
      const response = await post(API_ROUTES.CREATE_BENEFICIARY, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create beneficiary');
    }
  }
);

export interface TransactionDetailsState {
  /** Draft / form state */
  details: Partial<transactionDetailsPayload>;
}

const initialState: TransactionDetailsState = {
  details: {
    transaction: {
      paymentType: '',
      batchID: '',
      amount: '',
      currency: '',
      dateCreated: '',
      customerBatchReference: '',
      status: '',
      submissionMechanism: '',
    },
    instructionDetails: {
      instructionId: '',
      valueDateCreated: '',
      numberOfInstructions: '',
      status: '',
      serviceLevel: '',
      chargesPaidBy: '',
      submissionMechanism: '',
      fundingOptions: '',
    },
    payFrom: {
      accountNumber: '',
      debitAmount: '',
      transferCurrency: '',
      iban: '',
      debitReference: '',
    },
    paymentSchedule: {
      singleFirstPaymentDate: '',
      repeatPatternOptional: '',
    },
  },
};

const transactionDetailsSlice = createSlice({
  name: 'transactionDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
      builder
        .addCase(transactionDetails.pending, (state) => {
          // Optionally set loading state
        })
        .addCase(transactionDetails.fulfilled, (state, action) => {
          // Optionally handle success
        })
        .addCase(transactionDetails.rejected, (state, action) => {
          // Optionally handle error
        })
    },
});

export default transactionDetailsSlice.reducer;
