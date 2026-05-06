'use client';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import styles from './CollectionsList.module.scss';
import { Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { Icon } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
// import theme from 'components/lib/styles/theme';
import { HISTORY_TABLE_COLUMNS, HISTORY_TABLE_HEAD_CELLS } from './constant';
import { mockCollectionHistory } from '@lib/mock/mockCollectionsList';
import CollectionHistoryFilterDialog from './CollectionHistoryFilterDialog';

const CollectionHistory = () => {
  const t = useTranslations('collections');
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockCollectionHistory;

    if (filters.beneficiaryName) {
      filtered = filtered.filter((row: any) => row.beneficiaryName.toLowerCase().includes(filters.beneficiaryName.toLowerCase()));
    }
    if (filters.beneficiaryCode) {
      filtered = filtered.filter((row: any) => row.beneficiaryCode.toLowerCase().includes(filters.beneficiaryCode.toLowerCase()));
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.beneficiaryName?.toLowerCase().includes(search) ||
          row?.beneficiaryCode?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => ({
      ...row,
      links: {
        ...row.links,
        text: t(row.links.text)
      }
    }));

    return withAccountDetails;
  }, [filters, searchText, t]);


  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setFilters(appliedFilters);
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
  }, []);


  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    router.push(link.href);
  }, [router]);

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="filter" width='24' height='24'  bgColor={"#0051FF"} />
            <Typography variant="button" className={styles.filterText}>{t('filter')}</Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
      },
    ];
  }, [handleFilterOpen, t]);

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

  const historyTableHeadCells = useMemo(
    () =>
      HISTORY_TABLE_HEAD_CELLS.map(cell => ({
        ...cell,
        label: t(cell.labelKey),
      })),
    [t],
  );

  // Memoize table data
  const historyRecordsTableData = useMemo(
    () => ({
      columns: HISTORY_TABLE_COLUMNS,
      headCells: historyTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'default',
    }),
    [historyTableHeadCells, mappedRows],
  );

  return (
    <section className={`${styles.tabContent} ${styles.accountsAndBalancesContainer}`}>
      <Grid size={12} className={styles.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('searchHistory')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={
            {
              startAdornment: (
                <InputAdornment position="start"><Icon name="search" width='32' height='32' bgColor={"#0051FF"} /></InputAdornment>
              ),
            }
          }
          className={styles.searchField}
        />
      </Grid>
      <section className={styles.tableContainer}>
        <TableWithTab
          tableData={historyRecordsTableData}
          filterButtons={filterButtons}
          selectedRows={[]}
          onCheckboxClick={() => {}}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={() => {}}
          onPerPageChange={() => {}}
          onQuickLinkClick={handleLinkClick}
        />
        <CollectionHistoryFilterDialog
          open={filterDialogOpen}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          onApply={handleFilterApply}
          initialValues={filters}
        />
      </section>
    </section>
  );
};
export default CollectionHistory;
