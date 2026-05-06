'use client';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import CommonSnackbar from 'components/common/CommonSnackbar';
import styles from './TransferList.module.scss';
import { Typography, Tabs, Tab } from '@mui/material';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import ReportsFilterDialog, { ReportsFilterValues } from './ReportsFilterDialog';
import theme from 'components/lib/styles/theme';
import { Button } from 'components/lib/Forms';
import { mockReports } from '@lib/mock/mockTransfers';
import DateRangePicker from 'components/lib/DateRangePicker/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { getMonthDates, getWeekDates, isDateInRange } from '@lib/utils/dateHelpers';
import { REPORT_HEAD_CELLS, REPORT_TABLE_COLUMNS } from './constant';

const Reports = () => {
  const t = useTranslations('transfers');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ReportsFilterValues>({
    accountName: '',
    batchId: '',
    transferCurrency: '',
    serviceLevel: '',
    returnType: '',
  });
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [applySearch, setApplySearch] = useState(false);
  const [downloadSuccessOpen, setDownloadSuccessOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateRange>();
  const [currentTab, setCurrentTab] = useState('daily');

  const mappedRows = useMemo(() => {
    let data = mockReports;
    const addedDates: string[] = [];
    if (selectedDate?.from && selectedDate?.to && applySearch) {
      data = data.filter((row: any) => {
        if (!row.dateRange) return true;
        return isDateInRange(row.dateRangeValue, selectedDate?.from, selectedDate?.to);
      });
    }

    return data.map((row: any) => {
      let dateRangeValue = row.dateRange;
      if (currentTab === 'daily') {
        if (addedDates.includes(dateRangeValue)) {
          dateRangeValue = '';
        } else {
          addedDates.push(dateRangeValue);
        }
      } else if (currentTab === 'weekly') {
        dateRangeValue = `${new Date(getWeekDates(row.dateRangeValue).startDate).getDate()} - ${getWeekDates(row.dateRangeValue).end}`;
        if (addedDates.includes(dateRangeValue)) {
          dateRangeValue = '';
        } else {
          addedDates.push(dateRangeValue);
        }
      } else if (currentTab === 'monthly') {
        const month = new Date(getMonthDates(row.dateRangeValue).startDate).getMonth() + 1;
        dateRangeValue = `${month > 9 ? month : '0' + month}/${new Date(getMonthDates(row.dateRangeValue).endDate).getFullYear()}`;
        if (addedDates.includes(dateRangeValue)) {
          dateRangeValue = '';
        } else {
          addedDates.push(dateRangeValue);
        }
      }

      if (filters.accountName) {
        data = data.filter((row: any) =>
          row.accountName?.toLowerCase().includes(filters.accountName.toLowerCase())
        );
      }
  
      if (filters.batchId) {
        data = data.filter((row: any) =>
          row.batchId?.toLowerCase().includes(filters.batchId.toLowerCase())
        );
      }
  
      if (filters.transferCurrency && filters.transferCurrency !== '') {
        data = data.filter((row: any) => row.transferCurrency === filters.transferCurrency);
      }
  
      if (filters.serviceLevel && filters.serviceLevel !== '') {
        data = data.filter((row: any) => row.serviceLevel === filters.serviceLevel);
      }
  
      if (filters.returnType && filters.returnType !== '') {
        data = data.filter((row: any) => row.returnType === filters.returnType);
      }

      return {
        ...row,
        dateRange: dateRangeValue,
        batchStatus: {
          ...row.batchStatus,
          value: t(row.batchStatus.value)
        }
      };
    });
  }, [selectedDate, currentTab, applySearch, filters, t]);


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

  const handleFilterApply = useCallback((appliedFilters: ReportsFilterValues) => {
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
    // Generate CSV data from mappedRows
    const headers = [t('dateRange'), t('batchId'), t('processedInstructions'), t('partiallyProcessedInstructions'), t('batchStatus')];
    const csvContent = [
      headers.join(','),
      ...mappedRows.map((row: any) => 
        [
          row.dateRange || '',
          row.batchId || '',
          row.processedInstructions || 0,
          row.partiallyProcessedInstructions || 0,
          row.batchStatus?.value || ''
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccessOpen(true);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, [mappedRows, t]);

  const handleRemoveFilters = useCallback(() => {
    setFilters({
      accountName: '',
      batchId: '',
      transferCurrency: '',
      serviceLevel: '',
      returnType: '',
    });
    setStartDate(null);
    setEndDate(null);
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

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="download" width="24" height="24" bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>
              {t('download')}
            </Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleDownloadOpen,
      },
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
  }, [handleFilterOpen, handleDownloadOpen, t]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.values(filters).some(v => v !== '') || startDate !== null || endDate !== null;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={handleDownloadOpen}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, startDate, endDate, handleRemoveFilters, handleDownloadOpen, handleDeleteOpen]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => REPORT_HEAD_CELLS.map(cell => ({
        ...cell,
        label: t(cell.label),
      })),
    [t],
  );

  const tableData = useMemo(
    () => ({
      columns: REPORT_TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      emptyStateTitle: t('reportNotAppliedTitle'),
      emptyStateSubtitle: t('reportNotAppliedDescription'),
      emptyStateIcon: <Icon name="info" width="27px" height="27px" bgColor={theme.palette.primary.dark} />,
    }),
    [tableHeadCells, mappedRows, t],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(tableData);
      
  useEffect(() => {
    setCurrentTableData(tableData);
  }, [tableData]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setCurrentTableData(tableData);
  }, [tableData]);

  const handleDateChange = useCallback((newDateRange: DateRange) => {
    setSelectedDate(newDateRange);
    setCurrentPage(1);
  }, []);

  const statusTabs = useMemo(
    () => [
      { label: t('daily'), value: 'daily' },
      { label: t('weekly'), value: 'weekly' },
      { label: t('monthly'), value: 'monthly' }
    ],
    [t],
  );

  return (
    <section className={styles.tabContent}>
      <section className={`${styles.gridContainer} ${styles.searchRow}`}>
        <section className={styles.inputContainer}>
          <DateRangePicker label={t('dateRange')} onChange={handleDateChange} />
        </section>
        <Button buttonVariant="secondary" startIcon={<Icon name="search" bgColor={theme.palette.primary.main} />} onClick={() => setApplySearch(true)}> {t('search')} </Button>
      </section>
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
        />
        <ReportsFilterDialog
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
          title={`${t('download')} ${selectedRows.length > 1 ? t('transactions') : t('transaction')}`}
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
          itemLabel={selectedRows.length > 1 ? t('transactions') : t('transaction')}
          markedCount={selectedRows.length}
        />
      </section>
  </section>
  );
};
export default Reports;
