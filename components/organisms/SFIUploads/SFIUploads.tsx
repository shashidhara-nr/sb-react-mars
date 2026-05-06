'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './SFIUploads.module.scss';
import { Grid, TextField, Typography, useTheme, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import dayjs from 'dayjs';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import Button from 'components/lib/Forms/Button';
import { Icon } from '@atoms/index';
import SFIUploadsFilterDialog from '@organisms/SFIUploads/SFIUploadsFilterDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { mockSFIUploadsData, destinations, uploadedByUsers } from '@lib/mock/mockSFIUploads';
import { buildTestId } from 'src/utils/testIds';

const TABLE_COLUMNS = [
  { key: 'fileName', type: 'text' },
  'destination',
  'uploadedBy',
  'dateTime',
  'interchangeId',
  'fileStatus',
  'errorMessage',
] as const;


const parseDateTimeToDayjs = (dateTime: string) => {
  const [datePart, timePart] = dateTime.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return dayjs(new Date(year, month - 1, day, hour, minute));
};

const SFIUploads = () => {
  const t = useTranslations('sfiUploads');
  const theme = useTheme();
  const router = useRouter();
  const testIdPrefix = 'sfi-uploads';
  const [searchBy, setSearchBy] = useState<string>('status');
  const [searchValue, setSearchValue] = useState<any>('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    let filtered = mockSFIUploadsData;

    // Apply dialog filters
    if (filters.status) {
      filtered = filtered.filter((row: any) => row.fileStatus === filters.status);
    }

    if (filters.uploadDateFrom) {
      const from = dayjs(filters.uploadDateFrom).startOf('day');
      filtered = filtered.filter((row: any) => {
        const rowDate = parseDateTimeToDayjs(row.dateTime);
        return rowDate.isAfter(from) || rowDate.isSame(from);
      });
    }

    if (filters.uploadDateTo) {
      const to = dayjs(filters.uploadDateTo).endOf('day');
      filtered = filtered.filter((row: any) => {
        const rowDate = parseDateTimeToDayjs(row.dateTime);
        return rowDate.isBefore(to) || rowDate.isSame(to);
      });
    }

    if (filters.destination) {
      const search = filters.destination.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.destination?.toLowerCase().includes(search)
      );
    }
    if (filters.fileName) {
      const search = filters.fileName.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.fileName?.toLowerCase().includes(search)
      );
    }
    if (filters.uploadedBy) {
      const search = filters.uploadedBy.toLowerCase();
      filtered = filtered.filter((row: any) =>
        row.uploadedBy?.toLowerCase().includes(search)
      );
    }

    // Apply search by filters
    if (searchValue) {
      const search = searchValue.toLowerCase();
      if (searchBy === 'status') {
        filtered = filtered.filter((row: any) => row.fileStatus === searchValue);
      } else if (searchBy === 'destination') {
        filtered = filtered.filter((row: any) =>
          row.destination?.toLowerCase().includes(search)
        );
      } else if (searchBy === 'fileName') {
        filtered = filtered.filter((row: any) =>
          row.fileName?.toLowerCase().includes(search)
        );
      } else if (searchBy === 'uploadedBy') {
        filtered = filtered.filter((row: any) =>
          row.uploadedBy?.toLowerCase().includes(search)
        );
      }
    }

    return filtered;
  }, [filters, searchBy, searchValue]);

  // Memoize callbacks
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
        } else {
          setSelectedRows(selected);
        }
      } else {
        setSelectedRows(selected);
      }
    },
    []
  );

  const handleRemoveFilters = useCallback(() => {
    setFilters({});
    setSearchBy('status');
    setSearchValue('');
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

  // Memoize filter button
  const filterButtons = useMemo(() => {
    return [
      {
        children: (
          <>
            <Icon name="filter" width="24" height="24" bgColor={theme.palette.secondary.main} />
            <Typography variant="button" className={styles.filterText}>
              {t('filter')}
            </Typography>
          </>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleFilterOpen,
        'data-testid': buildTestId(testIdPrefix, 'button', 'filter'),
        'aria-label': 'Open filter dialog',
      },
    ];
  }, [handleFilterOpen, t, theme.palette.secondary.main]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || (searchValue && searchBy);

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
        onDeleteClick={handleDeleteOpen}
      />
    );
  }, [selectedRows.length, filters, searchValue, searchBy, handleRemoveFilters, handleDeleteOpen]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'fileName', label: t('fileName'), numeric: false, colWidth: '150px' },
      { id: 'destination', label: t('destination'), numeric: false, colWidth: '140px' },
      { id: 'uploadedBy', label: t('uploadedBy'), numeric: false, colWidth: '145px' },
      { id: 'dateTime', label: t('dateTime'), numeric: false, colWidth: '165px' },
      { id: 'interchangeId', label: t('interchangeId'), numeric: false, colWidth: '145px' },
      { id: 'fileStatus', label: t('fileStatus'), numeric: false, colWidth: '120px' },
      { id: 'errorMessage', label: t('errorMessage'), numeric: false, colWidth: '160px' },
    ],
    [t]
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
      rowVariant: 'checkbox',
    }),
    [tableHeadCells, mappedRows]
  );

  // Memoize breadcrumb links
const breadcrumbLinks = useMemo(
    () => [
        { href: '/', label: t('dashboard') },
        { href: '/sfi-upload', label: t('fileUpload') },
    ],
    [t]
);

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('sfiUploads')}
        </Heading>
        <Button
          buttonVariant="secondary"
          data-testid={buildTestId(testIdPrefix, 'button', 'upload-new-file')}
          aria-label="Upload new file"
          startIcon={<Icon name="add" width="24" height="24" bgColor="#0051FF" />}
          onClick={() => router.push('/sfi-upload/upload-new-file' as any)}
        >
          {t('uploadNewFile')}
        </Button>
      </Grid>
      <section className={styles.tabContent}>
        <Grid size={12} className={styles.searchRow}>
          <FormControl sx={{ minWidth: '250px' }}>
            <InputLabel>{t('searchBy')}</InputLabel>
            <Select
              data-testid={buildTestId(testIdPrefix, 'dropdown', 'search-by')}
              value={searchBy}
              label={t('searchBy')}
              onChange={(e: SelectChangeEvent) => {
                setSearchBy(e.target.value);
                setSearchValue('');
              }}
            >
              <MenuItem value="status">{t('status')}</MenuItem>
              <MenuItem value="destination">{t('destination')}</MenuItem>
              <MenuItem value="fileName">{t('fileName')}</MenuItem>
              <MenuItem value="uploadedBy">{t('uploadedBy')}</MenuItem>
            </Select>
          </FormControl>

          {searchBy === 'status' && (
            <FormControl sx={{ minWidth: '250px' }}>
              <InputLabel>{t('status')}</InputLabel>
              <Select
                data-testid={buildTestId(testIdPrefix, 'dropdown', 'status')}
                value={searchValue}
                label={t('status')}
                onChange={(e: SelectChangeEvent) => setSearchValue(e.target.value)}
              >
                <MenuItem value="">{t('all')}</MenuItem>
                <MenuItem value="Delivered">{t('statusDelivered')}</MenuItem>
                <MenuItem value="Failed">{t('statusFailed')}</MenuItem>
              </Select>
            </FormControl>
          )}

          {searchBy === 'destination' && (
            <FormControl sx={{ minWidth: '250px' }}>
              <InputLabel>{t('destination')}</InputLabel>
              <Select
                data-testid={buildTestId(testIdPrefix, 'dropdown', 'destination')}
                value={searchValue}
                label={t('destination')}
                onChange={(e: SelectChangeEvent) => setSearchValue(e.target.value)}
              >
                <MenuItem value="">{t('all')}</MenuItem>
                {destinations.map((destination) => (
                  <MenuItem key={destination} value={destination}>
                    {destination}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {(searchBy === 'fileName' || searchBy === 'uploadedBy') && (
            <TextField
              data-testid={buildTestId(testIdPrefix, 'input', searchBy === 'fileName' ? 'file-name' : 'uploaded-by')}
              placeholder={searchBy === 'fileName' ? t('fileName') : t('uploadedBy')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ minWidth: '250px' }}
              variant="outlined"
            />
          )}
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
          <SFIUploadsFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterDialogOpen(false)}
            onApply={(newFilters: any) => setFilters(newFilters)}
            initialValues={filters}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onPrimaryCTA={handleDeleteClose}
            onSecondaryCTA={handleDeleteClose}
            selectedCount={selectedRows.length}
            itemLabel={t('sfiUploads')}
            markedCount={selectedRows.length}
          />
        </section>
      </section>
    </section>
  );
};

export default SFIUploads;
