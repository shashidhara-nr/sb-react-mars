import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BillingAccountDetails } from 'types/billingAccountDetails';

interface BillingAccountDetailsState {
  details: BillingAccountDetails;
}

const initialState: BillingAccountDetailsState = {
  details: {
    id: '',
    accountName: '',
    accountNumber: '',
    branchSortCode: '',
    bicSwift: '',
    currency: '',
    countryRegion: '',
    billingAccountType: '',
  },
};

const billingAccountDetailsSlice = createSlice({
  name: 'billingAccountDetails',
  initialState,
  reducers: {},
});

export default billingAccountDetailsSlice.reducer;
