'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './UserDetails.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import Button from 'components/lib/Forms/Button';
import { Icon } from '@atoms/index';
import { mockUserDetailsData } from '@lib/mock/mockUserDetails';
import UserDetailsFilterDialog from './UserDetailsFilterDialog';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import EmptyState from 'components/common/EmptyState';
import Image from 'next/image';
import { ErrorAlertIcon, PeopleIcon, ReloadRefreshIcon, SearchIcon } from '@lib/icons';
import { People } from 'assets/icons';

const TABLE_COLUMNS = [
  'userName',
  'userId',
  'idNumber',
  'dob',
  'email',
  'adminRole',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;
const testIdPrefix = 'user-details';

const UserDetails = () => {
  const t = useTranslations('userDetails');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(false);
  const [deleteError, setDeleteError] = useState({
    invalidUser: false,
    error: false,
  });

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockUserDetailsData;

    // Apply dialog filters
    if (filters.userName) {
      const search = filters.userName.toLowerCase();
      filtered = filtered.filter((row: any) => row.userName?.toLowerCase().includes(search));
    }
    if (filters.userId) {
      const search = filters.userId.toLowerCase();
      filtered = filtered.filter((row: any) => row.userId?.toLowerCase().includes(search));
    }
    if (filters.dob) {
      filtered = filtered.filter((row: any) => row.dob?.includes(filters.dob));
    }
    if (filters.idNumber) {
      const search = filters.idNumber.toLowerCase();
      filtered = filtered.filter((row: any) => row.idNumber?.toLowerCase().includes(search));
    }
    if (filters.userStatus) {
      const search = filters.userStatus.toLowerCase();
      filtered = filtered.filter((row: any) => row.userStatus?.toLowerCase() === search);
    }
    if (filters.passwordStatus) {
      const search = filters.passwordStatus.toLowerCase();
      filtered = filtered.filter((row: any) => row.passwordStatus?.toLowerCase() === search);
    }

    // Apply search text - search by username
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((row: any) => row?.userName?.toLowerCase().includes(search));
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase(),
      },
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSelectedRows([]);
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setSelectedRows([]);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setSelectedRows([]);
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

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
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

  // Handle link click for manage beneficiary
  const handleLinkClick = useCallback(
    (row: any, index: number, link: any) => {
      router.push(link.href);
    },
    [router],
  );

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="filter" width="24" height="24" bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>
              {t('filter')}
            </Typography>
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
  }, [
    selectedRows.length,
    filters,
    searchText,
    handleRemoveFilters,
    handleDownloadOpen,
    handleDeleteOpen,
  ]);

  const handleReload = useCallback(() => {
    // TODO : handle reload logic
  }, []);
  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'userName', label: t('userName'), numeric: false },
      { id: 'userId', label: t('userId'), numeric: false },
      { id: 'idNumber', label: t('idNumber'), numeric: false },
      { id: 'dob', label: t('dob'), numeric: false },
      { id: 'email', label: t('email'), numeric: false },
      { id: 'adminRole', label: t('adminRole'), numeric: false },
      { id: 'status', label: t('status'), numeric: false },
      { id: 'links', label: t('quickLinks'), numeric: false, disableSort: true },
    ],
    [t],
  );

  // Memoize empty state content
  const noMatchStateContent = useMemo(
    () => (
      <EmptyState
        title={t('noMatchStateTitle')}
        description={t('noMatchStateDesc')}
        icon={<Image src={SearchIcon} alt={t('noMatchStateTitle')} width={48} height={48} />}
        testIdPrefix={testIdPrefix}
      />
    ),
    [t],
  );
  // Memoize empty state content
  const emptyStateContent = useMemo(
    () => (
      <EmptyState
        title={t('emptyStateTitle')}
        description={t('emptyStateDesc')}
        icon={<Image src={PeopleIcon} alt={t('emptyStateTitle')} width={48} height={48} />}
        testIdPrefix={testIdPrefix}
      />
    ),
    [t],
  );

  // Memoize error state content
  const errorStateContent = useMemo(
    () => (
      <EmptyState
        title={t('errorStateTitle')}
        description={t('errorStateDesc')}
        buttonLabel={t('reload')}
        onButtonClick={handleReload}
        icon={<Image src={ErrorAlertIcon} alt={t('errorStateTitle')} width={48} height={48} />}
        buttonIcon={<Image src={ReloadRefreshIcon} alt={t('reload')} width={20} height={20} />}
        testIdPrefix={testIdPrefix}
      />
    ),
    [t, handleReload],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: perPage,
      rowCount: mappedRows.length,
      rowVariant: 'checkbox',
      emptyStateContent: error
        ? errorStateContent
        : mappedRows.length === 6000
          ? emptyStateContent
          : mappedRows.length === 0 && searchText.trim().length > 0 && noMatchStateContent,
    }),
    [
      tableHeadCells,
      mappedRows,
      perPage,
      error,
      errorStateContent,
      emptyStateContent,
      searchText,
      noMatchStateContent,
    ],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/user-details', label: t('userDetails') },
    ],
    [t],
  );

  const deleteItemLabel = useMemo(() => {
    if (deleteError.error) {
      return {
        itemLabel1: t('somethingWentWrong')?.toLocaleLowerCase(),
        itemLabel2: t('somethingWentWrongDesc')?.toLocaleString(),
        primaryCTALabel: t('tryAgain').toLocaleString(),
      };
    }
    if (deleteError.invalidUser) {
      return {
        itemLabel1: t('deleteFailureTitle')?.toLocaleLowerCase(),
        itemLabel2: t('deleteFailureDesc')?.toLocaleLowerCase(),
        primaryCTALabel: t('deleteEligibleItem').toLocaleString(),
      };
    }
    if (selectedRows.length > 1) {
      return {
        itemLabel1: t('totalDeleteCountTitle', { value: selectedRows.length })?.toLocaleLowerCase(),
        itemLabel2: t('totalDeleteCountDesc', { value: selectedRows.length })?.toLocaleLowerCase(),
        primaryCTALabel: '',
      };
    }
  }, [selectedRows, t, deleteError]);

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px">
          {t('userDetails')}
        </Heading>
        <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor="#0051FF" />}
          onClick={() => router.push('/user-details/manage-user?mode=create' as any)}
        >
          {t('createUser')?.toLocaleUpperCase()}
        </Button>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchUsers')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="search" width="32" height="32" bgColor={theme.palette.navy.main} />
                  </InputAdornment>
                ),
              },
            }}
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
          <UserDetailsFilterDialog
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
            title={`${t('download')} ${t('userDetails')?.toLocaleLowerCase()}`}
            beneficiaryExportFields={tableHeadCells.map(({ id, label }) => ({
              label,
              key: id,
              mandatory: true,
            }))}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            itemLabel={deleteItemLabel?.itemLabel1}
            itemLabel2={deleteItemLabel?.itemLabel2}
            markedCount={selectedRows.length}
            primaryCTALabel={deleteItemLabel?.primaryCTALabel}
          />
        </section>
      </section>
    </section>
  );
};
export default UserDetails;
