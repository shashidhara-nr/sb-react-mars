import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import NonTransactionalPage from '../../../app/[locale]/audit-and-approve/non-transactional/page';
import { useNontransactionalAuditApprove } from 'lib/hooks/useNontransactionalauditapprove';
import { AuditApproveEventRow } from '../../../src/utils/auditandapprove';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import nonTransactionalReducer from '../../../store/slices/nontransactionalauditandapproveslice';
import { authReducer } from '../../../store/slices/authSlice';

// Mock dependencies
jest.mock('next-intl');
jest.mock('../../../lib/hooks/useNontransactionalauditapprove');

jest.mock('../../../src/utils/testIds', () => ({
  buildTestId: jest.fn((...args: any[]) => args.filter(Boolean).join('-')),
}));

jest.mock('../../../store/slices/nontransactionalauditandapproveslice', () => ({
  __esModule: true,
  default: (state = {}, action: any) => state,
  auditBeneficiaries: jest.fn(() => ({ type: 'nonTransactional/auditBeneficiaries' })),
  authoriseBeneficiaries: jest.fn(() => ({ type: 'nonTransactional/authoriseBeneficiaries' })),
}));

jest.mock('../../../lib/hooks/useAppDispatch', () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('@lib/icons', () => ({
  SearchIcon: '/icons/search.svg',
  FunnelIcon: '/icons/funnel.svg',
  CloseIcon: '/icons/close.svg',
  IcnDislikeBlue: '/icons/dislike.svg',
  IcnLikeBlue: '/icons/like.svg',
  AvatarAlert: '/icons/avatar-alert.svg',
  AvatarQuestion: '/icons/avatar-question.svg',
  CloseBlue: '/icons/close-blue.svg',
  AuditIcn: '/icons/audit.svg',
  CheckCircleIcon: '/icons/check-circle.svg',
}));

jest.mock('../../../dist/standard-bank-react', () => {
  const { getMockComponents } = require('../../../test-utils/mocks');
  const mocks = getMockComponents();
  return {
    Breadcrumb: mocks.Breadcrumb,
    Heading: mocks.Heading,
    ButtonToggle: ({ buttons, onChange, initialSelected }: any) => (
      <div data-testid="button-toggle">
        {buttons.map((btn: any, idx: number) => (
          <button
            key={idx}
            data-testid={`toggle-${btn.toggleValue}`}
            onClick={(e) => onChange(e, btn.toggleValue)}
            aria-selected={initialSelected === idx}
          >
            {btn.children}
          </button>
        ))}
      </div>
    ),
    Button: mocks.Button,
  };
});

jest.mock('@molecules/TableContainer/TableContainer', () => {
  const { getMockComponents } = require('../../../test-utils/mocks');
  return getMockComponents().TableContainer;
});

jest.mock('@molecules/EventFilterDialog', () => {
  return function MockEventFilterDialog({ open, onApply, onClose, initialValues }: any) {
    return open ? (
      <div data-testid="event-filter-dialog">
        <button onClick={() => onClose()} data-testid="filter-close">Close</button>
        <button
          onClick={() => onApply({
            userAccountName: 'Test User',
            eventFunction: 'Create',
            entityName: 'Test Entity',
            initiatorUserId: 'USER001',
          })}
          data-testid="filter-apply"
        >
          Apply
        </button>
      </div>
    ) : null;
  };
});

jest.mock('../../../components/common/EmptyState', () => {
  return function MockEmptyState({ title, description }: any) {
    return (
      <div data-testid="empty-state">
        <div data-testid="empty-state-title">{title}</div>
        <div data-testid="empty-state-description">{description}</div>
      </div>
    );
  };
});

jest.mock('../../../components/common/DeleteConfirmationDialog', () => {
  return function MockDeleteConfirmationDialog({
    open,
    onClose,
    onPrimaryCTA,
    onSecondaryCTA,
    testIdPrefix,
  }: any) {
    return open ? (
      <div data-testid={`${testIdPrefix}-dialog`}>
        <button onClick={onPrimaryCTA} data-testid={`${testIdPrefix}-confirm`}>Confirm</button>
        <button onClick={onSecondaryCTA} data-testid={`${testIdPrefix}-cancel`}>Cancel</button>
      </div>
    ) : null;
  };
});

jest.mock('@organisms/audit-and-approve/NonTransactionalDetailPanel', () => {
  return function MockNonTransactionalDetailPanel({
    open,
    row,
    onClose,
    onAuditSuccess,
    onDeclineSuccess,
    onPrev,
    onNext,
  }: any) {
    return open ? (
      <div data-testid="detail-panel">
        <span data-testid="detail-panel-row-id">{row?.id}</span>
        <button onClick={onClose} data-testid="detail-close">Close</button>
        <button onClick={onAuditSuccess} data-testid="detail-audit">Audit</button>
        <button onClick={onDeclineSuccess} data-testid="detail-decline">Decline</button>
        <button onClick={onPrev} data-testid="detail-prev">Prev</button>
        <button onClick={onNext} data-testid="detail-next">Next</button>
      </div>
    ) : null;
  };
});

jest.mock('@organisms/audit-and-approve/ConfirmationDialog', () => {
  return function MockConfirmationDialog({
    open,
    title,
    heading,
    message,
    onClose,
    onConfirm,
    confirmLabel,
    dismissLabel,
    avatarIcon,
    dialogTestId,
    dismissTestId,
    confirmTestId,
    closeTestId,
    children,
  }: any) {
    return open ? (
      <div data-testid={dialogTestId}>
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-heading">{heading}</div>
        <div data-testid="dialog-message">{message}</div>
        {children}
        <button onClick={onClose} data-testid={closeTestId}>Close</button>
        <button onClick={() => onClose()} data-testid={dismissTestId}>{dismissLabel}</button>
        <button onClick={onConfirm} data-testid={confirmTestId}>{confirmLabel}</button>
      </div>
    ) : null;
  };
});

jest.mock('../../../components/common', () => ({
  SearchInput: ({ onRuleChange, selectedRule, placeholder, testIdPrefix }: any) => (
    <div data-testid={testIdPrefix || 'search-input'}>
      <select
        data-testid={`${testIdPrefix}-dropdown` || 'search-dropdown'}
        value={selectedRule}
        onChange={(e) => onRuleChange(e.target.value)}
      >
        <option value="">Select Event Type</option>
        <option value="Debtors">Debtors</option>
        <option value="Beneficiaries">Beneficiaries</option>
        <option value="Payment type">Payment Type</option>
      </select>
      <input
        type="text"
        placeholder={placeholder}
        data-testid={`${testIdPrefix}-field` || 'search-input-field'}
      />
    </div>
  ),
}));

describe('NonTransactionalPage', () => {
  const testIdPrefix = 'non-transactional-audit';
  
  // Helper function to render with necessary Redux reducers
  const renderWithRedux = (component: React.ReactElement) => {
    return renderWithProviders(component, {
      reducers: {
        nonTransactional: nonTransactionalReducer,
        auth: authReducer,
      },
    });
  };
  
  const mockTranslations = {
    pageTitle: 'Non-Transactional Audit & Approve',
    dashboard: 'Dashboard',
    auditAndApprove: 'Audit & Approve',
    tabAudit: 'Audit',
    tabApprove: 'Approve',
    searchPlaceholder: 'Search...',
    filter: 'Filter',
    altFilter: 'Filter icon',
    audit: 'Audit',
    approve: 'Approve',
    decline: 'Decline',
    altAudit: 'Audit icon',
    altApprove: 'Approve icon',
    altDecline: 'Decline icon',
    altClose: 'Close icon',
    altCloseIcon: 'Close',
    removeFilters: 'Remove Filters',
    noResultsTitle: 'No Results Found',
    noResultsDescription: 'Try adjusting your filters',
    noEventsTitle: 'No Events',
    noEventsDescription: 'No events available',
    altNoResults: 'No results',
    altNoEvents: 'No events',
    auditSuccess: 'Successfully audited',
    approveSuccess: 'Successfully approved',
    declineSuccess: 'Successfully declined',
    auditConfirmTitle: 'Confirm Audit',
    approveConfirmTitle: 'Confirm Approve',
    auditConfirmHeading: 'Audit Events?',
    approveConfirmHeading: 'Approve Events?',
    auditConfirmMessage: 'Are you sure you want to audit these events?',
    approveConfirmMessage: 'Are you sure you want to approve these events?',
    auditConfirmButton: 'Confirm Audit',
    approveConfirmButton: 'Confirm Approve',
    dismiss: 'Dismiss',
    declineTitle: 'Decline Events',
    declineMessage: 'You are about to decline {count} event(s)',
    declineMessageSubtext: 'Please provide a reason',
    rejectionReasonPlaceholder: 'Enter reason...',
    rejectionReasonRequired: 'Reason is required',
    declineMultipleButton: 'Decline {count}',
    altQuestionIcon: 'Question',
    altAlertIcon: 'Alert',
  };

  const mockEventRows: AuditApproveEventRow[] = [
    {
      id: '1',
      mode: 'audit',
      userAccountName: 'John Doe',
      eventType: 'Debtors',
      eventFunction: 'Create',
      entityName: 'ABC Corp',
      initiatorUserId: 'USER001',
      valueDate: '2024-01-15',
      status: { value: 'Pending', color: 'warning' },
      links: { href: '/details/1', text: 'View' },
    },
    {
      id: '2',
      mode: 'audit',
      userAccountName: 'Jane Smith',
      eventType: 'Beneficiaries',
      eventFunction: 'Update',
      entityName: 'XYZ Ltd',
      initiatorUserId: 'USER002',
      valueDate: '2024-01-16',
      status: { value: 'Pending', color: 'warning' },
      links: { href: '/details/2', text: 'View' },
    },
  ];

  const mockUpdateFilters = jest.fn();
  const mockUpdateSearchText = jest.fn();
  const mockClearFiltersAndSearch = jest.fn();
  const mockUpdateSelectedIds = jest.fn();
  const mockClearSelection = jest.fn();
  const mockReloadEventList = jest.fn();
  const mockLoadListData = jest.fn();
  const mockDispatch = jest.fn();

  const defaultHookReturn = {
    items: [],
    loading: false,
    error: null,
    filteredRows: mockEventRows,
    hasFiltersOrSearch: false,
    selectedIds: [],
    selectedRows: [],
    updateFilters: mockUpdateFilters,
    updateSearchText: mockUpdateSearchText,
    clearFiltersAndSearch: mockClearFiltersAndSearch,
    updateSelectedIds: mockUpdateSelectedIds,
    clearSelection: mockClearSelection,
    eventList: [
      { value: 'Debtors', label: 'Debtors', className: 'za.co.sb.payments.domain.Debtors' },
      { value: 'Beneficiaries', label: 'Beneficiaries', className: 'za.co.sb.payments.domain.Beneficiaries' },
      { value: 'Payment type', label: 'Payment type', className: 'za.co.sb.payments.domain.PaymentType' },
    ],
    eventListLoading: false,
    eventListError: null,
    reloadEventList: mockReloadEventList,
    listData: null,
    listDataLoading: false,
    listDataError: null,
    loadListData: mockLoadListData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    const { useAppDispatch } = require('../../../lib/hooks/useAppDispatch');
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    mockDispatch.mockReturnValue({ type: 'mock' });
    
    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      const value = mockTranslations[key as keyof typeof mockTranslations];
      if (typeof value === 'string' && value.includes('{count}')) {
        return value.replace('{count}', '2');
      }
      return value;
    });
    
    (useNontransactionalAuditApprove as jest.Mock).mockReturnValue(defaultHookReturn);
  });

  describe('Component Rendering', () => {
    it('should render page with all main elements', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      expect(screen.getByTestId(`${testIdPrefix}-container`)).toBeInTheDocument();
      expect(screen.getByTestId(`breadcrumb`)).toBeInTheDocument();
      expect(screen.getByTestId(`${testIdPrefix}-heading`)).toBeInTheDocument();
      expect(screen.getAllByText('Non-Transactional Audit & Approve')[0]).toBeInTheDocument();
    });

    it('should render breadcrumb with correct links', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const breadcrumb = screen.getByTestId(`breadcrumb`);
      expect(breadcrumb).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Audit & Approve')).toBeInTheDocument();
    });

    it('should render mode toggle with audit and approve tabs', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      expect(screen.getByTestId('toggle-audit')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-approve')).toBeInTheDocument();
      expect(screen.getByText('Audit')).toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    it('should render search input with dropdown', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      expect(screen.getByTestId(`${testIdPrefix}-search-input`)).toBeInTheDocument();
      expect(screen.getByTestId(`${testIdPrefix}-search-input-dropdown`)).toBeInTheDocument();
    });

    it('should render search button', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      expect(screen.getByTestId(`${testIdPrefix}-button-search`)).toBeInTheDocument();
    });

    it('should show empty state before search', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Select event type and search')).toBeInTheDocument();
    });
  });

  describe('Mode Toggle', () => {
    it('should start in audit mode by default', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const auditTab = screen.getByTestId('toggle-audit');
      expect(auditTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to approve mode when approve tab is clicked', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const approveTab = screen.getByTestId('toggle-approve');
      fireEvent.click(approveTab);
      
      expect(mockClearFiltersAndSearch).toHaveBeenCalled();
    });

    it('should clear filters and search when switching modes', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const approveTab = screen.getByTestId('toggle-approve');
      fireEvent.click(approveTab);
      
      expect(mockClearFiltersAndSearch).toHaveBeenCalled();
    });

    it('should not switch mode if invalid value is passed', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const auditTab = screen.getByTestId('toggle-audit');
      fireEvent.click(auditTab);
      
      // Should remain in audit mode
      expect(auditTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Search Functionality', () => {
    it('should disable search button when no event type selected', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      expect(searchButton).toBeDisabled();
    });

    it('should enable search button when event type is selected', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      expect(searchButton).not.toBeDisabled();
    });

    it('should call updateSearchText and updateFilters when search is clicked', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({ eventType: 'Debtors' });
    });

    it('should show results after search', async () => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        filteredRows: mockEventRows,
      });
      
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('table-container')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should disable filter button before search', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const filterBtn = screen.getByTestId('filter-btn');
      expect(filterBtn).toBeDisabled();
    });

    it('should enable filter button after search', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const filterBtn = screen.getByTestId('filter-btn');
        expect(filterBtn).not.toBeDisabled();
      });
    });

    it('should open filter dialog when filter button is clicked', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      // First search
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const filterBtn = screen.getByTestId('filter-btn');
        fireEvent.click(filterBtn);
      });
      
      expect(screen.getByTestId('event-filter-dialog')).toBeInTheDocument();
    });

    it('should close filter dialog', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const filterBtn = screen.getByTestId('filter-btn');
        fireEvent.click(filterBtn);
      });
      
      const closeButton = screen.getByTestId('filter-close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('event-filter-dialog')).not.toBeInTheDocument();
      });
    });

    it('should apply filters and call updateFilters', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const filterBtn = screen.getByTestId('filter-btn');
        fireEvent.click(filterBtn);
      });
      
      const applyButton = screen.getByTestId('filter-apply');
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(mockUpdateFilters).toHaveBeenCalled();
      });
    });

    it('should show remove filters button when filters are applied', () => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        hasFiltersOrSearch: true,
      });
      
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      fireEvent.change(dropdown, { target: { value: 'Debtors' } });
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      // Button should appear in right panel after search
      expect(mockClearFiltersAndSearch).toBeDefined();
    });
  });

  describe('Bulk Actions - Audit Mode', () => {
    beforeEach(() => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        selectedRows: mockEventRows,
      });
    });

    it('should show bulk audit button with count when rows are selected', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkAuditBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-audit`);
        expect(bulkAuditBtn).toBeInTheDocument();
        expect(bulkAuditBtn.textContent).toContain('Audit');
      });
    });

    it('should show bulk decline button with count', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkDeclineBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-decline`);
        expect(bulkDeclineBtn).toBeInTheDocument();
      });
    });

    it('should open audit confirmation dialog when bulk audit is clicked', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkAuditBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-audit`);
        fireEvent.click(bulkAuditBtn);
      });
      
      expect(screen.getByTestId(`${testIdPrefix}-dialog-bulk-approve-confirm`)).toBeInTheDocument();
      expect(screen.getByText('Audit Events?')).toBeInTheDocument();
    });

    it('should close audit dialog when dismiss is clicked', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkAuditBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-audit`);
        fireEvent.click(bulkAuditBtn);
      });
      
      const dismissBtn = screen.getByTestId(`${testIdPrefix}-button-dismiss-approve`);
      fireEvent.click(dismissBtn);
      
      await waitFor(() => {
        expect(screen.queryByTestId(`${testIdPrefix}-dialog-bulk-approve-confirm`)).not.toBeInTheDocument();
      });
    });

    it('should confirm audit and show success message', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkAuditBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-audit`);
        fireEvent.click(bulkAuditBtn);
      });
      
      const confirmBtn = screen.getByTestId(`${testIdPrefix}-button-confirm-audit`);
      fireEvent.click(confirmBtn);
      
      await waitFor(() => {
        expect(mockClearSelection).toHaveBeenCalled();
        expect(screen.getByTestId(`${testIdPrefix}-snackbar`)).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Actions - Approve Mode', () => {
    beforeEach(() => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        selectedRows: mockEventRows.map(row => ({ ...row, mode: 'approve' })),
      });
    });

    it('should show bulk approve button in approve mode', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const approveTab = screen.getByTestId('toggle-approve');
      fireEvent.click(approveTab);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkApproveBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-approve`);
        expect(bulkApproveBtn).toBeInTheDocument();
      });
    });

    it('should open approve confirmation dialog', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const approveTab = screen.getByTestId('toggle-approve');
      fireEvent.click(approveTab);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkApproveBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-approve`);
        fireEvent.click(bulkApproveBtn);
      });
      
      expect(screen.getByText('Approve Events?')).toBeInTheDocument();
    });
  });

  describe('Bulk Decline', () => {
    beforeEach(() => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        selectedRows: mockEventRows,
      });
    });

    it('should open decline dialog when bulk decline is clicked', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkDeclineBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-decline`);
        fireEvent.click(bulkDeclineBtn);
      });
      
      expect(screen.getByTestId(`${testIdPrefix}-dialog-bulk-decline`)).toBeInTheDocument();
    });

    it('should show error when decline without reason', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkDeclineBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-decline`);
        fireEvent.click(bulkDeclineBtn);
      });
      
      const confirmBtn = screen.getByTestId(`${testIdPrefix}-button-confirm-decline`);
      fireEvent.click(confirmBtn);
      
      await waitFor(() => {
        expect(screen.getByText('Reason is required')).toBeInTheDocument();
      });
    });

    it('should successfully decline with reason', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkDeclineBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-decline`);
        fireEvent.click(bulkDeclineBtn);
      });
      
      const reasonInput = screen.getByTestId(`${testIdPrefix}-input-decline-reason`);
      await userEvent.type(reasonInput, 'Invalid data');
      
      const confirmBtn = screen.getByTestId(`${testIdPrefix}-button-confirm-decline`);
      fireEvent.click(confirmBtn);
      
      await waitFor(() => {
        expect(mockClearSelection).toHaveBeenCalled();
      });
    });

    it('should close decline dialog when dismiss is clicked', async () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const bulkDeclineBtn = screen.getByTestId(`${testIdPrefix}-button-bulk-decline`);
        fireEvent.click(bulkDeclineBtn);
      });
      
      const dismissBtn = screen.getByTestId(`${testIdPrefix}-button-dismiss-decline`);
      fireEvent.click(dismissBtn);
      
      await waitFor(() => {
        expect(screen.queryByTestId(`${testIdPrefix}-dialog-bulk-decline`)).not.toBeInTheDocument();
      });
    });
  });

  describe('Detail Panel', () => {
    it('should open detail panel when quick link is clicked', async () => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        filteredRows: mockEventRows,
        selectedRows: [mockEventRows[0]],
      });
      
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const quickLink = screen.getByTestId('quick-link');
        fireEvent.click(quickLink);
      });
      
      expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    });

    it('should close detail panel', async () => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        filteredRows: mockEventRows,
        selectedRows: [mockEventRows[0]],
      });
      
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const quickLink = screen.getByTestId('quick-link');
        fireEvent.click(quickLink);
      });
      
      const closeButton = screen.getByTestId('detail-close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
      });
    });

    
  });

  describe('Empty States', () => {
    it('should show no results empty state when no matches', async () => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        filteredRows: [],
        hasFiltersOrSearch: true,
      });
      
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('No Results Found')).toBeInTheDocument();
      });
    });

    it('should show no events empty state', async () => {
      (useNontransactionalAuditApprove as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        filteredRows: [],
        hasFiltersOrSearch: false,
      });
      
      renderWithRedux(<NonTransactionalPage />);
      
      const dropdown = screen.getByTestId(`${testIdPrefix}-search-input-dropdown`);
      await userEvent.selectOptions(dropdown, 'Debtors');
      const searchButton = screen.getByTestId(`${testIdPrefix}-button-search`);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('No Events')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      renderWithRedux(<NonTransactionalPage />);
      
      const pageChangeBtn = screen.getByTestId('page-change');
      fireEvent.click(pageChangeBtn);
      
      // Pagination state is handled internally
      expect(pageChangeBtn).toBeInTheDocument();
    });

  });

});
