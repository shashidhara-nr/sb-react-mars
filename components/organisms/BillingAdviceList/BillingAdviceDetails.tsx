'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions, CommonSnackbar } from 'components/common';
import styles from './BillingAdviceList.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import AccountInfo from 'components/lib/AccountDetailsCard';
import { Icon } from '@atoms/index';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import Image from 'next/image';
import { mockBillingAdviceDetailData } from '@lib/mock/mockBillingAdviceList';
import BillingAdviceDetailsFilterDialog from './BillingAdviceDetailsFilterDialog';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import Button from 'components/lib/Forms/Button';
import { DownloadIcon } from '@lib/icons';
import { buildTestId } from 'src/utils/testIds';

const TABLE_COLUMNS = [
  'chargeCode',
  'description',
  'chargeQuantity',
  'vatAmount',
  'basicCharge',
  'totalExclVAT',
  'totalInclVAT'
] as const;

const BillingAdviceDetails = () => {
  const t = useTranslations('billingAdviceList');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockBillingAdviceDetailData as any[];

    // Apply dialog filters
    if (filters.chargeCode) {
      const search = filters.chargeCode.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.chargeCode?.toLowerCase().includes(search)
      );
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.chargeCode?.toLowerCase().includes(search) ||
          row?.description?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row
    }));

    return withAccountDetails;
  }, [filters, searchText]);

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

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setAlertMessage('Download Successful');
    setSnackbarOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  const testIdPrefix = 'billing-advice-details';
  const disabled = false;
  const currentTableData = { rows: mockBillingAdviceDetailData };

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
        {
        children: (
          <>
            <Image
              src={DownloadIcon}
              alt={t('download')}
              width={16}
              height={16}
              style={{ marginRight: 4 }}
            />
            {t('download')}
          </>
        ),
        buttonVariant: 'tertiary',
        'data-testid': buildTestId(testIdPrefix, 'download-button'),
        onClick: handleDownloadOpen,
        disabled: disabled && currentTableData.rows.length === 0,
      },
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
        { id: 'chargeCode', label: t('chargeCode'), numeric: false },
        { id: 'description', label: t('description'), numeric: false },
        { id: 'chargeQuantity', label: t('chargeQuantity'), numeric: true, textAlign: 'right' },
        { id: 'vatAmount', label: t('vatAmount'), numeric: true, textAlign: 'right' },
        { id: 'basicCharge', label: t('basicCharge'), numeric: true, textAlign: 'right' },
        { id: 'totalExclVAT', label: t('totalExclVAT'), numeric: true, textAlign: 'right' },
        { id: 'totalInclVAT', label: t('totalInclVAT'), numeric: true, textAlign: 'right' }
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
      rowVariant: 'default'
    }),
    [tableHeadCells, mappedRows],
  );

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/billing-advice-list', label: t('billingAdviceList') },
      { href: '/billing-advice-list/details', label: t('billingAdviceDetails') },
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
          {t('billingAdviceDetails')}
        </Heading>
      </Grid>
      <section className={styles.tabContent}>
        <AccountInfo
          cards={[
          {
              cardCells: [
              {
                  title: t('accountNumber'),
                  value: 'XXXXXXXXXXXX'
              },
              {
                  title: t('branchSortCode'),
                  value: 'XX-XXX-XX'
              }
              ],
              iconElement: <Icon name="timer" width={'40'} height={'40'} bgColor='#02070D' />,
              cardSubheader: '[Billing advice ID]',
              cardTitle: t('billingAdviceID'),
              variant: 'account'
          },
          {
              cardCells: [
              {
                  title: t('bicSwift'),
                  value: 'XXXXXXXXXXXX'
              },
              {
                  title: t('period'),
                  value: 'MARCH 2020'
              }
              ],
              iconElement: <Icon name="folder" width={'40'} height={'40'} bgColor='#02070D' />,
              cardSubheader: 'ZAR',
              cardTitle: t('currency'),
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
        <section className={styles.tableContainer} ref={tableContainerRef}>
         
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={[]}
            onCheckboxClick={() => {}}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
          <BillingAdviceDetailsFilterDialog
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
            title={`${t('download')} ${t('billingAdviceDetails')?.toLocaleLowerCase()}`}
          />
          <CommonSnackbar
            open={snackbarOpen}
            onClose={() => setSnackbarOpen(false)}
            message={alertMessage}
            severity="success"
          />
        </section>
      </section>
    </section>
  );
};
export default BillingAdviceDetails;
