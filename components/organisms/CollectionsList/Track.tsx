'use client';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { useState, useMemo, useCallback, useRef } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './CollectionsList.module.scss';
import { Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import TableWithTab from '@molecules/TableWithTab';
import DownloadedReportsFilterDialog from './DownloadedReportsFilterDialog';
// import theme from 'components/lib/styles/theme';
import { Icon } from '@atoms/index';
import { mockCollectionTrackList } from '@lib/mock/mockCollectionTrackList';
import { useEffect } from 'react';
import { TABLE_COLUMNS, TABLE_HEAD_CELLS } from './constant';

/* ADDED — Sub‑tab to status mapping */
const TAB_STATUS_MAP: Record<string, string | null> = {
  allRecords: null,
  needsAction: 'Needs action',
  awaitingApproval: 'Awaiting Approval',
  processing: 'Processing',
  complete: 'Complete',
  decline: 'Decline',
};

const DownloadedReports = () => {
  const t = useTranslations('collections');
  const router = useRouter();
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
  const [currentTab, setCurrentTab] = useState('allRecords');

  const mappedRows = useMemo(() => {
    let filtered = mockCollectionTrackList;

    const selectedStatus = TAB_STATUS_MAP[currentTab];
    if (selectedStatus) {
      filtered = filtered.filter(
        (row: any) => row.status?.value === selectedStatus,
      );
    }
    /* ================= SEARCH (collection ID) ================= */
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row.paymentId?.toLowerCase().includes(search) ||
          row.instruction?.toLowerCase().includes(search),
      );
    }
    /* ================= DATE FILTER ================= */
    if (filters.dateCreated) {
      console.log('Applying date filter:', filters.dateCreated, filtered);
      filtered = filtered.filter((row: any) => {
        // Normalize both to YYYY-MM-DD
        const rowDate = new Date(row.valueDate).toISOString().split('T')[0];
        return rowDate === filters.dateCreated;
      });
    }

    /* ================= STATUS FILTER ================= */
    if (filters.status) {
      filtered = filtered.filter(
        (row: any) =>
          row.status?.value
            ?.toLowerCase()
            .includes(t(filters.status).toLowerCase())
      );
    }

    return filtered.map((row: any, index: number) => ({
      ...row,
      status: {
        value: row.status.value,
        color: row.status.color,
      },
      quickLinks: {
        ...row.links,
        text: t(row.links.text).toUpperCase()
      },
    }));
  }, [searchText, filters, currentTab, t]);

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
    if (selectedRows.length === 0) return;
    setDeleteDialogOpen(true);
    setFilterDialogOpen(false);
    setDownloadDialogOpen(false);
  }, [selectedRows.length]);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleConfirmDelete = useCallback(() => {
    const selectedIds = new Set(selectedRows.map((r) => r.id));
    setCurrentTableData((prev: any) => {
      if (!prev) return prev;

      const updatedRows = prev.rows.filter(
        (row: any) => !selectedIds.has(row.id),
      );

      return {
        ...prev,
        rows: updatedRows,
        rowCount: updatedRows.length,
      };
    });
    setSelectedRows([]);
    setDeleteDialogOpen(false);
  }, [selectedRows]);

  const handleDownloadOpen = useCallback(() => {
    if (selectedRows.length === 0) return;
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
  }, [selectedRows.length]);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setFilterDialogOpen(false);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleCheckboxClick = useCallback((rows: any | any[]) => {
    const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        setSelectedRows([]);
      } else if (rows.length > 1) {
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const currentPageRows = mappedRows.slice(startIndex, endIndex);
        const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));
        const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
        setSelectedRows(pageSelections);
      } else {
        setSelectedRows(selected);
      }
    } else {
      setSelectedRows(selected);
    }
  }, [currentPage, perPage, mappedRows]);

  const handleDownload = useCallback(({ format }: any) => {
    const dataToDownload = selectedRows;
    const csvContent = 'collection ID,Value Date,Amount,Status\n' + dataToDownload.map((row: any) =>
      `${row.collectionId},${row.valueDate},${row.amount},${row.status.value}`,
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `collections.${format || 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadDialogOpen(false);
    setSelectedRows([]);
  }, [selectedRows]);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); 
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); 
  }, []);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="filter" width='24' height='24'  bgColor={"#0051FF"} />
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
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={handleDownloadOpen}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDeleteOpen, handleDownloadOpen]);

  // Memoize table head cells
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

  const [currentTableData, setCurrentTableData] = useState<any>(tableData);
  
  useEffect(() => {
    setCurrentTableData(tableData);
  }, [tableData]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setCurrentTableData(tableData);
  }, [tableData]);

  const handleLinkClick = (row: any, index: number, link: any) => {
    router.push(link.href);
  };

  const statusTabs = useMemo(
    () => [
      { label: t('allRecords'), value: 'allRecords' },
      { label: t('needsAction'), value: 'needsAction' },
      { label: t('awaitingApproval'), value: 'awaitingApproval' },
      { label: t('processing'), value: 'processing' },
      { label: t('complete'), value: 'complete' },
      { label: t('decline'), value: 'decline' }
    ],
    [t],
  );

  const applySearch = useCallback((value:string) =>{
    setSearchText(value);
  },[])

  return (
    <section className={styles.tabContent}>
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchPlaceholder')}
          value={searchText}
          onChange={(e) => applySearch(e.target.value)}
          InputProps={
            {
              startAdornment: (
                <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={"#0051FF"} /></InputAdornment>
              ),
            }
          }
          className={styles.searchField}
        />
      </Grid>
      <section className={styles.tableContainer}>
        <TableWithTab
          statusTabs={statusTabs}
          currentTab={currentTab}
          tableData={currentTableData}
          onTabChange={handleTabChange}
          filterButtons={filterButtons}
          selectedRows={selectedRows}
          onCheckboxClick={handleCheckboxClick}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onQuickLinkClick={handleLinkClick} 
        />

        <DownloadedReportsFilterDialog
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
          title={selectedRows.length > 0 ? t('downloadReport') : t('downloadReports')}
        />
        
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
          onPrimaryCTA={handleConfirmDelete} 
          onSecondaryCTA={handleDeleteClose}
          selectedCount={selectedRows.length}
          itemLabel={selectedRows.length > 0 ? t('collection') : t('collections')}
          markedCount={selectedRows.length}
        />

      </section>
  </section>
  );
};
export default DownloadedReports;
