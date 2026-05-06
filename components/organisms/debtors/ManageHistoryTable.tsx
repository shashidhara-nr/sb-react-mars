'use client';

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { Button, TableWrapper } from 'dist/standard-bank-react';
import { Snackbar, Alert } from '@mui/material';
import Image from 'next/image';
import FilterIcon from 'public/icons/col-icon-filter.svg';
import DownloadIcon from 'public/icons/col-icon-download.svg';
import CloseIcon from 'public/icons/icn_close_circle.svg';
import CheckCircleIcon from 'public/icons/icn_check_circle_white.svg';
import WarningIcon from 'public/icons/icn_warning_outline.svg';
import HistoryTableFilter, { FilterValues } from './HistoryTableFilter';
import { printDebtorHistory } from '@lib/api/debtorApi';
import { formatDate } from '@lib/utils';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';

// Type for history table rows
interface HistoryRow {
  id: string | number;
  collectionID: string;
  dateCreated: string;
  currency: string;
  amount: number;
  status: string;
}

// Helper function to convert base64 to blob
const base64ToBlob = (base64: string, contentType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

// Define column structure for the DataTable
const columns = [
  { key: 'collectionID', type: 'normal' as const },
  { key: 'dateCreated', type: 'normal' as const },
  { key: 'currency', type: 'normal' as const },
  { key: 'amount', type: 'normal' as const },
  { key: 'status', type: 'chip' as const },
];

// Map status strings to chip format {value, color}
const getStatusChip = (status: string) => {
  if (!status || typeof status !== 'string') {
    return {
      value: 'Unknown',
      color: 'secondary' as const,
    };
  }
  
  switch (status.toLowerCase()) {
    case 'ts':
    case 'completed':
    case 'processed':
    case 'success':
    case 'active':
      return {
        value: 'Processed',
        color: 'success' as const,
      };
    case 'pending':
    case 'awaiting':
      return {
        value: 'Processing',
        color: 'secondary' as const,
      };
    case 'failed':
    case 'error':
    case 'rejected':
      return {
        value: 'Failed',
        color: 'error' as const,
      };
    case 'processing':
    case 'in progress':
      return {
        value: 'Processing',
        color: 'warning' as const,
      };
    case 'unknown':
    default:
      return {
        value: status || 'Unknown',
        color: 'secondary' as const,
      };
  }
};

function ManageHistoryTable() {
  const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtors-manage-history';

  // Get debtor data from Redux (managedDebtor state)
  const debtor = useSelector((state: RootState) => state.createDebtor.managedDebtor);
  
  // Define head cells for table headers with translations
  const headCells = useMemo(() => [
    { id: 'collectionID', label: translateLang('collectionID'), numeric: false, disablePadding: false },
    { id: 'dateCreated', label: translateLang('dateCreatedLabel'), numeric: false, disablePadding: false },
    { id: 'currency', label: translateLang('currencyLabel'), numeric: false, disablePadding: false },
    { id: 'amount', label: translateLang('amountLabel'), numeric: true, disablePadding: false },
    { id: 'status', label: translateLang('statusLabel'), numeric: false, disablePadding: false },
  ], [translateLang]);

  // Map backend data to table format
  const historyData = useMemo(() => {
    const history = (debtor as any)?.collectionHistory || debtor?.counterPartyTransactionHistoryList || [];
    
    // Filter out empty entries
    const validHistory = history.filter((item: any) => 
      item && (item.collectionId || item.transactionId || item.amount)
    );
    
    return validHistory.map((item: any, index: number) => ({
      id: item.id || item.collectionId || item.transactionId || index + 1,
      collectionID: item.collectionId || item.collectionID || item.transactionId || '',
      dateCreated: formatDate(item.date || item.dateCreated || item.dateAndTime || item.transactionDate || ''),
      currency: item.currency || item.currencyCode || '',
      amount: item.amount || item.transactionAmount || 0,
      status: item.status || item.transactionStatus || 'Unknown',
    }));
  }, [debtor]);

  // Filter state
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const filterOpen = Boolean(filterAnchorEl);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    collectionId: '',
    dateCreated: '',
    currencyAmount: '',
    amountFrom: '',
    amountTo: '',
    status: '',
  });

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloadError, setDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<any>(null);

  // Filter handlers
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: FilterValues) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      collectionId: '',
      dateCreated: '',
      currencyAmount: '',
      amountFrom: '',
      amountTo: '',
      status: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    activeFilters && Object.values(activeFilters).some((value) => value !== '');

  // Apply filters to history data
  const filteredData = useMemo(() => {
    return historyData.filter((row: HistoryRow) => {
      // Filter by Collection ID (case-insensitive partial match)
      if (activeFilters.collectionId) {
        const collectionId = String(row.collectionID || '').toLowerCase();
        if (!collectionId.includes(activeFilters.collectionId.toLowerCase())) {
          return false;
        }
      }

      // Filter by Date Created (exact match)
      if (activeFilters.dateCreated && row.dateCreated !== activeFilters.dateCreated) {
        return false;
      }

      // Filter by Currency (case-insensitive partial match)
      if (activeFilters.currencyAmount) {
        const currency = String(row.currency || '').toLowerCase();
        if (!currency.includes(activeFilters.currencyAmount.toLowerCase())) {
          return false;
        }
      }

      // Filter by Amount Range (from)
      if (activeFilters.amountFrom) {
        const amount = parseFloat(String(row.amount || 0));
        const fromAmount = parseFloat(activeFilters.amountFrom);
        if (isNaN(amount) || isNaN(fromAmount) || amount < fromAmount) {
          return false;
        }
      }

      // Filter by Amount Range (to)
      if (activeFilters.amountTo) {
        const amount = parseFloat(String(row.amount || 0));
        const toAmount = parseFloat(activeFilters.amountTo);
        if (isNaN(amount) || isNaN(toAmount) || amount > toAmount) {
          return false;
        }
      }

      return true;
    });
  }, [historyData, activeFilters]);

  // Download handler
  const handleDownload = async () => {
    if (!debtor?.entityKey || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadError(false);
      setLastDownloadParams({ debtorKey: debtor.entityKey });

      // Call API to get base64 PDF
      const base64Data = await printDebtorHistory({
        debtorKey: debtor.entityKey,
        ascOrder: false
      });

      // Convert base64 to blob
      const blob = base64ToBlob(base64Data, 'application/pdf');

      // Create download URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `debtor-history-${debtor.entityKey}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success snackbar
      setSnackbarMessage(translateLang('downloadSuccessful'));
      setDownloadError(false);
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(translateLang('downloadFailed'));
      setDownloadError(true);
      setSnackbarOpen(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetryDownload = () => {
    if (lastDownloadParams) {
      setSnackbarOpen(false);
      handleDownload();
    }
  };

  // Filter buttons for left side
  const filterButtons = [
    {
      children: (
        <>
          <Image
            src={DownloadIcon}
            alt="download"
            width={24}
            height={24}
            style={{ marginRight: 4 }}
          />
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{translateLang('download')}</span>
        </>
      ),
      buttonVariant: 'tertiary' as const,
      'data-testid': buildTestId(testIdPrefix, 'download-button'),
      onClick: handleDownload,
    },
    {
      children: (
        <>
          <Image
            src={FilterIcon}
            alt="filter"
            width={24}
            height={24}
            style={{ marginRight: 4 }}
          />
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{translateLang('filter')}</span>
        </>
      ),
      buttonVariant: 'tertiary' as const,
      'data-testid': buildTestId(testIdPrefix, 'filter-button'),
      onClick: handleFilterClick,
    },
    ...(hasActiveFilters ? [{
      children: translateLang('removeFilters'),
      buttonVariant: 'tertiary' as const,
      endIcon: <Image src={CloseIcon} alt="close" width={20} height={20} />,
      'data-testid': buildTestId(testIdPrefix, 'clear-filter-button'),
      onClick: handleClearFilters,
    }] : []),
  ];

  return (
    <>
      {historyData.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '16px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }} data-testid={buildTestId(testIdPrefix, 'empty-state')}>
          {translateLang('noCollectionHistory')}
        </div>
      ) : (
        <div style={{ 
          width: '100%', 
          overflow: 'auto',
          position: 'relative'
        }} data-testid={buildTestId(testIdPrefix, 'table-container')}>
          <TableWrapper
            dataSets={[
              {
                columns: columns,
                headCells: headCells,
                rows: filteredData.map((row: HistoryRow) => ({
                  ...row,
                  status: getStatusChip(row.status)
                })),
                rowButton: false,
                rowsPerPage: 15,
              },
            ]}
            filterButtons={filterButtons}
            tableIndex={0}
            sx={{ 
              borderRadius: '8px', 
              border: '1px solid #E0E0E0',
              minWidth: '100%'
            }}
          />
        </div>
      )}

      {/* Filter Popover */}
      <HistoryTableFilter
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
      />

      {/* Download Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={downloadError ? null : 6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={downloadError ? 'error' : 'success'}
          sx={{ width: '100%', alignItems: 'center' }}
          icon={
            downloadError ? (
              <Image src={WarningIcon} alt="warning" width={24} height={24} />
            ) : (
              <Image src={CheckCircleIcon} alt="success" width={24} height={24} />
            )
          }
          action={
            downloadError ? (
              <Button
                buttonVariant="tertiary"
                onClick={handleRetryDownload}
                style={{ color: 'white', textDecoration: 'underline' }}
              >
                {translateLang('retry')}
              </Button>
            ) : undefined
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ManageHistoryTable;