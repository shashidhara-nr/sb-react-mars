import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { CompanyDetailsPayload } from 'types/companyDetails';

export const companyDetails = createAsyncThunk('companyDetails/companyDetails',async (payload: CompanyDetailsPayload, { rejectWithValue }) => {
  try {
    const response = await post(API_ROUTES.CREATE_BENEFICIARY, payload);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create beneficiary');
  }
});

export interface CompanyDetailsState {
  details: CompanyDetailsPayload;
}

const initialState: CompanyDetailsState = {
  details: {
    companyName: '',
    companyId: '',
    companyRegistrationNumber: '',
    referenceCurrency: '',
    companyTaxNumber: '',
    companyVatNumber: '',
    systemId: '',
    operationsMode: '',
    companyAddress: {
      postCode: '',
      addressLine1: '',
      addressLine2: '',
      townCity: '',
      regionName: '',
      country: ''
    },
    companyPostalAddress: {
      postCode: '',
      addressLine1: '',
      addressLine2: '',
      townCity: '',
      regionName: '',
      country: ''
    },
    companyCommunicationInformation: {
      principlePointOfContact: '',
      jobTitle: '',
      mobilePhoneNumber: '',
      workPhoneNumber: '',
      emailAddress: ''
    },
    passwordRenewalSchedule: {
      passwordRenewalRequired: false,
      passwordExpiryDate: ''
    }
  }
};

export const setBeneficiaryField = createSlice({
  name: 'companyDetails',
  initialState,
  reducers: {},
}).actions;


const companyDetailsSlice = createSlice({
  name: 'companyDetails',
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(companyDetails.pending, (state) => {
        // Optionally set loading state
      })
      .addCase(companyDetails.fulfilled, (state, action) => {
        // Optionally handle success
      })
      .addCase(companyDetails.rejected, (state, action) => {
        // Optionally handle error
      })
  },
});

export default companyDetailsSlice.reducer;
