'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './TransactionalAuditAndApprove.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { mockAuditPaymentTableData, mockAuditCollectionTableData, mockAuditTransferTableData } from '@lib/mock/mockAuditAndApprove';
import { Icon } from '@atoms/index';

const PAYMENT_TABLE_COLUMNS = [
  'paymentID',
  'dateCreated',
  'userName',
  'instructions',
  'paymentType',
  'amount',
  { key: 'links', type: 'link' }
] as const;

const COLLECTION_TABLE_COLUMNS = [
  'collectionID',
  'dateCreated',
  'userName',
  'instructions',
  'collectionType',
  'amount',
  { key: 'links', type: 'link' }
] as const;

const TRANSFER_TABLE_COLUMNS = [
  'transferID',
  'dateCreated',
  'userName',
  'instructions',
  'transferType',
  'amount',
  { key: 'links', type: 'link' }
] as const;

const Audit = () => {
  const t = useTranslations('transactionalAuditAndApprove');
  const theme = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState("payments");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered: any[] = mockAuditPaymentTableData;

    if (currentTab === "payments") {
      filtered = mockAuditPaymentTableData
    } else if (currentTab === "collections") {
      filtered = mockAuditCollectionTableData.map((item: any) => ({
        paymentID: item.collectionID,
        paymentType: item.collectionType,
        ...item
      }))
    } else if (currentTab === "transfers") {
      filtered = mockAuditTransferTableData.map((item: any) => ({
        paymentID: item.transferID,
        paymentType: item.transferType,
        ...item
      }))
    }

    // Apply dialog filters
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.accountBalance?.branch?.toLowerCase().includes(search)
      );
    }
    if (filters.accountBalanceName) {
      const search = filters.accountBalanceName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.accountBalance?.name?.toLowerCase().includes(search),
      );
    }
    if (filters.accountNumber) {
      const search = filters.accountNumber.toLowerCase();
      filtered = filtered.filter((row: any) => 
        row.accountBalance?.accountNumber?.toLowerCase().includes(search)
      );
    }
    if (filters.paymentCategory) {
      filtered = filtered.filter((row: any) => row.paymentCategory === filters.paymentCategory);
    }
    if (filters.statusCode) {
      filtered = filtered.filter((row: any) => row.authoriseStatus === filters.statusCode);
    }

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
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));

    return withAccountDetails;
  }, [filters, searchText, t, currentTab]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
      const selected = Array.isArray(rows) ? rows : rows ? [rows] : [];

      // If "select all" was clicked (array with multiple or zero rows)
      if (Array.isArray(rows)) {
        if (rows.length === 0) {
          // Deselect all - clear everything
          setSelectedRows([]);
        } else if (rows.length > 1) {
          // Select all - limit to current page only
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageRows = mappedRows.slice(startIndex, endIndex);
          const currentPageIds = new Set(currentPageRows.map((r: any) => r.id));

          // Only keep selections from current page
          const pageSelections = selected.filter((row: any) => currentPageIds.has(row.id));
          setSelectedRows(pageSelections);
        } else {
          // Single row selection/deselection
          setSelectedRows(selected);
        }
      } else {
        // Single row click
        setSelectedRows(selected);
      }
    },
    [currentPage, perPage, mappedRows],
  );

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
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
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={() => {
          setDownloadDialogOpen(true);
          setDownloadAnchorEl(tableContainerRef.current);
        }}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

  // Memoize table head cells
  const paymentTableHeadCells = useMemo(
    () => [
      { id: 'paymentID', label: t('paymentID'), numeric: false },
      { id: 'dateCreated', label: t('dateCreated'), numeric: false },
      { id: 'userName', label: t('userName'), numeric: false },
      { id: 'instructions', label: t('instructions'), numeric: false },
      { id: 'paymentType', label: t('paymentType'), numeric: false },
      { id: 'amount', label: t('amount'), numeric: true },
      { id: 'links', label: t('quickLinks'), numeric: true, disableSort: true }
    ],
    [t],
  );
  const collectionTableHeadCells = useMemo(
    () => [
      { id: 'collectionID', label: t('collectionID'), numeric: false },
      { id: 'dateCreated', label: t('dateCreated'), numeric: false },
      { id: 'userName', label: t('userName'), numeric: false },
      { id: 'instructions', label: t('instructions'), numeric: false },
      { id: 'collectionType', label: t('collectionType'), numeric: false },
      { id: 'amount', label: t('amount'), numeric: true },
      { id: 'links', label: t('quickLinks'), numeric: true }
    ],
    [t],
  );
  const transferTableHeadCells = useMemo(
    () => [
      { id: 'transferID', label: t('transferID'), numeric: false },
      { id: 'dateCreated', label: t('dateCreated'), numeric: false },
      { id: 'userName', label: t('userName'), numeric: false },
      { id: 'instructions', label: t('instructions'), numeric: false },
      { id: 'transferType', label: t('transferType'), numeric: false },
      { id: 'amount', label: t('amount'), numeric: true },
      { id: 'links', label: t('quickLinks'), numeric: true, disableSort: true }
    ],
    [t],
  );

  // Memoize table data
  const paymentTableData = useMemo(
    () => {
      const updatedData = mockAuditPaymentTableData.map((row: any) => ({
        ...row,
        links: {
          href: row?.links?.href || '#',
          text: t(row?.links?.text).toLocaleUpperCase()
        }
      }));
      return {
        columns: PAYMENT_TABLE_COLUMNS,
        headCells: paymentTableHeadCells,
        rowButton: false,
        rows: updatedData,
        pageSize: 15,
        rowCount: updatedData.length,
        rowVariant: 'checkbox'
      };
    },
    [paymentTableHeadCells, t],
  );

  const collectionTableData = useMemo(
    () => {
      const updatedData = mockAuditCollectionTableData.map((row: any) => ({
        ...row,
        links: {
          href: row?.links?.href || '#',
          text: t(row?.links?.text).toLocaleUpperCase()
        }
      }));
      return {
        columns: COLLECTION_TABLE_COLUMNS,
        headCells: collectionTableHeadCells,
        rowButton: false,
        rows: updatedData,
        pageSize: 15,
        rowCount: updatedData.length,
        rowVariant: 'checkbox'
      };
    },
    [collectionTableHeadCells, t],
  );

  const transferTableData = useMemo(
    () => {
      const updatedData = mockAuditTransferTableData.map((row: any) => ({
        ...row,
        links: {
          href: row?.links?.href || '#',
          text: t(row?.links?.text).toLocaleUpperCase()
        }
      }));
      return {
        columns: TRANSFER_TABLE_COLUMNS,
        headCells: transferTableHeadCells,
        rowButton: false,
        rows: updatedData,
        pageSize: 15,
        rowCount: updatedData.length,
        rowVariant: 'checkbox'
      };
    },
    [transferTableHeadCells, t],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(paymentTableData);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    if (newValue === 'payments') {
      setCurrentTableData(paymentTableData);
    } else if (newValue === 'collections') {
      setCurrentTableData(collectionTableData);
    } else if (newValue === 'transfers') {
      setCurrentTableData(transferTableData);
    }
  }, [paymentTableData, collectionTableData, transferTableData]);
  
  const statusTabs = useMemo(
    () => [
      { label: t('payments'), value: 'payments' },
      { label: t('collections'), value: 'collections' },
      { label: t('transfers'), value: 'transfers' }
    ],
    [t],
  );

  return (
    <section className={styles.tabContent}>
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
            tableData={currentTableData}
            onTabChange={handleTabChange}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
      </section>
  </section>
  );
};
export default Audit;
