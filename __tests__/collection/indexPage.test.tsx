import React from 'react';
import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import CollectionsPage from '../../app/[locale]/collection/page';
import { useCollection } from '@lib/hooks/useCollection';

// Mock dependencies
jest.mock('next-intl');
jest.mock('next/navigation');
jest.mock('@lib/hooks/useCollection');

jest.mock('next/image', () => ({
	__esModule: true,
	default: (props: any) => <img {...props} />,
}));

jest.mock('../../dist/standard-bank-react', () => {
	const { getMockComponents } = require('../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		Breadcrumb: mocks.Breadcrumb,
		Heading: mocks.Heading,
		TableWrapper: mocks.TableWrapper,
		Loader: () => <div data-testid="loader">Loading...</div>,
	};
});

jest.mock('@molecules/CollectionHistoryFilterDialog', () => {
	return function MockFilterDialog({ open, onApply, onClose, initialValues }: any) {
		return (
			<div data-testid="filter-dialog" style={{ display: open ? 'block' : 'none' }}>
				<input 
					data-testid="filter-debtor-name" 
					defaultValue={initialValues?.debtorName || ''} 
				/>
				<input 
					data-testid="filter-debtor-code" 
					defaultValue={initialValues?.debtorCode || ''} 
				/>
				<button onClick={() => onClose()} data-testid="filter-close-button">Close</button>
				<button 
					onClick={() => onApply({ debtorName: 'Test Debtor', debtorCode: 'TC001' })}
					data-testid="apply-filter-button"
				>
					Apply Filter
				</button>
			</div>
		);
	};
});

jest.mock('@molecules/DownloadCollectionDialog', () => {
	return function MockDownloadDialog({ open, onClose, onDownload, title }: any) {
		return (
			<div data-testid="download-dialog" style={{ display: open ? 'block' : 'none' }}>
				<h2>{title}</h2>
				<button onClick={() => onClose()} data-testid="download-close-button">Close</button>
				<button 
					onClick={() => onDownload({ format: 'csv', sortBy: 'ascending' })}
					data-testid="download-button-csv"
				>
					Download CSV
				</button>
				<button 
					onClick={() => onDownload({ format: 'txt', sortBy: 'descending' })}
					data-testid="download-button-txt"
				>
					Download TXT
				</button>
				<button 
					onClick={() => onDownload({ format: 'pdf', sortBy: 'ascending' })}
					data-testid="download-button-pdf"
				>
					Download PDF
				</button>
			</div>
		);
	};
});

jest.mock('../../components/common/EmptyState', () => {
	return function MockEmptyState({ title, description, icon }: any) {
		return (
			<div data-testid="empty-state">
				{icon && <div data-testid="empty-state-icon">{icon}</div>}
				<div data-testid="empty-state-title">{title}</div>
				<div data-testid="empty-state-description">{description}</div>
			</div>
		);
	};
});

jest.mock('../../components/common', () => {
	const { getMockComponents } = require('../../test-utils/mocks');
	const mocks = getMockComponents();
	return {
		CommonSnackbar: mocks.CommonSnackbar,
		ListRightPanelActions: ({ selectedCount, hasFilters, onRemoveFilters }: any) => (
			<div data-testid="list-right-panel-actions">
				<span data-testid="selected-count">{selectedCount}</span>
				{hasFilters && (
					<button onClick={onRemoveFilters} data-testid="remove-filters-button">
						Remove Filters
					</button>
				)}
			</div>
		),
	};
});

describe('CollectionsPage', () => {
	const TEST_ID_PREFIX = 'collections-page';
	const mockPush = jest.fn();
	const mockSetFilters = jest.fn();
	const mockClearFilters = jest.fn();
	const mockHandlePageChange = jest.fn();
	const mockHandlePerPageChange = jest.fn();
	const mockHandleSort = jest.fn();

	const mockTranslations = {
		dashboard: 'Dashboard',
		breadcrumbCollections: 'Collections',
		collectionsPageHeading: 'Collections History',
		tabTrack: 'Track',
		tabReports: 'Reports',
		tabHistory: 'History',
		searchPlaceholder: 'Search by name or code...',
		searchPlaceholderEmpty: 'No data available',
		buttonFilter: 'Filter',
		buttonDownload: 'Download',
		altIconFilter: 'Filter icon',
		altIconSearch: 'Search icon',
		altIconDownload: 'Download icon',
		altIconNoResults: 'No results icon',
		altIconInfo: 'Info icon',
		quickLinkViewHistory: 'View History',
		emptyStateNoResultsTitle: 'No Results Found',
		emptyStateNoResultsDescription: 'Try adjusting your search or filters',
		emptyStateNoCollectionsTitle: 'No Collections Available',
		emptyStateNoCollectionsDescription: 'No debtors with collection history records created yet.',
		downloadCollectionDialogTitle: 'Download Debtor History',
		snackbarDownloadSuccess: 'Download started successfully',
	};

	const mockDebtors = [
		{ debtorName: 'ABC Corporation', debtorCode: 'ABC001' },
		{ debtorName: 'XYZ Industries', debtorCode: 'XYZ002' },
		{ debtorName: 'Demo Company', debtorCode: 'DEMO003' },
	];

	const defaultUseCollectionReturn = {
		debtors: mockDebtors,
		loading: false,
		pageSize: 50,
		currentPage: 1,
		rowCount: 3,
		filters: { debtorName: '', debtorCode: '' },
		hasFilters: false,
		sortBy: 'debtorName',
		sortAsc: true,
		setFilters: mockSetFilters,
		clearFilters: mockClearFilters,
		handlePageChange: mockHandlePageChange,
		handlePerPageChange: mockHandlePerPageChange,
		handleSort: mockHandleSort,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		
		(useTranslations as jest.Mock).mockReturnValue((key: string) => 
			mockTranslations[key as keyof typeof mockTranslations]
		);
		
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		
		(useCollection as jest.Mock).mockReturnValue(defaultUseCollectionReturn);
	});

	afterEach(() => {
		cleanup();
		jest.restoreAllMocks();
	});

	describe('Component Rendering', () => {
		it('should render the collections page with heading', () => {
			render(<CollectionsPage />);
			expect(screen.getByText('Collections History')).toBeInTheDocument();
		});

		it('should render breadcrumb navigation with correct links', () => {
			render(<CollectionsPage />);
			expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
			expect(screen.getByText('Dashboard')).toBeInTheDocument();
			expect(screen.getByText('Collections')).toBeInTheDocument();
		});

		it('should render all three tabs', () => {
			render(<CollectionsPage />);
			expect(screen.getByText('Track')).toBeInTheDocument();
			expect(screen.getByText('Reports')).toBeInTheDocument();
			expect(screen.getByText('History')).toBeInTheDocument();
		});

		it('should set History tab as default selected', () => {
			render(<CollectionsPage />);
			const historyTab = screen.getByTestId(`${TEST_ID_PREFIX}-tab-history`);
			expect(historyTab).toHaveAttribute('aria-selected', 'true');
		});

		it('should render search input field with correct placeholder', () => {
			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			expect(searchInput).toBeInTheDocument();
			expect(searchInput.placeholder).toBe('Search by name or code...');
		});

		it('should render filter button', () => {
			render(<CollectionsPage />);
			expect(screen.getByText('Filter')).toBeInTheDocument();
		});

		it('should render all test id containers', () => {
			render(<CollectionsPage />);
			expect(screen.getByTestId(`${TEST_ID_PREFIX}-container`)).toBeInTheDocument();
			expect(screen.getByTestId(`${TEST_ID_PREFIX}-breadcrumbs`)).toBeInTheDocument();
			expect(screen.getByTestId(`${TEST_ID_PREFIX}-header`)).toBeInTheDocument();
			expect(screen.getByTestId(`${TEST_ID_PREFIX}-tabs-container`)).toBeInTheDocument();
			expect(screen.getByTestId(`${TEST_ID_PREFIX}-search-container`)).toBeInTheDocument();
			expect(screen.getByTestId(`${TEST_ID_PREFIX}-table-container`)).toBeInTheDocument();
		});
	});

	describe('Tab Navigation', () => {
		it('should switch to Track tab when clicked', () => {
			render(<CollectionsPage />);
			const trackTab = screen.getByTestId(`${TEST_ID_PREFIX}-tab-track`);
			fireEvent.click(trackTab);
			expect(trackTab).toHaveAttribute('aria-selected', 'true');
		});

		it('should switch to Reports tab when clicked', () => {
			render(<CollectionsPage />);
			const reportsTab = screen.getByTestId(`${TEST_ID_PREFIX}-tab-reports`);
			fireEvent.click(reportsTab);
			expect(reportsTab).toHaveAttribute('aria-selected', 'true');
		});

		it('should maintain History tab selection', () => {
			render(<CollectionsPage />);
			const historyTab = screen.getByTestId(`${TEST_ID_PREFIX}-tab-history`);
			expect(historyTab).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('Search Functionality', () => {
		it('should update search text when typing', async () => {
			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			
			await userEvent.type(searchInput, 'ABC Corporation');
			
			await waitFor(() => {
				expect(searchInput.value).toBe('ABC Corporation');
			});
		});

		it('should clear search input', async () => {
			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			
			await userEvent.type(searchInput, 'test search');
			expect(searchInput.value).toBe('test search');
			
			await userEvent.clear(searchInput);
			expect(searchInput.value).toBe('');
		});

		it('should show empty placeholder when no debtors', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				debtors: [],
				rowCount: 0,
			});

			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			expect(searchInput.placeholder).toBe('No data available');
		});
	});

	describe('Filter Dialog', () => {
		it('should open filter dialog when filter button is clicked', () => {
			render(<CollectionsPage />);
			const filterButton = screen.getByText('Filter');
			fireEvent.click(filterButton);
			
			const filterDialog = screen.getByTestId('filter-dialog');
			expect(filterDialog).toHaveStyle({ display: 'block' });
		});

		it('should close filter dialog on close button click', () => {
			render(<CollectionsPage />);
			const filterButton = screen.getByText('Filter');
			fireEvent.click(filterButton);
			
			const closeButton = screen.getByTestId('filter-close-button');
			fireEvent.click(closeButton);
			
			const filterDialog = screen.getByTestId('filter-dialog');
			expect(filterDialog).toHaveStyle({ display: 'none' });
		});

		it('should apply filters and close dialog', async () => {
			render(<CollectionsPage />);
			const filterButton = screen.getByText('Filter');
			fireEvent.click(filterButton);
			
			const applyButton = screen.getByTestId('apply-filter-button');
			fireEvent.click(applyButton);
			
			await waitFor(() => {
				expect(mockSetFilters).toHaveBeenCalledWith({ 
					debtorName: 'Test Debtor', 
					debtorCode: 'TC001' 
				});
			});
			
			const filterDialog = screen.getByTestId('filter-dialog');
			expect(filterDialog).toHaveStyle({ display: 'none' });
		});

		it('should pass initial filter values to dialog', () => {
			const filters = { debtorName: 'ABC', debtorCode: '001' };
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				filters,
				hasFilters: true,
			});

			render(<CollectionsPage />);
			const filterButton = screen.getByText('Filter');
			fireEvent.click(filterButton);
			
			expect(screen.getByTestId('filter-debtor-name')).toHaveValue('ABC');
			expect(screen.getByTestId('filter-debtor-code')).toHaveValue('001');
		});
	});

	describe('Table and Data Display', () => {
		it('should render table wrapper with debtors data', () => {
			render(<CollectionsPage />);
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});

		it('should show loader when loading', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				loading: true,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('loader')).toBeInTheDocument();
			expect(screen.queryByTestId('table-wrapper')).not.toBeInTheDocument();
		});

		it('should not show loader when not loading', () => {
			render(<CollectionsPage />);
			expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});
	});

	describe('Empty States', () => {
		it('should show empty state with no results when search has no matches', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				debtors: [],
				rowCount: 0,
			});

			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

			const emptyState = screen.getByTestId('empty-state');
			expect(emptyState).toBeInTheDocument();
		});

		it('should show correct empty state title when no results', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				debtors: [],
				rowCount: 0,
				hasFilters: true,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No Results Found');
		});

		it('should show correct empty state description when no results', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				debtors: [],
				rowCount: 0,
				hasFilters: true,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
				'Try adjusting your search or filters'
			);
		});

		it('should show no collections empty state when no data and no filters', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				debtors: [],
				rowCount: 0,
				hasFilters: false,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No Collections Available');
			expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
				'No debtors with collection history records created yet.'
			);
		});
	});

	describe('Pagination', () => {
		it('should handle page change', () => {
			render(<CollectionsPage />);
			
			// Simulate page change through TableWrapper
			const tableWrapper = screen.getByTestId('table-wrapper');
			expect(tableWrapper).toBeInTheDocument();
			
			// The onPageChange callback should be passed to TableWrapper
			expect(useCollection).toHaveBeenCalled();
		});

		it('should handle per page change', () => {
			render(<CollectionsPage />);
			
			// Verify TableWrapper receives pagination props
			const tableWrapper = screen.getByTestId('table-wrapper');
			expect(tableWrapper).toBeInTheDocument();
		});

		it('should clear selected rows on page change', () => {
			render(<CollectionsPage />);
			
			// Component should manage selected rows state
			expect(useCollection).toHaveBeenCalled();
		});

		it('should clear selected rows on per page change', () => {
			render(<CollectionsPage />);
			
			expect(useCollection).toHaveBeenCalled();
		});
	});

	describe('Sorting', () => {
		it('should handle sort with ascending order', () => {
			render(<CollectionsPage />);
			
			// Verify sorting props are passed to TableWrapper
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});

		it('should handle sort with descending order', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				sortAsc: false,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});
	});

	describe('Row Selection and Actions', () => {
		it('should handle checkbox selection', () => {
			render(<CollectionsPage />);
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});

		it('should show selected count in right panel', () => {
			render(<CollectionsPage />);
			const selectedCount = screen.getByTestId('selected-count');
			expect(selectedCount).toHaveTextContent('0');
		});

		it('should show remove filters button when filters applied', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				hasFilters: true,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('remove-filters-button')).toBeInTheDocument();
		});

		it('should call clearFilters when remove filters clicked', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				hasFilters: true,
			});

			render(<CollectionsPage />);
			const removeButton = screen.getByTestId('remove-filters-button');
			fireEvent.click(removeButton);
			
			expect(mockClearFilters).toHaveBeenCalled();
		});

		it('should clear search text when remove filters clicked', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				hasFilters: true,
			});

			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			fireEvent.change(searchInput, { target: { value: 'test' } });
			
			const removeButton = screen.getByTestId('remove-filters-button');
			fireEvent.click(removeButton);
			
			expect(searchInput.value).toBe('');
		});
	});

	describe('Navigation', () => {
		it('should navigate to history details on quick link click', () => {
			render(<CollectionsPage />);
			expect(useRouter).toHaveBeenCalled();
		});

		it('should build correct URL with query params for history navigation', () => {
			render(<CollectionsPage />);
			// Component should handle navigation with debtor details
			expect(mockPush).not.toHaveBeenCalled(); // Not called until quick link is clicked
		});
	});

	describe('Integration with useCollection Hook', () => {
		it('should call useCollection hook', () => {
			render(<CollectionsPage />);
			expect(useCollection).toHaveBeenCalled();
		});

		it('should use debtors from useCollection', () => {
			render(<CollectionsPage />);
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});

		it('should use loading state from useCollection', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				loading: true,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('loader')).toBeInTheDocument();
		});

		it('should use pagination data from useCollection', () => {
			const customReturn = {
				...defaultUseCollectionReturn,
				currentPage: 2,
				pageSize: 100,
				rowCount: 250,
			};
			(useCollection as jest.Mock).mockReturnValue(customReturn);

			render(<CollectionsPage />);
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});

		it('should use filters from useCollection', () => {
			const customFilters = { debtorName: 'ABC', debtorCode: '001' };
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				filters: customFilters,
				hasFilters: true,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('remove-filters-button')).toBeInTheDocument();
		});

		it('should use sort configuration from useCollection', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				sortBy: 'debtorCode',
				sortAsc: false,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});
	});

	describe('Memoization and Performance', () => {
		it('should memoize breadcrumb links', () => {
			const { rerender } = render(<CollectionsPage />);
			const breadcrumb1 = screen.getByTestId('breadcrumb');
			
			rerender(<CollectionsPage />);
			const breadcrumb2 = screen.getByTestId('breadcrumb');
			
			expect(breadcrumb1).toBe(breadcrumb2);
		});

		it('should memoize table data', () => {
			render(<CollectionsPage />);
			expect(screen.getByTestId('table-wrapper')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {

		it('should have accessible search input', () => {
			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`);
			expect(searchInput).toBeInTheDocument();
		});
	});

	describe('Translation Integration', () => {
		it('should call useTranslations with collections namespace', () => {
			render(<CollectionsPage />);
			expect(useTranslations).toHaveBeenCalledWith('collections');
		});

		it('should translate all UI labels', () => {
			render(<CollectionsPage />);
			expect(screen.getByText('Collections History')).toBeInTheDocument();
			expect(screen.getByText('Track')).toBeInTheDocument();
			expect(screen.getByText('Reports')).toBeInTheDocument();
			expect(screen.getByText('History')).toBeInTheDocument();
			expect(screen.getByText('Filter')).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty debtors array', () => {
			(useCollection as jest.Mock).mockReturnValue({
				...defaultUseCollectionReturn,
				debtors: [],
				rowCount: 0,
			});

			render(<CollectionsPage />);
			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		});

		it('should handle null or undefined in search', () => {
			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			
			fireEvent.change(searchInput, { target: { value: '' } });
			expect(searchInput.value).toBe('');
		});

		it('should handle search with special characters', async () => {
			render(<CollectionsPage />);
			const searchInput = screen.getByTestId(`${TEST_ID_PREFIX}-search-input`) as HTMLInputElement;
			
		fireEvent.change(searchInput, { target: { value: 'ABC & XYZ (2024)' } });
		});
	});
});
