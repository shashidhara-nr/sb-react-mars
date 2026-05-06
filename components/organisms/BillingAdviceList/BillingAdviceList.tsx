'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './BillingAdviceList.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import { mockBillingAdviceListData } from '@lib/mock/mockBillingAdviceList';
import BillingAdviceFilterDialog from './BillingAdviceFilterDialog';
import { Icon } from '@atoms/index';

const TABLE_COLUMNS = [
  'billingAdviceId',
  'accountNumber',
  'branchSortCode',
  'bicSwift',
  'currencyCode',
  'amount',
  'date',
  { key: 'links', type: 'link' }
] as const;

const BillingAdviceList = () => {
  const t = useTranslations('billingAdviceList');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockBillingAdviceListData;

    // Apply dialog filters
    if (filters.billingAdviceId) {
      const search = filters.billingAdviceId.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.billingAdviceId?.toLowerCase().includes(search)
      );
    }
    if (filters.accountNumber) {
      const search = filters.accountNumber.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.accountNumber?.toLowerCase().includes(search)
      );
    }
    if (filters.currency) {
      const search = filters.currency.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.currencyCode?.toLowerCase().includes(search)
      );
    }
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.branchSortCode?.toLowerCase().includes(search)
      );
    }
    if (filters.bicSwift) {
      const search = filters.bicSwift.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.bicSwift?.toLowerCase().includes(search)
      );
    }
    if (filters.amountFrom) {
      const amountFrom = parseFloat(filters.amountFrom);
      filtered = filtered.filter((row: any) => 
        parseFloat(row.amount) >= amountFrom
      );
    }
    if (filters.amountTo) {
      const amountTo = parseFloat(filters.amountTo);
      filtered = filtered.filter((row: any) => 
        parseFloat(row.amount) <= amountTo
      );
    }

    // Apply search text - search by account number
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.accountNumber?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      accountDetails: {
        name: row?.accountNumber || '',
        accountNumber: row?.accountNumber || ''
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

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
        { id: 'billingAdviceId', label: t('billingAdviceId'), numeric: false },
        { id: 'accountNumber', label: t('accountNumber'), numeric: false },
        { id: 'branchSortCode', label: t('branchSortCode'), numeric: false },
        { id: 'bicSwift', label: t('bicSwift'), numeric: false },
        { id: 'currencyCode', label: t('currencyCode'), numeric: false },
        { id: 'amount', label: t('amount'), numeric: true },
        { id: 'date', label: t('date'), numeric: false },
        { id: 'links', label: t('quickLinks'), numeric: false, disableSort: true },
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
      rowVariant: 'default',
    }),
    [tableHeadCells, mappedRows],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/billing-advice-list', label: t('billingAdviceList') },
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
          {t('billingAdviceList')}
        </Heading>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchAdvice')}
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
          {mockBillingAdviceListData.length === 0 ? (
            // No data at all
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: 2
              }}
            >
              <Icon name="inbox" width="56" height="56" bgColor="#CCCCCC" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#02070D' }}>
                {t('noBillingAdvice')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                {t('noBillingAdviceMessage')}
              </Typography>
            </Box>
          ) : mappedRows.length === 0 ? (
            // Data exists but no results from search/filter
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: 2
              }}
            >
              <Icon name="search" width="56" height="56" bgColor="#CCCCCC" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#02070D' }}>
                {t('noResultsFound')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                {t('noResultsMessage')}
              </Typography>
            </Box>
          ) : (
            <TableWithTab
              tableData={tableData}
              filterButtons={filterButtons}
              selectedRows={[]}
              onCheckboxClick={() => {}}
              onRowClick={(rowData: any) => console.log('rowData', rowData)}
              rightPanelButtons={rightPanelButtons}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onQuickLinkClick={handleLinkClick}
            />
          )}
          <BillingAdviceFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
          />
        </section>
      </section>
    </section>
  );
};
export default BillingAdviceList;
