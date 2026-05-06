import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PaymentTypesHubPage from '../../../app/[locale]/setup-and-admin/payment-types/page';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { usePaymentTypes } from '../../../lib/hooks/usePaymentTypes';
import { deletePaymentTypesMulti } from '../../../lib/api/paymentTypesApi';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks/useAppDispatch';

// Mock next/image
jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock useAppDispatch and useAppSelector
jest.mock('../../../lib/hooks/useAppDispatch', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

// Mock Redux slice actions
jest.mock('../../../store/slices/paymentTypesSlice', () => ({
	setFilters: jest.fn((filters) => ({ type: 'paymentTypes/setFilters', payload: filters })),
	setSelectedTab: jest.fn((tab) => ({ type: 'paymentTypes/setSelectedTab', payload: tab })),
	setSearchType: jest.fn((searchType) => ({ type: 'paymentTypes/setSearchType', payload: searchType })),
	setSearchValue: jest.fn((searchValue) => ({ type: 'paymentTypes/setSearchValue', payload: searchValue })),
	clearFiltersAndSearch: jest.fn(() => ({ type: 'paymentTypes/clearFiltersAndSearch' })),
}));

// Mock authorisation profile slice actions
jest.mock('../../../store/slices/setup-admin/commonSlice/authorisationProfileSlice', () => ({
	fetchAuthorisationProfiles: jest.fn(() => ({ type: 'authorisationProfile/fetch' })),
}));

// Mock src/utils/testIds
jest.mock('../../../src/utils/testIds', () => ({
	buildTestId: jest.fn((...args) => args.filter(Boolean).join('-')),
}));

jest.mock('@lib/icons', () => ({
	FunnelIcon: '/icons/funnel.svg',
	SearchIcon: '/icons/search.svg',
	AddIcon: '/icons/add.svg',
	Exclamation: '/icons/exclamation.svg',
	IconPeopleProfile: '/icons/people.svg',
}));

jest.mock('../../../lib/hooks/usePaymentTypes', () => ({
	usePaymentTypes: jest.fn(),
}));

jest.mock('../../../lib/api/paymentTypesApi', () => ({
	deletePaymentTypesMulti: jest.fn(),
}));

jest.mock('../../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Button: mocks.Button,
	};
});

jest.mock('../../../components/sections/ListPageWrapper', () => ({
	__esModule: true,
	default: ({ children, title, action, breadcrumbLinks, searchBar, testIdPrefix = 'payment-types-hub' }: any) => (
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
	ListRightPanelActions: ({
		selectedCount,
		hasFilters,
		onRemoveFilters,
		onDeleteClick,
		testIdPrefix,
	}: any) => (
		<div data-testid={testIdPrefix}>
			<span data-testid="selected-count-display">{selectedCount}</span>
			{hasFilters ? (
				<button data-testid="remove-filters" onClick={onRemoveFilters}>
					Remove Filters
				</button>
			) : null}
			{onDeleteClick ? (
				<button data-testid="delete" onClick={onDeleteClick}>
					Delete
				</button>
			) : null}
		</div>
	),
}));

jest.mock('../../../components/common/DeleteConfirmationDialog', () => ({
	__esModule: true,
	default: ({ open, onPrimaryCTA, onSecondaryCTA, testIdPrefix, message, primaryCTALabel, secondaryCTALabel }: any) => {
		if (!open) return null;
		return (
			<div data-testid={`${testIdPrefix}-dialog`}>
				<div data-testid={`${testIdPrefix}-message`}>{message}</div>
				{primaryCTALabel ? <div>{primaryCTALabel}</div> : null}
				{secondaryCTALabel ? <div>{secondaryCTALabel}</div> : null}
				<button data-testid={`${testIdPrefix}-confirm`} onClick={onPrimaryCTA}>
					Confirm
				</button>
				<button data-testid={`${testIdPrefix}-cancel`} onClick={onSecondaryCTA}>
					Cancel
				</button>
			</div>
		);
	},
}));

jest.mock('../../../components/common/CommonSnackbar', () => ({
	__esModule: true,
	default: ({ open, message, severity }: any) =>
		open ? (
			<div data-testid="snackbar" data-severity={severity}>
				{message}
			</div>
		) : null,
}));

jest.mock('../../../components/common/EmptyState', () => ({
	__esModule: true,
	default: ({ title, description, buttonLabel, onButtonClick }: any) => (
		<div data-testid="empty-state">
			<div>{title}</div>
			<div>{description}</div>
			{buttonLabel ? (
				<button data-testid="empty-state-cta" onClick={onButtonClick}>
					{buttonLabel}
				</button>
			) : null}
		</div>
	),
}));

jest.mock('@molecules/PaymentTypeFilterDialog', () => ({
	__esModule: true,
	default: ({ open, onClose, onApply }: any) =>
		open ? (
			<div data-testid="payment-type-filter-dialog">
				<button data-testid="filter-apply" onClick={() => onApply({ status: 'Active' })}>
					Apply
				</button>
				<button data-testid="filter-close" onClick={onClose}>
					Close
				</button>
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
						data-testid={b?.buttonProps?.['data-testid'] || `filter-${idx}`}
						disabled={Boolean(b?.disabled)}
						onClick={b?.onClick}
					>
						Filter
					</button>
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
			<button data-testid="quick-link-first" onClick={() => onQuickLinkClick?.(tableData?.rows?.[0])}>
				Quick link first
			</button>
			<button data-testid="per-page-20" onClick={() => onPerPageChange?.(20)}>
				Per page 20
			</button>

			{rightPanelContent}
			<div data-testid="empty-state-slot">{emptyStateContent}</div>
		</div>
	),
}));

type Row = {
	id: string;
	paymentTypeKey: number;
	paymentTypeName: string;
	authorisationProfile: string;
	customerAgreement: string;
	numberOfAccounts: number;
	payAlerts: string;
	status: { value: string; label: string };
	links?: { text?: string; href?: string };
};

const makeRow = (overrides: Partial<Row> = {}): Row => ({
	id: overrides.id ?? '1',
	paymentTypeKey: overrides.paymentTypeKey ?? 111,
	paymentTypeName: overrides.paymentTypeName ?? 'Payment Type 1',
	authorisationProfile: overrides.authorisationProfile ?? 'Auth Profile',
	customerAgreement: overrides.customerAgreement ?? 'Agreement 1',
	numberOfAccounts: overrides.numberOfAccounts ?? 1,
	payAlerts: overrides.payAlerts ?? 'Yes',
	status: overrides.status ?? { value: 'Active', label: 'Active' },
	links: overrides.links ?? { text: 'Manage', href: '/manage/1' },
});

describe('PaymentTypesHubPage', () => {
	const mockPush = jest.fn();
	const mockReplace = jest.fn();
	const mockSearchParams = { get: jest.fn() };
	const mockRefetch = jest.fn();
	const mockDispatch = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: mockReplace });
		(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
		(useTranslations as jest.Mock).mockReturnValue((key: string) => key);
		(deletePaymentTypesMulti as jest.Mock).mockResolvedValue(undefined);
		(usePaymentTypes as jest.Mock).mockReturnValue({ rows: [makeRow()], fetch: mockRefetch });
		(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
		(useAppSelector as jest.Mock).mockImplementation((selector) => {
			const mockState = {
				authorisationProfile: {
					data: [
						{ authProfileName: 'Auth Profile 1', authProfileKey: 1 },
						{ authProfileName: 'Auth Profile 2', authProfileKey: 2 },
					],
				},
				paymentTypes: {
					searchType: '',
					searchValue: '',
					filters: {},
					selectedTab: 0,
				},
			};
			return selector(mockState);
		});
		mockDispatch.mockReturnValue({ type: 'mock' });
		mockSearchParams.get.mockReturnValue(null);
	});

	it('navigates to create page when create button is clicked', async () => {
		const user = userEvent.setup();
		render(<PaymentTypesHubPage />);

		await user.click(screen.getByTestId('payment-types-hub-create-button'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types/create');
	});

	it('disables filter button when there are no rows', () => {
		(usePaymentTypes as jest.Mock).mockReturnValue({ rows: [], fetch: mockRefetch });
		render(<PaymentTypesHubPage />);

		expect(screen.getByTestId('payment-types-hub-filter-button')).toBeDisabled();
	});

	it('shows cancelled snackbar and replaces URL when cancelled=true is present', () => {
		mockSearchParams.get.mockImplementation((key: string) => (key === 'cancelled' ? 'true' : null));
		render(<PaymentTypesHubPage />);

		expect(mockReplace).toHaveBeenCalledWith('/setup-and-admin/payment-types');
		expect(screen.getByTestId('snackbar')).toHaveTextContent('Payment type creation cancelled successfully');
	});

	it('shows reminder snackbar when sendReminder quick link is clicked', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow({ status: { value: 'Awaiting Approval', label: 'Awaiting Approval' } })],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);

		await user.click(screen.getByTestId('quick-link-first'));
		expect(screen.getByTestId('snackbar')).toHaveTextContent('sendReminderSent');
	});

	it('navigates to manage page when manage quick link is clicked', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({ rows: [makeRow({ id: '55' })], fetch: mockRefetch });

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('quick-link-first'));

		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types/manage/55');
	});

	it('deletes only Active rows and shows mixed-status dialog messaging', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [
				makeRow({ id: '1', paymentTypeKey: 111, paymentTypeName: 'Active One', status: { value: 'Active', label: 'Active' } }),
				makeRow({ id: '2', paymentTypeKey: 222, paymentTypeName: 'Draft One', status: { value: 'Draft', label: 'Draft' } }),
			],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);

		await user.click(screen.getByTestId('select-first-two'));
		await user.click(screen.getByTestId('delete'));

		expect(screen.getByText(/Some payment types can\'t be deleted/i)).toBeInTheDocument();

		await user.click(screen.getByTestId('payment-types-hub-delete-dialog-confirm'));

		expect(deletePaymentTypesMulti).toHaveBeenCalledWith([
			{ paymentTypeKey: 111, name: 'Active One' },
		]);
		expect(mockRefetch).toHaveBeenCalled();
		expect(screen.getByTestId('snackbar')).toHaveTextContent('Payment type deleted successfully');
		expect(screen.getByTestId('snackbar')).toHaveAttribute('data-severity', 'success');
	});

	it('applies filters when filter dialog is submitted', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow(), makeRow({ id: '2', paymentTypeName: 'Type 2' })],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('payment-types-hub-filter-button'));
		await user.click(screen.getByTestId('filter-apply'));

		expect(screen.queryByTestId('payment-type-filter-dialog')).not.toBeInTheDocument();
	});

	it('closes filter dialog without applying', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow()],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('payment-types-hub-filter-button'));
		await user.click(screen.getByTestId('filter-close'));

		expect(screen.queryByTestId('payment-type-filter-dialog')).not.toBeInTheDocument();
	});

	it('removes filters when remove filters button is clicked', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow()],
			fetch: mockRefetch,
		});
		(useAppSelector as jest.Mock).mockImplementation((selector) => {
			const mockState = {
				authorisationProfile: {
					data: [{ authProfileName: 'Auth Profile 1', authProfileKey: 1 }],
				},
				paymentTypes: {
					searchType: '',
					searchValue: '',
					filters: { status: 'Active' },
					selectedTab: 0,
				},
			};
			return selector(mockState);
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('remove-filters'));

		expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
			type: 'paymentTypes/clearFiltersAndSearch',
		}));
	});

	it('changes tabs and dispatches action', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow(), makeRow({ id: '2', status: { value: 'Awaiting Approval', label: 'Awaiting Approval' } })],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('tab-1'));

		expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
			type: 'paymentTypes/setSelectedTab',
			payload: 1,
		}));
	});

	it('changes per page setting', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow()],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('per-page-20'));

		expect(screen.getByTestId('table-container')).toBeInTheDocument();
	});

	it('cancels delete dialog', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow()],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('select-first-two'));
		await user.click(screen.getByTestId('delete'));
		await user.click(screen.getByTestId('payment-types-hub-delete-dialog-cancel'));

		expect(screen.queryByTestId('payment-types-hub-delete-dialog-dialog')).not.toBeInTheDocument();
		expect(deletePaymentTypesMulti).not.toHaveBeenCalled();
	});

	it('handles delete API error', async () => {
		const user = userEvent.setup();
		(deletePaymentTypesMulti as jest.Mock).mockRejectedValue(new Error('Delete failed'));
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow()],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('select-first-two'));
		await user.click(screen.getByTestId('delete'));
		await user.click(screen.getByTestId('payment-types-hub-delete-dialog-confirm'));

		expect(screen.getByTestId('snackbar')).toHaveTextContent('Delete failed');
		expect(screen.getByTestId('snackbar')).toHaveAttribute('data-severity', 'error');
	});

	it('deletes multiple Active rows and shows plural message', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [
				makeRow({ id: '1', paymentTypeKey: 111 }),
				makeRow({ id: '2', paymentTypeKey: 222 }),
			],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('select-first-two'));
		await user.click(screen.getByTestId('delete'));
		await user.click(screen.getByTestId('payment-types-hub-delete-dialog-confirm'));

		expect(screen.getByTestId('snackbar')).toHaveTextContent('Payment types deleted successfully');
	});

	it('navigates to manage page for completePaymentType link', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow({ id: '33', status: { value: 'Draft', label: 'Draft' } })],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('quick-link-first'));

		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types/manage/33');
	});

	it('shows empty state when no data and has create button', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);

		expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		await user.click(screen.getByTestId('empty-state-cta'));
		expect(mockPush).toHaveBeenCalledWith('/setup-and-admin/payment-types/create');
	});

	it('does not show delete button on Awaiting Approval tab', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow({ status: { value: 'Awaiting Approval', label: 'Awaiting Approval' } })],
			fetch: mockRefetch,
		});
		(useAppSelector as jest.Mock).mockImplementation((selector) => {
			const mockState = {
				authorisationProfile: {
					data: [{ authProfileName: 'Auth Profile 1', authProfileKey: 1 }],
				},
				paymentTypes: {
					searchType: '',
					searchValue: '',
					filters: {},
					selectedTab: 1,
				},
			};
			return selector(mockState);
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('select-first-two'));

		expect(screen.queryByTestId('delete')).not.toBeInTheDocument();
	});

	it('shows delete button but handles non-active rows with mixed status dialog', async () => {
		const user = userEvent.setup();
		(usePaymentTypes as jest.Mock).mockReturnValue({
			rows: [makeRow({ id: '1', paymentTypeKey: 111, status: { value: 'Draft', label: 'Draft' } })],
			fetch: mockRefetch,
		});

		render(<PaymentTypesHubPage />);
		await user.click(screen.getByTestId('select-first-two'));

		// Delete button should show (canDelete is based on selectedRows.length > 0 && selectedTab !== 1)
		expect(screen.getByTestId('delete')).toBeInTheDocument();

		// Clicking delete should show the mixed status dialog
		await user.click(screen.getByTestId('delete'));
		expect(screen.getByText(/Some payment types can't be deleted/i)).toBeInTheDocument();

		// Clicking cancel should close the dialog without deleting
		await user.click(screen.getByTestId('payment-types-hub-delete-dialog-cancel'));
		expect(deletePaymentTypesMulti).not.toHaveBeenCalled();
	});

	it('dispatches fetchAuthorisationProfiles on mount', () => {
		render(<PaymentTypesHubPage />);
		expect(mockDispatch).toHaveBeenCalled();
	});

	it('renders search bar and dispatches search type change', async () => {
		const user = userEvent.setup();
		render(<PaymentTypesHubPage />);

		expect(screen.getByTestId('search-bar')).toBeInTheDocument();
		
		const searchTypeSelect = screen.getByTestId('search-type-select');
		await user.selectOptions(searchTypeSelect, 'paymentTypeName');

		expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
			type: 'paymentTypes/setSearchType',
			payload: 'paymentTypeName',
		}));
	});

	it('dispatches search value change', async () => {
		const user = userEvent.setup();
		render(<PaymentTypesHubPage />);

		const searchInput = screen.getByTestId('search-field-input');
		await user.type(searchInput, 'test');

		expect(mockDispatch).toHaveBeenCalled();
	});

	it('dispatches filters on advanced search', async () => {
		const user = userEvent.setup();
		(useAppSelector as jest.Mock).mockImplementation((selector) => {
			const mockState = {
				authorisationProfile: {
					data: [{ authProfileName: 'Auth Profile 1', authProfileKey: 1 }],
				},
				paymentTypes: {
					searchType: 'paymentTypeName',
					searchValue: 'test',
					filters: {},
					selectedTab: 0,
				},
			};
			return selector(mockState);
		});

		render(<PaymentTypesHubPage />);
		
		const searchButton = screen.getByTestId('search-button');
		await user.click(searchButton);

		expect(mockDispatch).toHaveBeenCalled();
	});

	it('clears search on clear button click', async () => {
		const user = userEvent.setup();
		render(<PaymentTypesHubPage />);

		const clearButton = screen.getByTestId('search-clear');
		await user.click(clearButton);

		expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
			type: 'paymentTypes/setSearchType',
		}));
		expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
			type: 'paymentTypes/setSearchValue',
		}));
	});

	it('shows dropdown for authorisation profile search type', async () => {
		const user = userEvent.setup();
		(useAppSelector as jest.Mock).mockImplementation((selector) => {
			const mockState = {
				authorisationProfile: {
					data: [
						{ authProfileName: 'Auth Profile 1', authProfileKey: 1 },
						{ authProfileName: 'Auth Profile 2', authProfileKey: 2 },
					],
				},
				paymentTypes: {
					searchType: 'authorisationProfile',
					searchValue: '',
					filters: {},
					selectedTab: 0,
				},
			};
			return selector(mockState);
		});

		render(<PaymentTypesHubPage />);

		expect(screen.getByTestId('search-field-dropdown')).toBeInTheDocument();
		expect(screen.queryByTestId('search-field-input')).not.toBeInTheDocument();
	});

	it('dispatches tab change action', async () => {
		const user = userEvent.setup();
		render(<PaymentTypesHubPage />);

		await user.click(screen.getByTestId('tab-1'));

		expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
			type: 'paymentTypes/setSelectedTab',
			payload: 1,
		}));
	});
});
