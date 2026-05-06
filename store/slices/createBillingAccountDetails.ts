import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateBillingAccountPayload } from 'types/billingAccountDetails';

interface CreateBillingAccountDetailsState {
  create: CreateBillingAccountPayload;
}

const initialState: CreateBillingAccountDetailsState = {
  create: {
    billingAccount: '',
    billingAddBankAccounts: [
      {
        accountName: '',
        accountNumber: '',
        branchSortCode: '',
        bicSwift: '',
        currency: '',
        countryRegion: ''
      }
    ],
    billingAccountType: ''
  },
};

const createBillingAccountDetailsSlice = createSlice({
  name: 'createBillingAccountDetails',
  initialState,
  reducers: {
    updateBillingAccountsDetails(state, action: PayloadAction<{ field: string; value: any }>) {
      const { field, value } = action.payload;
      (state.create as any)[field] = value;
    }
  }
});

export const { updateBillingAccountsDetails } = createBillingAccountDetailsSlice.actions;
export default createBillingAccountDetailsSlice.reducer;
