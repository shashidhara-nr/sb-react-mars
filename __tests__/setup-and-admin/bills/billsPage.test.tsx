import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src, ...props }: any) => (
    <img {...props} alt={alt} src={src || ''} />
  ),
}));

jest.mock('../../../lib/mock/mockBills', () => ({
  mockBills: [
    {
      id: '1',
      billerName: { name: 'Biller A', billerCode: 'BA001' },
      billerId: 'BILL-001',
      countryRegion: 'South Africa',
      status: { value: 'Active', label: 'Active', color: 'success' },
      links: { text: 'MANAGE BILLER' },
    },
    {
      id: '2',
      billerName: { name: 'Biller B', billerCode: 'BB002' },
      billerId: 'BILL-002',
      countryRegion: 'South Africa',
      status: { value: 'Draft', label: 'Draft', color: 'warning' },
      links: { text: 'MANAGE BILLER' },
    },
  ],
  mockUpcomingBills: [],
}));

const mockBills = [
  {
    id: '1',
    billerName: { name: 'Biller A', billerCode: 'BA001' },
    billerId: 'BILL-001',
    countryRegion: 'South Africa',
    status: { value: 'Active', label: 'Active', color: 'success' },
    links: { text: 'MANAGE BILLER' },
  },
  {
    id: '2',
    billerName: { name: 'Biller B', billerCode: 'BB002' },
    billerId: 'BILL-002',
    countryRegion: 'South Africa',
    status: { value: 'Draft', label: 'Draft', color: 'warning' },
    links: { text: 'MANAGE BILLER' },
  },
];

jest.mock('../../../dist/standard-bank-react', () => {
  const { getMockComponents } = require('../../../test-utils/mocks');
  const mocks = getMockComponents();
  return {
    Breadcrumb: mocks.Breadcrumb,
    Heading: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    Button: ({ children, onClick, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
    ),
    ButtonToggle: ({ options, selected, onChange }: any) => (
      <div data-testid="button-toggle">
        {options.map((opt: any) => (
          <button
            key={opt.value}
            onClick={(e) => onChange(e, opt.value)}
            data-testid={`toggle-${opt.value}`}
            aria-pressed={selected === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    ),
  };
});

jest.mock('../../../components/common', () => ({
  ListRightPanelActions: ({ selectedCount, hasFilters, onRemoveFilters }: any) => (
    <div data-testid="right-panel-actions">
      <span data-testid="selected-count">{selectedCount}</span>
      {hasFilters && (
        <button onClick={onRemoveFilters} data-testid="remove-filters-button">
          Remove Filters
        </button>
      )}
    </div>
  ),
}));

jest.mock('@molecules/TableContainer/TableContainer', () => ({
  __esModule: true,
  default: ({ tableData, showTabs, tabs, selectedTab, onTabChange, onCheckboxClick, filterButtons, emptyStateContent }: any) => (
    <div data-testid="table-container">
      {showTabs && tabs && (
        <div data-testid="tabs">
          {tabs.map((tab: any, i: number) => (
            <button
              key={i}
              onClick={() => onTabChange && onTabChange(i)}
              data-testid={`tab-${i}`}
              aria-pressed={selectedTab === i}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {filterButtons && filterButtons.length > 0 && (
        <div data-testid="filter-buttons">
          {filterButtons.map((btn: any, i: number) => (
            <button
              key={i}
              onClick={btn.onClick}
              data-testid={btn.buttonProps?.['data-testid'] || `filter-btn-${i}`}
            >
              {typeof btn.children === 'string' ? btn.children : 'Filter'}
            </button>
          ))}
        </div>
      )}
      {tableData && tableData.rows && tableData.rows.length > 0 ? (
        <table data-testid="bills-table">
          <thead>
            <tr>
              {tableData.headCells && tableData.headCells.map((cell: any, i: number) => (
                <th key={i} data-testid={`header-${cell.id}`}>
                  {cell.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row: any, i: number) => (
              <tr key={i} data-testid={`row-${i}`} onClick={() => onCheckboxClick && onCheckboxClick(row)}>
                <td>{row.id}</td>
                <td>{row.billerName?.name || row.billerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        emptyStateContent
      )}
    </div>
  ),
}));

jest.mock('@molecules/FilterBillersDrawer/FilterBillersDrawer', () => ({
  __esModule: true,
  default: ({ open, onClose, onApply }: any) => 
    open ? (
      <div role="dialog" data-testid="filter-drawer">
        <button onClick={() => onApply({})} data-testid="apply-filter">Apply</button>
        <button onClick={onClose} data-testid="close-filter">Close</button>
      </div>
    ) : null,
}));

jest.mock('@molecules/FilterUpcomingBillsDrawer/FilterUpcomingBillsDrawer', () => ({
  __esModule: true,
  default: ({ open, onClose, onApply }: any) => 
    open ? (
      <div role="dialog" data-testid="filter-upcoming-drawer">
        <button onClick={() => onApply({})} data-testid="apply-filter">Apply</button>
        <button onClick={onClose} data-testid="close-filter">Close</button>
      </div>
    ) : null,
}));

jest.mock('../../../components/common/DeleteConfirmationDialog', () => ({
  __esModule: true,
  default: ({ open, onPrimaryCTA, onSecondaryCTA }: any) =>
    open ? (
      <div role="dialog" data-testid="delete-dialog">
        <button onClick={onPrimaryCTA} data-testid="confirm-delete">Delete</button>
        <button onClick={onSecondaryCTA} data-testid="cancel-delete">Cancel</button>
      </div>
    ) : null,
}));

jest.mock('../../../components/common/EmptyState', () => ({
  __esModule: true,
  default: ({ title, onButtonClick }: any) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      {onButtonClick && (
        <button onClick={onButtonClick} data-testid="empty-state-button">Create</button>
      )}
    </div>
  ),
}));

const BillsPage = require('../../../app/[locale]/setup-and-admin/bills/page').default;

describe('BillsPage (Listing)', () => {
  const mockPush = jest.fn();
  const mockDispatch = jest.fn();

  const mockTranslations = {
    'pageHeading': 'Billers',
    'pageHeadingBills': 'Billers',
    'dashboard': 'Dashboard',
    'breadcrumbLabel': 'Billers',
    'buttonAddBiller': 'Add Biller',
    'createLabel': 'Create',
    'searchPlaceholder': 'Search billers',
    'searchPlaceholderEmpty': 'No billers to search',
    'buttonFilter': 'Filter',
    'buttonDelete': 'Delete',
    'allRecords': 'All Records',
    'awaitingApproval': 'Awaiting Approval',
    'active': 'Active',
    'draft': 'Draft',
    'billers': 'Billers',
    'tabBillers': 'Billers',
    'tabUpcomingBills': 'Upcoming Bills',
    'upcomingBills': 'Upcoming Bills',
    'tableColumnId': 'ID',
    'tableColumnBillerName': 'Biller Name',
    'tableColumnStatus': 'Status',
    'altIconFilter': 'Filter Icon',
    'altIconAdd': 'Add Icon',
    'altIconSearch': 'Search Icon',
    'deleteDialogLabel': 'Delete Biller',
    'deleteDialogItemLabel': 'biller',
    'emptyStateNoBillersTitle': 'No Billers',
    'emptyStateNoBillersDescription': 'Create your first biller',
    'emptyStateNoBillersButton': 'Create Biller',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      return mockTranslations[key as keyof typeof mockTranslations] || key;
    });

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    (useSelector as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        createBiller: {
          biller: {},
          managedBiller: {},
          allBills: mockBills,
          loading: false,
          error: null,
        },
      };
      return selector(state);
    });
  });

  it('should render the bills listing page', () => {
    render(<BillsPage />);

    expect(screen.getByText('Billers')).toBeInTheDocument();
  });

  it('should display the add biller button', () => {
    render(<BillsPage />);

    const createButton = screen.getByTestId('bills-hub-button-add-biller');
    expect(createButton).toBeInTheDocument();
  });

  it('should navigate to create page when add biller button is clicked', async () => {
    const user = userEvent.setup();

    render(<BillsPage />);

    const createButton = screen.getByTestId('bills-hub-button-add-biller');
    await user.click(createButton);

    expect(mockPush).toHaveBeenCalled();
  });

  it('should display table with billers data', () => {
    render(<BillsPage />);

    expect(screen.getByTestId('bills-table')).toBeInTheDocument();
  });

  it('should display tabs for different statuses', () => {
    render(<BillsPage />);

    expect(screen.getByTestId('tab-0')).toBeInTheDocument();
    expect(screen.getByTestId('tab-1')).toBeInTheDocument();
  });

  it('should switch tabs when clicked', async () => {
    const user = userEvent.setup();

    render(<BillsPage />);

    const tab1 = screen.getByTestId('tab-1');
    await user.click(tab1);

    expect(tab1).toHaveAttribute('aria-pressed', 'true');
  });

  it('should dispatch resetBiller when add biller is clicked', async () => {
    const user = userEvent.setup();

    render(<BillsPage />);

    const createButton = screen.getByTestId('bills-hub-button-add-biller');
    await user.click(createButton);

    expect(mockDispatch).toHaveBeenCalled();
  });

  // Test ID verification tests
  it('should render page with correct test ID', () => {
    render(<BillsPage />);
    expect(screen.getByTestId('bills-hub-page')).toBeInTheDocument();
  });

  it('should render breadcrumbs with correct test ID', () => {
    render(<BillsPage />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('should render heading with correct test ID', () => {
    render(<BillsPage />);
    expect(screen.getByTestId('bills-hub-heading')).toBeInTheDocument();
  });

  it('should render add biller button with correct test ID', () => {
    render(<BillsPage />);
    expect(screen.getByTestId('bills-hub-button-add-biller')).toBeInTheDocument();
  });

  it('should render search input with correct test ID', () => {
    render(<BillsPage />);
    expect(screen.getByTestId('bills-hub-input-search')).toBeInTheDocument();
  });

  it('should render filter button with correct test ID', () => {
    render(<BillsPage />);
    expect(screen.getByTestId('bills-hub-button-filter')).toBeInTheDocument();
  });
});
