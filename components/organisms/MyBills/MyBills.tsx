'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './MyBills.module.scss';
import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import { Icon, SelectField } from '@atoms/index';
import { mockMyBillsData } from '@lib/mock/mockMyBills';
import MyBillsFilterDialog from './MyBillsFilterDialog';
import { Button } from 'components/lib/Forms';
import MultipleSelectChip from 'components/lib/Forms/MultiSelect';
import Image from 'next/image';
import IcnInfoCircle from 'public/icons/icn_info_circle_grey.svg';
import { buildTestId } from 'src/utils/testIds';

const testIdPrefix = 'my-bills';

const TABLE_COLUMNS = [
  'billerId',
  'billerName',
  'country',
  'amount',
  'dueDate',
  'reference',
  { key: 'status', type: 'chip' },
  { key: 'links', type: 'link' }
] as const;

const searchByOptions = [
  { label: 'Biller ID', value: 'billerId' },
  { label: 'Biller Name', value: 'billerName' },
  { label: 'Status', value: 'status' },
  { label: 'Country/Region', value: 'country' },
]

const statusOptions = [
  { value: 'Approved', color: 'success' },
  { value: 'Account dormant', color: 'warning' },
  { value: 'Awaiting approval', color: 'info' },
  { value: 'Declined', color: 'error' },
  { value: 'Date expired', color: 'info' },
  { value: 'Invalid account number', color: 'warning' },
  { value: 'Daily limit exceeded', color: 'info' },
  { value: 'File validation in progress', color: 'default' },
  { value: 'File validation failed', color: 'error' },
]

const MyBills = () => {
  const t = useTranslations('myBills');
  const theme = useTheme();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({
    searchBy: '',
    values: [] as string[]

  });
  const [dialogFilters, setDialogFilters] = useState<any>({
    billerId: '',
    billerName: '',
    country: '',
    status: '',
    dueDate: '',
    amount: ''
  });
  const [applySearch, setApplySearch] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // dynamic options
  const getOptions = () => {
    if (!filters.searchBy) return [];

    if (filters.searchBy === 'status') {
      return [
        { label: 'All', value: 'All' },
        ...statusOptions.map((s) => ({
          label: s.value,
          value: s.value,
          color: s.color
        })),
      ];
    }

    if (filters.searchBy === 'country') {
      const unique = [...new Set(mockMyBillsData.map((b) => b.country))];
      return [
        { label: 'All', value: 'All' },
        ...unique.map((c) => ({
          label: c,
          value: c
        })),
      ];
    }


    if (filters.searchBy === 'billerId') {
      return mockMyBillsData.map((b) => ({
        label: `${b.billerId} - ${b.billerName}`,
        value: String(b.billerId),
      }));
    }


    if (filters.searchBy === 'billerName') {
      return mockMyBillsData.map((b) => ({
        label: `${b.billerName} - ${b.billerId}`,
        value: b.billerName
      }))
    }

    return [];
  }

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    // Initially show nothing
    if (!applySearch) return [];
    let result = [...mockMyBillsData];
    if (applySearch && filters.searchBy && filters.values) {
      if (!filters.values.includes('All')) {
        if (filters.searchBy === 'status') {
          result = result.filter((b: any) =>
            filters.values.includes(b.status.value)
          )
        }
        if (filters.searchBy === 'country') {
          result = result.filter((b: any) =>
            filters.values.includes(b.country)
          )
        }


        if (filters.searchBy === 'billerId') {
          result = result.filter((b: any) =>
            filters.values.includes(String(b.billerId))
          );
        }


        if (filters.searchBy === 'billerName') {
          result = result.filter((b: any) =>
            filters.values.includes(b.billerName)
          )
        }
      }
    }

    // Apply dialog filters
    if (dialogFilters) {

      if (dialogFilters.billerId) {
        const search = dialogFilters.billerId;
        const ids = search
          .split(',')
          .map((item: string) => item.trim().split('-')[0]);

        result = result.filter((row: any) =>
          ids.includes(String(row.billerId))
        );
      }

      if (dialogFilters.billerName) {
        const search = dialogFilters.billerName.toLowerCase();
        result = result.filter((row: any) =>
          row.billerName.toLowerCase().includes(search),
        );
      }
      if (dialogFilters.status) {
        const search = dialogFilters.status.toLowerCase();
        result = result.filter((row: any) =>
          row.status?.value.toLowerCase().includes(search),
        );
      }
      if (dialogFilters.country) {
        const search = dialogFilters.country.toLowerCase();
        result = result.filter((row: any) =>
          row.country.toLowerCase().includes(search),
        );
      }
      if (dialogFilters.amount) {
        const search = dialogFilters.amount.toLowerCase();
        result = result.filter((row: any) =>
          row.amount.toLowerCase().includes(search),
        );
      }
      if (dialogFilters.dueDate) {
        const search = dialogFilters.dueDate;
        result = result.filter((row: any) =>
          row.dueDate === search,
        );
      }
    }

    const withAccountDetails = result.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase()
      }
    }));

    return withAccountDetails;
  }, [filters, applySearch, dialogFilters]);

  // Memoize callbacks
  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    console.log('data', appliedFilters);
    setDialogFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setDialogFilters({});
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Handle link click for manage link
  const handleLinkClick = useCallback(
    (row: any, index: number, link: any) => {
      if (!row || !link) return;

      const linkText = link.text || '';

      // Handle specific action types
      if (linkText === 'MANAGE MY BILLS') {
        const billerId = row?.billerId || row?.id || '';
        const billerName =
          typeof row?.billerName === 'string' ? row.billerName : row?.billerName?.name || '';
        const country = row?.country || '';
        const dueDate = row?.dueDate || '';
        const reference = row?.reference || '';
        const status =
          typeof row?.status === 'string' ? row.status : row?.status?.value || '';

        const queryParams = new URLSearchParams({
          billerId: String(billerId),
          billerName: String(billerName),
          country: String(country),
          dueDate: String(dueDate),
          reference: String(reference),
          status: String(status),
        });

        router.push(`/my-bills/details?${queryParams.toString()}` as any);
      }
    },
    [router],
  );

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <div data-testid={buildTestId(testIdPrefix, 'filter-button')} className={styles.filterButton}>
              <Icon name="filter" width='24' height='24' bgColor={theme.palette.secondary.main} />
              <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
            </div>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen
      },
    ];
  }, [handleFilterOpen, t]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasFilters = Object.values(dialogFilters).some(v => v);

    return (
      <ListRightPanelActions
        selectedCount={0}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        data-testid={buildTestId(testIdPrefix, 'remove-filters-button')}
      />
    );
  }, [dialogFilters, handleRemoveFilters]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'billerId', label: t('billerId'), numeric: false },
      { id: 'billerName', label: t('billerName'), numeric: false },
      { id: 'country', label: t('country'), numeric: false },
      { id: 'amount', label: t('amount'), numeric: false },
      { id: 'dueDate', label: t('dueDate'), numeric: false },
      { id: 'reference', label: t('reference'), numeric: true },
      { id: 'status', label: t('status'), numeric: false },
      { id: 'links', label: t('quickLinks'), numeric: false, disableSort: true },
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
      rowVariant: 'default',
      emptyStateContent: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Image src={IcnInfoCircle} alt="Info" width={32} height={32} />
          <h3>No My bills data yet</h3>
          <p>My bills will be displayed here when a search has been run</p>
        </div>
      )
    }),
    [tableHeadCells, mappedRows],
  );

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/my-bills', label: t('myBills') },
    ],
    [t],
  );

  // search login
  const handleSearch = () => {
    setApplySearch(true);
  }

  const handleChange = (name: string, value: any) => {
    setApplySearch(false);

    if (name === 'searchBy') {
      setFilters({
        searchBy: value,
        values: []
      });
      return;
    }

    if (value.includes('All')) {
      setFilters((prev: any) => ({
        ...prev,
        values: ["All"],
      }));
      return;
    }

    setFilters((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleMultiChange = (name: string, value: any) => {
    setApplySearch(false);
    setFilters((prev: any) => ({
      ...prev,
      values: value,
    }))
  }

  return (
    <section className={styles.container} data-testid={buildTestId(testIdPrefix, 'container')}>
      <BreadcrumbList data-testid={buildTestId(testIdPrefix, 'breadcrumb')} links={breadcrumbLinks} />
      <Grid
        data-testid={buildTestId(testIdPrefix, 'header')}
        size={12}
        className={styles.headerRow}
      >
        <Heading data-testid={buildTestId(testIdPrefix, 'heading')} as="h4" fontSize="28px">
          {t('myBills')}
        </Heading>
      </Grid>
      <section data-testid={buildTestId(testIdPrefix, 'tab-content')} className={styles.tabContent}>
        <Stack data-testid={buildTestId(testIdPrefix, 'search-section')} direction="row" spacing={2} alignItems="center">
          <section data-testid={buildTestId(testIdPrefix, 'search-by-field')} className={`${styles.selectField} ${styles.fieldsContainer}`}>
            <SelectField
              data-testid={buildTestId(testIdPrefix, 'search-by-dropdown')}
              name="searchBy"
              label={t('searchBy')}
              value={filters.searchBy}
              onChange={handleChange}
              options={searchByOptions}
              height={'52px'}
            />
          </section>
          <section data-testid={buildTestId(testIdPrefix, 'value-field')} className={`${styles.selectField} ${styles.fieldsContainer}`}>
            {
              filters.searchBy === 'billerId' ? (
                <MultipleSelectChip
                  data-testid={buildTestId(testIdPrefix, 'billerId-multiselect')}
                  label={t('selectMultiOptions')}
                  options={getOptions()}
                  selected={filters.values}
                  OnChange={(selectedItems: string[]) =>
                    handleMultiChange('values', selectedItems)
                  }
                  placeholder="Select one or more options"
                  error={false}
                  helperText=""
                  disabled={filters.searchBy !== 'billerId'}
                  sx={{
                    height: '54px',
                    minHeight: '54px',
                  }}
                />
              ) : (
                <SelectField
                  data-testid={buildTestId(testIdPrefix, 'single-select-dropdown')}
                  name="values"
                  label={t('selectOption')}
                  value={filters.values}
                  onChange={handleChange}
                  options={getOptions()}
                  disabled={!filters.searchBy}
                  height={'54px'}
                />
              )
            }
          </section>
          <Button buttonVariant="secondary"
            data-testid={buildTestId(testIdPrefix, 'button-search')}
            startIcon={<Icon name="search"
              bgColor={theme.palette.secondary.main} />}
            disabled={!filters.searchBy || filters.values.length === 0}
            className={styles.searchButton}
            onClick={handleSearch}> {t('search')}
          </Button>
        </Stack>
        <section data-testid={buildTestId(testIdPrefix, 'table-container')} className={styles.tableContainer}>
          <TableWithTab
            data-testid={buildTestId(testIdPrefix, 'table')}
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={[]}
            onCheckboxClick={() => { }}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
          />
          <MyBillsFilterDialog
            data-testid={buildTestId(testIdPrefix, 'filter-dialog')}
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={dialogFilters}
          />
        </section>
      </section>
    </section>
  );
};
export default MyBills;
