import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BopThirdPartiesPage from '../../../app/[locale]/setup-and-admin/bop-third-parties/page';
import '@testing-library/jest-dom';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      pageTitle: 'BOP Third Parties',
      createButton: 'Create',
      filterButton: 'Filter',
      searchPlaceholder: 'Search',
      deleteSuccessMessage: 'Successfully deleted',
      downloadSuccessMessage: 'Download successful',
    };
    return translations[key] || key;
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="mock-image" />,
}));

jest.mock('../../../dist/standard-bank-react', () => ({
  Button: (props: any) => <button {...props}>{props.startIcon}{props.children}</button>,
}));

jest.mock('../../../components/common/DeleteConfirmationDialog', () => {
  return function MockDeleteDialog({ open, onPrimaryCTA, onSecondaryCTA }: any) {
    return open ? (
      <div data-testid="delete-dialog">
        <button data-testid="delete-confirm" onClick={onPrimaryCTA}>Confirm</button>
        <button data-testid="delete-cancel" onClick={onSecondaryCTA}>Cancel</button>
      </div>
    ) : null;
  };
});

jest.mock('../../../components/common/CommonSnackbar', () => {
  return function MockSnackbar({ open, message }: any) {
    return open ? <div data-testid="snackbar">{message}</div> : null;
  };
});

jest.mock('@molecules/TableContainer/TableContainer', () => {
  return function MockTable({ tableData, filterButtons, rightPanelContent, onCheckboxClick, onTabChange, selectedTab, onQuickLinkClick }: any) {
    const [selected, setSelected] = React.useState<string[]>([]);
    
    const handleCheck = (id: string) => {
      const newSelected = selected.includes(id) 
        ? selected.filter(s => s !== id) 
        : [...selected, id];
      setSelected(newSelected);
      const selectedRows = tableData?.rows?.filter((r: any) => newSelected.includes(r.id)) || [];
      onCheckboxClick(selectedRows);
    };

    return (
      <div data-testid="table-container">
        <div data-testid="filter-buttons">{filterButtons?.map((btn: any, i: number) => <button key={i} {...btn}>{btn.children}</button>)}</div>
        <div data-testid="right-panel">{rightPanelContent}</div>
        <div data-testid="tabs">
          {[0, 1, 2, 3].map(tab => (
            <button key={tab} data-testid={`tab-${tab}`} onClick={() => onTabChange(tab)} className={selectedTab === tab ? 'active' : ''}>Tab {tab}</button>
          ))}
        </div>
        <div data-testid="rows" data-count={tableData?.rows?.length || 0}>
          {tableData?.rows?.map((row: any, i: number) => (
            <div key={row.id} data-testid={`row-${i}`}>
              <input type="checkbox" data-testid={`checkbox-${i}`} onChange={() => handleCheck(row.id)} checked={selected.includes(row.id)} />
              <span data-testid={`row-name-${i}`}>{row.thirdPartyName}</span>
              <button data-testid={`link-${i}`} onClick={() => onQuickLinkClick(row)}>Manage</button>
            </div>
          ))}
        </div>
      </div>
    );
  };
});

jest.mock('@molecules/FilterBopThirdPartiesDrawer/FilterBopThirdPartiesDrawer', () => {
  return function MockFilter({ open, onClose, onApply }: any) {
    return open ? (
      <div data-testid="filter-drawer">
        <button data-testid="filter-apply" onClick={() => onApply({ entity: 'Individual', status: 'Active' })}>Apply</button>
        <button data-testid="filter-close" onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock('@molecules/DownloadBopThirdPartyDialog/DownloadBopThirdPartyDialog', () => {
  return function MockDownload({ open, onClose, onDownload }: any) {
    return open ? (
      <div data-testid="download-dialog">
        <button data-testid="download-confirm" onClick={onDownload}>Download</button>
        <button data-testid="download-close" onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock('../../../components/sections', () => ({
  ListPageWrapper: ({ children, title, action, searchValue, onSearchChange, searchPlaceholder }: any) => (
    <div data-testid="list-page-wrapper">
      <h1>{title}</h1>
      {action}
      <input data-testid="search-input" placeholder={searchPlaceholder} value={searchValue} onChange={(e) => onSearchChange(e.target.value)} />
      {children}
    </div>
  ),
}));

jest.mock('../../../components/common/ListRightPanelActions', () => {
  return function MockRightPanel({ selectedCount, hasFilters, onRemoveFilters, onDownloadClick, onDeleteClick }: any) {
    return (
      <div data-testid="right-panel-actions">
        <span data-testid="selected-count">{selectedCount}</span>
        {hasFilters && <span data-testid="has-filters">Filters</span>}
        <button data-testid="remove-filters" onClick={onRemoveFilters}>Clear</button>
        <button data-testid="download-btn" onClick={onDownloadClick}>Download</button>
        <button data-testid="delete-btn" onClick={onDeleteClick}>Delete</button>
      </div>
    );
  };
});

jest.mock('../../../app/[locale]/setup-and-admin/bop-third-parties/bopThirdPartyHelper', () => ({
  STATUS_TAB_KEYS: ['allRecords', 'needsAction', 'awaitingApproval', 'activeTab'],
  TAB_STATUS_MAP: [undefined, 'Needs Action', 'Awaiting Approval', 'Active'],
  TABLE_COLUMNS: ['thirdPartyName', 'bopThirdPartyID', 'status', 'countryRegion', 'links'],
  TABLE_HEAD_CELL_KEYS: [
    { id: 'thirdPartyName', labelKey: 'nameHeader', numeric: false },
    { id: 'bopThirdPartyID', labelKey: 'idHeader', numeric: false },
    { id: 'status', labelKey: 'statusHeader', numeric: false },
    { id: 'links', labelKey: 'linksHeader', numeric: false },
  ],
  bopThirdPartiesUrl: { create: '/create', manage: '/manage', home: '/home' },
  MANAGE_LINKS_KEY: 'MANAGE BOP THIRD PARTY',
  getBreadcrumbLinks: jest.fn(() => []),
  textMatches: (text: string, filter: string) => text?.toLowerCase().includes(filter?.toLowerCase()),
  textEquals: (text: string, filter: string) => text?.toLowerCase() === filter?.toLowerCase(),
  matchesSearchText: (row: any, search: string) => !search || row.thirdPartyName?.toLowerCase().includes(search) || row.bopThirdPartyID?.toLowerCase().includes(search),
}));

jest.mock('../../../lib/mock/mockBopThirdParties', () => ({
  mockBopThirdParties: [
    { id: '1', thirdPartyName: 'Test Company 1', entityType: 'Individual', status: { value: 'Active' }, countryRegion: 'SA', bopThirdPartyID: 'BOP001', hasPostalAddress: true, links: { text: 'MANAGE BOP THIRD PARTY' } },
    { id: '2', thirdPartyName: 'Test Company 2', entityType: 'Company', status: { value: 'Needs Action' }, countryRegion: 'US', bopThirdPartyID: 'BOP002', hasPostalAddress: false, links: { text: 'MANAGE BOP THIRD PARTY' } },
    { id: '3', thirdPartyName: 'Test Company 3', entityType: 'Trust', status: { value: 'Awaiting Approval' }, countryRegion: 'UK', bopThirdPartyID: 'BOP003', hasPostalAddress: true, links: { text: 'MANAGE BOP THIRD PARTY' } },
  ],
}));

jest.mock('../../../src/utils/testIds', () => ({
  buildTestId: (...parts: string[]) => parts.join('-'),
}));

describe('BopThirdPartiesPage', () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);
  });

  describe('Core Rendering', () => {
    it('renders main components', () => {
      render(<BopThirdPartiesPage />);
      expect(screen.getByText('BOP Third Parties')).toBeInTheDocument();
      expect(screen.getByTestId('bop-third-parties-list-create-button')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('table-container')).toBeInTheDocument();
    });

    it('displays all rows initially', () => {
      render(<BopThirdPartiesPage />);
      expect(screen.getByTestId('rows')).toHaveAttribute('data-count', '3');
    });
  });

  describe('Search', () => {
    it('filters by search term', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.type(screen.getByTestId('search-input'), 'Test Company 1');
      
      await waitFor(() => {
        expect(screen.getByTestId('rows')).toHaveAttribute('data-count', '1');
      });
    });

    it('clears search results', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'Test');
      await user.clear(input);
      
      await waitFor(() => {
        expect(screen.getByTestId('rows')).toHaveAttribute('data-count', '3');
      });
    });
  });

  describe('Filtering', () => {
    it('opens and applies filter', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('bop-third-parties-list-filter-button'));
      expect(screen.getByTestId('filter-drawer')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('filter-apply'));
      expect(screen.getByTestId('has-filters')).toBeInTheDocument();
    });

    it('removes filters', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('bop-third-parties-list-filter-button'));
      await user.click(screen.getByTestId('filter-apply'));
      await user.click(screen.getByTestId('remove-filters'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('has-filters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tab Switching', () => {
    it('filters by tab status', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('tab-1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('rows')).toHaveAttribute('data-count', '1');
      });
    });
  });

  describe('Selection', () => {
    it('selects and deselects rows', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('checkbox-0'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
      
      await user.click(screen.getByTestId('checkbox-0'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    });
  });

  describe('Actions', () => {
    it('navigates to create page', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('bop-third-parties-list-create-button'));
      expect(mockRouter.push).toHaveBeenCalledWith('/create');
    });

    it('deletes selected items', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('checkbox-0'));
      await user.click(screen.getByTestId('delete-btn'));
      await user.click(screen.getByTestId('delete-confirm'));
      
      await waitFor(() => {
        expect(screen.getByTestId('snackbar')).toBeInTheDocument();
      });
    });

    it('downloads data', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('download-btn'));
      await user.click(screen.getByTestId('download-confirm'));
      
      await waitFor(() => {
        expect(screen.getByTestId('snackbar')).toBeInTheDocument();
      });
    });

    it('navigates to manage page', async () => {
      const user = userEvent.setup();
      render(<BopThirdPartiesPage />);
      
      await user.click(screen.getByTestId('link-0'));
      
      expect(mockRouter.push).toHaveBeenCalledWith('/manage?id=1&type=Individual&postal=true');
    });
  });
});
