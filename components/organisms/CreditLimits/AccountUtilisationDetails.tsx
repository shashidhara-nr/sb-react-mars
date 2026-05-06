'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CommonSnackbar, ListRightPanelActions } from 'components/common';
import styles from './CreditLimits.module.scss';
import { Icon } from '@atoms/index';
import {
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  Tab,
  Tabs,
  Box,
} from '@mui/material';
import AccountInfo from 'components/lib/AccountDetailsCard';
import TableWithTab from '@molecules/TableWithTab';
import { mockUsageByGroupTableData, mockUsageByAccountTableData } from '@lib/mock/mockLimits';
import { Button } from 'dist/standard-bank-react';
import { DownloadIcon } from '@lib/icons';
import { DEFAULT_SNACKBAR } from './constant';
import { CreditLimitToast } from 'types/creditLimits';
import Image from 'next/image';

const GROUP_LEVEL_TABLE_COLUMNS = [
  'accountGroupName',
  'utilisation',
  'dailyLimit',
  'weeklyLimit',
  'monthlyLimit',
  'quarterlyLimit',
  'annualLimit',
  'productName',
] as const;

const ACCOUNT_LEVEL_TABLE_COLUMNS = [
  'accountNumber',
  'utilisation',
  'dailyLimit',
  'weeklyLimit',
  'monthlyLimit',
  'quarterlyLimit',
  'annualLimit',
] as const;

const AccountUtilisationDetails = () => {
  const t = useTranslations('creditLimits');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [currentTab, setCurrentTab] = useState('groupLevel');
  const [snackBar, setSnackBar] = useState<CreditLimitToast>(DEFAULT_SNACKBAR);

  // Memoize filtered rows based on current tab
  const mappedRows = useMemo(() => {
    const dataSource =
      currentTab === 'groupLevel' ? mockUsageByGroupTableData : mockUsageByAccountTableData;
    let filtered = dataSource as any[];

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      if (currentTab === 'groupLevel') {
        filtered = filtered.filter(
          (row: any) =>
            row?.accountGroupName?.toLowerCase().includes(search) ||
            row?.productName?.toLowerCase().includes(search),
        );
      } else {
        filtered = filtered.filter((row: any) =>
          row?.accountNumber?.toLowerCase().includes(search),
        );
      }
    }

    return filtered;
  }, [searchText, currentTab]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleCheckboxClick = useCallback(
    (rows: any | any[]) => {
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

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setSelectedRows([]);
    setSearchText('');
    setCurrentPage(1);
  };

  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDownloadClick={() => {}}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

  // Memoize table head cells for group level
  const groupLevelTableHeadCells = useMemo(
    () => [
      { id: 'accountGroupName', label: t('accountGroupName'), numeric: false },
      { id: 'utilisation', label: t('utilisation'), numeric: false },
      {
        id: 'dailyLimit',
        label: t('dailyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'weeklyLimit',
        label: t('weeklyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'monthlyLimit',
        label: t('monthlyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'quarterlyLimit',
        label: t('quarterlyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'annualLimit',
        label: t('annualLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'productName',
        label: t('product'),
        numeric: false,
      },
    ],
    [t],
  );

  // Memoize table head cells for account level
  const accountLevelTableHeadCells = useMemo(
    () => [
      { id: 'accountNumber', label: t('accountNumber'), numeric: false, colWidth: '250px' },
      { id: 'utilisation', label: t('utilisation'), numeric: false },
      {
        id: 'dailyLimit',
        label: t('dailyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'weeklyLimit',
        label: t('weeklyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'monthlyLimit',
        label: t('monthlyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'quarterlyLimit',
        label: t('quarterlyLimit'),
        numeric: true,
        textAlign: 'right',
      },
      {
        id: 'annualLimit',
        label: t('annualLimit'),
        numeric: true,
        textAlign: 'right',
      },
    ],
    [t],
  );

  // Memoize table data based on current tab
  const tableData = useMemo(
    () => ({
      columns:
        currentTab === 'groupLevel' ? GROUP_LEVEL_TABLE_COLUMNS : ACCOUNT_LEVEL_TABLE_COLUMNS,
      headCells:
        currentTab === 'groupLevel' ? groupLevelTableHeadCells : accountLevelTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: perPage,
      rowCount: mappedRows.length,
      // rowVariant: 'checkbox'
    }),
    [currentTab, groupLevelTableHeadCells, accountLevelTableHeadCells, mappedRows, perPage],
  );

  const consumptionTabs = useMemo(
    () => [
      { label: t('creditLimitConsumptionAtAccountGroupLevel'), value: 'groupLevel' },
      { label: t('creditLimitConsumptionAtAccountLevel'), value: 'accountLevel' },
    ],
    [t],
  );
  const handleDownload = useCallback(() => {
    setSnackBar({ message: t('downloadSuccess'), severity: 'success', open: true });
  }, [t]);

  return (
    <section className={styles.tabContent}>
      <AccountInfo
        cards={[
          {
            // cardCells: [
            //   {
            //     title: t('creditLimitName'),
            //     value: 'Collection',
            //   },
            // ],
            iconElement: <Icon name="timer" width={'40'} height={'40'} bgColor="#02070D" />,
            cardSubheader: 'Collection',
            cardTitle: t('creditLimitName'),
            variant: 'account',
          },
          {
            // cardCells: [
            //   {
            //     title: t('creditLimitType'),
            //     value: 'Permanent limit',
            //   },
            // ],
            iconElement: <Icon name="folder" width={'40'} height={'40'} bgColor="#02070D" />,
            cardSubheader: 'Permanent limit',
            cardTitle: t('creditLimitType'),
            variant: 'account',
          },
        ]}
        moreDetails={{
          title: '',
          description: '',
        }}
      />
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchActivities')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="search" width="32" height="32" bgColor={theme.palette.navy.main} />
              </InputAdornment>
            ),
          }}
          className={styles.searchField}
        />
      </Grid>
      <section className={styles.tableContainer}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="consumption tabs"
          sx={{ marginBottom: 2 }}
        >
          {consumptionTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
        <TableWithTab
          tableData={tableData}
          filterButtons={[]}
          selectedRows={selectedRows}
          onCheckboxClick={handleCheckboxClick}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </section>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          buttonVariant="secondary-on-colour"
          variant="outlined"
          startIcon={<Image src={DownloadIcon} alt={t('download')} width={24} height={24} />}
          onClick={handleDownload}
        >
          {t('download')}
        </Button>
      </Box>
      <CommonSnackbar
        open={snackBar.open}
        onClose={() => setSnackBar(DEFAULT_SNACKBAR)}
        message={snackBar.message}
        severity={snackBar.severity}
      />
    </section>
  );
};

export default AccountUtilisationDetails;
