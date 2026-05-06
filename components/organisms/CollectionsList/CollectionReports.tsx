'use client';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Grid } from '@mui/material';
import { useTranslations } from 'next-intl';
import styles from './CollectionsList.module.scss';
import { mockReports } from '@lib/mock/mockReports';
import TableWithTab from '@molecules/TableWithTab';
import { Icon } from '@atoms/index';
// import theme from 'components/lib/styles/theme';
import Button from 'components/lib/Forms/Button';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import DateRangePicker from 'components/lib/DateRangePicker/DateRangePicker';
import { REPORT_COLUMNS, REPORT_HEAD_CELLS } from './constant';
import { ListRightPanelActions } from 'components/common';
import { getWeekDates, getMonthDates, isDateInRange } from '@lib/utils/dateHelpers';
import { DateRange } from 'node_modules/react-day-picker/dist/esm/types/shared';

const CollectionReports = () => {
  const t = useTranslations('collections');
  const [filters, setFilters] = useState<any>({});
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState<DateRange>();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [applySearch, setApplySearch] = useState(false);

  const filteredRows = useMemo(() => {
    let data = mockReports;
    const addedDates: string[] = [];
    if (selectedDate?.from && selectedDate?.to && applySearch) {
      console.log("Filtering by date range:", selectedDate.from, selectedDate.to);
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
      return {
        ...row,
        dateRange: dateRangeValue,
        status: {
          value: row.status.value,
          color: row.status.color,
        },
      };
    });
  }, [currentTab, selectedDate, applySearch]);

  const tableHeadCells = useMemo(
      () =>
        REPORT_HEAD_CELLS.map(cell => ({
          ...cell,
          label: t(cell.labelKey),
        })),
      [t],
    );

  const tableData = useMemo(
    () => ({
      columns: REPORT_COLUMNS,
      headCells: tableHeadCells,
      rows: filteredRows,
      rowVariant: 'default',
      rowCount: filteredRows.length,
      pageSize: 15,
    }),
    [filteredRows, tableHeadCells],
  );

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownload = useCallback(() => {
    const csv =
      `${t('dateRange')}, ${t('batchId')}, ${t('processedInstructions')}, ${t('partiallyProcessedInstructions')}, ${t('batchStatus')}\n` +
      filteredRows
        .map(
          (r: any) =>
            `${r.dateRange},${r.batchId},${r.processed},${r.partiallyProcessed},${r.status.value}`,
        )
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reports.csv';
    link.click();

    setDownloadDialogOpen(false);
  }, [filteredRows, t]);

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

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSelectedDate(undefined);
    setApplySearch(false);
  }, []);

  const rightPanelButtons = useMemo(() => {
    const hasFilters = Object.keys(filters).length > 0 || (selectedDate?.from && selectedDate?.to && applySearch);

    return (
      <section className={styles.rightPanel} data-testid="reports-right-panel">
        <ListRightPanelActions
          selectedCount={filteredRows.length}
          hasFilters={hasFilters}
          onRemoveFilters={handleRemoveFilters}
          onDownloadClick={handleDownloadOpen}
        />
      </section>
    );
  }, [filters, filteredRows, selectedDate, applySearch, handleRemoveFilters, handleDownloadOpen]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  return (
    <section className={styles.tabContent}>
      <Grid container spacing={2} alignItems="center" className={styles.searchRow}>
        <Grid className={styles.searchInputWrapper}>
          <DateRangePicker label={t('dateRange')} onChange={handleDateChange} />
        </Grid>
        <Grid>
          <Button buttonVariant="secondary" size="small" startIcon={<Icon name="search"  bgColor={"#0051FF"} />} onClick={() => setApplySearch(true)}>
            {t('search')}
          </Button>
        </Grid>
      </Grid>

      <section className={styles.tableContainer} ref={tableContainerRef}>
        <TableWithTab 
          statusTabs={statusTabs}
          currentTab={currentTab}
          tableData={currentTableData}
          onTabChange={handleTabChange}
          filterButtons={[]}
          selectedRows={[]}
          onCheckboxClick={() => {}}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onQuickLinkClick={() => {}} 
        />
      </section>

      <DownloadDebtorDialog
        open={downloadDialogOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleDownloadClose}
        onDownload={handleDownload}
        title={t('downloadReports')}
      />
    </section>
  );
};

export default CollectionReports;