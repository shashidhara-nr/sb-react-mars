import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PaymentCategory = 'Domestic' | 'International' | 'Company';
export type BeneficiaryStatus =
  | 'ACT'
  | 'ACA'
  | 'ACI'
  | 'ACR'
  | 'PCA'
  | 'ABA'
  | 'ABI'
  | 'ABR'
  | 'PBA'
  | 'INACTIVE';

export interface BeneficiaryFilters {
  counterPartyName: string;
  accountNumber: string;
  referenceIDX: string;
  paymentCategory: PaymentCategory | '';
  statusCode: BeneficiaryStatus | '';
}

interface BeneficiaryFiltersState {
  filters: BeneficiaryFilters;
  searchType: string;
  searchValue: string;
}

const initialState: BeneficiaryFiltersState = {
  filters: {
    counterPartyName: '',
    accountNumber: '',
    referenceIDX: '',
    paymentCategory: '',
    statusCode: '',
  },
  searchType: '',
  searchValue: '',
};

const beneficiaryFiltersSlice = createSlice({
  name: 'beneficiaryFilters',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ key: keyof BeneficiaryFilters; value: any }>) => {
      (state.filters as any)[action.payload.key] = action.payload.value;
    },
    setFilters: (state, action: PayloadAction<Partial<BeneficiaryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchType: (state, action: PayloadAction<string>) => {
      state.searchType = action.payload;
    },
    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
    },
    clearFilters: (state) => {
      // Only clear dialog filters, preserve search fields
      state.filters.paymentCategory = '';
      state.filters.statusCode = '';
    },
    clearSearch: (state) => {
      state.searchType = '';
      state.searchValue = '';
      state.filters.counterPartyName = '';
      state.filters.accountNumber = '';
      state.filters.referenceIDX = '';
    },
    resetAll: () => initialState,
  },
});

export const {
  setFilter,
  setFilters,
  setSearchType,
  setSearchValue,
  clearFilters,
  clearSearch,
  resetAll,
} = beneficiaryFiltersSlice.actions;

export default beneficiaryFiltersSlice.reducer;
