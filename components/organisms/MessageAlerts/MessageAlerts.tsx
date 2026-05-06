'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import styles from './MessageAlerts.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme, Box } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import { mockMessageAlertsData } from '@lib/mock/mockMessageAlerts';
import { Icon } from '@atoms/index';
import { buildTestId } from 'src/utils/testIds';
import MessageAlertsFilterDialog from './MessageAlertsFilterDialog';
import MessageAlertDetail from './MessageAlertDetail';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import DownloadCollectionDialog from 'components/molecules/DownloadCollectionDialog/DownloadCollectionDialog';

const TABLE_COLUMNS = [
  'messageId',
  'dateSent',
  'subject',
  'status',
  { key: 'links', type: 'link' }
] as const;

const testIdPrefix = 'message-alerts';

const MessageAlerts = () => {
  const t = useTranslations('messageAlerts');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockMessageAlertsData;

    // Apply dialog filters
    if (filters.messageId) {
      const search = filters.messageId.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.messageId?.toLowerCase().includes(search),
      );
    }
    if (filters.subject) {
      const search = filters.subject.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.subject?.toLowerCase().includes(search),
      );
    }
    if (filters.dateSentFrom) {
      let fromDate: any = filters.dateSentFrom;
      if (fromDate && typeof fromDate.toDate === 'function') {
        fromDate = fromDate.toDate();
      } else if (typeof fromDate === 'string') {
        fromDate = new Date(fromDate);
      }
      if (fromDate instanceof Date && !isNaN(fromDate.getTime())) {
        filtered = filtered.filter((row: any) => {
          const [day, month, year] = row.dateSent.split('/');
          const rowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return rowDate >= fromDate;
        });
      }
    }
    if (filters.dateSentTo) {
      let toDate: any = filters.dateSentTo;
      if (toDate && typeof toDate.toDate === 'function') {
        toDate = toDate.toDate();
      } else if (typeof toDate === 'string') {
        toDate = new Date(toDate);
      }
      if (toDate instanceof Date && !isNaN(toDate.getTime())) {
        filtered = filtered.filter((row: any) => {
          const [day, month, year] = row.dateSent.split('/');
          const rowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return rowDate <= toDate;
        });
      }
    }

    // Apply text search
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.messageId?.toLowerCase().includes(search) ||
          row?.subject?.toLowerCase().includes(search),
      );
    }

    const withLinks = filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));

    return withLinks;
  }, [filters, searchText, t]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
    setSelectedRows([]);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      setFilterDialogOpen(false);
      setFilterAnchorEl(null);
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          setSelectedRows([]);
        } else if (rows.length > 1) {
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mappedRows.slice(startIndex, endIndex);
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
    [currentPage, perPage, mappedRows],
  );

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handleDeleteOpen = useCallback(() => {
    setDeleteDialogOpen(true);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDeleteClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
    setDownloadAnchorEl(rightPanelRef.current);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  const handleDownload = useCallback(() => {
    // Just close the dialog on download click
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
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

  // Handle link click
  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    setSelectedMessage(row);
    const messageIndex = mappedRows.findIndex((msg: any) => msg.id === row.id);
    setSelectedMessageIndex(messageIndex);
    setDetailDialogOpen(true);
  }, [mappedRows]);

  // Handle navigation to next message
  const handleNextMessage = useCallback(() => {
    if (selectedMessageIndex < mappedRows.length - 1) {
      const nextIndex = selectedMessageIndex + 1;
      setSelectedMessageIndex(nextIndex);
      setSelectedMessage(mappedRows[nextIndex]);
    }
  }, [selectedMessageIndex, mappedRows]);

  // Handle navigation to previous message
  const handlePreviousMessage = useCallback(() => {
    if (selectedMessageIndex > 0) {
      const prevIndex = selectedMessageIndex - 1;
      setSelectedMessageIndex(prevIndex);
      setSelectedMessage(mappedRows[prevIndex]);
    }
  }, [selectedMessageIndex, mappedRows]);

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
        'data-testid': buildTestId(testIdPrefix, 'button', 'filter'),
      },
    ];
  }, [handleFilterOpen, t, theme.palette.secondary.main]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={handleDownloadOpen}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters, handleDownloadOpen, handleDeleteOpen]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'messageId', label: t('messageId'), numeric: false, colWidth: '150px' },
      { id: 'dateSent', label: t('dateSent'), numeric: false, colWidth: '140px' },
      { id: 'subject', label: t('subject'), numeric: false, colWidth: '300px' },
      { id: 'status', label: t('status'), numeric: false, colWidth: '150px' },
      { id: 'links', label: t('quickLinks'), numeric: false, colWidth: '170px', disableSort: true }
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'checkbox',
    }),
    [tableHeadCells, mappedRows],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/message-alerts', label: t('messageAlerts') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('messageAlerts')}
        </Heading>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            data-testid={buildTestId(testIdPrefix, 'input', 'search')}
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
        <section className={styles.tableContainer} ref={rightPanelRef}>
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
          />
          <MessageAlertsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterDialogOpen(false)}
            onApply={(newFilters: any) => setFilters(newFilters)}
            initialValues={filters}
          />
          <DownloadCollectionDialog
            open={downloadDialogOpen}
            anchorEl={downloadAnchorEl}
            onClose={handleDownloadClose}
            onDownload={handleDownload}
            title="Download error code"
            availableFormats={['pdf']}
            defaultSortBy="ascending"
            defaultFormat="pdf"
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            itemLabel={t('messageAlerts')}
            markedCount={selectedRows.length}
          />
          <MessageAlertDetail
            open={detailDialogOpen}
            onClose={() => {
              setDetailDialogOpen(false);
              setSelectedMessageIndex(-1);
              setSelectedMessage(null);
            }}
            selectedMessage={selectedMessage}
            selectedMessageIndex={selectedMessageIndex}
            mappedRows={mappedRows}
            onNextMessage={handleNextMessage}
            onPreviousMessage={handlePreviousMessage}
          />
        </section>
      </section>
    </section>
  );
};

export default MessageAlerts;
