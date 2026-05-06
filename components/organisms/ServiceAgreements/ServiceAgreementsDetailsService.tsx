'use client';
import { useCallback, useMemo, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ServiceAgreements.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { mockServiceAgreementServiceDetailData } from '@lib/mock/mockServiceAgreement';
import { useRouter } from 'next/navigation';
import { Icon } from '@atoms/index';
import AccountInfo from 'components/lib/AccountDetailsCard';

const SERVICE_TABLE_COLUMNS = [
  'attributeName',
  { key: 'status', type: 'chip' },
] as const;

const ServiceAgreementsDetailsService = () => {
  const t = useTranslations('serviceAgreements');
  const theme = useTheme();
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<any>({});
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/service-agreements', label: t('serviceAgreements') },
      { href: '/service-agreements/details', label: t('serviceAgreementDetails') },
      { href: '/service-agreements/details/service', label: t('serviceDetails') },
    ],
    [t],
  );

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockServiceAgreementServiceDetailData as any[]; // Replace with actual data source and type

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
        href: row?.links?.href,
        text: row?.links?.text ? t(row.links.text)?.toLocaleUpperCase() : '',
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
        onDownloadClick={() => {
          setDownloadDialogOpen(true);
          setDownloadAnchorEl(tableContainerRef.current);
        }}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

  // Memoize table head cells
  const serviceTableHeadCells = useMemo(
    () => [
      { id: 'attributeName', label: t('attributeName'), numeric: false },
      { id: 'status', label: t('status'), numeric: false }
    ],
    [t],
  );

  // Memoize table data
  const serviceTableData = useMemo(
    () => ({
      columns: SERVICE_TABLE_COLUMNS,
      headCells: serviceTableHeadCells,
      rowButton: false,
      rows: mockServiceAgreementServiceDetailData,
      pageSize: 15,
      rowCount: mockServiceAgreementServiceDetailData.length,
      rowVariant: 'checkbox'
    }),
    [serviceTableHeadCells],
  );

  const handleLinkClick = useCallback((row: any) => {
    console.log('Link clicked for row:', row);
    router.push(row?.links?.href || '/');
  }, [router]);

  return (
    <section className={styles.container}>
        <section className={styles.tabContent}>
            <BreadcrumbList links={breadcrumbLinks} />
            <Grid
                size={12}
                className={styles.headerRow}
            >
                <Heading as="h4" fontSize="28px">
                    {t('serviceDetails')}
                </Heading>
            </Grid>
            <section className={styles.accountInfoRow}>
              <AccountInfo
                cards={[
                  {
                    cardCells: [
                      {
                        title: t('serviceModule'),
                        value: '[Service module name]'
                      }
                    ],
                    iconElement: <Icon name="notes" width={'40'} height={'40'} />,
                    cardSubheader: '[Service name]',
                    cardTitle: t('serviceName'),
                    variant: 'account'
                  },
                  {
                    cardCells: [
                      {
                        title: t('serviceGroup'),
                        value: '[Service group name]'
                      }
                    ],
                    iconElement: <></>,
                    cardSubheader: '',
                    cardTitle: '',
                    variant: 'account'
                  }
                ]}
                moreDetails={{
                  title: '',
                  description: ''
                }}
                moreCardDetails={
                  [
                    {
                      title: t('latestBalance'),
                      value: 'R X,XXX,XXX.XX'
                    },
                    {
                      title: t('openingBalance'),
                      value: 'R X,XXX,XXX.XX'
                    },
                    {
                      title: t('clearedBalance'),
                      value: 'R X,XXX,XXX.XX'
                    },
                    {
                      title: t('interimBalance'),
                      value: 'R X,XXX,XXX.XX'
                    }
                  ]
                }
              />
            </section>
            <Grid size={12} className={styles.searchRow}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('searchAttributes')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={
                  {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name="search" width='32' height='32' bgColor={theme.palette.navy.main} />
                      </InputAdornment>
                    ),
                  }
                }
                className={styles.searchField}
              />
            </Grid>
            <section className={styles.tableContainer}>
                <TableWithTab
                  tableData={serviceTableData}
                  filterButtons={filterButtons}
                  selectedRows={selectedRows}
                  onCheckboxClick={handleCheckboxClick}
                  onRowClick={(rowData: any) => console.log('rowData', rowData)}
                  rightPanelButtons={rightPanelButtons}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                  onQuickLinkClick={handleLinkClick}
                />
            </section>
        </section>
    </section>
  );
};
export default ServiceAgreementsDetailsService;
