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
import { printPaymentHistory } from '@lib/api/beneficiaryApi';
import { formatDate } from '@lib/utils';
import { buildTestId } from 'src/utils/testIds';

const base64ToBlob = (base64: string, contentType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

const columns = [
  { key: 'paymentID', type: 'normal' as const },
  { key: 'dateCreated', type: 'normal' as const },
  { key: 'currency', type: 'normal' as const },
  { key: 'amount', type: 'normal' as const },
  { key: 'status', type: 'chip' as const },
];

const headCells = [
  { id: 'paymentID', label: 'Payment ID', numeric: false, disablePadding: false },
  { id: 'dateCreated', label: 'Date Created', numeric: false, disablePadding: false },
  { id: 'currency', label: 'Currency', numeric: false, disablePadding: false },
  { id: 'amount', label: 'Amount', numeric: true, disablePadding: false },
  { id: 'status', label: 'Status', numeric: false, disablePadding: false },
];

const getStatusChip = (status: string) => {
  if (!status || typeof status !== 'string') {
    return {
      value: 'Unknown',
      color: 'secondary' as const,
    };
  }
  
  switch (status.toLowerCase()) {
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
  const testIdPrefix = 'beneficiary-manage-history';

  // Get beneficiary data from Redux
  const beneficiary = useSelector((state: RootState) => state.createBeneficiary.beneficiary);
  
  // Map backend data to table format
  const historyData = useMemo(() => {
    const history = beneficiary?.counterPartyTransactionHistoryList || [];
    
    return history.map((item: any, index: number) => ({
      id: item.id || item.paymentId || item.transactionId || index + 1,
      paymentID: item.paymentId || item.paymentID || item.transactionId || '',
      dateCreated: formatDate(item.date || item.dateCreated || item.dateAndTime || item.transactionDate || ''),
      currency: item.currency || item.currencyCode || '',
      amount: item.amount || item.transactionAmount || 0,
      status: item.status || item.transactionStatus || 'Unknown',
    }));
  }, [beneficiary]);

  // Filter state
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const filterOpen = Boolean(filterAnchorEl);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    paymentId: '',
    dateCreated: '',
    currency: '',
    from: '',
    to: '',
    status: '',
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloadError, setDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<any>(null);

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
      paymentId: '',
      dateCreated: '',
      currency: '',
      from: '',
      to: '',
      status: '',
    });
  };

  const hasActiveFilters =
    activeFilters && Object.values(activeFilters).some((value) => value !== '');

  const filteredData = useMemo(() => {
    return historyData.filter((row) => {
      // Filter by Payment ID (case-insensitive partial match)
      if (activeFilters.paymentId) {
        const paymentId = String(row.paymentID || '').toLowerCase();
        if (!paymentId.includes(activeFilters.paymentId.toLowerCase())) {
          return false;
        }
      }

      // Filter by Date Created (exact match)
      if (activeFilters.dateCreated && row.dateCreated !== activeFilters.dateCreated) {
        return false;
      }

      // Filter by Currency (case-insensitive partial match)
      if (activeFilters.currency) {
        const currency = String(row.currency || '').toLowerCase();
        if (!currency.includes(activeFilters.currency.toLowerCase())) {
          return false;
        }
      }

      // Filter by Amount Range (from)
      if (activeFilters.from) {
        const amount = parseFloat(String(row.amount || 0));
        const fromAmount = parseFloat(activeFilters.from);
        if (isNaN(amount) || isNaN(fromAmount) || amount < fromAmount) {
          return false;
        }
      }

      // Filter by Amount Range (to)
      if (activeFilters.to) {
        const amount = parseFloat(String(row.amount || 0));
        const toAmount = parseFloat(activeFilters.to);
        if (isNaN(amount) || isNaN(toAmount) || amount > toAmount) {
          return false;
        }
      }

      // Status filtering excluded as per user request

      return true;
    });
  }, [historyData, activeFilters]);

  // Download handlers
  const handleDownloadClick = async () => {
    if (!beneficiary?.entityKey || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadError(false);
      setLastDownloadParams({ beneficiaryKey: beneficiary.entityKey });
      
      // Call API to get PDF as base64 string
      const base64Pdf = await printPaymentHistory({
        beneficiaryKey: beneficiary.entityKey,
        ascOrder: true // Default to ascending order
      });

      // Convert base64 to blob
      const blob = base64ToBlob(base64Pdf, 'application/pdf');

      // Create download URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-history-${beneficiary.entityKey}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbarMessage('Download successful');
      setDownloadError(false);
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Download failed');
      setDownloadError(true);
      setSnackbarOpen(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetryDownload = () => {
    if (lastDownloadParams) {
      setSnackbarOpen(false);
      handleDownloadClick();
    }
  };

  const transformedData = filteredData.map((row) => {
    const statusChip = getStatusChip(row.status);
    return {
      ...row,
      status: {
        ...statusChip,
        valueOf: () => statusChip.value,
        toString: () => statusChip.value,
      },
    };
  });

  // Filter buttons for left side (same pattern as audit trail)
  const filterButtons = [
    ...(hasActiveFilters
      ? [
          {
            children: (
              <>
                <span style={{ fontSize: '14px', fontWeight: 400 }}>Remove filters</span>
                <Image
                  src={CloseIcon}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ marginLeft: 4 }}
                />
              </>
            ),
            buttonVariant: 'tertiary' as const,
            'data-testid': buildTestId(testIdPrefix, 'remove-filters-button'),
            onClick: handleClearFilters,
          },
        ]
      : []),
    ...(filteredData.length > 0
      ? [
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
                <span style={{ fontSize: '14px', fontWeight: 700 }}>DOWNLOAD</span>
              </>
            ),
            buttonVariant: 'tertiary' as const,
            'data-testid': buildTestId(testIdPrefix, 'download-button'),
            onClick: handleDownloadClick,
          },
        ]
      : []),
    ...(historyData.length > 0
      ? [
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
                <span style={{ fontSize: '14px', fontWeight: 700 }}>FILTER</span>
              </>
            ),
            buttonVariant: 'tertiary' as const,
            'data-testid': buildTestId(testIdPrefix, 'filter-button'),
            onClick: handleFilterClick,
          },
        ]
      : []),
  ];

  return (
    <>
      <div style={{ 
        width: '100%', 
        overflow: 'auto',
        position: 'relative'
      }} data-testid={buildTestId(testIdPrefix, 'table-container')}>
        <TableWrapper
            key={JSON.stringify(activeFilters)}
            dataSets={[
              {
                columns: columns,
                headCells: headCells,
                rows: transformedData,
                rowButton: false,
                rowsPerPage: 15,
              },
            ]}
            filterButtons={filterButtons}
            tableIndex={0}
            emptyStateTitle="No history available"
            sx={{ 
              borderRadius: '8px', 
              border: '1px solid #E0E0E0',
              minWidth: '100%'
            }}
          />
      </div>

      {/* Filter Popover anchored to FILTER button */}
      <HistoryTableFilter
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
        values={activeFilters}
        testIdPrefix={buildTestId(testIdPrefix, 'filter')}
      />
      
      {/* Snackbar for download notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={downloadError ? null : 4000}
        onClose={() => !downloadError && setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
        data-testid={buildTestId(testIdPrefix, 'download-snackbar')}
      >
        <Alert
          icon={
            <Image 
              src={downloadError ? WarningIcon : CheckCircleIcon} 
              alt={downloadError ? "error" : "success"} 
              width={24} 
              height={24}
              style={downloadError ? { filter: 'brightness(0) saturate(100%) invert(100%)' } : undefined}
            />
          }
          severity={downloadError ? 'error' : 'success'}
          action={
            downloadError ? (
              <Button
                buttonVariant="tertiary"
                onClick={handleRetryDownload}
                data-testid={buildTestId(testIdPrefix, 'retry-download-button')}
                style={{
                  color: '#FFFFFF',
                  minWidth: 'auto',
                  padding: '4px 12px',
                  height: '36px',
                }}
              >
                Try again
              </Button>
            ) : null
          }
          sx={{
            backgroundColor: downloadError ? '#DC0A0A' : '#008545',
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
    </>
  );
}

export default ManageHistoryTable;
