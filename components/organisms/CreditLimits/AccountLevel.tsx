'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './CreditLimits.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import AccountInfo from 'components/lib/AccountDetailsCard';
import { Icon } from '@atoms/index';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { mockAccountTableData } from '@lib/mock/mockLimits';

const TABLE_COLUMNS = [
  'accountNumber',
  'accountName',
  'accountOwner',
  'bicSwift',
  'bankName',
  { key: 'status', type: 'chip' },
  'annualLimit'
] as const;

const AccountLevel = () => {
  const t = useTranslations('creditLimits');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
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
      accountDetails: {
        name: row?.accountBalance?.name || '',
        accountNumber: row?.accountBalance?.number || ''
      },
      transactionLinks: {
        href: row?.transactionLinks?.href || '#',
        text: t(row?.transactionLinks?.text).toLocaleUpperCase()
      },
      statementLinks: {
        href: row?.statementLinks?.href || '#',
        text: t(row?.statementLinks?.text).toLocaleUpperCase()
      },
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);

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
        onDownloadClick={() => {}}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

  // Memoize table head cells
  const allocationTableHeadCells = useMemo(
    () => [
      { id: 'accountNumber', label: t('accountNumber'), numeric: false },
      { id: 'accountName', label: t('accountName'), numeric: false, colWidth: '250px' },
      { id: 'accountOwner', label: t('accountOwner'), numeric: false, colWidth: '250px' },
      { id: 'bicSwift', label: t('bicSwift'), numeric: false, colWidth: '150px' },
      { id: 'bankName', label: t('bankName'), numeric: false, colWidth: '150px' },
      { id: 'status', label: t('status'), numeric: false, colWidth: '80px' },
      { id: 'annualLimit', label: t('annualLimit'), numeric: true, textAlign: 'right', colWidth: '150px' }
    ],
    [t],
  );

  // Memoize table data
  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: allocationTableHeadCells,
      rowButton: false,
      rows: mockAccountTableData,
      pageSize: 15,
      rowCount: mockAccountTableData.length,
      rowVariant: 'checkbox'
    }),
    [allocationTableHeadCells],
  );

  return (
    <section className={styles.tabContent}>
      <AccountInfo
        cards={[
          {
            cardCells: [
              {
                title: t('currency'),
                value: '[Currency name XXX]'
              }
            ],
            iconElement: <Icon name="timer" width={'40'} height={'40'} bgColor='#02070D' />,
            cardSubheader: '[Credit Limit account group Name]',
            cardTitle: t('creditLimitAccountGroupName'),
            variant: 'account'
          },
          {
            cardCells: [
              {
                title: t('status'),
                value: '[Status]'
              }
            ],
            iconElement: <Icon name="countryFlagSouthAfrica" width={'40'} height={'40'} />,
            cardSubheader: 'South African',
            cardTitle: t('country'),
            variant: 'account'
          }
        ]}
        moreDetails={{
          title: '',
          description: 'Credit limit account group description'
        }}
      />
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchActivities')}
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
            tableData={tableData}
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
export default AccountLevel;
