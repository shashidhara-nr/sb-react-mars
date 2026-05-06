'use client';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useRef } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './PaymentList.module.scss';
import { Grid, InputAdornment, TextField, useTheme } from '@mui/material';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import { REPORTS_PAYMENTS_TABLE_COLUMNS, REPORTS_PAYMENTS_TABLE_HEAD_CELLS } from './constant';
import { mockReportPayments } from '@lib/mock/mockPayments';

const ReportsPayment = () => {
  const t = useTranslations('payments');
  const theme = useTheme();
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState('0');

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockReportPayments;

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
      ...row
    }));

    return withAccountDetails;
  }, [searchText]);


  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
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

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    return (
      <ListRightPanelActions
        selectedCount={0}
        hasFilters={false}
        onDownloadClick={handleDownloadOpen}
      />
    );
  }, [handleDownloadOpen]);

  const reportsTableHeadCells = useMemo(
    () =>
      REPORTS_PAYMENTS_TABLE_HEAD_CELLS.map(cell => ({
        ...cell,
        label: t(cell.labelKey),
      })),
    [t],
  );

  // Memoize table data
  const reportsTableData = useMemo(
    () => ({
      columns: REPORTS_PAYMENTS_TABLE_COLUMNS,
      headCells: reportsTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'default',
    }),
    [reportsTableHeadCells, mappedRows],
  );

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setDownloadDialogOpen(false);
    setSelectedRows([]);
  }, []);

  const statusTabs = useMemo(
    () => [
      { label: t('daily'), value: '0' },
      { label: t('weekly'), value: '1' },
      { label: t('monthly'), value: '2' }
    ],
    [t],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(reportsTableData);

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
          statusTabs={statusTabs}
          currentTab={currentTab}
          onTabChange={handleTabChange}
          tableData={currentTableData}
          filterButtons={[]}
          selectedRows={selectedRows}
          onCheckboxClick={() => {}}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onQuickLinkClick={handleLinkClick}
        />
        <DownloadDebtorDialog
          open={downloadDialogOpen}
          anchorEl={downloadAnchorEl}
          onClose={handleDownloadClose}
          onDownload={handleDownload}
          title={`${t('download')} ${t('payments').toLowerCase()}`}
        />
      </section>
  </section>
  );
};
export default ReportsPayment;
