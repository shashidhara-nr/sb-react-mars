import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CollectionTypePage from '../../../app/[locale]/setup-and-admin/collection-types/page';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCollectionTypes } from '../../../lib/hooks/useCollectionTypes';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks/useAppDispatch';
import { COLLECTION_TYPE_STATUS_CODES } from '../../../types/redux/collectionTypes';

// Mock next/image
jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock useAppSelector
jest.mock('../../../lib/hooks/useAppDispatch', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

// Mock Redux slice actions
jest.mock('../../../store/slices/collectionTypesSlice', () => ({
	setFilters: jest.fn((filters) => ({ type: 'collectionTypes/setFilters', payload: filters })),
	setSelectedTab: jest.fn((tab) => ({ type: 'collectionTypes/setSelectedTab', payload: tab })),
	clearFiltersAndSearch: jest.fn(() => ({ type: 'collectionTypes/clearFiltersAndSearch' })),
	clearDeleteError: jest.fn(() => ({ type: 'collectionTypes/clearDeleteError' })),
	setSearchType: jest.fn((searchType) => ({ type: 'collectionTypes/setSearchType', payload: searchType })),
	setSearchValue: jest.fn((searchValue) => ({ type: 'collectionTypes/setSearchValue', payload: searchValue })),
}));

// Mock authorisation profile slice actions
jest.mock('../../../store/slices/setup-admin/commonSlice/authorisationProfileSlice', () => ({
	fetchAuthorisationProfiles: jest.fn(() => ({ type: 'authorisationProfile/fetch' })),
}));

// Mock src/utils/testIds
jest.mock('../../../src/utils/testIds', () => ({
	buildTestId: jest.fn((...args) => args.filter(Boolean).join('-')),
}));

jest.mock('@mui/material', () => {
	const actual = jest.requireActual('@mui/material');
	const React = require('react');
	return {
		...actual,
		Snackbar: ({ open, onClose, children, ...props }: any) =>
			open ? (
				<div data-testid={props['data-testid'] ?? 'snackbar'}>
					<button data-testid="snackbar-close" onClick={() => onClose?.({}, 'timeout')}>close</button>
					{children}
				</div>
			) : null,
	};
});

jest.mock('@lib/icons', () => ({
	FunnelIcon: '/icons/funnel.svg',
	SearchIcon: '/icons/search.svg',
	AddIcon: '/icons/add.svg',
	AvatarAlert: '/icons/avatar-alert.svg',
	CheckCircleIcon: '/icons/check-circle.svg',
	IcnInfoCircleBlack: '/icons/info-circle.svg',
}));

jest.mock('../../../lib/hooks/useCollectionTypes');

jest.mock('../../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Button: mocks.Button,
		Loader: () => <div data-testid="loader">Loading...</div>,
	};
});

jest.mock('../../../components/sections/ListPageWrapper', () => ({
	__esModule: true,
	default: ({ children, title, action, breadcrumbLinks, searchBar, testIdPrefix = 'collection-types-hub' }: any) => (
		<div data-testid="list-page-wrapper">
			<h1 data-testid="list-page-title">{title}</h1>
			<div data-testid="list-page-action">{action}</div>
			{searchBar && (
				<div data-testid="search-bar">
					<select
						data-testid="search-type-select"
						value={searchBar.searchType || ''}
						onChange={(e) => searchBar.onSearchTypeChange?.(e.target.value)}
					>
						<option value="">{searchBar.searchTypePlaceholder}</option>
						{(searchBar.searchTypeOptions || []).map((opt: any) => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						))}
					</select>
					{searchBar.searchFieldType === 'dropdown' ? (
						<select
							data-testid="search-field-dropdown"
							value={searchBar.searchValue || ''}
							onChange={(e) => searchBar.onSearchValueChange?.(e.target.value)}
						>
							<option value="">{searchBar.searchFieldPlaceholder}</option>
							{(searchBar.searchFieldOptions || []).map((opt: any) => (
								<option key={opt.value} value={opt.value}>{opt.label}</option>
							))}
						</select>
					) : (
						<input
							data-testid="search-field-input"
							value={searchBar.searchValue || ''}
							onChange={(e) => searchBar.onSearchValueChange?.(e.target.value)}
							placeholder={searchBar.searchFieldPlaceholder}
						/>
					)}
					<button
						data-testid="search-button"
						onClick={() => searchBar.onSearch?.(searchBar.searchType, searchBar.searchValue)}
					>
						Search
					</button>
					<button
						data-testid="search-clear"
						onClick={() => searchBar.onClear?.()}
					>
						Clear
					</button>
				</div>
			)}
			<div data-testid={`${testIdPrefix}-content`}>{children}</div>
		</div>
	),
}));

jest.mock('../../../components/common', () => ({
	ListRightPanelActions: ({ selectedCount, hasFilters, onRemoveFilters, onDeleteClick, testIdPrefix }: any) => (
		<div data-testid={testIdPrefix}>
			<span data-testid="selected-count-display">{selectedCount}</span>
			{hasFilters && (
				<button data-testid="remove-filters" onClick={onRemoveFilters}>Remove Filters</button>
			)}
			{onDeleteClick && (
				<button data-testid="delete-button" onClick={onDeleteClick}>Delete</button>
			)}
		</div>
	),
}));

jest.mock('../../../components/common/DeleteConfirmationDialog', () => ({
	__esModule: true,
	default: ({ open, onPrimaryCTA, onSecondaryCTA, testIdPrefix, title, itemLabel }: any) => {
		if (!open) return null;
		return (
			<div data-testid={`${testIdPrefix}-dialog`}>
				<div data-testid={`${testIdPrefix}-title`}>{title}</div>
				<div data-testid={`${testIdPrefix}-item-label`}>{itemLabel}</div>
				<button data-testid={`${testIdPrefix}-confirm`} onClick={onPrimaryCTA}>Confirm</button>
				<button data-testid={`${testIdPrefix}-cancel`} onClick={onSecondaryCTA}>Cancel</button>
			</div>
		);
	},
}));

jest.mock('../../../components/common/EmptyState', () => ({
	__esModule: true,
	default: ({ title, description, icon }: any) => (
		<div data-testid="empty-state">
			<div data-testid="empty-state-title">{title}</div>
			<div data-testid="empty-state-description">{description}</div>
		</div>
	),
}));

jest.mock('@molecules/CollectionTypeFilterDialog', () => ({
	__esModule: true,
	default: ({ open, onClose, onApply }: any) =>
		open ? (
			<div data-testid="collection-type-filter-dialog">
				<button data-testid="filter-apply" onClick={() => onApply({ status: 'Active' })}>Apply</button>
				<button data-testid="filter-close" onClick={onClose}>Close</button>
			</div>
		) : null,
}));

jest.mock('@molecules/TableContainer/TableContainer', () => ({
	__esModule: true,
	default: ({
		tableData,
		filterButtons,
		onCheckboxClick,
		selectedRows,
		rightPanelContent,
		onQuickLinkClick,
		tabs,
		selectedTab,
		onTabChange,
		onPageChange,
		onPerPageChange,
		emptyStateContent,
	}: any) => (
		<div data-testid="table-container" data-selected-tab={selectedTab}>
			<div data-testid="row-count">{tableData?.rows?.length ?? 0}</div>
			<div data-testid="selected-count">{selectedRows?.length ?? 0}</div>
			<div data-testid="filter-buttons">
				{(filterButtons || []).map((b: any, idx: number) => (
					<button
						key={idx}
						data-testid={b['data-testid'] || `filter-${idx}`}
						disabled={Boolean(b?.disabled)}
						onClick={b?.onClick}
					>Filter</button>
				))}
			</div>
			<div data-testid="tabs">
				{(tabs || []).map((tab: any) => (
					<button key={tab.value} data-testid={`tab-${tab.value}`} onClick={() => onTabChange?.(tab.value)}>
						{tab.label}
					</button>
				))}
			</div>
			<button data-testid="select-first-two" onClick={() => onCheckboxClick?.(tableData?.rows?.slice(0, 2) ?? [])}>
				Select first two
			</button>
			<button data-testid="select-single" onClick={() => onCheckboxClick?.(tableData?.rows?.[0])}>
				Select single
			</button>
			<button data-testid="select-none" onClick={() => onCheckboxClick?.(null)}>
				Select none
			</button>
			<button data-testid="quick-link-first" onClick={() => onQuickLinkClick?.(tableData?.rows?.[0])}>
				Quick link first
			</button>
			<button data-testid="page-change" onClick={() => onPageChange?.(2)}>Change page</button>
			<button data-testid="per-page-change" onClick={() => onPerPageChange?.(20)}>Change per page</button>
			{rightPanelContent}
			<div data-testid="empty-state-slot">{emptyStateContent}</div>
		</div>
	),
}));

type Row = {
	id: string;
	collectionTypeKey?: number;
	collectionTypeName: string;
	authorisationProfile: string;
	customerAgreement: string;
	numberOfCount: number;
	status: { value: string; label: string; color?: string };
	links?: { text: string; linkKey: string; href?: string };
};

const makeRow = (overrides: Partial<Row> = {}): Row => ({
	id: overrides.id ?? '1',
	collectionTypeKey: Object.prototype.hasOwnProperty.call(overrides, 'collectionTypeKey')
		? overrides.collectionTypeKey
		: 111,
	collectionTypeName: overrides.collectionTypeName ?? 'Collection Type 1',
	authorisationProfile: overrides.authorisationProfile ?? 'Auth Profile',
	customerAgreement: overrides.customerAgreement ?? 'Agreement 1',
	numberOfCount: overrides.numberOfCount ?? 5,
	status: overrides.status ?? { value: COLLECTION_TYPE_STATUS_CODES.ACTIVE, label: COLLECTION_TYPE_STATUS_CODES.ACTIVE, color: 'success' },
	links: overrides.links ?? { text: 'collectionTypesManage', linkKey: 'collectionTypesManage', href: '/manage/1' },
});

describe('CollectionTypePage', () => {
	const mockPush = jest.fn();
	const mockDispatch = jest.fn();
	const mockSetSearchText = jest.fn();
	const mockSetSelectedRows = jest.fn();
	const mockHandleSort = jest.fn();
	const mockHandlePageChange = jest.fn();
	const mockHandlePerPageChange = jest.fn();
	const mockHandleDelete = jest.fn();
	let consoleLogSpy: jest.SpyInstance;

	const setHook = (overrides: any = {}) => {
		(useCollectionTypes as jest.Mock).mockReturnValue({
			loading: false,
			filters: {},
			searchText: '',
			setSearchText: mockSetSearchText,
			selectedRows: [],
			setSelectedRows: mockSetSelectedRows,
			selectedTab: 0,
			mappedRows: [makeRow()],
			hasFiltersOrSearch: false,
			totalRows: 1,
			currentPage: 1,
			perPage: 15,
			sortBy: { field: 'collectionTypeName', order: 'asc' },
			handleSort: mockHandleSort,
			handlePageChange: mockHandlePageChange,
			handlePerPageChange: mockHandlePerPageChange,
			handleDelete: mockHandleDelete,
			...overrides,
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);
		(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
		(useAppSelector as jest.Mock).mockImplementation((selector) => {
			const mockState = {
				authorisationProfile: {
					data: [
						{ authProfileName: 'Auth Profile 1', id: 1 },
						{ authProfileName: 'Auth Profile 2', id: 2 },
					],
				},
				collectionTypes: {
					searchType: '',
					searchValue: '',
				},
			};
			return selector(mockState);
		});
		mockDispatch.mockReturnValue({ type: 'mock' });
		setHook();
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	it('rendering basics: loader and create navigation', async () => {
		const user = userEvent.setup();
		setHook({ loading: true, mappedRows: [] });
		const view1 = render(<CollectionTypePage />);
		expect(screen.getByTestId('loader')).toBeInTheDocument();
		view1.unmount();

		setHook({ loading: false, mappedRows: [makeRow()] });
		render(<CollectionTypePage />);
		expect(screen.getByTestId('collection-types-hub-create-button')).toBeInTheDocument();
		await user.click(screen.getByTestId('collection-types-hub-create-button'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types/create');
	});

	it('filters + remove filters + checkbox normalization branches', async () => {
		const user = userEvent.setup();

		setHook({ mappedRows: [] });
		const view1 = render(<CollectionTypePage />);
		expect(screen.getByTestId('collection-types-hub-filter-button')).toBeDisabled();
		await user.click(screen.getByTestId('collection-types-hub-filter-button'));
		expect(screen.queryByTestId('collection-type-filter-dialog')).not.toBeInTheDocument();
		view1.unmount();

		setHook({ mappedRows: [makeRow()] });
		const viewOpen = render(<CollectionTypePage />);
		await user.click(screen.getByTestId('collection-types-hub-filter-button'));
		expect(screen.getByTestId('collection-type-filter-dialog')).toBeInTheDocument();
		await user.click(screen.getByTestId('filter-apply'));
		expect(mockDispatch).toHaveBeenCalled();
		await waitFor(() => expect(screen.queryByTestId('collection-type-filter-dialog')).not.toBeInTheDocument());

		await user.click(screen.getByTestId('collection-types-hub-filter-button'));
		expect(screen.getByTestId('collection-type-filter-dialog')).toBeInTheDocument();
		await user.click(screen.getByTestId('filter-close'));
		await waitFor(() => expect(screen.queryByTestId('collection-type-filter-dialog')).not.toBeInTheDocument());
		viewOpen.unmount();

		const view2 = render(<CollectionTypePage />);
		view2.unmount();
		setHook({ hasFiltersOrSearch: true, filters: { status: 'Active' }, searchText: 'x' });
		render(<CollectionTypePage />);
		await user.click(screen.getByTestId('remove-filters'));
		expect(mockDispatch).toHaveBeenCalled();


		await user.click(screen.getByTestId('select-first-two'));
		await user.click(screen.getByTestId('select-single'));
		await user.click(screen.getByTestId('select-none'));
		expect(mockSetSelectedRows).toHaveBeenCalled();
	});

	it('tabs and pagination callbacks', async () => {
		const user = userEvent.setup();
		render(<CollectionTypePage />);
		await user.click(screen.getByTestId('tab-1'));
		await user.click(screen.getByTestId('page-change'));
		await user.click(screen.getByTestId('per-page-change'));
		expect(mockDispatch).toHaveBeenCalled();
		expect(mockHandlePageChange).toHaveBeenCalledWith(2);
		expect(mockHandlePerPageChange).toHaveBeenCalledWith(20);
	});

	it('quick links: manage/complete navigate and reminder shows snackbar (with key fallback)', async () => {
		const user = userEvent.setup();
		const manageFallbackKeyRow = makeRow({ id: 'fallback-id', collectionTypeKey: undefined, links: { text: 'collectionTypesManage', linkKey: 'collectionTypesManage', href: '/manage/1' } });
		setHook({ mappedRows: [manageFallbackKeyRow] });
		const view1 = render(<CollectionTypePage />);
		await user.click(screen.getByTestId('quick-link-first'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types/manage/fallback-id');
		view1.unmount();

		const completeRow = makeRow({ status: { value: COLLECTION_TYPE_STATUS_CODES.DRAFT, label: COLLECTION_TYPE_STATUS_CODES.DRAFT }, links: { text: 'collectionTypesComplete', linkKey: 'collectionTypesComplete', href: '/manage/1' } });
		setHook({ selectedTab: 3, mappedRows: [completeRow] });
		const view2 = render(<CollectionTypePage />);
		await user.click(screen.getByTestId('quick-link-first'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/collection-types/manage/111');
		view2.unmount();

		const remindRow = makeRow({ status: { value: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL, label: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL }, links: { text: 'collectionTypesRemind', linkKey: 'collectionTypesRemind', href: '' } });
		setHook({ selectedTab: 1, mappedRows: [remindRow] });
		render(<CollectionTypePage />);
		await user.click(screen.getByTestId('quick-link-first'));
		await waitFor(() => expect(screen.getByTestId('collection-types-hub-snackbar')).toBeInTheDocument());
	});

	it('delete dialog variants + delete payload filtering + snackbar close + delete-error callback', async () => {
		const user = userEvent.setup();
		mockHandleDelete.mockResolvedValue(undefined);

		const awaitingRow = makeRow({ status: { value: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL, label: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL } });
		setHook({ selectedRows: [awaitingRow] });
		const view1 = render(<CollectionTypePage />);
		await user.click(screen.getByTestId('delete-button'));
		expect(screen.getByTestId('collection-types-hub-delete-dialog-title')).toHaveTextContent('deleteAwaitingTitle');
		await user.click(screen.getByTestId('collection-types-hub-delete-dialog-cancel'));
		view1.unmount();

		const activeWithKey = makeRow({ id: '1', collectionTypeKey: 111, status: { value: COLLECTION_TYPE_STATUS_CODES.ACTIVE, label: COLLECTION_TYPE_STATUS_CODES.ACTIVE } });
		const awaitingToExclude = makeRow({ id: '2', collectionTypeKey: 222, status: { value: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL, label: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL } });
		const activeKeyFallback = makeRow({ id: 'fallback', collectionTypeKey: undefined, status: { value: COLLECTION_TYPE_STATUS_CODES.ACTIVE, label: COLLECTION_TYPE_STATUS_CODES.ACTIVE } });
		setHook({ selectedRows: [activeWithKey, awaitingToExclude, activeKeyFallback], mappedRows: [activeWithKey, awaitingToExclude, activeKeyFallback] });
		const view2 = render(<CollectionTypePage />);
		await user.click(screen.getByTestId('delete-button'));
		await user.click(screen.getByTestId('collection-types-hub-delete-dialog-confirm'));
		await waitFor(() => {
			expect(mockHandleDelete).toHaveBeenCalledWith([
				{ collectionTypeKey: 111, collectionTypeName: 'Collection Type 1' },
				{ collectionTypeKey: 'fallback', collectionTypeName: 'Collection Type 1' },
			]);
		});
		await waitFor(() => expect(screen.getByTestId('collection-types-hub-snackbar')).toBeInTheDocument());
		await user.click(screen.getByTestId('snackbar-close'));
		await waitFor(() => expect(screen.queryByTestId('collection-types-hub-snackbar')).not.toBeInTheDocument());
		view2.unmount();

		let triggered = false;
		( useCollectionTypes as jest.Mock ).mockImplementation(({ onShowDeleteError }: any) => {
			if (!triggered) {
				triggered = true;
				onShowDeleteError?.();
			}
			return {
				loading: false,
				filters: {},
				searchText: '',
				setSearchText: mockSetSearchText,
				selectedRows: [],
				setSelectedRows: mockSetSelectedRows,
				selectedTab: 0,
				mappedRows: [makeRow()],
				hasFiltersOrSearch: false,
				totalRows: 1,
				currentPage: 1,
				perPage: 15,
				sortBy: null,
				handleSort: mockHandleSort,
				handlePageChange: mockHandlePageChange,
				handlePerPageChange: mockHandlePerPageChange,
				handleDelete: mockHandleDelete,
			};
		});
		render(<CollectionTypePage />);
		expect(await screen.findByTestId('collection-types-hub-delete-dialog-title')).toHaveTextContent('deleteErrorTitle');
		await user.click(screen.getByTestId('collection-types-hub-delete-dialog-cancel'));
		expect(mockDispatch).toHaveBeenCalled();
	});

	it('empty states: no records vs no results', () => {
		setHook({ mappedRows: [], hasFiltersOrSearch: false, selectedTab: 0, totalRows: 0 });
		const view1 = render(<CollectionTypePage />);
		expect(screen.getByTestId('empty-state-title')).toHaveTextContent('noRecordsToDisplay');
		view1.unmount();

		setHook({ mappedRows: [], hasFiltersOrSearch: true, filters: { status: 'Active' }, selectedTab: 0, totalRows: 0 });
		const view2 = render(<CollectionTypePage />);
		expect(screen.getByTestId('empty-state-title')).toHaveTextContent('noResultsFound');
		view2.unmount();

		setHook({ mappedRows: [], hasFiltersOrSearch: false, selectedTab: 2, totalRows: 0 });
		render(<CollectionTypePage />);
		expect(screen.getByTestId('empty-state-title')).toHaveTextContent('noResultsFound');
	});
});
