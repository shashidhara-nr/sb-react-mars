'use client';

import { useMemo, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import TableWithTab from '@molecules/TableWithTab';
import styles from './TransactionList.module.scss';
import { mockTransfersList } from '@lib/mock/mockTransfersList';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { TRANSFERS_COLUMNS, TRANSFERS_HEAD_CELL_CONFIG } from './constant';
import { FormControl, Grid, InputLabel, MenuItem, Select, Typography, useTheme } from '@mui/material';
import ListRightPanelActions from 'components/common/ListRightPanelActions';
import { Icon } from '@atoms/index';
import { DateRange } from 'react-day-picker';
import DateRangePicker from 'components/lib/DateRangePicker/DateRangePicker';
import { Button } from 'components/lib/Forms';
import { isDateInRange } from '@lib/utils/dateHelpers';
import TransferFilterDialog from './TransferFilterDialog';

const STATUS_LABEL_MAP: Record<string, string> = {
  awaitingApproval: 'Awaiting client feedback',
  processing: 'Awaiting approval',
  complete: 'Approved',
  declined: 'Declined',
};

const currencyKeyValueList: Record<string, string> = {'USD': '$', 'EUR': '€', 'GBP': '£'};

const currencyList = ['USD', 'EUR', 'GBP'];

const Transfers = () => {
  const t = useTranslations('findTransaction');
  const router = useRouter();
  const theme = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedDate, setSelectedDate] = useState<DateRange>();
  const [currency, setCurrency] = useState('');
  const [searchParams, setSearchParams] = useState<{ dateRange: DateRange | undefined; currency: string }>({ dateRange: undefined, currency: '' });

  const [baseRows, setBaseRows] = useState(() =>
    mockTransfersList.map((row: any) => ({
      ...row,
      status: {
        value: STATUS_LABEL_MAP[row.status.value],
        color: row.status.color,
      },
      quickLinks: {
        ...row.links,
        text: t('viewDetails').toUpperCase()
      },
    })),
  );

  const filteredRows = useMemo(() => {
    let data = baseRows;

    if (searchParams.dateRange) {
      const { from, to } = searchParams.dateRange;
      data = data.filter((row) => {
        return row.dateValue && from && to ? isDateInRange(row.dateValue as Date, from as Date, to as Date) : false;
      });
    }

    if (searchParams.currency) {
      data = data.filter((row) => row.currency === searchParams.currency);
    }

    if (filters.instructionId) {
      data = data.filter(r =>
        r.instructionId.toLowerCase().includes(filters.instructionId.toLowerCase()),
      );
    }

    if (filters.batchId) {
      data = data.filter(r =>
        r.batchId.toLowerCase().includes(filters.batchId.toLowerCase()),
      );
    }

    if (filters.transactionId) {
      data = data.filter((r) =>
        r.transactionId.toLowerCase().includes(filters.transactionId!.toLowerCase()),
      );
    }

    if (filters.debitAccountNumber) {
      data = data.filter((r) =>
        r.debitAccount.toLowerCase().includes(filters.debitAccountNumber!.toLowerCase()),
      );
    }

    if (filters.creditAccountNumber) {
      data = data.filter((r) =>
        r.creditAccount.toLowerCase().includes(filters.creditAccountNumber!.toLowerCase()),
      );
    }

    if (filters.accountNumber) {
      data = data.filter(r =>
        r.accountNumber.includes(filters.accountNumber),
      );
    }

    if (filters.amount) {
      data = data.filter((r) =>
        r.amount.toString().includes(filters.amount!.toString()),
      );
    }

    if (filters.paymentType) {
      data = data.filter(r =>
        r.paymentType.toLowerCase().includes(filters.paymentType.toLowerCase()),
      );
    }

    return data.map(r => ({
      ...r,
      amount: `${currencyKeyValueList[r.currency as string] || ''} ${Number(r.amount).toLocaleString()}`,
    }));
  }, [baseRows, filters, searchParams]);

  const handleLinkClick = (row: any, index: number, link: any) => {
    router.push(link.href);
  };

  const handleDeleteConfirm = useCallback(() => {
    const ids = new Set(selectedRows.map(r => r.id));
    setBaseRows(prev => prev.filter(row => !ids.has(row.id)));
    setSelectedRows([]);
    setDeleteDialogOpen(false);
  }, [selectedRows]);

  const handleDownload = useCallback(
    ({ format }: any) => {
      const ids = new Set(selectedRows.map(r => r.id));
      const dataToDownload = baseRows.filter(r => ids.has(r.id));

      if (!dataToDownload.length) {
        setDownloadDialogOpen(false);
        return;
      }

      const csv =
        `${t('instructionId')},${t('batchID')},${t('beneficiaryName')},${t('valueDate')},${t('accountNumber')},${t('amount')},${t('status')}\n` +
        dataToDownload
          .map(
            r =>
              `${r.instructionId},${r.batchId},${r.beneficiaryName},${r.valueDate},${r.accountNumber},${r.amount},${r.status.value}`,
          )
          .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transfers.${format || 'csv'}`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSelectedRows([]);
      setDownloadDialogOpen(false);
    },
    [selectedRows, baseRows, t],
  );

  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);
  
  const handleDeleteOpen = useCallback(() => {
    if (selectedRows.length === 0) return;
    setDeleteDialogOpen(true);
    setFilterDialogOpen(false);
    setDownloadDialogOpen(false);
  }, [selectedRows.length]);
  
  const handleDownloadOpen = useCallback(() => {
    if (selectedRows.length === 0) return;
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
    setFilterDialogOpen(false);
  }, [selectedRows.length]);

  const handleCheckboxClick = useCallback((rows: any | any[]) => {
    const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        setSelectedRows([]);
      } else if (rows.length > 1) {
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const currentPageRows = filteredRows.slice(startIndex, endIndex);
        const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));
        const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
        setSelectedRows(pageSelections);
      } else {
        setSelectedRows(selected);
      }
    } else {
      setSelectedRows(selected);
    }
  }, [currentPage, perPage, filteredRows]);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchParams({ dateRange: undefined, currency: '' });
    setSelectedDate(undefined);
    setCurrency('');
    setSelectedRows([]);
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
    const hasFilters = Object.keys(filters).length > 0 || searchParams.currency || searchParams.dateRange;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={handleDownloadOpen}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, searchParams, handleRemoveFilters, handleDeleteOpen, handleDownloadOpen]);

  const tableHeadCells = useMemo(
    () =>
      TRANSFERS_HEAD_CELL_CONFIG.map((cell) => ({
        ...cell,
        label: t(cell.labelKey),
      })),
    [t],
  );

  const tableData = useMemo(
    () => ({
      columns: TRANSFERS_COLUMNS,
      headCells: tableHeadCells,
      rows: filteredRows,
      rowVariant: 'checkbox',
      rowCount: filteredRows.length,
      pageSize: 15,
    }),
    [filteredRows, tableHeadCells],
  );

  const handleDateChange = useCallback((newDateRange: DateRange) => {
    setSelectedDate(newDateRange);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchParams({ dateRange: selectedDate, currency });
  }, [selectedDate, currency]);

  return (
    <section>
      <Grid size={12} container spacing={2} alignItems="center" className={styles.searchRow}>
        <Grid size={11} container spacing={2} alignItems="center" className={styles.searchWrapper}>
          <Grid size={6}>
            <DateRangePicker label={t('dateRange')} onChange={handleDateChange} />
          </Grid>
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel id="consolidated-currency-label">{t('currency')}</InputLabel>
              <Select
                labelId="currency-label"
                label={t('currency')}
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                displayEmpty={false}
                MenuProps={{
                  sx: { zIndex: 1500 },
                }}
              >
                {currencyList.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid size={1}>
          <Button buttonVariant="secondary" size="small" onClick={() => handleSearch()}>
            {t('search')}
          </Button>
        </Grid>
      </Grid>
      <section className={styles.tableContainer}>
        <TableWithTab
          tableData={tableData}
          filterButtons={filterButtons}
          selectedRows={selectedRows}
          onCheckboxClick={handleCheckboxClick}
          onRowClick={() => {}}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onQuickLinkClick={handleLinkClick}
        />

        <TransferFilterDialog
          open={filterDialogOpen}
          anchorEl={filterAnchorEl}
          initialValues={filters}
          onClose={() => setFilterDialogOpen(false)}
          onApply={(appliedFilters) => {
            setFilters(appliedFilters);
            setFilterDialogOpen(false);
          }}
        />

        <DownloadDebtorDialog
          open={downloadDialogOpen}
          anchorEl={downloadAnchorEl}
          onClose={() => setDownloadDialogOpen(false)}
          onDownload={handleDownload}
          title={t('download')}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onPrimaryCTA={handleDeleteConfirm}
          onSecondaryCTA={() => setDeleteDialogOpen(false)}
          selectedCount={selectedRows.length}
          itemLabel={t('transaction')}
          markedCount={selectedRows.length}
        />
      </section>
    </section>
  );
};

export default Transfers;