import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  TransferType,
  TransferTypeFilters,
  TransferTypesState,
} from 'types/redux/transferTypes';
import { getTransferTypesList, getTransferTypeById, updateTransferType, deleteTransferTypes } from '@lib/api/transferTypesApi';
import { transformTransferTypeResponse, transformTransferTypeDetail } from '@lib/transformers/transferTypesTransformers';
import { UpdateTransferTypeRequest, DeleteTransferTypeRequest } from 'types/api/transfer-types.res';

const initialState: TransferTypesState = {
  data: [],
  filteredData: [],
  agreements: [],
  filters: {},
  searchText: '',
  selectedRows: [],
  isLoading: false,
  isError: false,
  error: null,
  selectedTransferType: null,
  isSelectedLoading: false,
  selectedError: null,
  isUpdating: false,
  updateError: null,
  isDeleting: false,
  deleteError: null,
};

function withMockIds(rows: TransferType[]): TransferType[] {
  return rows.map((row, index) => ({
    ...row,
    id: row.id ?? `${index + 1}`,
  }));
}

// Async thunk to fetch transfer types
export const fetchTransferTypes = createAsyncThunk(
  'transferTypes/fetchTransferTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTransferTypesList();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch transfer types');
    }
  }
);

// Async thunk to fetch a single transfer type by id
export const fetchTransferTypeById = createAsyncThunk(
  'transferTypes/fetchTransferTypeById',
  async (id: string | number, { rejectWithValue }) => {
    try {
      console.log('fetchTransferTypeById called with id:', id);
      const transferTypeKey = typeof id === 'string' ? Number.parseInt(id, 10) : id;
      console.log('Converted transferTypeKey:', transferTypeKey);
      const response = await getTransferTypeById(transferTypeKey);
      console.log('API response:', response);
      const transformed = transformTransferTypeDetail(response);
      console.log('Transformed data:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error in fetchTransferTypeById:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch transfer type');
    }
  }
);

// Async thunk to update a transfer type
export const updateTransferTypeThunk = createAsyncThunk(
  'transferTypes/updateTransferType',
  async (
    { transferTypeKey, formData, versionNumber }: { 
      transferTypeKey: number; 
      formData: any;
      versionNumber: number;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('updateTransferType called with key:', transferTypeKey);
      
      // Transform form data to API payload format
      const payload: UpdateTransferTypeRequest = {
        versionNumber,
        transferTypeKey,
        name: formData.transferTypeName,
        agreementKey: Number.parseInt(formData.payerCustomerAgreement, 10),
        authProfileKey: Number.parseInt(formData.authorisationProfile, 10),
        accountKeys: [formData.payerAccount],
        creditAccountKeys: [formData.paymentAccount],
        requiresInterimAudit: formData.enforceAuditing ?? false,
      };
      
      console.log('Update payload:', payload);
      const response = await updateTransferType(transferTypeKey, payload);
      console.log('Update API response:', response);
      return { transferTypeKey, response };
    } catch (error) {
      console.error('Error in updateTransferType:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update transfer type');
    }
  }
);

// Async thunk to delete transfer types (single or multiple)
export const deleteTransferTypesThunk = createAsyncThunk(
  'transferTypes/deleteTransferTypes',
  async (payload: DeleteTransferTypeRequest, { rejectWithValue }) => {
    try {
      console.log('deleteTransferTypes called with payload:', payload);
      const response = await deleteTransferTypes(payload);
      console.log('Delete API response:', response);
      return { deletedKeys: payload.map(p => p.transferTypeKey) };
    } catch (error) {
      console.error('Error in deleteTransferTypes:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete transfer types');
    }
  }
);

const transferTypesSlice = createSlice({
  name: 'transferTypes',
  initialState,
  reducers: {
    setTransferTypes(state, action: PayloadAction<TransferType[]>) {
      state.data = action.payload;
      state.filteredData = action.payload;
    },
    setFilters(state, action: PayloadAction<TransferTypeFilters>) {
      state.filters = action.payload;
      applyFiltersAndSearch(state);
    },
    setSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
      applyFiltersAndSearch(state);
    },
    setSelectedRows(state, action: PayloadAction<TransferType[]>) {
      state.selectedRows = action.payload;
    },
    addSelectedRow(state, action: PayloadAction<TransferType>) {
      state.selectedRows.push(action.payload);
    },
    removeSelectedRow(state, action: PayloadAction<string>) {
      state.selectedRows = state.selectedRows.filter(
        (row) => row.id !== action.payload
      );
    },
    clearFiltersAndSearch(state) {
      state.filters = {};
      state.searchText = '';
      state.filteredData = state.data;
    },
    resetTransferTypes() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransferTypes.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchTransferTypes.fulfilled, (state, action) => {
        const transformedTransferTypes = transformTransferTypeResponse(action.payload.transferTypes);
        state.isLoading = false;
        state.isError = false;
        state.data = transformedTransferTypes;
        state.filteredData = transformedTransferTypes;
        state.agreements = action.payload.agreements ?? [];
        state.error = null;
      })
      .addCase(fetchTransferTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload as string || 'Failed to fetch transfer types';
      });

    builder
      .addCase(fetchTransferTypeById.pending, (state) => {
        state.isSelectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchTransferTypeById.fulfilled, (state, action) => {
        state.isSelectedLoading = false;
        state.selectedTransferType = action.payload;
        state.selectedError = null;

        // Keep the list in sync so other selectors/pages can reuse it
        // const exists = state.data.some((row) => String(row.id) === String(action.payload.id));
        // if (!exists) {
        //   state.data = [action.payload, ...state.data];
        //   state.filteredData = state.data;
        // }
      })
      .addCase(fetchTransferTypeById.rejected, (state, action) => {
        state.isSelectedLoading = false;
        state.selectedTransferType = null;
        state.selectedError = (action.payload as string) || 'Failed to fetch transfer type';
      });

    builder
      .addCase(updateTransferTypeThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateTransferTypeThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateError = null;
        
        // Optionally update the selectedTransferType if it was updated
        if (state.selectedTransferType && 
            String(state.selectedTransferType.id) === String(action.payload.transferTypeKey)) {
          // You may want to refetch or update the selected item here
          // For now, we'll just clear any errors
        }
        
        // Optionally update the item in the data array
        // This would require the response to contain the updated transfer type details
      })
      .addCase(updateTransferTypeThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = (action.payload as string) || 'Failed to update transfer type';
      });

    builder
      .addCase(deleteTransferTypesThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteTransferTypesThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.deleteError = null;
        
        // Remove deleted items from state
        const deletedKeys = action.payload.deletedKeys;
        state.data = state.data.filter(item => !deletedKeys.includes(Number(item.id)));
        state.selectedRows = [];
        applyFiltersAndSearch(state);
      })
      .addCase(deleteTransferTypesThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = (action.payload as string) || 'Failed to delete transfer types';
      });
  },
});

function applyFiltersAndSearch(state: TransferTypesState) {
  const searchLower = state.searchText.trim().toLowerCase();
  state.filteredData = state.data.filter((row: TransferType) => {
    if (
      state.filters.transferTypeName &&
      !row.transferTypeName
        .toLowerCase()
        .includes(state.filters?.transferTypeName.toLowerCase())
    ) {
      return false;
    }
    if (
      state.filters.authorisationProfile &&
      !row.authorisationProfile
        .toLowerCase()
        .includes(state.filters?.authorisationProfile.toLowerCase())
    ) {
      return false;
    }
    if (
      state.filters.customerAgreement &&
      !row.customerAgreement
        .toLowerCase()
        .includes(state.filters.customerAgreement.toLowerCase())
    ) {
      return false;
    }
    if (
      state.filters.numberOfAccounts &&
      state.filters.numberOfAccounts !== ''
    ) {
      const filterValue = typeof state.filters.numberOfAccounts === 'number' 
        ? state.filters.numberOfAccounts 
        : Number(state.filters.numberOfAccounts);
      
      if (row.numberOfAccounts !== filterValue) {
        return false;
      }
    }
    if (
      state.filters.status &&
      state.filters.status !== '' &&
      row.status.value !== state.filters.status
    ) {
      return false;
    }
    if (
      searchLower &&
      !(
        row.transferTypeName?.toLowerCase().includes(searchLower) ||
        row.customerAgreement?.toLowerCase().includes(searchLower)
      )
    ) {
      return false;
    }
    return true;
  });
}

export const {
  setTransferTypes,
  setFilters,
  setSearchText,
  setSelectedRows,
  addSelectedRow,
  removeSelectedRow,
  clearFiltersAndSearch,
  resetTransferTypes,
} = transferTypesSlice.actions;

export default transferTypesSlice.reducer;
