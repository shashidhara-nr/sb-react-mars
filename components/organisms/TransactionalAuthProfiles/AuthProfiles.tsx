'use client';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './TransactionalAuthProfiles.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import {  TABLE_COLUMNS, TABLE_HEAD_CELLS } from './constant';
import AuthProfilesFilterDialog from './AuthProfilesFilterDialog';
import { mockAuthProfiles } from '@lib/mock/mockAuthProfile';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';


const AuthProfiles = () => {
  const t = useTranslations('transactionalAuthProfiles');
  const router = useRouter();
  const theme = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockAuthProfiles;

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

  const handleDeleteOpen = useCallback(() => {
    setDeleteDialogOpen(true);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadDialogOpen(false);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

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

  const tableHeadCells = useMemo(
    () =>
      TABLE_HEAD_CELLS.map(cell => ({
        ...cell,
        label: t(cell.labelKey),
      })),
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
  return (
    <section className={`${styles.tabContent} ${styles.accountsAndBalancesContainer}`}>
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
        <AuthProfilesFilterDialog
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
          title={`${t('download')} ${t('transactionalAuthProfiles').toLowerCase()}`}
        />
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
          onPrimaryCTA={handleDeleteClose}
          onSecondaryCTA={handleDeleteClose}
          selectedCount={selectedRows.length}
          itemLabel={t("transactionalAuthProfiles")}
          markedCount={selectedRows.length}
        />
      </section>
  </section>
  );
};
export default AuthProfiles;
