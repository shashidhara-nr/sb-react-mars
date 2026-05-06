'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './BillingAccounts.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import { mockBillingAccountsData } from '@lib/mock/mockBillingAccounts';
import Button from 'components/lib/Forms/Button';
import { Icon } from '@atoms/index';
import BillingAccountsFilterDialog from './BillingAccountsFilterDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';

const TABLE_COLUMNS = [
  { key: 'accountDetails', type: 'account' },
  'serialNumber',
  'bicSwift',
  'branchSortCode',
  'currency',
  'countryRegion',
  'billingAccountType',
  { key: 'links', type: 'link' }
] as const;

const BillingAccounts = () => {
  const t = useTranslations('billingAccounts');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null); 
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockBillingAccountsData;

    // Apply dialog filters
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.branchSortCode?.toLowerCase().includes(search) ||
        row.accountBalance?.branch?.toLowerCase().includes(search)
      );
    }
    if (filters.country) {
      filtered = filtered.filter((row: any) => 
        row.countryRegion === filters.country ||
        row.accountBalance?.countryRegion === filters.country
      );
    }
    if (filters.currency) {
      filtered = filtered.filter((row: any) => 
        row.currency === filters.currency ||
        row.accountBalance?.currency === filters.currency
      );
    }
    if (filters.billingAccountType) {
      filtered = filtered.filter((row: any) => 
        row.billingAccountType === filters.billingAccountType
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
        row.accountBalance?.accountNumber?.toLowerCase().includes(search) ||
        row.accountBalance?.number?.toLowerCase().includes(search)
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
          row?.accountBalance?.accountNumber?.toLowerCase().includes(search) ||
          row?.accountBalance?.number?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      accountDetails: {
        name: row?.accountBalance?.name || '',
        accountNumber: row?.accountBalance?.number || ''
      },
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
    setSelectedRows([]); 
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      setFilterDialogOpen(false);
      setFilterAnchorEl(null);
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

  const handleDeleteOpen = useCallback(() => {
    setDeleteDialogOpen(true);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Handle link click for manage beneficiary
  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    console.log('Link clicked:', { row, index, link });
    router.push(row?.links?.href || '#');
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
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDeleteOpen]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'accountName', label: t('accountName'), numeric: false },
      { id: 'serialNumber', label: t('serialNumber'), numeric: true, colWidth: '160px' },
      { id: 'bicSwift', label: t('bicSwift'), numeric: true, colWidth: '160px' },
      { id: 'branchSortCode', label: t('branchSortCode'), numeric: true, colWidth: '200px' },
      { id: 'currency', label: t('currency'), numeric: true, colWidth: '100px' },
      { id: 'countryRegion', label: t('countryRegion'), numeric: true },
      { id: 'billingAccountType', label: t('billingAccountType'), numeric: true },
      { id: 'links', label: t('quickLinks'), numeric: false, colWidth: '170px', disableSort: true }
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'checkbox',
    }),
    [tableHeadCells, mappedRows],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/billing-accounts', label: t('billingAccounts') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('billingAccounts')}
        </Heading>
        <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
          onClick={() => router.push('/billing-accounts/create' as any)}
        >
          {t('createBillingAccount')}
        </Button>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
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
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
          />
          <BillingAccountsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterDialogOpen(false)}
            onApply={(newFilters) => setFilters(newFilters)}
            initialValues={filters}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            itemLabel={t('billingAccounts')}
            markedCount={selectedRows.length}
          />
        </section>
      </section>
    </section>
  );
};
export default BillingAccounts;
