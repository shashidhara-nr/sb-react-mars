'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import styles from './BillingAccounts.module.scss';
import { Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import Button from 'components/lib/Forms/Button';
import { Icon } from '@atoms/index';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import theme from 'components/lib/styles/theme';
import { mockAccountVerificationRequest } from '@lib/mock/mockAccountVerificationRequest';
import AccountVerificationRequestFilterDialog from './AccountVerificationRequestFilterDialog';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';


const TABLE_COLUMNS = [
  'paymentId',
  'description',
  'created',
  'serviceType',
  'submissionMethod',
  'verified',
  'accounts',
  { key: 'quickLinks', type: 'link' }
] as const;


const AccountVerificationRequest = () => {
  const t = useTranslations('accountVerificationRequest');
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null); 
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
   const tableContainerRef = useRef<HTMLDivElement>(null);

const mappedRows = useMemo(() => {
  let filtered = mockAccountVerificationRequest;

  // Apply dialog filters (from BatchAccountVerificationRequestFilter)
  if (filters.paymentId) {
    const search = filters.paymentId.toLowerCase();
    filtered = filtered.filter((row: any) =>
      row.paymentId?.toLowerCase().includes(search)
    );
  }
  if (filters.dateCreated) {
    filtered = filtered.filter((row: any) => row.dateCreated === filters.dateCreated);
  }
  if (filters.dateVerified) {
    filtered = filtered.filter((row: any) => row.dateVerified === filters.dateVerified);
  }
  if (filters.serviceType) {
    filtered = filtered.filter((row: any) => row.serviceType === filters.serviceType);
  }
   if (filters.accounts) {
    filtered = filtered.filter((row: any) => row.accounts === filters.accounts);
  }

  // Apply search text - search by paymentId and serviceType
  if (searchText.trim()) {
    const search = searchText.toLowerCase();
    filtered = filtered.filter(
      (row: any) =>
        row?.paymentId?.toLowerCase().includes(search) ||
        row?.serviceType?.toLowerCase().includes(search) ||
        row?.description?.toLowerCase().includes(search)
    );
  }

  // Map to final structure with quickLinks
  const mapped = filtered.map((row: any) => ({
    ...row,
    quickLinks: {
      href: row.quickLinks.href,
      text: t(row.quickLinks.text)
    }
  }));

  return mapped;
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
    router.push(row.quickLinks.href);
  }, [router]);


  
  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setFilterDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
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
  }, [handleFilterOpen, t]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <> 
        <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDeleteClick={handleDeleteOpen}
      />
      {count > 0 && (
        <Button
          buttonVariant="tertiary"
          startIcon={<Icon name="download" width="24" height="24" />}
          onClick={handleDownloadOpen}
        >
          {t('download')}
        </Button>
      )} </>
    
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDeleteOpen]);
// Memoize table head cells
const tableHeadCells = useMemo(
    () => [
        { id: 'paymentId', label: t('paymentId'), numeric: false, colWidth: '150px' },
        { id: 'description', label: t('description'), numeric: false, colWidth: '200px' },
        { id: 'created', label: t('created'), numeric: false, colWidth: '150px' },
        { id: 'serviceType', label: t('serviceType'), numeric: false, colWidth: '120px' },
        { id: 'submissionMethod', label: t('submissionMethod'), numeric: false, colWidth: '150px' },
        { id: 'verified', label: t('verified'), numeric: false, colWidth: '120px' },
        { id: 'accounts', label: t('accounts'), numeric: false, colWidth: '120px' },
        { id: 'quickLinks', label: t('quickLinks'), numeric: false, disableSort: true, colWidth: '200px' },
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
      { href: '/account-verification-request', label: t('accountVerificationRequest') },
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
          {t('accountVerificationRequest')}
        </Heading>
        <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
          onClick={() => router.push('/account-verification-request/create' as any)}
        >
          {t('createVerificationRequest')}
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
          <AccountVerificationRequestFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterDialogOpen(false)}
            onApply={(newFilters) => setFilters(newFilters)}
            initialValues={filters}
          />

             <DownloadDebtorDialog
                      open={downloadDialogOpen}
                      anchorEl={downloadAnchorEl}
                      onClose={handleDownloadClose}
                      onDownload={handleDownload}
                      title={`${t('download')} ${selectedRows.length > 1 ? t('accountVerificationRequest') : t('accountVerificationRequest')}`}
                    />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            itemLabel={t('accountVerificationRequest')}
            markedCount={selectedRows.length}
            exclamationIcon={<Icon name="exclamation" width="24" height="24" />}
          />
        </section>
      </section>
    </section>
  );
};
export default AccountVerificationRequest;
