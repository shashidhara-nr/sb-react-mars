import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../lib/api/httpClient';
import { API_ROUTES } from '../../lib/utils/apiRoute';
import { BeneficiariesState, Beneficiary } from 'types/redux/beneficiaries';

const initialState: BeneficiariesState = {
  data: [],
  loading: false,
  error: null,
};


// Chained thunk for credentials, login, and beneficiaries
export const fetchBeneficiariesWithAuth = createAsyncThunk(
  'beneficiaries/fetchBeneficiariesWithAuth',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.paymentCategory) params.append('paymentCategory', filters.paymentCategory);
      if (filters?.branchSortCode) params.append('branchSortCode', filters.branchSortCode);
      if (filters?.name) params.append('name', filters.name);
      if (filters?.accountNumber) params.append('accountNumber', filters.accountNumber);
      if (filters?.statusCode) params.append('statusCode', filters.statusCode);
      if (filters?.pageSize) params.append('pageSize', filters.pageSize);

      const beneficiariesUrl = `${API_ROUTES.BENEFICIARIES}?${params.toString()}`;
      // Fetch beneficiaries with filters
      const response = await get<Beneficiary[]>(beneficiariesUrl);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch beneficiaries');
    }
  }
);

const beneficiariesSlice = createSlice({
  name: 'beneficiaries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeneficiariesWithAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiariesWithAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBeneficiariesWithAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default beneficiariesSlice.reducer;
