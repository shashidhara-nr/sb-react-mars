'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions, CommonSnackbar } from 'components/common';
import styles from './UserDetails.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import { mockUserCredentialHistory, mockUserTokenHistory } from '@lib/mock/mockUserDetails';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import { Icon } from '@atoms/index';
import { Typography, useTheme, Box } from '@mui/material';
import Image from 'next/image';
import { DeleteIcon, DownloadIcon } from '@lib/icons';
// import { Button } from 'dist/standard-bank-react';
import { Button } from 'components/lib/Forms';
import CredentialHistoryFilter, { FilterValues } from './CredentialHistoryFilter';

const CREDENTIAL_HISTORY_TABLE_COLUMNS = [
  'dateAndTime',
  'credential',
  'userID',
  'previousState',
  'newState',
  'details',
] as const;

const TOKEN_HISTORY_TABLE_COLUMNS = [
  'orderNumber',
  'createdOn',
  'lastStateChangeDate',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

const CredentialHistory = () => {
  const t = useTranslations('userDetails');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState('credentialHistory');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadSuccessOpen, setDownloadSuccessOpen] = useState(false);
  const theme = useTheme();

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered: any =
      currentTab === 'credentialHistory' ? mockUserCredentialHistory : mockUserTokenHistory;

    // Apply filter values
    if (filters && Object.keys(filters).length > 0) {
      filtered = filtered.filter((row: any) => {
        // Filter by credential
        if (filters.credential && filters.credential.trim()) {
          if (!row?.credential?.toLowerCase().includes(filters.credential.toLowerCase())) {
            return false;
          }
        }

        // Filter by state
        if (filters.state && filters.state.trim()) {
          const stateFilterValue = filters.state.toLowerCase();
          if (
            !row?.previousState?.toLowerCase().includes(stateFilterValue)
            //&& row?.newState?.toLowerCase().includes(stateFilterValue)
          ) {
            return false;
          }
        }

        // Filter by date
        if (filters.date && filters.date.trim()) {
          const filterDate = new Date(filters.date).toISOString().split('T')[0];
          const rowDate = new Date(row?.dateAndTime).toISOString().split('T')[0];
          if (rowDate !== filterDate) {
            return false;
          }
        }

        return true;
      });
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.userID?.toLowerCase().includes(search) ||
          row?.credential?.toLowerCase().includes(search) ||
          row?.previousState?.toLowerCase().includes(search) ||
          row?.newState?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => {
      return {
        ...row,
        status: {
          ...row.status,
          value: t(row?.status?.value || ''),
        },
        links: {
          ...row.links,
          text: t(row?.links?.text || '')?.toLocaleUpperCase(),
        },
      };
    });

    return withAccountDetails;
  }, [searchText, t, currentTab, filters]);
  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setDownloadSuccessOpen(true);
  }, []);

  const handleDeleteUser = useCallback(() => {
    // Add delete user logic here
    console.log('Delete user');
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Memoize filter buttons
  const filterButtons = useMemo(() => {
    const buttons = [
      {
        children: (
          <>
            <Image
              src={DownloadIcon}
              alt={t('download')}
              width={24}
              height={24}
              style={{ marginRight: 4 }}
            />
            {t('download')}
          </>
        ),
        buttonVariant: 'tertiary',
        onClick: () => {
          setDownloadDialogOpen(true);
          setDownloadAnchorEl(tableContainerRef.current);
        },
      },
    ];

    // Show filter button only for Credential History tab
    if (currentTab === 'credentialHistory') {
      buttons.push({
        children: (
          <>
            <Icon name="filter" width="24" height="24" bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: () => {
          setFilterDialogOpen(true);
          setFilterAnchorEl(tableContainerRef.current);
        },
      });
    }

    return buttons;
  }, [t, theme, currentTab]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={0}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
      />
    );
  }, [filters, searchText, handleRemoveFilters]);

  // Memoize table head cells
  const credentialHistoryTableHeadCells = useMemo(
    () => [
      { id: 'dateAndTime', label: t('dateAndTime'), numeric: false, colWidth: '250px' },
      { id: 'credential', label: t('credential'), numeric: false, colWidth: '250px' },
      { id: 'userID', label: t('userId'), numeric: false, colWidth: '250px' },
      { id: 'previousState', label: t('previousState'), numeric: false, colWidth: '200px' },
      { id: 'newState', label: t('newState'), numeric: false, colWidth: '200px' },
      { id: 'details', label: t('details'), numeric: false, colWidth: '200px' },
    ],
    [t],
  );

  const tokenHistoryTableHeadCells = useMemo(
    () => [
      { id: 'orderNumber', label: t('orderNumber'), numeric: false },
      { id: 'createdOn', label: t('createdOn'), numeric: false },
      { id: 'lastStateChangeDate', label: t('lastStateChangeDate'), numeric: false },
      { id: 'status', label: t('status'), numeric: false, colWidth: '200px' },
      { id: 'links', label: t('quickLinks'), numeric: false, disableSort: true, colWidth: '180px' },
    ],
    [t],
  );

  // Memoize table data
  const credentialHistoryTableData = useMemo(
    () => ({
      columns: CREDENTIAL_HISTORY_TABLE_COLUMNS,
      headCells: credentialHistoryTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: perPage,
      rowCount: mappedRows.length,
      rowVariant: 'default',
    }),
    [credentialHistoryTableHeadCells, mappedRows, perPage],
  );

  const tokenHistoryTableData = useMemo(
    () => ({
      columns: TOKEN_HISTORY_TABLE_COLUMNS,
      headCells: tokenHistoryTableHeadCells,
      rowButton: false,
      rows: mockUserTokenHistory,
      pageSize: 15,
      rowCount: mockUserTokenHistory.length,
      rowVariant: 'default',
    }),
    [tokenHistoryTableHeadCells],
  );

  const [currentTableData, setCurrentTableData] = useState<any>(credentialHistoryTableData);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue);
      if (newValue === 'credentialHistory') {
        setCurrentTableData(credentialHistoryTableData);
      } else if (newValue === 'tokenOrderHistory') {
        tokenHistoryTableData.rows = tokenHistoryTableData.rows.map((row: any) => ({
          ...row,
          status: {
            ...row.status,
            value: t(row?.status?.value || ''),
          },
          links: {
            ...row.links,
            text: t(row?.links?.text || '')?.toLocaleUpperCase(),
          },
        }));
        setCurrentTableData(tokenHistoryTableData);
      }
    },
    [credentialHistoryTableData, tokenHistoryTableData, t],
  );

  const statusTabs = useMemo(
    () => [
      { label: t('credentialHistory'), value: 'credentialHistory' },
      { label: t('tokenOrderHistory'), value: 'tokenOrderHistory' },
    ],
    [t],
  );

  const handleFilterApply = useCallback((filterValues: FilterValues) => {
    setFilters(filterValues);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);
  return (
    <section className={styles.tabContent}>
      <section className={styles.tableContainer} ref={tableContainerRef}>
        <TableWithTab
          statusTabs={statusTabs}
          currentTab={currentTab}
          tableData={currentTableData}
          onTabChange={handleTabChange}
          filterButtons={filterButtons}
          // selectedRows={currentTableData.rows}
          selectedRows={[]}
          onCheckboxClick={() => {}}
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
          title={`${t('download')} ${t(currentTab === 'credentialHistory' ? 'credentialHistory' : 'tokenOrderHistory')?.toLocaleLowerCase()}`}
        />
      </section>
      {/* <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '24px',
          paddingBottom: '24px',
        }}
      >
        <Button
          variant="contained"
          startIcon={<Icon name="delete" width="16px" height="16px" bgColor="#1473E6" />}
          sx={{
            backgroundColor: '#FFFFFF',
            textTransform: 'uppercase',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            padding: '10px 24px',
            color: '#1473E6',
            border: '1px solid #E0E0E0',
            '&:hover': {
              backgroundColor: '#F5F5F5',
            },
          }}
          onClick={handleDeleteUser}
        >
          {t('deleteUser')}
        </Button>
      </Box> */}
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          buttonVariant="secondary-on-colour"
          variant="text"
          startIcon={<Image src={DeleteIcon} alt={t('deleteUser')} width={24} height={24} />}
          onClick={handleDownload}
        >
          {t('deleteUser')}
        </Button>
      </Box> */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="text"
          startIcon={<Image src={DeleteIcon} alt={t('deleteUser')} width={24} height={24} />}
          onClick={handleDownload}
        >
          {t('deleteUser')}
        </Button>
      </Box>
      <CommonSnackbar
        open={downloadSuccessOpen}
        message={`${t('download')} ${t('successful')}`}
        severity="success"
        onClose={() => setDownloadSuccessOpen(false)}
        autoHideDuration={3000}
      />
      <CredentialHistoryFilter
        open={filterDialogOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
      />
    </section>
  );
};
export default CredentialHistory;
