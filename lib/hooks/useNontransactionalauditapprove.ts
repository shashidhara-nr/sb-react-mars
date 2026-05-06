import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import {
	fetchListData,
	fetchEventList,
	setNonTransactionalFilters,
	setNonTransactionalSearchText,
	clearNonTransactionalFiltersAndSearch,
	setNonTransactionalSelectedIds,
	clearNonTransactionalSelection,
	auditBeneficiaries,
	authoriseBeneficiaries,
	auditDebtor,
	authoriseDebtor,
	auditPayment,
	authorisePayment,
	NonTransactionalFilters,
} from '../../store/slices/nontransactionalauditandapproveslice';
import { AuditApproveEventRow, AuditApproveMode } from 'src/utils/auditandapprove';

const EMPTY_SELECTED_IDS: string[] = [];

export const useNontransactionalAuditApprove = (mode: AuditApproveMode) => {
	const dispatch = useAppDispatch();
	const { 
		filters, 
		searchText, 
		selectedIdsByMode,
		listData,
		listDataLoading,
		listDataError,
		eventList,
		eventListLoading,
		eventListError,
		auditState,
		approveState,
	} = useAppSelector(
		(state) => state.nonTransactional,
	);

	const auditLoading = auditState.loading;
	const auditError = auditState.error;
	const authoriseLoading = approveState.loading;
	const authoriseError = approveState.error;

	// Transform API data to table rows
	const filteredRows: AuditApproveEventRow[] = useMemo(() => {
		if (!listData?.authorisationList) return [];

		const eventFunctionMap: Record<string, string> = {
			'C': 'Create',
			'U': 'Update',
			'D': 'Delete',
		};

		let rows: AuditApproveEventRow[] = listData.authorisationList.map((item) => {			const simpleEntityType = item.entityType.split('.').pop() || item.entityType;
			const dateObj = new Date(item.date);
			const valueDate = dateObj.toLocaleDateString('en-GB');

			return {
				id: String(item.auditEventId),
				mode, 
				userAccountName: item.userUnitName || '',
				eventType: simpleEntityType,
				eventFunction: eventFunctionMap[item.action] || item.action,
				entityName: item.entityName || '',
				initiatorUserId: item.personId || item.userName || '',
				valueDate,
				details: item,
				status: {
					value: mode === 'audit' ? 'Awaiting audit' : 'Awaiting approval',
					color: 'info',
				},
				links: {
					href: '#',
					text: 'VIEW AND MANAGE',
				},
			};
		});

		if (filters.userAccountName) {
			const q = filters.userAccountName.toLowerCase();
			rows = rows.filter((row) => row.userAccountName.toLowerCase().includes(q));
		}
		if (filters.eventType) {
			rows = rows.filter((row) => row.eventType === filters.eventType);
		}
		if (filters.eventFunction) {
			rows = rows.filter((row) => row.eventFunction === filters.eventFunction);
		}
		if (filters.entityName) {
			const q = filters.entityName.toLowerCase();
			rows = rows.filter((row) => row.entityName.toLowerCase().includes(q));
		}
		if (filters.initiatorUserId) {
			const q = filters.initiatorUserId.toLowerCase();
			rows = rows.filter((row) => row.initiatorUserId.toLowerCase().includes(q));
		}
		if (filters.valueDate) {
			const q = String(filters.valueDate).toLowerCase();
			rows = rows.filter((row) => row.valueDate.toLowerCase().includes(q));
		}		if (searchText.trim()) {
			const q = searchText.toLowerCase();
			rows = rows.filter(
				(row) =>
					row.userAccountName.toLowerCase().includes(q) ||
					row.eventType.toLowerCase().includes(q) ||
					row.eventFunction.toLowerCase().includes(q) ||
					row.entityName.toLowerCase().includes(q) ||
					row.initiatorUserId.toLowerCase().includes(q),
			);
		}

		return rows;
	}, [listData, mode, filters, searchText]);

	const hasFiltersOrSearch = useMemo(
		() =>
			Object.entries(filters).some(([, value]) => String(value ?? '').trim().length > 0) ||
			searchText.trim().length > 0,
		[filters, searchText],
	);

	const selectedIds = selectedIdsByMode[mode] ?? EMPTY_SELECTED_IDS;

	const selectedRows = useMemo(
		() => filteredRows.filter((row) => selectedIds.includes(row.id)),
		[filteredRows, selectedIds],
	);

	const updateFilters = (next: NonTransactionalFilters) => {
		dispatch(setNonTransactionalFilters(next));
	};

	const updateSearchText = (value: string) => {
		dispatch(setNonTransactionalSearchText(value));
	};

	const clearFiltersAndSearch = () => {
		dispatch(clearNonTransactionalFiltersAndSearch());
	};

	const updateSelectedIds = (ids: string[]) => {
		dispatch(setNonTransactionalSelectedIds({ mode, ids }));
	};

	const clearSelection = () => {
		dispatch(clearNonTransactionalSelection(mode));
	};

	const reloadEventList = () => {
		dispatch(fetchEventList());
	};

	const loadListData = (eventEntityType: string, initiatorUser: string) => {
		dispatch(fetchListData({ eventEntityType, initiatorUser }));
	};

	const auditThunksMap = {
		Beneficiary: auditBeneficiaries,
		Debtor: auditDebtor,
		PaymentType: auditPayment,
	};

	const approveThunksMap = {
		Beneficiary: authoriseBeneficiaries,
		Debtor: authoriseDebtor,
		PaymentType: authorisePayment,
	};

	const performAudit = (entityType: string, requestBody: { [key: string]: string }) => {
		const thunk = auditThunksMap[entityType as keyof typeof auditThunksMap] || auditBeneficiaries;
		dispatch(thunk(requestBody));
	};

	const performAuthorise = (entityType: string, requestBody: { [key: string]: string }) => {
		const thunk = approveThunksMap[entityType as keyof typeof approveThunksMap] || authoriseBeneficiaries;
		dispatch(thunk(requestBody));
	};

	return {
		filteredRows,
		filters,
		searchText,
		hasFiltersOrSearch,
		selectedIds,
		selectedRows,
		updateFilters,
		updateSearchText,
		clearFiltersAndSearch,
		updateSelectedIds,
		clearSelection,
		eventList,
		eventListLoading,
		eventListError,
		reloadEventList,
		listData,
		listDataLoading,
		listDataError,
		loadListData,
		performAudit,
		performAuthorise,
		auditLoading,
		auditError,
		authoriseLoading,
		authoriseError,
	};
};

export default useNontransactionalAuditApprove;
