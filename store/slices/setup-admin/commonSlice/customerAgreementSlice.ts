import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAgreementList } from '@lib/api/transferTypesApi';
import { Agreement as ReduxAgreement } from 'types/redux/transferTypes';

export interface FetchCustomerAgreementParams {
  service: string;
}

export interface TransformedAgreement {
  id: string;
  label: string;
}

export interface CustomerAgreementState {
  data: TransformedAgreement[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerAgreementState = {
  data: [],
  isLoading: false,
  error: null,
};

export const fetchCustomerAgreement = createAsyncThunk<
  TransformedAgreement[],
  FetchCustomerAgreementParams,
  { rejectValue: string }
>(
  'customerAgreement/fetchCustomerAgreement',
  async ({ service }, { rejectWithValue }) => {
    try {
      const response = await getAgreementList(service);
      const transformed: TransformedAgreement[] = response.agreementsList.map((agreement: ReduxAgreement) => ({
        id: agreement.agreementKey.toString(),
        label: agreement.agreementName,
      }));
      return transformed;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred while fetching customer agreements');
    }
  }
);

const customerAgreementSlice = createSlice({
  name: 'customerAgreement',
  initialState,
  reducers: {
    resetCustomerAgreement() {
      return initialState;
    },
    clearCustomerAgreementError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerAgreement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerAgreement.fulfilled, (state, action: PayloadAction<TransformedAgreement[]>) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerAgreement.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.payload ?? 'Failed to fetch customer agreements';
      });
  },
});

export const { resetCustomerAgreement, clearCustomerAgreementError } = customerAgreementSlice.actions;

export default customerAgreementSlice.reducer;
