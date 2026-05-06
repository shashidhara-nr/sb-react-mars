'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './CreditLimits.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import AccountInfo from 'components/lib/AccountDetailsCard';
import { Icon } from '@atoms/index';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { mockAllocationTableData, mockUsageByAccountTableData, mockUsageByGroupTableData } from '@lib/mock/mockLimits';

const ALLOCATION_TABLE_COLUMNS = [
  'productName',
  'utilisation',
  'dailyLimit',
  'weeklyLimit',
  'monthlyLimit',
  'quarterlyLimit',
  'annualLimit'
] as const;

const USUAGE_BY_GROUP_TABLE_COLUMNS = [
  'accountGroupName',
  'utilisation',
  'dailyLimit',
  'weeklyLimit',
  'monthlyLimit',
  'quarterlyLimit',
  'annualLimit',
  'productName'
] as const;

const USUAGE_BY_ACCOUNT_TABLE_COLUMNS = [
  'accountNumber',
  'utilisation',
  'dailyLimit',
  'weeklyLimit',
  'monthlyLimit',
  'quarterlyLimit',
  'annualLimit'
] as const;

const AccountGroupLevel = () => {
  const t = useTranslations('creditLimits');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState("allocation");

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockAllocationTableData as any[];

    if (currentTab === 'allocation') {
      filtered = mockAllocationTableData;
    } else if (currentTab === 'usageByGroup') {
      filtered = mockUsageByGroupTableData;
    } else if (currentTab === 'usageByAccount') {
      filtered = mockUsageByAccountTableData;
    }

    // Apply dialog filters
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.accountBalance?.branch?.toLowerCase().includes(search)
      );
    }
    if (filters.accountBalanceName) {
      const search = filters.accountBalanceName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.accountBalance?.name?.toLowerCase().includes(search),
      );
    }
    if (filters.accountNumber) {
      const search = filters.accountNumber.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.accountBalance?.accountNumber?.toLowerCase().includes(search)
      );
    }
    if (filters.paymentCategory) {
      filtered = filtered.filter((row: any) => row.paymentCategory === filters.paymentCategory);
    }
    if (filters.statusCode) {
      filtered = filtered.filter((row: any) => row.authoriseStatus === filters.statusCode);
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.accountBalance?.name?.toLowerCase().includes(search) ||
          row?.accountBalance?.accountNumber?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row
    }));

    return withAccountDetails;
  }, [filters, searchText, currentTab]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      // If "select all" was clicked (array with multiple or zero rows)
      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          // Deselect all - clear everything
          setSelectedRows([]);
        } else if (rows.length > 1) {
          // Select all - limit to current page only
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mappedRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));

          // Only keep selections from current page
          const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
          setSelectedRows(pageSelections);
        } else {
          // Single row selection/deselection
          setSelectedRows(selected);
        }
      } else {
        // Single row click
        setSelectedRows(selected);
      }
    },
    [currentPage, perPage, mappedRows],
  );

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="filter" width='24' height='24' bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
      },
    ];
  }, [handleFilterOpen, t, theme.palette.secondary.main]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={() => {}}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

  // Memoize table head cells
  const allocationTableHeadCells = useMemo(
    () => [
      { id: 'productName', label: t('productName'), numeric: false },
      { id: 'utilisation', label: t('utilisation'), numeric: false, colWidth: '250px' },
      { id: 'dailyLimit', label: t('dailyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'weeklyLimit', label: t('weeklyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'monthlyLimit', label: t('monthlyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'quarterlyLimit', label: t('quarterlyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'annualLimit', label: t('annualLimit'), numeric: true, textAlign: 'right', colWidth: '180px' }
    ],
    [t],
  );

  const usageByGroupTableHeadCells = useMemo(
    () => [
      { id: 'accountGroupName', label: t('accountGroupName'), numeric: false },
      { id: 'utilisation', label: t('utilisation'), numeric: false, colWidth: '250px' },
      { id: 'dailyLimit', label: t('dailyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'weeklyLimit', label: t('weeklyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'monthlyLimit', label: t('monthlyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'quarterlyLimit', label: t('quarterlyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'annualLimit', label: t('annualLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'productName', label: t('productName'), numeric: false, colWidth: '180px' }
    ],
    [t],
  );

  const usageByAccountTableHeadCells = useMemo(
    () => [
      { id: 'accountNumber', label: t('accountNumber'), numeric: false },
      { id: 'utilisation', label: t('utilisation'), numeric: false, colWidth: '250px' },
      { id: 'dailyLimit', label: t('dailyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'weeklyLimit', label: t('weeklyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'monthlyLimit', label: t('monthlyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'quarterlyLimit', label: t('quarterlyLimit'), numeric: true, textAlign: 'right', colWidth: '180px' },
      { id: 'annualLimit', label: t('annualLimit'), numeric: true, textAlign: 'right', colWidth: '180px' }
    ],
    [t],
  );

  // Memoize table data
  const allocationTableData = useMemo(
    () => ({
      columns: ALLOCATION_TABLE_COLUMNS,
      headCells: allocationTableHeadCells,
      rowButton: false,
      rows: mockAllocationTableData,
      pageSize: 15,
      rowCount: mockAllocationTableData.length,
      rowVariant: 'checkbox'
    }),
    [allocationTableHeadCells],
  );

  const usageByGroupTableData = useMemo(
    () => ({
      columns: USUAGE_BY_GROUP_TABLE_COLUMNS,
      headCells: usageByGroupTableHeadCells,
      rowButton: false,
      rows: mockUsageByGroupTableData,
      pageSize: 15,
      rowCount: mockUsageByGroupTableData.length,
      rowVariant: 'checkbox'
    }),
    [usageByGroupTableHeadCells],
  );

  const usageByAccountTableData = useMemo(
    () => ({
      columns: USUAGE_BY_ACCOUNT_TABLE_COLUMNS,
      headCells: usageByAccountTableHeadCells,
      rowButton: false,
      rows: mockUsageByAccountTableData,
      pageSize: 15,
      rowCount: mockUsageByAccountTableData.length,
      rowVariant: 'checkbox'
    }),
    [usageByAccountTableHeadCells],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(allocationTableData);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setSelectedRows([]);
    setSearchText('');
    setFilters({});
    setFilterAnchorEl(null);
    setCurrentPage(1);
    setPerPage(15);
    setFilterDialogOpen(false);
    if (newValue === 'allocation') {
      setCurrentTableData(allocationTableData);
    } else if (newValue === 'usageByGroup') {
      setCurrentTableData(usageByGroupTableData);
    } else if (newValue === 'usageByAccount') {
      setCurrentTableData(usageByAccountTableData);
    }
  }, [allocationTableData, usageByGroupTableData, usageByAccountTableData]);

  const statusTabs = useMemo(
    () => [
      { label: t('allocation'), value: 'allocation' },
      { label: t('usageByGroup'), value: 'usageByGroup' },
      { label: t('usageByAccount'), value: 'usageByAccount' }
    ],
    [t],
  );

  return (
    <section className={styles.tabContent}>
      <AccountInfo
        cards={[
          {
            cardCells: [
              {
                title: t('effectiveFrom'),
                value: '[Country / Region]'
              },
              {
                title: t('effectiveTo'),
                value: '[Status]'
              }
            ],
            iconElement: <Icon name="timer" width={'40'} height={'40'} bgColor='#02070D' />,
            cardSubheader: '[Credit Limit Name]',
            cardTitle: t('creditLimitName'),
            variant: 'account'
          },
          {
            cardCells: [
              {
                title: t('currencyLabel'),
                value: '[Currency name XXX]'
              },
              {
                title: t('status'),
                value: '[Status]'
              }
            ],
            iconElement: <Icon name="folder" width={'40'} height={'40'} bgColor='#02070D' />,
            cardSubheader: 'Credit limit type',
            cardTitle: t('creditLimitType'),
            variant: 'account'
          }
        ]}
        moreDetails={{
          title: '',
          description: ''
        }}
      />
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchActivities')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={
            {
              startAdornment: (
                <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} /></InputAdornment>
              ),
            }
          }
          className={styles.searchField}
        />
      </Grid>
      <section className={styles.tableContainer}>
        <TableWithTab
          statusTabs={statusTabs}
          currentTab={currentTab}
          tableData={currentTableData}
          onTabChange={handleTabChange}
          filterButtons={filterButtons}
          selectedRows={selectedRows}
          onCheckboxClick={handleCheckboxClick}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </section>
  </section>
  );
};
export default AccountGroupLevel;
