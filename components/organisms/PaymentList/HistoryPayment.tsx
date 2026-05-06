'use client';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './PaymentList.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import { HISTORY_TABLE_COLUMNS, HISTORY_TABLE_HEAD_CELLS } from './constant';
import { mockHistoryPayments } from '@lib/mock/mockPayments';
import HistoryPaymentFilterDialog from './HistoryPaymentFilterDialog';

const HistoryPayment = () => {
  const t = useTranslations('payments');
  const theme = useTheme();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockHistoryPayments;

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
      links: {
        ...row.links,
        text: t(row.links.text)
      }
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);


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


  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Handle link click for manage beneficiary
  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    router.push(link.href);
  }, [router]);

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
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={0}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
      />
    );
  }, [filters, searchText, handleRemoveFilters]);

  const historyTableHeadCells = useMemo(
    () =>
      HISTORY_TABLE_HEAD_CELLS.map(cell => ({
        ...cell,
        label: t(cell.labelKey),
      })),
    [t],
  );

  // Memoize table data
  const historyRecordsTableData = useMemo(
    () => ({
      columns: HISTORY_TABLE_COLUMNS,
      headCells: historyTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'default',
    }),
    [historyTableHeadCells, mappedRows],
  );

  return (
    <section className={`${styles.tabContent} ${styles.accountsAndBalancesContainer}`}>
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchHistory')}
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
          tableData={historyRecordsTableData}
          filterButtons={filterButtons}
          selectedRows={[]}
          onCheckboxClick={() => {}}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onQuickLinkClick={handleLinkClick}
        />
        <HistoryPaymentFilterDialog
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
export default HistoryPayment;
