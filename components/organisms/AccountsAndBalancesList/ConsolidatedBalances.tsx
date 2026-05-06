'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions, RHFSelectField } from 'components/common';
import styles from './AccountsAndBalancesList.module.scss';
import { mockConsolidatedBalances, mockExcludedBalances } from '@lib/mock/mockAccountsAndBalances';
import { Icon, SelectField } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import ConsolidatedBalancesFilterDialog from './ConsolidatedBalancesFilterDialog';
import { Typography, useTheme } from '@mui/material';
import DatePickerComponent from 'components/lib/DatePicker';
import { Button } from 'components/lib/Forms';

const CONSOLIDATED_TABLE_COLUMNS = [
  'accountNumber',
  'accountName',
  'sortCode',
  'currency',
  'conversionUSD',
  'balance',
  'balanceInUSD',
  'balanceAsAt'
] as const;

const EXCLUDED_TABLE_COLUMNS = [
  'accountNumber',
  'accountName',
  'branchCode',
  'currency',
  'reasonForExclusion'
] as const;

const ConsolidatedBalances = () => {
  const t = useTranslations('accountsAndBalances');
  const theme = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState("consolidatedAccounts");

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered: any[] = currentTab === "consolidatedAccounts" ? mockConsolidatedBalances : mockExcludedBalances;

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

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
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

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

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
        onDownloadClick={() => {
          setDownloadDialogOpen(true);
          setDownloadAnchorEl(tableContainerRef.current);
        }}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

  // Memoize table head cells
  const consolidatedTableHeadCells = useMemo(
    () => [
      { id: 'accountNumber', label: t('accountNumber'), numeric: false, colWidth: '120px' },
      { id: 'accountName', label: t('accountName'), numeric: false, colWidth: '120px' },
      { id: 'sortCode', label: t('sortCode'), numeric: false, colWidth: '120px' },
      { id: 'currency', label: t('currency'), numeric: false, colWidth: '120px' },
      { id: 'conversionUSD', label: t('conversionUSD'), numeric: false, colWidth: '120px' },
      { id: 'balance', label: t('balance'), numeric: true, colWidth: '120px' },
      { id: 'balanceInUSD', label: t('balanceInUSD'), numeric: true, colWidth: '120px' },
      { id: 'balanceAsAt', label: t('balanceAsAt'), numeric: true, colWidth: '120px' }
    ],
    [t],
  );

  const excludedTableHeadCells = useMemo(
    () => [
      { id: 'accountNumber', label: t('accountNumber'), numeric: false, colWidth: '300px' },
      { id: 'accountName', label: t('accountName'), numeric: false, colWidth: '300px' },
      { id: 'currency', label: t('currency'), numeric: false, colWidth: '300px' },
      { id: 'branchCode', label: t('branchCode'), numeric: false, colWidth: '300px' },
      { id: 'reasonForExclusion', label: t('reasonForExclusion'), numeric: false }
    ],
    [t],
  );

  // Memoize table data
  const consolidatedTableData = useMemo(
    () => ({
      columns: CONSOLIDATED_TABLE_COLUMNS,
      headCells: consolidatedTableHeadCells,
      rowButton: false,
      rows: mockConsolidatedBalances,
      pageSize: 15,
      rowCount: mockConsolidatedBalances.length,
      rowVariant: 'default'
    }),
    [consolidatedTableHeadCells],
  );

  const excludedTableData = useMemo(
    () => ({
      columns: EXCLUDED_TABLE_COLUMNS,
      headCells: excludedTableHeadCells,
      rowButton: false,
      rows: mockExcludedBalances,
      pageSize: 15,
      rowCount: mockExcludedBalances.length,
      rowVariant: 'default'
    }),
    [excludedTableHeadCells],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(consolidatedTableData);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    if (newValue === 'consolidatedAccounts') {
      setCurrentTableData(consolidatedTableData);
    } else if (newValue === 'excludedAccounts') {
      setCurrentTableData(excludedTableData);
    }
  }, [consolidatedTableData, excludedTableData]);

  const statusTabs = useMemo(
    () => [
      { label: t('consolidatedAccounts'), value: 'consolidatedAccounts' },
      { label: t('excludedAccounts'), value: 'excludedAccounts' }
    ],
    [t],
  );

  return (
    <section className={styles.tabContent}>
      <section className={styles.gridContainer}>
        <section className={styles.selectField}>
          <SelectField
            name={t('consolidationCurrency')}
            label={t('consolidationCurrency')}
            value={''}
            onChange={(name, value) => {}}
            options={[]}
            height={'52px'}
          />
        </section>
        <section className={styles.selectField}>
          <SelectField
            name={`${t('consolidationLevel')}1`}
            label={`${t('consolidationLevel')} 1`}
            value={''}
            onChange={(name, value) => {}}
            options={[]}
            height={'52px'}
          />
        </section>
        <section className={styles.selectField}>
          <SelectField
            name={`${t('consolidationLevel')}2`}
            label={`${t('consolidationLevel')} 2`}
            value={''}
            onChange={(name, value) => {}}
            options={[]}
            height={'52px'}
          />
        </section>
        <section className={styles.seelctDatePicker}>
          <DatePickerComponent
            actions={[
              {
                label: t('cancel'),
                onClick: () => {},
                variant: 'tertiary',
              },
              {
                label: t('ok'),
                onClick: () => {},
                variant: 'tertiary',
              },
            ]}
            label={t('valueDate')}
          />
        </section>
      </section>
      <section className={styles.gridContainer + ' ' + styles.searchRow}>
        <section className={styles.inputContainer}>
          <RHFSelectField
            name={t('searchTransactions')}
            label={t('searchTransactions')}
            options={[]}
          />
        </section>
        <Button buttonVariant="secondary" startIcon={<Icon name="search" width='24px' height='24px' bgColor='#0062E1' />}onClick={() => {}} > {t('search')} </Button>
      </section>
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
          <ConsolidatedBalancesFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
          />
      </section>
  </section>
  );
};
export default ConsolidatedBalances;
