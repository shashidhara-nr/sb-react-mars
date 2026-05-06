import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuditApproveEventRow, AuditApproveMode } from 'src/utils/auditandapprove';
import { getNonTransactionalAuditApproveList, getEventTypeList, transformEventTypesToOptions, EventTypeOption, NonTransactionalApiResponse, performAuditApproveOperation, AuditApproveOperation } from 'lib/api/nonTransactionalApi';

export interface NonTransactionalFilters {
	userAccountName?: string;
	eventType?: string;
	eventFunction?: string;
	entityName?: string;
	initiatorUserId?: string;
	valueDate?: string;
}

export interface NonTransactionalState {
	items: AuditApproveEventRow[];
	loading: boolean;
	error: string | null;
	listData: NonTransactionalApiResponse | null;
	listDataLoading: boolean;
	listDataError: string | null;
	eventList: EventTypeOption[];
	eventListLoading: boolean;
	eventListError: string | null;
	auditState: { loading: boolean; error: string | null };
	approveState: { loading: boolean; error: string | null };
	filters: NonTransactionalFilters;
	searchText: string;
	selectedIdsByMode: Record<AuditApproveMode, string[]>;
}

const initialState: NonTransactionalState = {
	items: [],
	loading: false,
	error: null,
	filters: {},
	listData: null,
	listDataLoading: false,
	listDataError: null,
	eventList: [],
	eventListLoading: false,
	eventListError: null,
	auditState: { loading: false, error: null },
	approveState: { loading: false, error: null },
	searchText: '',
	selectedIdsByMode: {
		audit: [],
		approve: [],
	},
};

export const fetchNonTransactionalEvents = createAsyncThunk(
	'nonTransactional/fetchNonTransactionalEvents',
	async (_, { getState }) => {
		return [];
	},
);

export const fetchListData = createAsyncThunk(
	'nonTransactional/fetchListData',
	async ({ eventEntityType, initiatorUser }: { eventEntityType: string; initiatorUser: string }, { rejectWithValue }) => {
		try {
			return await getNonTransactionalAuditApproveList(eventEntityType, initiatorUser);
		} catch (error: any) {
			return rejectWithValue(error?.message || 'Failed to load list data');
		}
	}
);

export const fetchEventList = createAsyncThunk(
	'nonTransactional/fetchEventList',
	async (_, { rejectWithValue }) => {
		try {
			const response = await getEventTypeList();
			const options = transformEventTypesToOptions(response.eventTypeMap);
			return options;
		} catch (error: any) {
			return rejectWithValue(error?.message || 'Failed to load event list');
		}
	}
);

function createAuditThunk(
	operation: AuditApproveOperation,
	displayName: string
) {
	return createAsyncThunk(
		`nonTransactional/${displayName}`,
		async (requestBody: { [key: string]: string }, { rejectWithValue }) => {
			try {
				return await performAuditApproveOperation(operation, requestBody);
			} catch (error: any) {
				return rejectWithValue(error?.message || `Failed to ${displayName}`);
			}
		}
	);
}


function getStateByOperation(operation: AuditApproveOperation): 'audit' | 'approve' {
	return operation.includes('AUTHORISE') ? 'approve' : 'audit';
}


function addAuditApproveThunkHandlers(
	builder: any,
	thunk: any,
	operation: AuditApproveOperation
) {
	const stateKey = getStateByOperation(operation);

	builder
		.addCase(thunk.pending, (state: NonTransactionalState) => {
			if (stateKey === 'audit') {
				state.auditState = { loading: true, error: null };
			} else {
				state.approveState = { loading: true, error: null };
			}
		})
		.addCase(thunk.fulfilled, (state: NonTransactionalState) => {
			if (stateKey === 'audit') {
				state.auditState = { loading: false, error: null };
			} else {
				state.approveState = { loading: false, error: null };
			}
		})
		.addCase(thunk.rejected, (state: NonTransactionalState, action: any) => {
			const error = action.payload as string || 'Operation failed';
			if (stateKey === 'audit') {
				state.auditState = { loading: false, error };
			} else {
				state.approveState = { loading: false, error };
			}
		});
}

export const auditBeneficiaries = createAuditThunk('BENI_AUDIT', 'auditBeneficiaries');
export const authoriseBeneficiaries = createAuditThunk('BENI_AUTHORISE', 'authoriseBeneficiaries');
export const auditDebtor = createAuditThunk('DEBITOR_AUDIT', 'auditDebtor');
export const authoriseDebtor = createAuditThunk('DEBITOR_AUTHORISE', 'authoriseDebtor');
export const auditPayment = createAuditThunk('PAYMENT_AUDIT', 'auditPayment');
export const authorisePayment = createAuditThunk('PAYMENT_AUTHORISE', 'authorisePayment');

const nonTransactionalSlice = createSlice({
	name: 'nonTransactional',
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<NonTransactionalFilters>) {
			state.filters = action.payload;
		},
		setSearchText(state, action: PayloadAction<string>) {
			state.searchText = action.payload;
		},
		clearFiltersAndSearch(state) {
			state.filters = {};
			state.searchText = '';
		},
		setSelectedIds(state, action: PayloadAction<{ mode: AuditApproveMode; ids: string[] }>) {
			state.selectedIdsByMode[action.payload.mode] = action.payload.ids;
		},
		clearSelection(state, action: PayloadAction<AuditApproveMode>) {
			state.selectedIdsByMode[action.payload] = [];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNonTransactionalEvents.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNonTransactionalEvents.fulfilled, (state, action: PayloadAction<AuditApproveEventRow[]>) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchNonTransactionalEvents.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || 'Failed to load non-transactional events';
			})
			.addCase(fetchListData.pending, (state) => {
				state.listDataLoading = true;
				state.listDataError = null;
			})
			.addCase(fetchListData.fulfilled, (state, action: PayloadAction<any>) => {
				state.listDataLoading = false;
				state.listData = action.payload;
			})
			.addCase(fetchListData.rejected, (state, action) => {
				state.listDataLoading = false;
				state.listDataError = action.payload as string || 'Failed to load list data';
			})
			.addCase(fetchEventList.pending, (state) => {
				state.eventListLoading = true;
				state.eventListError = null;
			})
			.addCase(fetchEventList.fulfilled, (state, action: PayloadAction<EventTypeOption[]>) => {
				state.eventListLoading = false;
				state.eventList = action.payload;
			})
			.addCase(fetchEventList.rejected, (state, action) => {
				state.eventListLoading = false;
				state.eventListError = action.payload as string || 'Failed to load event list';
			});
		addAuditApproveThunkHandlers(builder, auditBeneficiaries, 'BENI_AUDIT');
		addAuditApproveThunkHandlers(builder, authoriseBeneficiaries, 'BENI_AUTHORISE');
		addAuditApproveThunkHandlers(builder, auditDebtor, 'DEBITOR_AUDIT');
		addAuditApproveThunkHandlers(builder, authoriseDebtor, 'DEBITOR_AUTHORISE');
		addAuditApproveThunkHandlers(builder, auditPayment, 'PAYMENT_AUDIT');
		addAuditApproveThunkHandlers(builder, authorisePayment, 'PAYMENT_AUTHORISE');
	},
});

export const {
	setFilters: setNonTransactionalFilters,
	setSearchText: setNonTransactionalSearchText,
	clearFiltersAndSearch: clearNonTransactionalFiltersAndSearch,
	setSelectedIds: setNonTransactionalSelectedIds,
	clearSelection: clearNonTransactionalSelection,
} = nonTransactionalSlice.actions;

export default nonTransactionalSlice.reducer;
