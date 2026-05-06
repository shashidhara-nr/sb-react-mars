'use client';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { useState, useMemo, useCallback, useRef } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './AccountsAndBalancesList.module.scss';
import { mockTransactionsData, mockStatementData } from '@lib/mock/mockAccountsAndBalances';
import TableWithTab from '@molecules/TableWithTab';
import AccountInfo from 'components/lib/AccountDetailsCard';
import { Icon } from '@atoms/index';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import TransactionsFilterDialog from './TransactionFilterDialog';
import StatementFilterDialog from './StatementFilterDialog';

const TRANSACTION_TABLE_COLUMNS = [
  'originatorReference',
  'valueDate',
  'bookDate',
  'description',
  'transactionType',
  'serviceFee',
  'amount'
] as const;

const STATEMENT_TABLE_COLUMNS = [
  'statementNumber',
  'statementDate',
  'creditsCount',
  'debitsCount',
  'openingBalance',
  'closingBalance'
] as const;

const TransactionsAndStatement = () => {
  const t = useTranslations('accountsAndBalances');  const theme = useTheme();  const tableContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const tab = searchParams ? (searchParams.get('tab') as string | undefined) : undefined;
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
  const [currentTab, setCurrentTab] = useState(tab || "transactions");

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered;
    if (currentTab === "transactions") {
      filtered = mockTransactionsData;
      // Apply transaction filters
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
        ...row,
        accountDetails: {
          name: row?.accountBalance?.name || '',
          accountNumber: row?.accountBalance?.number || ''
        },
      }));
      return withAccountDetails;
    } else {
      filtered = mockStatementData;
      // Apply statement filters (if any, currently none)
      // Apply search text (if relevant for statements)
      if (searchText.trim()) {
        const search = searchText.toLowerCase();
        filtered = filtered.filter(
          (row: any) =>
            row?.statementNumber?.toLowerCase().includes(search)
        );
      }
      // Map statement rows (if needed)
      return filtered;
    }
  }, [filters, searchText, currentTab]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDeleteOpen = useCallback(() => {
    setDeleteDialogOpen(true);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadDialogOpen(false);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setFilterDialogOpen(false);
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
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
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
        onDownloadClick={handleDownloadOpen}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDownloadOpen, handleDeleteOpen]);

  // Memoize table head cells
  const transactionTableHeadCells = useMemo(
    () => [
      { id: 'originatorReference', label: t('originatorReference'), numeric: false },
      { id: 'valueDate', label: t('valueDate'), numeric: false },
      { id: 'bookDate', label: t('bookDate'), numeric: false },
      { id: 'description', label: t('description'), numeric: false },
      { id: 'transactionType', label: t('transactionType'), numeric: false },
      { id: 'serviceFee', label: t('serviceFee'), numeric: true, textAlign: 'right' },
      { id: 'amount', label: t('amount'), numeric: true, textAlign: 'right' }
    ],
    [t],
  );

  const statementTableHeadCells = useMemo(
    () => [
      { id: 'statementNumber', label: t('statementNumber'), numeric: false },
      { id: 'statementDate', label: t('statementDate'), numeric: false },
      { id: 'creditsCount', label: t('creditsCount'), numeric: false },
      { id: 'debitsCount', label: t('debitsCount'), numeric: false },
      { id: 'openingBalance', label: t('openingBalance'), numeric: false },
      { id: 'closingBalance', label: t('closingBalance'), numeric: false }
    ],
    [t],
  );

  // Memoize table data
  const transactionTableData = useMemo(
    () => ({
      columns: TRANSACTION_TABLE_COLUMNS,
      headCells: transactionTableHeadCells,
      rowButton: false,
      rows: mockTransactionsData,
      pageSize: 15,
      rowCount: mockTransactionsData.length,
      rowVariant: 'checkbox'
    }),
    [transactionTableHeadCells],
  );

  const statementTableData = useMemo(
    () => ({
      columns: STATEMENT_TABLE_COLUMNS,
      headCells: statementTableHeadCells,
      rowButton: false,
      rows: mockStatementData,
      pageSize: 15,
      rowCount: mockStatementData.length,
      rowVariant: 'checkbox'
    }),
    [statementTableHeadCells],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(transactionTableData);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setFilterDialogOpen(false);
    setDeleteDialogOpen(false);
    setDownloadDialogOpen(false);
    setSelectedRows([]);
    if (newValue === 'transactions') {
      setCurrentTableData(transactionTableData);
    } else if (newValue === 'statements') {
      setCurrentTableData(statementTableData);
    }
  }, [transactionTableData, statementTableData]);

  const statusTabs = useMemo(
    () => [
      { label: t('transactions'), value: 'transactions' },
      { label: t('statements'), value: 'statements' }
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
                title: t('accountOwner'),
                value: 'Professor Shane W Bruce'
              },
              {
                title: t('accountType'),
                value: 'Current account'
              },
              {
                title: t('branchCode'),
                value: '2091283'
              },
              {
                title: t('bicSwift'),
                value: 'SBZAZAJJ'
              }
            ],
            iconElement: <Icon name="currentAccount" width={'40'} height={'40'} />,
            cardSubheader: 123456789123,
            cardTitle: t('accountName'),
            variant: 'account'
          },
          {
            cardCells: [
              {
                title: t('latestBalance'),
                value: 603657536
              },
              {
                title: t('openingBalance'),
                value: 4500100
              },
              {
                title: t('clearedBalance')
              },
              {
                title: t('interimBalance'),
                value: 603657536
              }
            ],
            iconElement: <Icon name="countryFlagSouthAfrica" width={'40'} height={'40'} />,
            cardSubheader: 'Values as DD/MM/YYYY',
            cardTitle: t('currencyType'),
            variant: 'account'
          }
        ]}
        moreDetails={{ title: '', description: '' }}
      />
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={currentTab === 'transactions' ? t('searchTransactions') : t('searchStatements')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={
            {
              startAdornment: (
                <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={theme.palette.primary.main} /></InputAdornment>
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
        <TransactionsFilterDialog
          open={currentTab === 'transactions' ? filterDialogOpen : false}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          onApply={handleFilterApply}
          initialValues={filters}
        />
        <StatementFilterDialog
          open={currentTab === 'statements' ? filterDialogOpen : false}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          onApply={handleFilterApply}
          initialValues={filters}
        />
        <DownloadDebtorDialog
          open={downloadDialogOpen}
          anchorEl={downloadAnchorEl}
          onClose={handleDownloadClose}
          onDownload={handleDownload}
          title={`${t('download')} ${currentTab === 'transactions' ? (selectedRows.length > 1 ? t('transactions') : t('transaction')) : (selectedRows.length > 1 ? t('statements') : t('statement'))}`}
        />
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
          onPrimaryCTA={handleDeleteClose}
          onSecondaryCTA={handleDeleteClose}
          selectedCount={selectedRows.length}
          itemLabel={currentTab === 'transactions' ? (selectedRows.length > 1 ? t('transactions') : t('transaction')) : (selectedRows.length > 1 ? t('statements') : t('statement'))}
          markedCount={selectedRows.length}
        />
      </section>
  </section>
  );
};
export default TransactionsAndStatement;
