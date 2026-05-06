import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { UserDetailsPayload } from 'types/userDetails';

export const userDetails = createAsyncThunk(
  'userDetails/userDetails',
  async (payload: UserDetailsPayload, { rejectWithValue }) => {
    try {
      const response = await post(API_ROUTES.CREATE_BENEFICIARY, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create beneficiary');
    }
  },
);

export interface UserDetailsState {
  details: UserDetailsPayload;
}

const initialState: UserDetailsState = {
  details: {
    userId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    identificationType: '',
    identificationNumber: '',
    language: '',
    gender: '',
    addressDetails: {
      postCode: '',
      addressLine1: '',
      addressLine2: '',
      townCity: '',
      regionName: '',
      country: '',
    },
    postalAddressCheck: false,
    postalAddressDetails: {
      postCode: '',
      addressLine1: '',
      addressLine2: '',
      townCity: '',
      regionName: '',
      country: '',
    },
    phoneEmailDetails: {
      mobilePhoneNumber: '',
      mobileCommunicationPermissions: '',
      homePhoneNumber: '',
      homeCommunicationPermissions: '',
      emailAddress: '',
      emailCommunicationPermissions: '',
    },
  },
};

export const setBeneficiaryField = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {},
}).actions;

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    updateMobileCommunicationPermissions(state, action) {
      state.details.phoneEmailDetails.mobileCommunicationPermissions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userDetails.pending, (state) => {
        // Optionally set loading state
      })
      .addCase(userDetails.fulfilled, (state, action) => {
        // Optionally handle success
      })
      .addCase(userDetails.rejected, (state, action) => {
        // Optionally handle error
      });
  },
});

export default userDetailsSlice.reducer;
export const { updateMobileCommunicationPermissions } = userDetailsSlice.actions;