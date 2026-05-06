'use client';

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { Button, TableWrapper } from 'dist/standard-bank-react';
import { Snackbar, Alert } from '@mui/material';
import Image from 'next/image';
import DownloadIcon from 'public/icons/col-icon-download.svg';
import CheckCircleIcon from 'public/icons/icn_check_circle_white.svg';
import WarningIcon from 'public/icons/icn_warning_outline.svg';
import DownloadAuditTrailPopover from './DownloadAuditTrailDialog';
import { printAuditTrail, exportAuditTrailHistory } from '@lib/api/beneficiaryApi';
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
  { key: 'userName', type: 'normal' as const },
  { key: 'eventType', type: 'normal' as const },
  { key:  'description', type: 'normal' as const },
  { key: 'timeOfEvent', type: 'normal' as const },
];

const headCells = [
  { id: 'userName', label: 'User Name', numeric: false, disablePadding:  false },
  { id: 'eventType', label: 'Event Type', numeric: false, disablePadding: false },
  { id:  'description', label: 'Description', numeric: false, disablePadding:  false },
  { id: 'timeOfEvent', label: 'Time of Event', numeric: false, disablePadding: false },
];

function ManageAuditTrail() {
  const testIdPrefix = 'beneficiary-manage-audit-trail';
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<HTMLElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloadError, setDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<5 | 15 | 30 | 50 | 100>(15);
  
  const beneficiary = useSelector((state: RootState) => state.createBeneficiary.beneficiary);
  
  const auditData = useMemo(() => {
    const auditTrails = beneficiary?.auditTrails || [];
    
    return auditTrails.map((item: any, index: number) => ({
      id: item.id || index + 1,
      userName: item.userName || item.user || item.username || '',
      eventType: item.event || item.eventType || item.action || '',
      description: item.description || item.desc || '',
      timeOfEvent: formatDate(item.dateAndTime || item.date || item.time || item.timeOfEvent || item.timestamp || ''),
    }));
  }, [beneficiary]);

  const slicedAuditData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return auditData.slice(startIndex, startIndex + rowsPerPage);
  }, [auditData, page, rowsPerPage]);

  const downloadOpen = Boolean(downloadAnchorEl);

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownload = () => {
    setDownloadAnchorEl(null);
  };

  const handleDownload = async (format: string, sortOrder: string) => {
    if (!beneficiary?.entityKey || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadError(false);
      setLastDownloadParams({ format, sortOrder });
      handleCloseDownload();

      const ascOrder = sortOrder === 'ascending';
      let base64Data: string;
      let contentType: string;
      let fileExtension: string;

      if (format === 'pdf') {
        base64Data = await printAuditTrail({
          beneficiaryKey: beneficiary.entityKey,
          ascOrder
        });
        contentType = 'application/pdf';
        fileExtension = 'pdf';
      } else if (format === 'csv') {
        base64Data = await exportAuditTrailHistory({
          beneficiaryKey: beneficiary.entityKey,
          exportFormat: 'csv',
          ascOrder
        });
        contentType = 'text/csv';
        fileExtension = 'csv';
      } else if (format === 'txt') {
        base64Data = await exportAuditTrailHistory({
          beneficiaryKey: beneficiary.entityKey,
          exportFormat: 'txt',
          ascOrder
        });
        contentType = 'text/plain';
        fileExtension = 'txt';
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      const blob = base64ToBlob(base64Data, contentType);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-trail-${beneficiary.entityKey}.${fileExtension}`;
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
      handleDownload(lastDownloadParams.format, lastDownloadParams.sortOrder);
    }
  };

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
          <span style={{ fontSize: '14px', fontWeight: 700 }}>DOWNLOAD</span>
        </>
      ),
      buttonVariant: 'tertiary' as const,
      'data-testid': buildTestId(testIdPrefix, 'download-button'),
      onClick: handleDownloadClick,
    },
  ];

  return (
    <>
      {auditData.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '16px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }} data-testid={buildTestId(testIdPrefix, 'empty-state')}>
          No audit trail available for this beneficiary.
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
                rows: slicedAuditData,
                rowButton: false,
                rowsPerPage: rowsPerPage,
              },
            ]}
            filterButtons={filterButtons}
            tableIndex={0}
            serverSidePagination={true}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRecords={auditData.length}
            onPageChange={setPage}
            onPerPageChange={(newPerPage) => {
              setRowsPerPage(newPerPage as 5 | 15 | 30 | 50 | 100);
              setPage(1);
            }}
            sx={{ 
              borderRadius: '8px', 
              border: '1px solid #E0E0E0',
              minWidth: '100%'
            }}
          />
        </div>
      )}

      {/* Download Popover anchored to button */}
      <DownloadAuditTrailPopover
        open={downloadOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleCloseDownload}
        onDownload={handleDownload}
        testIdPrefix={buildTestId(testIdPrefix, 'download')}
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

export default ManageAuditTrail;
