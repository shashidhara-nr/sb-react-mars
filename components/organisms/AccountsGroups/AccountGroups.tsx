'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AccountGroups.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import { mockAccountGroupsData } from '@lib/mock/mockAccountGroups';
import Button from 'components/lib/Forms/Button';
import { Icon } from '@atoms/index';
import AccountGroupsFilterDialog from './AccountGroupsFilterDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { buildTestId } from 'src/utils/testIds';

const testIdPrefix = 'manage-group';

const TABLE_COLUMNS = [
  'accountGroupName',
  'numberOfAccounts',
  'serviceAgreement',
  { key: 'links', type: 'link' },
] as const;

const AccountGroups = () => {
  const t = useTranslations('accountGroups');
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

  const mappedRows = useMemo(() => {
    let filtered = mockAccountGroupsData;

    if (filters.accountGroupName) {
      const search = filters.accountGroupName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.accountGroupName?.toLowerCase().includes(search),
      );
    }

    if (filters.numberOfAccounts) {
      const search = filters.numberOfAccounts.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.numberOfAccounts?.toLowerCase().includes(search),
      );
    }

    if (filters.serviceAgreement) {
      const search = filters.serviceAgreement.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.serviceAgreement?.toLowerCase().includes(search),
      );
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.accountGroupName?.toLowerCase().includes(search) ||
          row?.numberOfAccounts?.toLowerCase().includes(search),
      );
    }

    return filtered.map((row: any) => ({
      ...row,
      links: {
        href: row?.links?.href || '#',
        text: t(row?.links?.text).toLocaleUpperCase(),
      },
    }));
  }, [filters, searchText, t]);

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

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]);
  }, []);

  const handleLinkClick = useCallback(
    (row: any) => {
      router.push(row?.links?.href || '#');
    },
    [router],
  );

  const filterButtons = useMemo(
    () => [
      {
        children: (
          <>
            <Icon name="filter" width="24" height="24" bgColor={theme.palette.secondary.main} />
            <Typography
              variant="button"
              className={styles.filterText}
              data-testid={buildTestId('filter-button-text')}
            >
              {t('filter')}
            </Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
        'data-testid': buildTestId('filter-button'),
      },
    ],
    [handleFilterOpen, theme, t],
  );

  const tableHeadCells = useMemo(
    () => [
      { id: 'accountGroupName', label: t('accountGroupName'), numeric: false, colWidth: '500px' },
      { id: 'numberOfAccounts', label: t('numberOfAccounts'), numeric: true, colWidth: '250px' },
      { id: 'serviceAgreement', label: t('serviceAgreement'), numeric: false, colWidth: '252px' },
      { id: 'links', label: t('quickLinks'), numeric: false, colWidth: '200px', disableSort: true },
    ],
    [t],
  );

  const tableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'default',
    }),
    [tableHeadCells, mappedRows],
  );

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/account-groups', label: t('accountGroups') },
    ],
    [t],
  );

  return (
    <section className={styles.container} data-testid={buildTestId('page')}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px" data-testid={buildTestId('title')}>
          {t('accountGroups')}
        </Heading>

        <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor="#0051FF" />}
          onClick={() => router.push('/account-groups/create' as any)}
          data-testid={buildTestId(testIdPrefix, `create-button`)}
        >
          {t('createAccountGroup')}
        </Button>
      </Grid>

      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
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
            data-testid={buildTestId(testIdPrefix, `search-input`)}
          />
        </Grid>

        <section
          className={styles.tableContainer}
          data-testid={buildTestId(testIdPrefix, `table-container`)}
        >
          <TableWithTab
            tableData={tableData}
            filterButtons={filterButtons}
            selectedRows={selectedRows}
            onCheckboxClick={handleCheckboxClick}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={
              <ListRightPanelActions
                selectedCount={selectedRows.length}
                hasFilters={Boolean(Object.keys(filters).length || searchText)}
                onRemoveFilters={handleRemoveFilters}
                onDeleteClick={handleDeleteOpen}
                data-testid={buildTestId(testIdPrefix, `right-panel-actions`)}
              />
            }
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onQuickLinkClick={handleLinkClick}
            data-testid={buildTestId(testIdPrefix, `table`)}
          />

          <AccountGroupsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterDialogOpen(false)}
            onApply={(newFilters) => setFilters(newFilters)}
            initialValues={filters}
            data-testid={buildTestId(testIdPrefix, `filter-dialog`)}
          />

          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            itemLabel={t('accountGroups')}
            markedCount={selectedRows.length}
            data-testid={buildTestId(testIdPrefix, `delete-dialog`)}
          />
        </section>
      </section>
    </section>
  );
};

export default AccountGroups;
