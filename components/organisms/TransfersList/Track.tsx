'use client';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { useState, useMemo, useCallback, useRef } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import CommonSnackbar from 'components/common/CommonSnackbar';
import styles from './TransferList.module.scss';
import { Grid, InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import { mockTrack } from '@lib/mock/mockTransfers';
import TableWithTab from '@molecules/TableWithTab';
// import theme from 'components/lib/styles/theme';
import { Icon } from '@atoms/index';
import { SEARCH_BY_OPTIONS, TABLE_COLUMNS, TABLE_HEAD_CELLS } from './constant';
import { Button } from 'components/lib/Forms';


const Track = () => {
  const t = useTranslations('transfers');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState<'allRecords' | 'needsAction' | 'awaitingApproval' | 'processing' | 'complete' | 'declined'>('allRecords');
  const [downloadSuccessOpen, setDownloadSuccessOpen] = useState(false);
  const [searchBy, setSearchBy] = useState('batchId');
  const [applySearch, setApplySearch] = useState(false);

  const TAB_STATUS_MAP = useMemo(() => ({
    allRecords: null,
    needsAction: t('needsAction'),
    awaitingApproval: t('awaitingApproval'),
    processing: t('processing'),
    complete: t('complete'),
    declined: t('declined'),
  }), [t]);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockTrack;
    const selectedStatus = TAB_STATUS_MAP?.[currentTab];
    if (selectedStatus) {
      filtered = filtered.filter(
        (row: any) => t(row.status?.value).toLocaleLowerCase() === selectedStatus.toLocaleLowerCase(),
      );
    }

    if (searchText.trim() && applySearch) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.[searchBy]?.toLowerCase().includes(search)
      );
    }
    
    const mapped = filtered.map((row: any) => ({
      ...row,
      status: {
        ...row.status,
        value: t(row.status.value)
      },
      quickLinks: {
        ...row.quickLinks,
        text: t(row.quickLinks.text).toLocaleUpperCase()
      }
    }));

    return mapped;
  }, [searchText, TAB_STATUS_MAP, currentTab, t, applySearch, searchBy]);

  const handleDeleteOpen = useCallback(() => {
    setDeleteDialogOpen(true);
    setDownloadDialogOpen(false);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
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
    setDownloadSuccessOpen(true);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setSearchText('');
    setApplySearch(false);
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

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = searchText.trim().length > 0 && applySearch;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={handleDownloadOpen}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, searchText, applySearch, handleRemoveFilters, handleDeleteOpen, handleDownloadOpen]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => TABLE_HEAD_CELLS.map(cell => ({
      ...cell,
      label: t(cell.label),
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

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue as 'allRecords' | 'needsAction' | 'awaitingApproval' | 'processing' | 'complete' | 'declined');
  }, []);

  const statusTabs = useMemo(
    () => [
      { label: t('allRecords'), value: 'allRecords' },
      { label: t('needsAction'), value: 'needsAction' },
      { label: t('awaitingApproval'), value: 'awaitingApproval' },
      { label: t('processing'), value: 'processing' },
      { label: t('complete'), value: 'complete' },
      { label: t('declined'), value: 'declined' }
    ],
    [t],
  );

  return (
    <section className={styles.tabContent}>
      <Grid size={12} className={styles.searchRow}>
        <Select
          labelId="payment-category-label"
          label={t('searchBy')}
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          displayEmpty={false}
          MenuProps={{
            sx: { zIndex: 1500 },
          }}
        >
          {SEARCH_BY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {t('searchBy')} {t(option.label)}
            </MenuItem>
          ))}
        </Select>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchPayments')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={
            {
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            }
          }
          className={styles.searchField}
        />
        <Button buttonVariant="secondary" size="small" startIcon={<Icon name="search"  bgColor={"#0051FF"} />} onClick={() => setApplySearch(true)}>
          {t('search')}
        </Button>
      </Grid>
      <section className={styles.tableContainer}>
        <TableWithTab
          statusTabs={statusTabs}
          currentTab={currentTab}
          tableData={tableData}
          onTabChange={handleTabChange}
          filterButtons={[]}
          selectedRows={selectedRows}
          onCheckboxClick={handleCheckboxClick}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />

        <DownloadDebtorDialog
          open={downloadDialogOpen}
          anchorEl={downloadAnchorEl}
          onClose={handleDownloadClose}
          onDownload={handleDownload}
          title={selectedRows.length > 0 ? t('downloadReport') : t('downloadReports')}
        />
        <CommonSnackbar
          open={downloadSuccessOpen}
          onClose={() => setDownloadSuccessOpen(false)}
          message={t('downloadSuccessful') || 'Download successful'}
          severity="success"
          autoHideDuration={3000}
        />
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
          onPrimaryCTA={handleDeleteClose}
          onSecondaryCTA={handleDeleteClose}
          selectedCount={selectedRows.length}
          itemLabel={selectedRows.length > 0 ? t('report') : t('reports')}
          markedCount={selectedRows.length}
        />
      </section>
  </section>
  );
};
export default Track;
