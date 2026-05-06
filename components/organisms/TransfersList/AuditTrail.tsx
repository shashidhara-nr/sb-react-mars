'use client';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { useState, useMemo, useCallback, useRef } from 'react';
import DownloadDebtorDialog from 'components/molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import CommonSnackbar from 'components/common/CommonSnackbar';
import styles from './TransferList.module.scss';
import { Typography } from '@mui/material';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
// import theme from 'components/lib/styles/theme';
import { mockAuditTrail } from '@lib/mock/mockTransfers';

const TABLE_COLUMNS = [
 'username',
  'eventType',
  'description',
  'dateAndTime'
] as const;

const AuditTrail = () => {
  const t = useTranslations('transfers');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [downloadSuccessOpen, setDownloadSuccessOpen] = useState(false);

  const handleDeleteOpen = useCallback(() => {
    setDeleteDialogOpen(true);
    setDownloadDialogOpen(false);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(tableContainerRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];
      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          // Deselect all - clear everything
          setSelectedRows([]);
        } else if (rows.length > 1) {
          // Select all - limit to current page only
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mockAuditTrail.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));

          const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
          setSelectedRows(pageSelections);
        } else {
          setSelectedRows(selected);
        }
      } else {
        setSelectedRows(selected);
      }
    },
    [currentPage, perPage],
  );

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    const headers = [t('username'), t('eventType'), t('description'), t('dateAndTime')];
    const csvContent = [
      headers.join(','),
      ...mockAuditTrail.map((row: any) => 
        [
          row.username || '',
          row.eventType || '',
          `"${row.description || ''}"`, // Wrap in quotes to handle commas
          row.dateAndTime || ''
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccessOpen(true);
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, [t]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); 
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); 
  }, []);

  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="download" width='24' height='24' bgColor={"#0051FF"} />
            <Typography variant="button" className={styles.filterText}>{t('download')}</Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleDownloadOpen,
      },
    ];
  }, [handleDownloadOpen, t]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={false}
        onRemoveFilters={() => {}}
        onDownloadClick={handleDownloadOpen}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, handleDownloadOpen, handleDeleteOpen]);

  const tableHeadCells = useMemo(
    () => [
      { id: 'username', label: t('username'), numeric: false, colWidth: '200px' },
      { id: 'eventType', label: t('eventType'), numeric: false, colWidth: '200px' },
      { id: 'description', label: t('description'), numeric: false, colWidth: '300px' },
      { id: 'dateAndTime', label: t('dateAndTime'), numeric: false, colWidth: '200px' }
    ],
    [t],
  );
 
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mockAuditTrail,
      pageSize: 15,
      rowCount: mockAuditTrail.length,
      emptyStateTitle: t('NoAuditTrailNotAppliedTitle'),
      emptyStateSubtitle: t('NoAuditTrailNotAppliedDescription'),
      emptyStateIcon: <Icon name="info" width="27px" height="27px"  bgColor={"#0051FF"} />,
    }),
    [tableHeadCells, t],
  );

  return (
    <section className={styles.tabContent}>
      <section className={styles.tableContainer}>
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
          <DownloadDebtorDialog
            open={downloadDialogOpen}
            anchorEl={downloadAnchorEl}
            onClose={handleDownloadClose}
            onDownload={handleDownload}
            title={`${t('download')} ${selectedRows.length > 1 ? t('auditTrails') : t('auditTrail')}`}
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
            itemLabel={selectedRows.length > 1 ? t('auditTrails') : t('auditTrail')}
            markedCount={selectedRows.length}
          />
      </section>
  </section>
  );
};
export default AuditTrail;
