'use client';
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './UserDetails.module.scss';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import { mockUserCredentials } from '@lib/mock/mockUserDetails';
import { useTheme } from '@mui/material/styles';
import { buildTestId } from 'src/utils/testIds';
import Image from 'next/image';
import { DownloadIcon } from '@lib/icons';
import ManagePasswordTable from './UserDrawer';
import ManageCredentialsDrawer from './ManageCredentialsDrawer';
import ManageTokenDrawer from './ManageTokenDrawer';

const TABLE_COLUMNS = [
  'credentials',
  'state',
  'lastUsedOn',
  'lastStateChange',
  { key: 'authorisationStatus', type: 'chip' },
  { key: 'links', type: 'link' },
] as const;

const testIdPrefix = 'user-credentials';
const UserCredentials = () => {
  const t = useTranslations('userDetails');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [credentialsDrawerOpen, setCredentialsDrawerOpen] = useState(false);
  const [tokenDrawerOpen, setTokenDrawerOpen] = useState(false);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockUserCredentials;

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
      filtered = filtered.filter((row: any) => row.authorisationStatus === filters.statusCode);
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
        text: t(row?.links?.text).toLocaleUpperCase(),
      },
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);

  // Memoize callbacks
  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
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

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]); // Clear selections when changing pages
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when changing rows per page
  }, []);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'credentials', label: t('credentials'), numeric: false },
      { id: 'state', label: t('state'), numeric: false },
      { id: 'lastUsedOn', label: t('lastUsedOn'), numeric: false },
      { id: 'lastStateChange', label: t('lastStateChange'), numeric: false },
      {
        id: 'authorisationStatus',
        label: t('authorisationStatus'),
        numeric: false,
      },
      {
        id: 'links',
        // label: t('quickAction'),
        numeric: false,
        type: 'link',
        disableSort: true,
      },
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
      // rowVariant: 'checkbox',
      emptyStateIcon: (
        <Icon name="info" width="27px" height="27px" bgColor={theme.palette.primary.dark} />
      ),
    }),
    [tableHeadCells, mappedRows, theme, perPage],
  );

  const filterButtons = useMemo(() => {
    // const disabled = creditLimitsData.length === 0 || error;
    return [
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
        'data-testid': buildTestId(testIdPrefix, 'download-button'),
        onClick: () => {},
        // disabled: disabled && currentTableData.rows.length === 0,
      },
    ];
  }, [t]);
  /**
   * Handle quick link clicks from table
   */
  const handleQuickLinkClick = useCallback(
    (row: any, index: number, link: { text: string; href: string }) => {
      const isViewPassword = link?.text?.toLocaleLowerCase() === 'view password';
      const isViewToken = link?.text?.toLocaleLowerCase() === 'view token';
      if (isViewPassword) {
        setCredentialsDrawerOpen(true);
      } else if (isViewToken) {
        setTokenDrawerOpen(true);
      }
    },
    [],
  );
  // Memoize action buttons for right panel
  // const rightPanelButtons = useMemo(() => {
  //   const hasFilters = searchText.trim().length > 0;

  //   return (
  //     <ListRightPanelActions
  //       selectedCount={tableData.rows.length}
  //       hasFilters={hasFilters}
  //       onDownloadClick={() => {}}
  //     />
  //   );
  // }, [tableData.rows.length, searchText]);

  return (
    <section className={styles.tabContent}>
      <section className={styles.tableContainer}>
        <TableWithTab
          tableData={tableData}
          filterButtons={filterButtons}
          selectedRows={selectedRows}
          onCheckboxClick={handleCheckboxClick}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={null}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onQuickLinkClick={handleQuickLinkClick}
        />
      </section>

      {/* <ManagePasswordTable /> */}
      <ManageCredentialsDrawer
        open={credentialsDrawerOpen}
        onClose={() => setCredentialsDrawerOpen(false)}
      />
      <ManageTokenDrawer open={tokenDrawerOpen} onClose={() => setTokenDrawerOpen(false)} />
    </section>
  );
};
export default UserCredentials;
