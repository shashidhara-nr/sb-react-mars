'use client';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { useState, useMemo, useCallback, useRef } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './AccountsAndBalancesList.module.scss';
import { TextField, Typography, useTheme } from '@mui/material';
import { mockTransactions } from '@lib/mock/mockAccountsAndBalances';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import FindTransactionsFilterDialog from './FindTransactionFilterDialog';
import DatePickerComponent from 'components/lib/DatePicker';
import { Button } from 'components/lib/Forms';

const TABLE_COLUMNS = [
  'transactionType',
  'originatorReference',
  'description',
  'dateCreated',
  'bookDate',
  'amount',
] as const;

const FindTransaction = () => {
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
  const [applySearch, setApplySearch] = useState(false);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockTransactions;

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
      ...row,
      accountDetails: {
        name: row?.accountBalance?.name || '',
        accountNumber: row?.accountBalance?.number || ''
      },
      transactionLinks: {
        href: row?.transactionLinks?.href || '#',
        text: t(row?.transactionLinks?.text).toLocaleUpperCase()
      },
      statementLinks: {
        href: row?.statementLinks?.href || '#',
        text: t(row?.statementLinks?.text).toLocaleUpperCase()
      },
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);


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
  }, [handleFilterOpen, t, theme]);

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
  const tableHeadCells = useMemo(
    () => [
      { id: 'transactionType', label: t('transactionType'), numeric: false, colWidth: '180px' },
      { id: 'originatorReference', label: t('originatorReference'), numeric: false, colWidth: '220px' },
      { id: 'description', label: t('description'), numeric: false },
      { id: 'dateCreated', label: t('dateCreated'), numeric: false, colWidth: '180px' },
      { id: 'bookDate', label: t('bookDate'), numeric: false, colWidth: '180px' },
      { id: 'amount', label: t('amount'), numeric: true, colWidth: '180px' },
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: applySearch ? mappedRows : [],
      pageSize: 15,
      rowCount: applySearch ? mappedRows.length : 0,
      rowVariant: 'checkbox',
      emptyStateTitle: t('findTransactionNotAppliedTitle'),
      emptyStateSubtitle: t('findTransactionNotAppliedDescription'),
      emptyStateIcon: <Icon name="info" width="27px" height="27px" bgColor={theme.palette.primary.dark} />,
    }),
    [tableHeadCells, mappedRows, applySearch, t, theme.palette.primary.dark],
  );

  return (
    <section className={styles.tabContent}>
      <section className={`${styles.gridContainer} ${styles.searchRow}`}>
        <section className={styles.inputContainer}>
          <section className={styles.textField}>
            <TextField
              defaultValue=""
              label={t('searchTransactions')}
              type="text"
              placeholder={t('searchTransactions')}
              name="accountName"
            />
          </section>
          <section className={styles.datePicker}>
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
        <Button buttonVariant="secondary" startIcon={<Icon name="search" bgColor={theme.palette.secondary.main} />} onClick={() => setApplySearch(true)}> {t('search')} </Button>
      </section>
      <section className={styles.tableContainer}>
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
          <FindTransactionsFilterDialog
            open={filterDialogOpen}
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
            title={`${t('download')} ${selectedRows.length > 1 ? t('transactions') : t('transaction')}`}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            itemLabel={selectedRows.length > 1 ? t('transactions') : t('transaction')}
            markedCount={selectedRows.length}
          />
      </section>
  </section>
  );
};
export default FindTransaction;
