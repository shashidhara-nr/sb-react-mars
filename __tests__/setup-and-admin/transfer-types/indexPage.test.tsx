import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import TransferTypesPage from '../../../app/[locale]/setup-and-admin/transfer-types/page';
import { LINK_TEXT, transferTypesRoute } from '../../../app/[locale]/setup-and-admin/transfer-types/transferTypeHelper';
import { useTransferTypes } from '../../../lib/hooks/useTransferTypes';
import { renderWithProviders, createMockStore } from '../../../test-utils/renderWithProviders';
import transferTypesReducer from '../../../store/slices/setup-admin/transferTypes/transferTypesSlice';

jest.mock('../../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Breadcrumb: mocks.Breadcrumb,
		Heading: mocks.Heading,
		Button: mocks.Button,
		Loader: () => <div data-testid="loader">Loading...</div>,
	};
});

jest.mock('../../../components/common', () => ({
	ListRightPanelActions: ({ selectedCount, hasFilters, onRemoveFilters }: any) => (
		<div data-testid="right-panel-actions">
			<span data-testid="selected-count-display">{selectedCount}</span>
			{hasFilters ? (
				<button data-testid="remove-filters" onClick={onRemoveFilters}>
					Remove Filters
				</button>
			) : null}
		</div>
	),
}));

jest.mock('../../../components/common/DeleteConfirmationDialog', () => {
	const { getMockComponents } = require('../../../test-utils/mocks');
	const mocks = getMockComponents();
	return { __esModule: true, default: mocks.DeleteConfirmationDialog };
});

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

jest.mock('@molecules/TransferTypeFilterDialog', () => ({
	__esModule: true,
	default: ({ open, onClose, onApply }: any) =>
		open ? (
			<div data-testid="transfer-type-filter-dialog">
				<button data-testid="filter-apply" onClick={() => onApply({ status: ['Active'] })}>
					Apply
				</button>
				<button data-testid="filter-close" onClick={onClose}>
					Close
				</button>
			</div>
		) : null,
}));

// Purpose-built TableContainer mock:
// - Renders filter buttons with their passed buttonProps (so we can click by real test ids)
// - Exposes tab switching, paging, and quick-link click hooks
jest.mock('@molecules/TableContainer/TableContainer', () => ({
	__esModule: true,
	default: (() => {
		const { getMockComponents } = require('../../../test-utils/mocks');
		const mocks = getMockComponents();
		return mocks.TableContainer;
	})(),
}));

jest.mock('../../../lib/hooks/useTransferTypes', () => ({
	useTransferTypes: jest.fn(),
}));

type Row = {
	id: string;
	transferTypeName?: string;
	status: { value: string; label: string };
	links?: { text?: string };
};

const makeRows = (count: number, overrides: Partial<Row> = {}): Row[] =>
	Array.from({ length: count }, (_, i) => ({
		id: String(i + 1),
		transferTypeName: `Transfer ${i + 1}`,
		status: { value: 'ACT', label: 'Active' },
		links: { text: LINK_TEXT.manage },
		...overrides,
	}));

const setupUseTransferTypesMock = (opts?: {
	initialFilteredData?: Row[];
	initialSelectedRows?: Row[];
	initialSearchText?: string;
	initialFilters?: Record<string, any>;
	initialHasFiltersOrSearch?: boolean;
}) => {
	const {
		initialFilteredData = makeRows(3),
		initialSelectedRows = [],
		initialSearchText = '',
		initialFilters = {},
		initialHasFiltersOrSearch = false,
	} = opts || {};

	const spies = {
		applyFilters: jest.fn(),
		updateSearchText: jest.fn(),
		selectRows: jest.fn(),
		clearAllFilters: jest.fn(),
		deleteSelected: jest.fn(),
	};

	(useTransferTypes as jest.Mock).mockImplementation(() => {
		const [data] = React.useState<Row[]>(initialFilteredData);
		const [filteredData, setFilteredData] = React.useState<Row[]>(initialFilteredData);
		const [filters, setFilters] = React.useState<Record<string, any>>(initialFilters);
		const [searchText, setSearchText] = React.useState<string>(initialSearchText);
		const [selectedRows, setSelectedRows] = React.useState<Row[]>(initialSelectedRows);
		const [hasFiltersOrSearch, setHasFiltersOrSearch] = React.useState<boolean>(initialHasFiltersOrSearch);

		// Keep latest filters accessible without changing callback identities.
		const filtersRef = React.useRef(filters);
		React.useEffect(() => {
			filtersRef.current = filters;
		}, [filters]);

		// IMPORTANT: These callbacks must be stable across renders.
		// The page effect depends on `clearAllFilters` and `selectRows`; if their identities change,
		// React will re-run the effect each render and the cleanup will set state → infinite loop.
		const applyFiltersCb = React.useCallback((newFilters: any) => {
			spies.applyFilters(newFilters);
			setFilters(newFilters);
			setHasFiltersOrSearch(true);
		}, []);

		const updateSearchTextCb = React.useCallback((value: string) => {
			spies.updateSearchText(value);
			setSearchText(value);
			const currentFilters = filtersRef.current || {};
			setHasFiltersOrSearch(Boolean(value) || Object.keys(currentFilters).length > 0);
			// Optional: emulate server filtering by search text
			setFilteredData(
				initialFilteredData.filter((r) =>
					(r.transferTypeName || '').toLowerCase().includes(String(value).toLowerCase())
				)
			);
		}, []);

		const selectRowsCb = React.useCallback((rows: Row[]) => {
			spies.selectRows(rows);
			setSelectedRows(rows);
		}, []);

		const clearAllFiltersCb = React.useCallback(() => {
			spies.clearAllFilters();
			setFilters({});
			setSearchText('');
			setHasFiltersOrSearch(false);
			setFilteredData(initialFilteredData);
		}, []);

		const deleteSelectedCb = React.useCallback((ids: string[]) => {
			spies.deleteSelected(ids);
			// emulate deletion by clearing selection
			setSelectedRows([]);
		}, []);

		return {
			data,
			filteredData,
			filters,
			searchText,
			selectedRows,
			hasFiltersOrSearch,
			isLoading: false,
			applyFilters: applyFiltersCb,
			updateSearchText: updateSearchTextCb,
			selectRows: selectRowsCb,
			clearAllFilters: clearAllFiltersCb,
			deleteSelected: deleteSelectedCb,
		};
	});

	return spies;
};

describe('TransferTypesPage', () => {
	const mockPush = jest.fn();
	const mockTranslate = jest.fn((key: string) => key);
	
	const createTestStore = () => {
		return createMockStore(
			{
				transferTypes: {
					data: [],
					filteredData: [],
					agreements: [
						{ agreementName: 'Agreement 1' },
						{ agreementName: 'Agreement 2' },
					],
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
				}
			},
			{ transferTypes: transferTypesReducer }
		);
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTranslations as jest.Mock).mockReturnValue(mockTranslate);
	});

	describe('Rendering', () => {
		it('renders the page container and heading', () => {
			setupUseTransferTypesMock({ initialFilteredData: makeRows(1) });
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			expect(screen.getByTestId('transfer-types-hub-page')).toBeInTheDocument();
				expect(screen.getByTestId('transfer-types-hub-heading')).toHaveTextContent('pageHeading');
			expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
		});
	});

	describe('Navigation', () => {
		it('navigates to create route when Create button is clicked', async () => {
			setupUseTransferTypesMock({ initialFilteredData: makeRows(1) });
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			await user.click(screen.getByTestId('transfer-types-hub-create-button'));
			expect(mockPush).toHaveBeenCalledWith(transferTypesRoute.create);
		});

		it('navigates to details route when quick link is manage', async () => {
			setupUseTransferTypesMock({
				initialFilteredData: [
					{
						id: '99',
						transferTypeName: 'Row',
						status: { value: 'Active', label: 'Active' },
						links: { text: LINK_TEXT.manage },
					},
				],
			});

			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			await user.click(screen.getByTestId('quick-link'));
			expect(mockPush).toHaveBeenCalledWith(transferTypesRoute.details.replace(':id', '99'));
		});

		it('shows success snackbar and does not navigate when quick link is reminder', async () => {
			setupUseTransferTypesMock({
				initialFilteredData: [
					{
						id: '1',
						transferTypeName: 'Row',
						status: { value: 'APP', label: 'Awaiting Approval' },
						links: { text: LINK_TEXT.reminder },
					},
				],
			});
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			await user.click(screen.getByTestId('quick-link'));
			expect(mockPush).not.toHaveBeenCalled();
			expect(await screen.findByText('snackbarReminderSent')).toBeInTheDocument();
		});
	});

	describe('Search', () => {
		it('calls updateSearchText on input and filters rows deterministically', async () => {
			const spies = setupUseTransferTypesMock({
				initialFilteredData: [
					{ id: '1', transferTypeName: 'Alpha', status: { value: 'Active', label: 'Active' }, links: { text: LINK_TEXT.manage } },
					{ id: '2', transferTypeName: 'Beta', status: { value: 'Active', label: 'Active' }, links: { text: LINK_TEXT.manage } },
				],
			});
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			const searchRoot = screen.getByTestId('transfer-types-hub-search-input');
			const input = within(searchRoot).getByRole('textbox');

			await user.type(input, 'alp');
			expect(spies.updateSearchText).toHaveBeenCalled();
			expect(screen.getByTestId('row-count')).toHaveTextContent('1');
		});

		it('uses the empty placeholder when there are no mapped rows', () => {
			setupUseTransferTypesMock({ initialFilteredData: [] });
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			const searchRoot = screen.getByTestId('transfer-types-hub-search-input');
			const input = within(searchRoot).getByRole('textbox');
			expect(input).toHaveAttribute('placeholder', 'searchPlaceholderEmpty');
		});
	});

	describe('Tabs and status filtering', () => {
		it('filters rows by status when a non-all tab is selected', async () => {
			setupUseTransferTypesMock({
				initialFilteredData: [
					{ id: '1', transferTypeName: 'A', status: { value: 'APP', label: 'Awaiting Approval' }, links: { text: LINK_TEXT.manage } },
					{ id: '2', transferTypeName: 'B', status: { value: 'ACT', label: 'Active' }, links: { text: LINK_TEXT.manage } },
				],
			});
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			// All tab shows both rows
			expect(screen.getByTestId('row-count')).toHaveTextContent('2');

			// Click Awaiting Approval tab (index 1)
			// The TableContainer mock triggers onTabChange which updates selectedTab state
			// The component then filters mappedRows based on selectedTab, showing only APP status
			await user.click(screen.getByTestId('tab-needs-action'));
			// After tab change, only 1 row with 'APP' status should be shown
			expect(screen.getByTestId('row-count')).toHaveTextContent('1');
		});
	});

	describe('Filter dialog', () => {
it('does not render filter button when there is no data', async () => {
				setupUseTransferTypesMock({ initialFilteredData: [] });
				renderWithProviders(<TransferTypesPage />, { store: createTestStore() });
				// Filter button should not be rendered when data is empty
				// The component checks: if (data && data.length > 0) before adding filter button
				const filterButtons = screen.getByTestId('filter-buttons');
				// Filter buttons container should be empty
				expect(filterButtons).toBeEmptyDOMElement();
		});

		it('opens filter dialog and applies filters', async () => {
			const spies = setupUseTransferTypesMock({ initialFilteredData: makeRows(1) });
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });
			// Click the filter button from the TableContainer action buttons
			const filterButton = screen.getByTestId('transfer-types-hub-filter-button');
			await user.click(filterButton);
			expect(screen.getByTestId('transfer-type-filter-dialog')).toBeInTheDocument();

			await user.click(screen.getByTestId('filter-apply'));
			expect(spies.applyFilters).toHaveBeenCalledWith({ status: ['Active'] });
			expect(screen.queryByTestId('transfer-type-filter-dialog')).not.toBeInTheDocument();
		});
	});

	describe('Row selection and delete', () => {
		it('wraps single-row selection into an array (edge case)', async () => {
			const spies = setupUseTransferTypesMock({ initialFilteredData: makeRows(1) });
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });
			// Shared mock selects array rows via select-row-1
			await user.click(screen.getByTestId('select-row-1'));
			expect(spies.selectRows).toHaveBeenCalledWith([
				expect.objectContaining({ id: '1' }),
			]);
			expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
		});

		it('shows delete action when rows are selected and confirms deletion', async () => {
			const spies = setupUseTransferTypesMock({ initialFilteredData: makeRows(1) });
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });
			await user.click(screen.getByTestId('select-row-1'));
			expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

			// Delete button is rendered with the correct test ID
			const deleteButton = screen.getByTestId('transfer-types-hub-delete-selected-button');
			await user.click(deleteButton);
			expect(screen.getByTestId('transfer-types-hub-delete-dialog-dialog')).toBeInTheDocument();

			await user.click(screen.getByTestId('transfer-types-hub-delete-dialog-dialog-confirm'));
			expect(spies.deleteSelected).toHaveBeenCalled();
			expect(screen.queryByTestId('transfer-types-hub-delete-dialog-dialog')).not.toBeInTheDocument();
		});
	});

	describe('Pagination behavior', () => {
		it('slices rows per page and resets selection on page change', async () => {
			setupUseTransferTypesMock({ initialFilteredData: makeRows(16) });
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });


			expect(screen.getByTestId('row-count')).toHaveTextContent('15');

			await user.click(screen.getByTestId('select-row-1'));
			expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

			await user.click(screen.getByTestId('page-change'));
			expect(screen.getByTestId('row-count')).toHaveTextContent('1');
			expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
		});

		it('changes per-page, resets to page 1, and clears selection', async () => {
			setupUseTransferTypesMock({ initialFilteredData: makeRows(16) });
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });
			await user.click(screen.getByTestId('page-change'));

			await user.click(screen.getByTestId('select-row-1'));
			expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

			await user.click(screen.getByTestId('per-page-change'));
			expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
			expect(screen.getByTestId('row-count')).toHaveTextContent('16');
		});
	});

	describe('Empty states and right panel actions', () => {
		it('renders "no data" empty state on All tab', async () => {
			setupUseTransferTypesMock({ initialFilteredData: [] });
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			// The component renders empty state without a CTA button
			// The EmptyState component gets title and description but no buttonLabel
			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			expect(screen.getByText('emptyStateNoRecordsTitle')).toBeInTheDocument();
			expect(screen.getByText('emptyStateNoRecordsDescription')).toBeInTheDocument();
			// The Create button exists separately at the top of the page
			expect(screen.getByTestId('transfer-types-hub-create-button')).toBeInTheDocument();
		});

		it('invokes clearAllFilters from right panel when filters/search are active', async () => {
			const spies = setupUseTransferTypesMock({
				initialFilteredData: makeRows(1),
				initialHasFiltersOrSearch: true,
			});
			const user = userEvent.setup();
			renderWithProviders(<TransferTypesPage />, { store: createTestStore() });

			await user.click(screen.getByTestId('remove-filters'));
			expect(spies.clearAllFilters).toHaveBeenCalledTimes(1);
		});
	});

	describe('Side effects', () => {
		it('clears filters and selection on unmount (cleanup effect)', () => {
			const spies = setupUseTransferTypesMock({
				initialFilteredData: makeRows(1),
				initialHasFiltersOrSearch: true,
				initialSelectedRows: makeRows(1),
			});

			const { unmount } = renderWithProviders(<TransferTypesPage />, { store: createTestStore() });
			unmount();

			expect(spies.clearAllFilters).toHaveBeenCalledTimes(1);
			expect(spies.selectRows).toHaveBeenCalledWith([]);
		});
	});
});
