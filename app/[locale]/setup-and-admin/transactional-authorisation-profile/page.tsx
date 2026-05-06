'use client';
import { Box, Snackbar, Alert } from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import Exclamation from 'public/icons/exclamation.svg';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import FunnelIcon from 'public/icons/icn_funnel.svg';
import SearchIcon from 'public/icons/icn_search_black.svg';
import AddIcon from 'public/icons/icn_add.svg';
import CheckCircleIcon from 'public/icons/icn_check_circle_white.svg';
import { ListPageWrapper } from 'components/sections';
import { ListRightPanelActions } from 'components/common';
import FilterTransactionalAuthorisationProfileDrawer, {
  FilterValues,
} from '@molecules/FilterTransactionalAuthorisationProfileDrawer/FilterTransactionalAuthorisationProfileDrawer';
import useTransactionalAuthorisationProfiles from 'lib/hooks/useTransactionalAuthorisationProfiles';

// Constants
const TABLE_COLUMNS = [
  { key: 'authorisationProfileName', type: 'account', accountIcon: false },
  'authorisationProfileDescription',
  'currency',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

const TABLE_HEAD_CELLS = [
  { id: 'authorisationProfileName', label: 'Authorisation profile name', numeric: false },
  {
    id: 'authorisationProfileDescription',
    label: 'Authorisation profile description',
    numeric: false,
  },
  { id: 'currency', label: 'Currency', numeric: false },
  { id: 'status', label: 'Status', numeric: false },
  { id: 'links', label: 'Quick links', numeric: false },
] as const;

const TransactionalAuthorisationProfilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const {
    filteredRows,
    filters: filterValues,
    searchText,
    hasFiltersOrSearch,
    updateFilters,
    updateSearchText,
    clearFiltersAndSearch,
  } = useTransactionalAuthorisationProfiles();

  // Check for cancelled query parameter and show snackbar
  useEffect(() => {
    const cancelled = searchParams?.get('cancelled');
    if (cancelled === 'true') {
      setSnackbarMessage('Authorisation profile creation cancelled successfully');
      setSnackbarOpen(true);
      // Clean up URL without the query parameter
      router.replace('/setup-and-admin/transactional-authorisation-profile');
    }
  }, [searchParams, router]);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDeleteConfirm = useCallback(() => {
    // Perform delete operation here
    setDeleteDialogOpen(false);
    setSnackbarMessage('Authorisation profile successfully deleted');
    setSnackbarOpen(true);
    setSelectedRows([]);
  }, []);

  const handleCreateClick = useCallback(() => {
    router.push('/setup-and-admin/transactional-authorisation-profile/create' as any);
  }, [router]);

  const handleRemoveFilters = useCallback(() => {
    clearFiltersAndSearch();
  }, [clearFiltersAndSearch]);

  // Memoize filter callbacks
  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDrawerOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDrawerOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((values: Partial<FilterValues>) => {
    updateFilters(values);
    setFilterDrawerOpen(false);
    setFilterAnchorEl(null);
  }, [updateFilters]);

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
          const currentPageRows = filteredRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r) => r.id));

          // Only keep selections from current page
          const pageSelections = selected.filter((row) => currentPageIds.has(row.id));
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
    [currentPage, perPage, filteredRows],
  );

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Image
              src={FunnelIcon}
              alt="filter"
              width={16}
              height={16}
              style={{ marginRight: 4 }}
            />
            Filter
          </>
        ),
        buttonVariant: 'tertiary',
        onClick: handleFilterClick,
      },
    ];
  }, [handleFilterClick]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = hasFiltersOrSearch;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />
    );
  }, [selectedRows.length, hasFiltersOrSearch, handleRemoveFilters]);

  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: TABLE_HEAD_CELLS,
      rowButton: true,
      rows: filteredRows,
      pageSize: 15,
      rowCount: filteredRows.length,
    }),
    [filteredRows],
  );

  // Handle pagination changes to track current page
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Handle link click for manage profile
  const handleLinkClick = useCallback(
    (row: any) => {
      if (row && row.links && row.links.text === 'MANAGE PROFILE') {
        router.push(`/setup-and-admin/transactional-authorisation-profile/manage/` as any);
      }
    },
    [router],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: 'Dashboard' },
      {
        href: '/transactional-authorisation-profile',
        label: 'Transactional authorisation profile',
      },
    ],
    [],
  );

  return (
    <ListPageWrapper
      breadcrumbLinks={breadcrumbLinks}
      title="Transactional authorisation profile"
      action={
        <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
          <Button
            buttonVariant="secondary"
            startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
            style={{ height: 48 }}
            onClick={handleCreateClick}
          >
            CREATE AN AUTHORISATION PROFILE
          </Button>
        </Box>
      }
      searchPlaceholder="Search by authorisation profile name"
      searchValue={searchText}
      onSearchChange={updateSearchText}
      searchIcon={<Image src={SearchIcon} alt="search" width={32} height={32} />}
      containerSpacing={4}
      containerPaddingBottom={4}
      titleFontSize="28px"
      titleMinHeight="48px"
      contentRef={tableContainerRef}
    >
      <TableContainer
        tableData={tableData}
        filterButtons={filterButtons}
        rightPanelContent={rightPanelButtons}
        onCheckboxClick={handleCheckboxClick}
        selectedRows={selectedRows}
        showTabs={false}
        tableStyle={{}}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        onQuickLinkClick={handleLinkClick}
      />
      <FilterTransactionalAuthorisationProfileDrawer
        open={filterDrawerOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialValues={filterValues}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onPrimaryCTA={handleDeleteConfirm}
        onSecondaryCTA={handleDeleteClose}
        selectedCount={selectedRows.length}
        exclamationIcon={Exclamation}
        itemLabel="authorization profiles"
        markedCount={selectedRows.length}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          icon={<Image src={CheckCircleIcon} alt="success" width={20} height={20} />}
          severity="success"
          sx={{
            backgroundColor: '#008545',
            color: '#FFFFFF',
            fontWeight: 400,
            fontSize: 16,
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ListPageWrapper>
  );
};

export default TransactionalAuthorisationProfilePage;
