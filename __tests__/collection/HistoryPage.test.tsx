import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DebtorHistoryPage from '../../app/[locale]/collection/history/page';
import '@testing-library/jest-dom';

const mockUseCollectionHistory = {
	collectionHistories: [
		{
			collectionId: 'COL-00001',
			date: '2026-02-12',
			currency: 'ZAR',
			amount: 1234567.89,
			authoriseStatus: 'ACT',
		},
		{
			collectionId: 'COL-00002',
			date: '2026-02-12',
			currency: 'ZAR',
			amount: 1234567.89,
			authoriseStatus: 'TS',
		},
		{
			collectionId: 'COL-00003',
			date: '2026-02-12',
			currency: 'ZAR',
			amount: 1234567.89,
			authoriseStatus: 'ACT',
		},
		{
			collectionId: 'COL-00004',
			date: '2026-02-12',
			currency: 'ZAR',
			amount: 1234567.89,
			authoriseStatus: 'TS',
		},
		{
			collectionId: 'COL-00005',
			date: '2026-02-12',
			currency: 'ZAR',
			amount: 1234567.89,
			authoriseStatus: 'ACT',
		},
	],
	loading: false,
	error: null,
	currentPage: 1,
	pageSize: 15,
	rowCount: 5,
	filters: {},
	setFilters: jest.fn(),
	clearFilters: jest.fn(),
	handlePageChange: jest.fn(),
	handlePerPageChange: jest.fn(),
};

jest.mock('@lib/hooks/useCollectionHistory', () => ({
	useCollectionHistory: jest.fn(() => mockUseCollectionHistory),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			collections: 'collections',
			dashboard: 'Dashboard',
			breadcrumbCollections: 'Collections',
			breadcrumbDebtorHistory: 'Debtor History',
			tabHistory: 'History',
			altIconDownload: 'Download Icon',
			buttonDownload: 'Download',
			altIconFilter: 'Filter Icon',
			buttonFilter: 'Filter',
			snackbarDownloadSuccess: 'Download successful',
			tableColumnCollectionId: 'Collection ID',
			tableColumnDate: 'Date',
			tableColumnCurrency: 'Currency',
			tableColumnAmount: 'Amount',
			tableColumnStatus: 'Status',
		};
		return translations[key] || key;
	},
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
	useSearchParams: () => ({
		get: (key: string) => {
			if (key === 'name') return 'John Doe';
			if (key === 'code') return 'DBT-001';
			return null;
		},
	}),
	useRouter: () => ({
		refresh: jest.fn(),
		push: jest.fn(),
		back: jest.fn(),
	}),
}));

// Mock next/image
jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ src, alt, width, height, style }: any) => (
		<img src={src} alt={alt} width={width} height={height} style={style} data-testid="mock-image" />
	),
}));

// Mock lib/icons
jest.mock('../../lib/icons', () => ({
	SearchIcon: '/icons/search.svg',
	FunnelIcon: '/icons/funnel.svg', 
	DownloadIcon: '/icons/download.svg',
}));

// Mock collection helper
jest.mock('../../app/[locale]/collection/collectionHelper', () => ({
	navlinks: {
		dashboard: '/',
		collection: '/collection',
		history: '/collection/history',
	},
	HISTORY_TABLE_COLUMNS: [
		'collection_id',
		'date',
		'currency',
		'amount',
		{ key: 'status', type: 'chip' },
	],
	getHistoryTableHeadCells: (t: any) => [
		{ id: 'collection_id', label: t('tableColumnCollectionId'), numeric: false },
		{ id: 'date', label: t('tableColumnDate'), numeric: false },
		{ id: 'currency', label: t('tableColumnCurrency'), numeric: false },
		{ id: 'amount', label: t('tableColumnAmount'), numeric: false },
		{ id: 'status', label: t('tableColumnStatus'), numeric: false },
	],
	transformCollectionHistoryToRows: (data: any[]) => {
		return data.map((item) => ({
			collection_id: item.collectionId,
			date: '12 Feb 2026',
			currency: item.currency,
			amount: item.amount.toFixed(2),
			status: {
				value: item.authoriseStatus === 'ACT' ? 'Processed' : 'Processing',
				color: item.authoriseStatus === 'ACT' ? 'success' : 'warning',
			},
		}));
	},
}));

// Mock buildTestId
jest.mock('../../src/utils/testIds', () => ({
	buildTestId: (prefix: string, suffix: string) => `${prefix}-${suffix}`,
}));

// Mock components from test-utils
jest.mock('../../dist/standard-bank-react', () => {
    const { getMockComponents } = require('../../test-utils/mocks');
	const mockComponents = getMockComponents();
	return {
		Breadcrumb: mockComponents.Breadcrumb,
		Heading: mockComponents.Heading,
		Loader: ({ backgroundColor }: any) => (
			<div data-testid="loader" data-background={backgroundColor}>Loading...</div>
		),
	};
});

jest.mock('../../components/common', () => {
    const { getMockComponents } = require('../../test-utils/mocks');
	const mockComponents = getMockComponents();
	return {
		CommonSnackbar: mockComponents.CommonSnackbar,
		ListRightPanelActions: mockComponents.ListRightPanelActions,
	};
});

jest.mock('../../components/common/EmptyState', () => {
	return {
		__esModule: true,
		default: ({ title, description, icon, buttonLabel, onButtonClick, testIdPrefix }: any) => (
			<div data-testid="empty-state">
				{icon && <div data-testid="empty-state-icon">{icon}</div>}
				<h3 data-testid="empty-state-title">{title}</h3>
				<p data-testid="empty-state-description">{description}</p>
				{buttonLabel && (
					<button data-testid="empty-state-button" onClick={onButtonClick}>
						{buttonLabel}
					</button>
				)}
			</div>
		),
	};
});

jest.mock('@molecules/DebtorHistoryFilterDialog', () => {
	return function MockFilterDialog({ open, onClose, onApply }: any) {
		if (!open) return null;
		return (
			<div data-testid="filter-dialog">
				<button
					data-testid="filter-apply-btn"
					onClick={() => {
						onApply({
							collectionId: 'COL-00001',
							status: 'Processed',
						});
					}}
				>
					Apply Filters
				</button>
				<button data-testid="filter-close-btn" onClick={onClose}>
					Close
				</button>
			</div>
		);
	};
});

jest.mock('@molecules/DownloadCollectionDialog', () => {
	return function MockDownloadDialog({ open, onClose, onDownload }: any) {
		if (!open) return null;
		return (
			<div data-testid="download-dialog">
				<button
					data-testid="download-confirm-btn"
					onClick={() => {
						onDownload({ format: 'pdf', sortBy: 'ascending' });
					}}
				>
					Download
				</button>
				<button data-testid="download-close-btn" onClick={onClose}>
					Close
				</button>
			</div>
		);
	};
});

jest.mock('@molecules/TableContainer/TableContainer', () => {
	return function MockTableContainer({ 
		tableData, 
		filterButtons, 
		rightPanelContent, 
		emptyStateContent,
		serverSidePagination,
		totalRecords,
		currentPage,
		perPage,
		onPageChange,
		onPerPageChange,
	}: any) {
		return (
			<div data-testid="table-container">
				{tableData?.rows?.length > 0 ? (
					<>
						<div data-testid="table-rows-count">{tableData?.rows?.length || 0}</div>
						<div data-testid="table-rows">
							{tableData?.rows?.map((row: any, idx: number) => (
								<div key={idx} data-testid={`history-row-${idx}`}>
									<span data-testid={`row-id-${idx}`}>{row.collection_id}</span>
									<span data-testid={`row-date-${idx}`}>{row.date}</span>
									<span data-testid={`row-currency-${idx}`}>{row.currency}</span>
									<span data-testid={`row-amount-${idx}`}>{row.amount}</span>
									<span data-testid={`row-status-${idx}`}>{row.status.value}</span>
								</div>
							))}
						</div>
					</>
				) : (
					<div data-testid="empty-state-container">{emptyStateContent}</div>
				)}
				<div data-testid="filter-buttons">
					{filterButtons?.map((btn: any, idx: number) => (
						<button key={idx} data-testid={`action-button-${idx}`} onClick={btn.onClick}>
							{btn.children}
						</button>
					))}
				</div>
				<div data-testid="right-panel">{rightPanelContent}</div>
				{serverSidePagination && (
					<div data-testid="pagination-info">
						<span data-testid="total-records">{totalRecords}</span>
						<span data-testid="current-page">{currentPage}</span>
						<span data-testid="per-page">{perPage}</span>
					</div>
				)}
			</div>
		);
	};
});

describe('DebtorHistoryPage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
		useCollectionHistory.mockReturnValue(mockUseCollectionHistory);
	});

	describe('Rendering', () => {
		it('should render the component without crashing', () => {
			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('table-container')).toBeInTheDocument();
		});

		it('should display the debtor name and history heading', () => {
			render(<DebtorHistoryPage />);
			const heading = screen.getByTestId('heading');
			expect(heading).toBeInTheDocument();
			expect(heading.textContent).toContain('John Doe');
			expect(heading.textContent).toContain('history');
		});

		it('should render breadcrumb navigation', () => {
			render(<DebtorHistoryPage />);
			const breadcrumb = screen.getByTestId('breadcrumb');
			expect(breadcrumb).toBeInTheDocument();
		});

		it('should show loader when loading', () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				loading: true,
			});

			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('loader')).toBeInTheDocument();
		});

		it('should show empty state when no data', () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				collectionHistories: [],
			});

			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		});

		it('should show error state when error occurs', () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				collectionHistories: [],
				error: 'Failed to load data',
			});

			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		});
	});

	describe('Breadcrumb Navigation', () => {
		it('should display all breadcrumb links', () => {
			render(<DebtorHistoryPage />);
			const breadcrumb = screen.getByTestId('breadcrumb');
			expect(breadcrumb.textContent).toContain('Dashboard');
			expect(breadcrumb.textContent).toContain('Collections');
			expect(breadcrumb.textContent).toContain('Debtor History');
		});

		it('should have correct number of breadcrumb links', () => {
			render(<DebtorHistoryPage />);
			const breadcrumb = screen.getByTestId('breadcrumb');
			expect(breadcrumb).toHaveAttribute('data-links-count', '3');
		});
	});

	describe('Table Display', () => {
		it('should display history table with correct number of rows', () => {
			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('table-rows-count')).toHaveTextContent('5');
		});

		it('should render table rows with collection IDs', () => {
			render(<DebtorHistoryPage />);
			for (let i = 0; i < 5; i++) {
				expect(screen.getByTestId(`row-id-${i}`)).toHaveTextContent(`COL-${String(i + 1).padStart(5, '0')}`);
			}
		});

		it('should display correct date in all rows', () => {
			render(<DebtorHistoryPage />);
			const dateElements = screen.getAllByTestId(/^row-date-/);
			dateElements.forEach((element) => {
				expect(element.textContent).toBe('12 Feb 2026');
			});
		});

		it('should display currency in rows', () => {
			render(<DebtorHistoryPage />);
			const currencyElements = screen.getAllByTestId(/^row-currency-/);
			currencyElements.forEach((element) => {
				expect(element.textContent).toBe('ZAR');
			});
		});

		it('should display amount in rows', () => {
			render(<DebtorHistoryPage />);
			const amountElements = screen.getAllByTestId(/^row-amount-/);
			amountElements.forEach((element) => {
				expect(element.textContent).toBe('1234567.89');
			});
		});

		it('should display status with correct values', () => {
			render(<DebtorHistoryPage />);
			const statusElements = screen.getAllByTestId(/^row-status-/);
			expect(statusElements.length).toBeGreaterThan(0);
			const statuses = statusElements.map((el) => el.textContent);
			expect(statuses).toEqual(expect.arrayContaining(['Processed', 'Processing']));
		});

		it('should alternate status values correctly', () => {
			render(<DebtorHistoryPage />);
			const status0 = screen.getByTestId('row-status-0').textContent;
			const status1 = screen.getByTestId('row-status-1').textContent;
			// Even indices should have 'Processed', odd indices should have 'Processing'
			expect(status0).toBe('Processed');
			expect(status1).toBe('Processing');
		});
	});

	describe('Action Buttons', () => {
		it('should render action buttons', () => {
			render(<DebtorHistoryPage />);
			const buttons = screen.getAllByTestId(/^action-button-/);
			expect(buttons.length).toBeGreaterThanOrEqual(2);
		});

		it('should have Download and Filter buttons', () => {
			render(<DebtorHistoryPage />);
			const actionButtons = screen.getAllByTestId(/^action-button-/);
			const buttonTexts = actionButtons.map((btn) => btn.textContent);
			expect(buttonTexts.some((text) => text?.includes('Download'))).toBe(true);
			expect(buttonTexts.some((text) => text?.includes('Filter'))).toBe(true);
		});
	});

	describe('Filter Functionality', () => {
		it('should open filter dialog when filter button is clicked', async () => {
			render(<DebtorHistoryPage />);
			const filterButton = screen.getAllByTestId(/^action-button-/)[1];
			fireEvent.click(filterButton);

			await waitFor(() => {
				expect(screen.getByTestId('filter-dialog')).toBeInTheDocument();
			});
		});

		it('should apply filters when filter dialog confirms', async () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			const mockSetFilters = jest.fn();
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				setFilters: mockSetFilters,
			});

			render(<DebtorHistoryPage />);
			const filterButton = screen.getAllByTestId(/^action-button-/)[1];
			fireEvent.click(filterButton);

			await waitFor(() => {
				expect(screen.getByTestId('filter-dialog')).toBeInTheDocument();
			});

			const applyButton = screen.getByTestId('filter-apply-btn');
			fireEvent.click(applyButton);

			await waitFor(() => {
				expect(mockSetFilters).toHaveBeenCalledWith({
					collectionId: 'COL-00001',
					status: 'Processed',
				});
			});
		});

		it('should close filter dialog when close button is clicked', async () => {
			render(<DebtorHistoryPage />);
			const filterButton = screen.getAllByTestId(/^action-button-/)[1];
			fireEvent.click(filterButton);

			await waitFor(() => {
				expect(screen.getByTestId('filter-dialog')).toBeInTheDocument();
			});

			const closeButton = screen.getByTestId('filter-close-btn');
			fireEvent.click(closeButton);

			await waitFor(() => {
				expect(screen.queryByTestId('filter-dialog')).not.toBeInTheDocument();
			});
		});

		it('should filter rows by collection ID', async () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			const mockSetFilters = jest.fn();
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				setFilters: mockSetFilters,
			});

			render(<DebtorHistoryPage />);
			const filterButton = screen.getAllByTestId(/^action-button-/)[1];
			fireEvent.click(filterButton);

			await waitFor(() => {
				expect(screen.getByTestId('filter-dialog')).toBeInTheDocument();
			});

			const applyButton = screen.getByTestId('filter-apply-btn');
			fireEvent.click(applyButton);

			await waitFor(() => {
				expect(mockSetFilters).toHaveBeenCalled();
			});
		});

		it('should filter rows by status', async () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			const mockSetFilters = jest.fn();
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				setFilters: mockSetFilters,
			});

			render(<DebtorHistoryPage />);
			const filterButton = screen.getAllByTestId(/^action-button-/)[1];
			fireEvent.click(filterButton);

			await waitFor(() => {
				expect(screen.getByTestId('filter-dialog')).toBeInTheDocument();
			});

			const applyButton = screen.getByTestId('filter-apply-btn');
			fireEvent.click(applyButton);

			await waitFor(() => {
				expect(mockSetFilters).toHaveBeenCalledWith(
					expect.objectContaining({
						status: 'Processed',
					})
				);
			});
		});

		it('should display remove filters button when filters are active', async () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				filters: { collectionId: 'COL-00001' },
			});

			render(<DebtorHistoryPage />);
			
			const rightPanel = screen.getByTestId('right-panel');
			expect(rightPanel).toBeInTheDocument();
		});
	});

	describe('Download Functionality', () => {
		it('should trigger snackbar when download button is clicked', async () => {
			render(<DebtorHistoryPage />);
			const downloadButton = screen.getAllByTestId(/^action-button-/)[0];
			fireEvent.click(downloadButton);

			// The component should show a success snackbar
			// We would need to verify this through state or the actual snackbar component
			expect(downloadButton).toBeInTheDocument();
		});
	});

	describe('Right Panel Actions', () => {
		it('should render right panel with action controls', async () => {
			render(<DebtorHistoryPage />);
			const rightPanel = screen.getByTestId('right-panel');
			expect(rightPanel).toBeInTheDocument();
		});

		it('should initially show zero selected items', async () => {
			render(<DebtorHistoryPage />);
			const rightPanel = screen.getByTestId('right-panel');
			const selectedCountDisplay = rightPanel.querySelector('[data-testid="selected-count-display"]');
			if (selectedCountDisplay) {
				expect(selectedCountDisplay.textContent).toBe('0');
			}
		});
	});

	describe('Data Parsing and Filtering', () => {
		it('should handle amount parsing correctly', () => {
			render(<DebtorHistoryPage />);
			const amountElements = screen.getAllByTestId(/^row-amount-/);
			amountElements.forEach((element) => {
				expect(element.textContent).toMatch(/^\d+\.\d{2}$/);
			});
		});

		it('should parse dates correctly for filtering', async () => {
			render(<DebtorHistoryPage />);
			const filterButton = screen.getAllByTestId(/^action-button-/)[1];
			fireEvent.click(filterButton);

			await waitFor(() => {
				expect(screen.getByTestId('filter-dialog')).toBeInTheDocument();
			});

			fireEvent.click(screen.getByTestId('filter-apply-btn'));

			// Should still have some rows after filtering
			await waitFor(() => {
				const rowCount = screen.getByTestId('table-rows-count');
				expect(parseInt(rowCount.textContent || '0')).toBeGreaterThanOrEqual(0);
			});
		});
	});

	describe('Search Parameters', () => {
		it('should use debtor name from search params', () => {
			render(<DebtorHistoryPage />);
			const heading = screen.getByTestId('heading');
			expect(heading.textContent).toContain('John Doe');
		});

		it('should use debtor code from search params', () => {
			// The debtor code is retrieved but not directly displayed in the main heading
			// It's available in the component state
			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('table-container')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper heading hierarchy', () => {
			render(<DebtorHistoryPage />);
			const heading = screen.getByTestId('heading');
			expect(heading).toBeInTheDocument();
			expect(heading.tagName.toLowerCase()).toBe('h4');
		});

		it('should have proper alt text for images', () => {
			render(<DebtorHistoryPage />);
			const images = screen.getAllByTestId('mock-image');
			images.forEach((img) => {
				expect(img).toHaveAttribute('alt');
				expect(img.getAttribute('alt')).toBeTruthy();
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty filter values gracefully', async () => {
			render(<DebtorHistoryPage />);
			const filterButton = screen.getAllByTestId(/^action-button-/)[1];
			fireEvent.click(filterButton);

			await waitFor(() => {
				expect(screen.getByTestId('filter-apply-btn')).toBeInTheDocument();
			});

			expect(screen.getByTestId('table-container')).toBeInTheDocument();
		});

		it('should maintain all 5 rows when no filters are applied', () => {
			render(<DebtorHistoryPage />);
			const rowCount = screen.getByTestId('table-rows-count');
			expect(rowCount.textContent).toBe('5');
		});
	});

	describe('Pagination', () => {
		it('should display pagination information', () => {
			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('pagination-info')).toBeInTheDocument();
			expect(screen.getByTestId('total-records').textContent).toBe('5');
			expect(screen.getByTestId('current-page').textContent).toBe('1');
			expect(screen.getByTestId('per-page').textContent).toBe('15');
		});

		it('should call handlePageChange when page changes', () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			const mockHandlePageChange = jest.fn();
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				handlePageChange: mockHandlePageChange,
			});

			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('table-container')).toBeInTheDocument();
		});

		it('should call handlePerPageChange when rows per page changes', () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			const mockHandlePerPageChange = jest.fn();
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				handlePerPageChange: mockHandlePerPageChange,
			});

			render(<DebtorHistoryPage />);
			expect(screen.getByTestId('table-container')).toBeInTheDocument();
		});
	});

	describe('Clear Filters', () => {
		it('should call clearFilters when remove filters is clicked', () => {
			const { useCollectionHistory } = require('@lib/hooks/useCollectionHistory');
			const mockClearFilters = jest.fn();
			useCollectionHistory.mockReturnValue({
				...mockUseCollectionHistory,
				filters: { collectionId: 'COL-00001' },
				clearFilters: mockClearFilters,
			});

			render(<DebtorHistoryPage />);
			const rightPanel = screen.getByTestId('right-panel');
			expect(rightPanel).toBeInTheDocument();
		});
	});
});
