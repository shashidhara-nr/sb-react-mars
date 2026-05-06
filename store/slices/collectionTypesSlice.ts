import { getCollectionTypesList, deleteCollectionTypes as deleteCollectionTypesApi } from '@lib/api/collectionTypesApi';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CollectionType,
  CollectionTypeFilters,
  CollectionTypesState,
} from 'types/redux/collectionTypes';
import { transformCollectionTypeResponse } from '@lib/transformers/collectionTypesTransformers';

const initialState: CollectionTypesState = {
  data: [],
  filteredData: [],
  filters: {},
  selectedTab: 0,
  loading: false,
  error: null,
  deleteError: null,
  searchType: '',
  searchValue: '',
};

export const fetchCollectionTypes = createAsyncThunk(
  'collectionTypes/fetchCollectionTypes', 
  async (_, { rejectWithValue }) => {
    try {
      const collectionTypesApiData = await getCollectionTypesList();
      return collectionTypesApiData.collectionTypeList;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch collection types');
    }
  }
);

export const deleteCollectionTypes = createAsyncThunk(
  'collectionTypes/deleteCollectionTypes',
  async (items: { collectionTypeKey: string | number; collectionTypeName: string }[], { rejectWithValue }) => {
    try {
      const deletedKeys = await deleteCollectionTypesApi(items);
      return deletedKeys;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to delete collection types');
    }
  }
);

const collectionTypesSlice = createSlice({
  name: 'collectionTypes',
  initialState,
  reducers: {
    // Set all collection types data
    setCollectionTypes(state, action: PayloadAction<CollectionType[]>) {
      state.data = action.payload;
      state.filteredData = action.payload;
    },

    // Set loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    // Set error state
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // Update filters
    setFilters(state, action: PayloadAction<CollectionTypeFilters>) {
      state.filters = action.payload;
      applyFiltersAndSearch(state);
    },

    // Update selected tab
    setSelectedTab(state, action: PayloadAction<number>) {
      state.selectedTab = action.payload;
    },

    clearFiltersAndSearch(state) {
      state.filters = {};
      state.filteredData = state.data;
    },

    // Set search type
    setSearchType(state, action: PayloadAction<string>) {
      state.searchType = action.payload;
    },

    // Set search value
    setSearchValue(state, action: PayloadAction<string>) {
      state.searchValue = action.payload;
    },

    // Clear delete error
    clearDeleteError(state) {
      state.deleteError = null;
    },

    // Reset state
    resetCollectionTypes() {
      return initialState;
    },
  },
  extraReducers: (builder) => {

    builder
    .addCase(fetchCollectionTypes.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchCollectionTypes.fulfilled, (state, action) => {
      const payload = Array.isArray(action.payload) ? action.payload : [];
      const mapped = transformCollectionTypeResponse(payload);
      state.loading = false;
      state.data = mapped;
      state.filteredData = mapped;
    })
    .addCase(fetchCollectionTypes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(deleteCollectionTypes.pending, (state) => {
      state.loading = true;
      state.deleteError = null;
    })
    .addCase(deleteCollectionTypes.fulfilled, (state, action) => {
      state.loading = false;
      state.deleteError = null;
      const deletedKeys = action.payload;
      state.data.map(item => {console.log("data >>> ", {...item}, deletedKeys);if(deletedKeys.includes(item.id as number)) console.log("data >>>> ", item)});
      state.data = state.data.filter((item) => !deletedKeys.includes(item.id as number));
      state.filteredData = state.filteredData.filter((item) => !deletedKeys.includes(Number(item.id)));
    })
    .addCase(deleteCollectionTypes.rejected, (state, action) => {
      state.loading = false;
      state.deleteError = action.payload as string;
    });

    // Handle rehydration from redux-persist
    // builder.addMatcher(
    //   (action) => action.type === 'persist/REHYDRATE',
    //   (state, action: any) => {
    //     if (action.payload?.collectionTypes) {
    //       const rehydratedData = action.payload.collectionTypes.data || [];
    //       const rehydratedFilteredData = action.payload.collectionTypes.filteredData || [];
          
    //       // Ensure data has IDs, otherwise reload from mock
    //       state.data = ensureDataIntegrity(rehydratedData);
    //       state.filteredData = ensureDataIntegrity(rehydratedFilteredData);
    //     }
    //   }
    // );
  },
});

function applyFiltersAndSearch(state: CollectionTypesState) {
  state.filteredData = state.data.filter((row: CollectionType) => {
    if (
      state.filters.collectionTypeName &&
      !row.collectionTypeName
        .toLowerCase()
        .includes(state.filters.collectionTypeName.toLowerCase())
    ) {
      return false;
    }

    if (
      state.filters.authorisationProfile &&
      !row.authorisationProfile
        .toLowerCase()
        .includes(state.filters.authorisationProfile.toLowerCase())
    ) {
      return false;
    }

    if (
      state.filters.numberOfCount &&
      state.filters.numberOfCount !== ''
    ) {
      const filterValue = typeof state.filters.numberOfCount === 'string' 
        ? parseInt(state.filters.numberOfCount, 10) 
        : state.filters.numberOfCount;
      
      if (isNaN(filterValue) || row.numberOfCount !== filterValue) {
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

    return true;
  });
}

export const {
  setCollectionTypes,
  setLoading,
  setError,
  setFilters,
  setSelectedTab,
  clearFiltersAndSearch,
  setSearchType,
  setSearchValue,
  clearDeleteError,
  resetCollectionTypes,
} = collectionTypesSlice.actions;

export default collectionTypesSlice.reducer;
