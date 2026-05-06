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
import { printAuditTrail, exportAuditTrailHistory } from '@lib/api/debtorApi';
import { formatDate } from '@lib/utils';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';

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
  { key: 'userName', type: 'normal' as const },
  { key: 'eventType', type: 'normal' as const },
  { key: 'description', type: 'normal' as const },
  { key: 'timeOfEvent', type: 'normal' as const },
];

function ManageAuditTrail() {
  const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtors-manage-audit-trail';
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<HTMLElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloadError, setDownloadError] = useState(false);
  const [lastDownloadParams, setLastDownloadParams] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<5 | 15 | 30 | 50 | 100>(15);
  
  // Get debtor data from Redux (managedDebtor state)
  const debtor = useSelector((state: RootState) => state.createDebtor.managedDebtor);
  
  // Define head cells for table headers with translations
  const headCells = useMemo(() => [
    { id: 'userName', label: translateLang('userName'), numeric: false, disablePadding: false },
    { id: 'eventType', label: translateLang('eventType'), numeric: false, disablePadding: false },
    { id: 'description', label: translateLang('descriptionLabel'), numeric: false, disablePadding: false },
    { id: 'timeOfEvent', label: translateLang('timeOfEvent'), numeric: false, disablePadding: false },
  ], [translateLang]);
  
  // Map backend data to table format
  const auditData = useMemo(() => {
    const auditTrails = debtor?.auditTrails || [];
    
    // Filter out empty audit trail entries (from initial state)
    const validAuditTrails = auditTrails.filter((item: any) => 
      item && (item.userName || item.event || item.description)
    );
    
    return validAuditTrails.map((item: any, index: number) => ({
      id: item.id || index + 1,
      userName: item.userName || item.user || item.username || '',
      eventType: item.event || item.eventType || item.action || '',
      description: item.description || item.desc || '',
      timeOfEvent: formatDate(item.dateAndTime || item.date || item.time || item.timeOfEvent || item.timestamp || ''),
    }));
  }, [debtor]);

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
    if (!debtor?.entityKey || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadError(false);
      setLastDownloadParams({ format, sortOrder });
      handleCloseDownload();

      const ascOrder = sortOrder === 'ascending';
      let base64Data: string;
      let contentType: string;
      let fileExtension: string;

      // Call appropriate API based on format
      if (format === 'pdf') {
        base64Data = await printAuditTrail({
          debtorKey: debtor.entityKey,
          ascOrder
        });
        contentType = 'application/pdf';
        fileExtension = 'pdf';
      } else if (format === 'csv') {
        base64Data = await exportAuditTrailHistory({
          debtorKey: debtor.entityKey,
          exportFormat: 'csv',
          ascOrder
        });
        contentType = 'text/csv';
        fileExtension = 'csv';
      } else if (format === 'txt') {
        base64Data = await exportAuditTrailHistory({
          debtorKey: debtor.entityKey,
          exportFormat: 'txt',
          ascOrder
        });
        contentType = 'text/plain';
        fileExtension = 'txt';
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      // Convert base64 to blob
      const blob = base64ToBlob(base64Data, contentType);

      // Create download URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `debtor-audit-trail-${debtor.entityKey}.${fileExtension}`;
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
      handleDownload(lastDownloadParams.format, lastDownloadParams.sortOrder);
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
          {translateLang('noAuditTrail')}
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

      {/* Download Popover */}
      <DownloadAuditTrailPopover
        open={downloadOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleCloseDownload}
        onDownload={handleDownload}
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

export default ManageAuditTrail;