'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CommonSnackbar, ListRightPanelActions } from 'components/common';
import styles from './CreditLimits.module.scss';
import { Icon } from '@atoms/index';
import { Box, Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import AccountInfo from 'components/lib/AccountDetailsCard';
import TableWithTab from '@molecules/TableWithTab';
import { mockAllocationTableData } from '@lib/mock/mockLimits';
import Image from 'next/image';
import { Button } from 'dist/standard-bank-react';
import { DownloadIcon } from '@lib/icons';
import { CreditLimitToast } from 'types/creditLimits';
import { DEFAULT_SNACKBAR } from './constant';

const ALLOCATION_TABLE_COLUMNS = [
  'productName',
  'utilisation',
  'dailyLimit',
  'weeklyLimit',
  'monthlyLimit',
  'quarterlyLimit',
  'annualLimit',
] as const;

const ProductAndFrequencyAllocation = () => {
  const t = useTranslations('creditLimits');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [snackBar, setSnackBar] = useState<CreditLimitToast>(DEFAULT_SNACKBAR);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockAllocationTableData as any[];

    // Apply dialog filters
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.accountBalance?.branch?.toLowerCase().includes(search),
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
        row.accountBalance?.accountNumber?.toLowerCase().includes(search),
      );
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((row: any) => row?.productName?.toLowerCase().includes(search));
    }

    return filtered;
  }, [filters, searchText]);

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

  // const filterButtons = useMemo(() => {
  //   return [
  //     {
  //       children: (
  //         <>
  //           <Icon name="filter" width='24' height='24' bgColor={theme.palette.secondary.main} />
  //           <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
  //         </>
  //       ),
  //       buttonVariant: 'tertiary' as const,
  //       onClick: handleFilterOpen,
  //     },
  //   ];
  // }, [handleFilterOpen, t]);

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

  // Memoize table head cells
  const allocationTableHeadCells = useMemo(
    () => [
      { id: 'productName', label: t('product'), numeric: false, colWidth: '250px' },
      { id: 'utilisation', label: t('utilisation'), numeric: false },
      {
        id: 'dailyLimit',
        label: t('dailyLimit'),
        numeric: true,
        textAlign: 'right',
        colWidth: '180px',
      },
      {
        id: 'weeklyLimit',
        label: t('weeklyLimit'),
        numeric: true,
        textAlign: 'right',
        colWidth: '180px',
      },
      {
        id: 'monthlyLimit',
        label: t('monthlyLimit'),
        numeric: true,
        textAlign: 'right',
        colWidth: '180px',
      },
      {
        id: 'quarterlyLimit',
        label: t('quarterlyLimit'),
        numeric: true,
        textAlign: 'right',
        colWidth: '180px',
      },
      {
        id: 'annualLimit',
        label: t('annualLimit'),
        numeric: true,
        textAlign: 'right',
        colWidth: '180px',
      },
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: ALLOCATION_TABLE_COLUMNS,
      headCells: allocationTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: perPage,
      rowCount: mappedRows.length,
      // rowVariant: 'checkbox'
    }),
    [allocationTableHeadCells, mappedRows, perPage],
  );

  const handleDownload = useCallback(() => {
    setSnackBar({ message: t('downloadSuccess'), severity: 'success', open: true });
  }, [t]);
  return (
    <section className={styles.tabContent}>
      <AccountInfo
        cards={[
          {
            cardCells: [
              {
                title: t('effectiveFrom'),
                value: '5/03/2026 00:00',
              },
              {
                title: t('effectiveTo'),
                value: '5/03/2026 00:00',
              },
            ],
            iconElement: <Icon name="timer" width={'40'} height={'40'} bgColor="#02070D" />,
            cardSubheader: 'Collection',
            cardTitle: t('creditLimitName'),
            variant: 'account',
          },
          {
            cardCells: [
              {
                title: t('currencyLabel'),
                value: 'ZAR',
              },
              {
                title: t('status'),
                value: 'Active',
              },
            ],
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

export default ProductAndFrequencyAllocation;
