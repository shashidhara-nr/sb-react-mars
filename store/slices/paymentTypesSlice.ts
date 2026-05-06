import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { getPaymentTypesList, getPaymentTypeDetails, updatePaymentType, getUnpaidProcessingOptions, type PaymentTypeApiItem } from '../../lib/api/paymentTypesApi';
import type { PaymentTypeGetDetails, UpdatePaymentTypeRequest, UnPaidProcessingOption } from '../../types/api/payment-types.res';

export interface PaymentTypeFilters {
	paymentTypeName?: string;
	authorisationProfile?: string;
	numberOfAccounts?: string;
	payAlerts?: string;
	status?: string;
}

export interface PaymentTypesState {
	data: PaymentTypeApiItem[];
	loading: boolean;
	error: string | null;
	paymentDetails: PaymentTypeGetDetails | null;
	detailsLoading: boolean;
	detailsError: string | null;
	updateLoading: boolean;
	updateError: string | null;
	unpaidProcessingOptions: UnPaidProcessingOption[];
	unpaidOptionsLoading: boolean;
	unpaidOptionsError: string | null;
	filters: PaymentTypeFilters;
	selectedTab: number;
	searchType: string;
	searchValue: string;
}

const initialState: PaymentTypesState = {
	data: [],
	loading: false,
	error: null,
	paymentDetails: null,
	detailsLoading: false,
	detailsError: null,
	updateLoading: false,
	updateError: null,
	unpaidProcessingOptions: [],
	unpaidOptionsLoading: false,
	unpaidOptionsError: null,
	filters: {},
	selectedTab: 0,
	searchType: '',
	searchValue: '',
};

export const fetchPaymentTypes = createAsyncThunk(
	'paymentTypes/fetchPaymentTypes',
	async (_, { rejectWithValue }) => {
		try {
			const resp = await getPaymentTypesList();
			return Array.isArray(resp?.paymentTypes) ? resp.paymentTypes : [];
		} catch (error: any) {
			return rejectWithValue(error?.message || 'Failed to fetch payment types');
		}
	}
);

export const fetchPaymentTypeDetails = createAsyncThunk(
	'paymentTypes/fetchPaymentTypeDetails',
	async (paymentTypeKey: number, { rejectWithValue }) => {
		try {
			const resp = await getPaymentTypeDetails(paymentTypeKey);
			return resp;
		} catch (error: any) {
			return rejectWithValue(error?.message || 'Failed to fetch payment type details');
		}
	}
);

export const updatePaymentTypeThunk = createAsyncThunk(
	'paymentTypes/updatePaymentType',
	async ({ paymentTypeKey, payload }: { paymentTypeKey: number; payload: UpdatePaymentTypeRequest }, { rejectWithValue }) => {
		try {
			const resp = await updatePaymentType(paymentTypeKey, payload);
			return resp;
		} catch (error: any) {
			return rejectWithValue(error?.message || 'Failed to update payment type');
		}
	}
);

export const fetchUnpaidProcessingOptions = createAsyncThunk(
	'paymentTypes/fetchUnpaidProcessingOptions',
	async (_, { rejectWithValue }) => {
		try {
			const resp = await getUnpaidProcessingOptions();
			return resp;
		} catch (error: any) {
			return rejectWithValue(error?.message || 'Failed to fetch unpaid processing options');
		}
	}
);

const paymentTypesSlice = createSlice({
	name: 'paymentTypes',
	initialState,
	reducers: {
		clearPaymentTypesError(state) {
			state.error = null;
		},
		resetPaymentTypes(state) {
			state.data = [];
			state.loading = false;
			state.error = null;
		},
		clearPaymentDetailsError(state) {
			state.detailsError = null;
		},
		resetPaymentDetails(state) {
			state.paymentDetails = null;
			state.detailsLoading = false;
			state.detailsError = null;
		},
		clearUpdateError(state) {
			state.updateError = null;
		},
		clearUnpaidOptionsError(state) {
			state.unpaidOptionsError = null;
		},
		resetUnpaidOptions(state) {
			state.unpaidProcessingOptions = [];
			state.unpaidOptionsLoading = false;
			state.unpaidOptionsError = null;
		},
		setFilters(state, action) {
			state.filters = action.payload;
		},
		setSelectedTab(state, action) {
			state.selectedTab = action.payload;
		},
		setSearchType(state, action) {
			state.searchType = action.payload;
		},
		setSearchValue(state, action) {
			state.searchValue = action.payload;
		},
		clearFiltersAndSearch(state) {
			state.filters = {};
			state.searchType = '';
			state.searchValue = '';
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPaymentTypes.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPaymentTypes.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload;
			})
			.addCase(fetchPaymentTypes.rejected, (state, action) => {
				state.loading = false;
				state.error = (action.payload as string) || 'Failed to fetch payment types';
			})
			.addCase(fetchPaymentTypeDetails.pending, (state) => {
				state.detailsLoading = true;
				state.detailsError = null;
			})
			.addCase(fetchPaymentTypeDetails.fulfilled, (state, action) => {
				state.detailsLoading = false;
				state.paymentDetails = action.payload;
			})
			.addCase(fetchPaymentTypeDetails.rejected, (state, action) => {
				state.detailsLoading = false;
				state.detailsError = (action.payload as string) || 'Failed to fetch payment type details';
			})
			.addCase(updatePaymentTypeThunk.pending, (state) => {
				state.updateLoading = true;
				state.updateError = null;
			})
			.addCase(updatePaymentTypeThunk.fulfilled, (state, action) => {
				state.updateLoading = false;
				// Optionally update the paymentDetails with the response
				state.paymentDetails = action.payload as any;
			})
			.addCase(updatePaymentTypeThunk.rejected, (state, action) => {
				state.updateLoading = false;
				state.updateError = (action.payload as string) || 'Failed to update payment type';
			})
			.addCase(fetchUnpaidProcessingOptions.pending, (state) => {
				state.unpaidOptionsLoading = true;
				state.unpaidOptionsError = null;
			})
			.addCase(fetchUnpaidProcessingOptions.fulfilled, (state, action) => {
				state.unpaidOptionsLoading = false;
				state.unpaidProcessingOptions = action.payload;
			})
			.addCase(fetchUnpaidProcessingOptions.rejected, (state, action) => {
				state.unpaidOptionsLoading = false;
				state.unpaidOptionsError = (action.payload as string) || 'Failed to fetch unpaid processing options';
			});
	},
});

export const { 
	clearPaymentTypesError, 
	resetPaymentTypes, 
	clearPaymentDetailsError, 
	resetPaymentDetails, 
	clearUpdateError, 
	clearUnpaidOptionsError, 
	resetUnpaidOptions,
	setFilters,
	setSelectedTab,
	setSearchType,
	setSearchValue,
	clearFiltersAndSearch,
} = paymentTypesSlice.actions;

export const selectPaymentTypes = (state: RootState) => state.paymentTypes.data;
export const selectPaymentTypesLoading = (state: RootState) => state.paymentTypes.loading;
export const selectPaymentTypesError = (state: RootState) => state.paymentTypes.error;
export const selectPaymentDetails = (state: RootState) => state.paymentTypes.paymentDetails;
export const selectPaymentDetailsLoading = (state: RootState) => state.paymentTypes.detailsLoading;
export const selectPaymentDetailsError = (state: RootState) => state.paymentTypes.detailsError;
export const selectUpdateLoading = (state: RootState) => state.paymentTypes.updateLoading;
export const selectUpdateError = (state: RootState) => state.paymentTypes.updateError;
export const selectUnpaidProcessingOptions = (state: RootState) => state.paymentTypes.unpaidProcessingOptions;
export const selectUnpaidOptionsLoading = (state: RootState) => state.paymentTypes.unpaidOptionsLoading;
export const selectUnpaidOptionsError = (state: RootState) => state.paymentTypes.unpaidOptionsError;

export default paymentTypesSlice.reducer;
