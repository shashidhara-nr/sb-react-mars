'use client'

import { useMemo, useState, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Breadcrumb, Heading, Loader } from 'dist/standard-bank-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FunnelIcon, DownloadIcon, SearchIcon } from 'lib/icons';
import { CommonSnackbar, ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import DebtorHistoryFilterDialog, { DebtorHistoryFilterValues } from '@molecules/DebtorHistoryFilterDialog';
import DownloadCollectionDialog from '@molecules/DownloadCollectionDialog';
import TableContainer from '@molecules/TableContainer/TableContainer';
import { navlinks, HISTORY_TABLE_COLUMNS, getHistoryTableHeadCells, type HistoryRow, transformCollectionHistoryToRows } from '../collectionHelper';
import { buildTestId } from 'src/utils/testIds';
import { useCollectionHistory } from '@lib/hooks/useCollectionHistory';
import { printCollectionHistory } from '@lib/api/collectionApi';

export default function DebtorHistoryPage() {
  const testIdPrefix = 'debtor-history-page';
  const t = useTranslations('collections');
  const params = useSearchParams();
  const router = useRouter();
  const debtorName = params?.get('name') || 'Debtor Name';
  const debtorCode = params?.get('code') || '';
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isDownloading, setIsDownloading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  const {
    collectionHistories,
    loading,
    error,
    currentPage,
    pageSize,
    rowCount,
    filters,
    setFilters,
    clearFilters,
    handlePageChange,
    handlePerPageChange,
  } = useCollectionHistory({
    debtorCode,
    debtorName,
    autoFetch: true,
  });

  const tableHeadCells = useMemo(() => getHistoryTableHeadCells(t), [t]);

  const rows: HistoryRow[] = useMemo(() => {
    if (!collectionHistories || collectionHistories.length === 0) {
      return [];
    }
    return transformCollectionHistoryToRows(collectionHistories);
  }, [collectionHistories]);

  const hasFilters = useMemo(() => {
    return Object.values(filters).some((value) => Boolean(value));
  }, [filters]);

  const breadcrumbLinks = useMemo(() => (
    [
      { href: navlinks.dashboard, label: t('dashboard') },
      { href: navlinks.collection, label: t('breadcrumbCollections') },
      { href: navlinks.history, label: t('breadcrumbDebtorHistory') },
    ]
  ), [t]);

  const onPageChange = useCallback((newPage: number) => {
    handlePageChange(newPage);
  }, [handlePageChange]);

  const onPerPageChange = useCallback((newPerPage: number) => {
    handlePerPageChange(newPerPage);
  }, [handlePerPageChange]);

  const handleOpenFilter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setFilterOpen(true);
    setFilterAnchorEl(e.currentTarget);
  }, []);

  const handleApplyFilters = useCallback((vals: Partial<DebtorHistoryFilterValues>) => {
    setFilters(vals);
    setFilterOpen(false);
    setFilterAnchorEl(null);
  }, [setFilters]);

  const handleReload = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleOpenDownload = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(e.currentTarget);
  }, []);

  const handleCloseDownload = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownload = useCallback(async (payload: { format: string; sortBy: string }) => {
    if (!debtorCode || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadDialogOpen(false);
      setDownloadAnchorEl(null);
      const ascOrder = payload.sortBy === 'ascending';
      const blob = await printCollectionHistory({
        debtorCode,
        filters,
        ascOrder,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `collection-history-${debtorCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbarMessage(t('snackbarDownloadSuccess'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Download error:', error);
      setSnackbarMessage('Download failed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDownloading(false);
    }
  }, [debtorCode, filters, isDownloading, t]);

  const actionButtons = [
    {
      children: (<><Image src={DownloadIcon} alt={t('altIconDownload')} width={16} height={16} style={{ marginRight: 4 }} />{t('buttonDownload')}</>),
      buttonVariant: 'tertiary',
      'data-testid': buildTestId(testIdPrefix, 'download-button'),
      onClick: handleOpenDownload,
      disabled: isDownloading,
    },
    {
      children: (<><Image src={FunnelIcon} alt={t('altIconFilter')} width={16} height={16} style={{ marginRight: 4 }} />{t('buttonFilter')}</>),
      buttonVariant: 'tertiary',
      'data-testid': buildTestId(testIdPrefix, 'filter-button'),
      onClick: handleOpenFilter,
    },
  ];

  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('emptyStateNoResultsTitle')}
      description={t('emptyStateNoResultsDescription')}
      icon={<Image src={SearchIcon} alt={t('altIconSearch')} width={32} height={32} />}
      testIdPrefix={testIdPrefix}
    />
  ), [t, testIdPrefix]);

  const errorStateContent = useMemo(() => (
    <EmptyState
      title={t('errorStateTitle')}
      description={t('errorStateDescription')}
      buttonLabel={t('buttonReload')}
      onButtonClick={handleReload}
      icon={
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#FEF0F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#F04438',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            !
          </Box>
        </Box>
      }
      testIdPrefix={testIdPrefix}
    />
  ), [t, handleReload, testIdPrefix]);

  return (
    <Grid container spacing={2} sx={{ pb: 2 }} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Grid size={12} sx={{ mb: 0.5, mt: 1 }} data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}>
        <Breadcrumb links={breadcrumbLinks} />
      </Grid>

      <Grid size={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '40px', mb: 0.5 }} data-testid={buildTestId(testIdPrefix, 'header')}>
        <Heading as="h4" fontSize="24px">{debtorName} {t('tabHistory').toLowerCase()}</Heading>
        <Box />
      </Grid>

      {loading ? (
        <Grid size={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <Loader backgroundColor="transparent" />
          </Box>
        </Grid>
      ) : (
        <Grid size={12} sx={{ padding: 0, backgroundColor: '#FFFFFF', borderRadius: '12px' }} data-testid={buildTestId(testIdPrefix, 'table-container')}>
          <TableContainer
            tableData={{
              columns: HISTORY_TABLE_COLUMNS,
              headCells: tableHeadCells,
              rows,
              rowButton: false,
            } as any}
            filterButtons={actionButtons}
            rightPanelContent={
              <ListRightPanelActions 
                selectedCount={0} 
                hasFilters={hasFilters} 
                onRemoveFilters={clearFilters} 
                testIdPrefix={testIdPrefix}
              />
            }
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
            serverSidePagination={true}
            totalRecords={rowCount}
            currentPage={currentPage}
            perPage={pageSize}
            tableSx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}
            showTabs={false}
            emptyStateContent={error ? errorStateContent : emptyStateContent}
          />
        </Grid>
      )}

      <DebtorHistoryFilterDialog
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={() => { setFilterOpen(false); setFilterAnchorEl(null); }}
        onApply={handleApplyFilters}
        initialValues={filters}
      />

      <DownloadCollectionDialog
        open={downloadDialogOpen}
        anchorEl={downloadAnchorEl}
        onClose={handleCloseDownload}
        onDownload={handleDownload}
        title="Download collection history"
        availableFormats={['pdf']}
        defaultFormat="pdf"
        loading={isDownloading}
      />

      <CommonSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Grid>
  );
}
