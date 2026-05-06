'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './CreditLimits.module.scss';
import { Icon } from '@atoms/index';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import AccountInfo from 'components/lib/AccountDetailsCard';
import TableWithTab from '@molecules/TableWithTab';
import { mockAccountTableData } from '@lib/mock/mockLimits';

const TABLE_COLUMNS = [
  'accountNumber',
  'accountName',
  'accountOwner',
  'bicSwift',
  'bankName',
  { key: 'status', type: 'chip' },
] as const;

const AccountGroupUtilisation = () => {
  const t = useTranslations('creditLimits');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockAccountTableData as any[];

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
      accountDetails: {
        name: row?.accountBalance?.name || '',
        accountNumber: row?.accountBalance?.number || '',
      },
    }));

    return withAccountDetails;
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
  const tableHeadCells = useMemo(
    () => [
      { id: 'accountNumber', label: t('accountNumber'), numeric: false, colWidth: '250px' },
      { id: 'accountName', label: t('accountName'), numeric: false },
      { id: 'accountOwner', label: t('accountOwner'), numeric: false, colWidth: '180px' },
      { id: 'bicSwift', label: t('bicSwift'), numeric: false, colWidth: '180px' },
      { id: 'bankName', label: t('bankName'), numeric: false, colWidth: '200px' },
      { id: 'status', label: t('status'), numeric: false, colWidth: '180px' },
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
      pageSize: perPage,
      rowCount: mappedRows.length,
      // rowVariant: 'checkbox'
    }),
    [tableHeadCells, mappedRows, perPage],
  );

  return (
    <section className={styles.tabContent}>
      <AccountInfo
        cards={[
          {
            cardCells: [
              {
                title: t('creditLimitAccountGroupDescription'),
                value: 'Credit limit account',
              },
            ],
            iconElement: <Icon name="timer" width={'40'} height={'40'} bgColor="#02070D" />,
            cardSubheader: '[Credit Limit account group Name]',
            cardTitle: t('creditLimitAccountGroupName'),
            variant: 'account',
          },
          {
            cardCells: [
              {
                title: t('currency'),
                value: 'ZAR',
              },
              {
                title: t('status'),
                value: 'Active',
              },
            ],
            iconElement: <Icon name="folder" width={'40'} height={'40'} bgColor="#02070D" />,
            cardSubheader: 'South African',
            cardTitle: t('country'),
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
          placeholder={t('searchByAccountNameOwnerOrNumber')}
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
      {/* <CreditLimitDownloadBtn /> */}
    </section>
  );
};

export default AccountGroupUtilisation;
