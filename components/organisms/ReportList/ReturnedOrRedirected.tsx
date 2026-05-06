'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ReportList.module.scss';
import { Stack } from '@mui/material';
import TableWithTab from '@molecules/TableWithTab';
import { mockReturnedOrRedirectedReports } from '@lib/mock/mockReports';
import { DownloadIcon } from 'lib/icons';
import Image from 'next/image';
import { RETURNED_REDIRECTED_TABLE_COLUMNS, RETURNED_REDIRECTED_TABLE_HEAD_CELLS } from './constant';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import DateRangePicker from 'components/lib/DateRangePicker/DateRangePicker';
import dayjs from 'dayjs';
import { Button } from 'components/lib/Forms';
import { SelectField } from '@atoms/index';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { buildTestId } from 'src/utils/testIds';
import IcnInfoCircle from 'public/icons/icn_info_circle_grey.svg';
dayjs.extend(customParseFormat);

const testIdPrefix = 'returned-redirected';

const DATE_TYPE_FIELD_MAP: Record<string, string> = {
  actionDate: 'returnDate',
  creationDate: 'creationDate'
};

const dateTypeOptions = [
  { label: 'Action Date', value: 'actionDate' },
  { label: 'Creation Date', value: 'creationDate' }
];

const ReturnedOrRedirected = () => {
  const t = useTranslations('reports');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [applySearch, setApplySearch] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [values, setValues] = useState({
    dateType: '',
    requestCreationDateRange: {
      from: undefined,
      to: undefined
    }
  })
  const [appliedValues, setAppliedValues] = useState(values);

  // Memoize filtered rows
 const mappedRows = useMemo(() => {
  if (!applySearch) return [];

  const { from, to } = appliedValues.requestCreationDateRange;
  const selectedField = DATE_TYPE_FIELD_MAP[appliedValues.dateType];

  // ✅ Guard conditions (VERY IMPORTANT)
  if (!from || !to || !selectedField) return [];

  return mockReturnedOrRedirectedReports.filter((row: any) => {
    const rawDate = row[selectedField];

    if (!rawDate) return false;

    const rowDate = dayjs(rawDate, "DD/MM/YYYY");

    if (!rowDate.isValid()) return false;

    return (
      !rowDate.isBefore(dayjs(from), "day") &&
      !rowDate.isAfter(dayjs(to), "day")
    );
  });
}, [appliedValues, applySearch]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  const handleDownloadOpen = useCallback(() => {
    setDownloadDialogOpen(true);
  }, []);

  const handleDownloadClose = useCallback(() => {
    setDownloadDialogOpen(false);
  }, []);

  // Memoize download button
  const downloadButton = useMemo(() => {
    return [
      {
        children: (
          <div data-testid={buildTestId(testIdPrefix, 'download-button')}>
            <Image
              data-testid={buildTestId(testIdPrefix, 'download-icon')}
              src={DownloadIcon}
              alt={t('altIconDownload')}
              width={16}
              height={16}
              style={{ marginRight: 4 }}
            />
            {t('buttonDownload')}
          </div>

        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleDownloadOpen,
      },
    ];
  }, [handleDownloadOpen, t]);

  const returnedRedirectedTableHeadCells = useMemo(() =>
    RETURNED_REDIRECTED_TABLE_HEAD_CELLS.map(cell => ({
      ...cell,
      label: t(cell.labelKey),
    })),
    [t],
  );

  // Memoize table data
  const returnedRedirectedTableData = useMemo(
    () => ({
      columns: RETURNED_REDIRECTED_TABLE_COLUMNS,
      headCells: returnedRedirectedTableHeadCells,
      rowButton: false,
      rows: mappedRows,
      pageSize: 15,
      rowCount: mappedRows.length,
      rowVariant: 'default',
      emptyStateContent: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Image src={IcnInfoCircle} alt="Info" width={32} height={32} />
          <h3>No data yet</h3>
          <p>Reports will be displayed here when a search has been run</p>
        </div>
      )
    }),
    [returnedRedirectedTableHeadCells, mappedRows],
  );

  const handleDownload = useCallback(({ format, sortBy }: any) => {
    setDownloadDialogOpen(false);
    setDownloadAnchorEl(null);
  }, []);

  return (
    <section data-testid={buildTestId(testIdPrefix, 'container')} className={`${styles.tabContent}`}>
      <Stack data-testid={buildTestId(testIdPrefix, 'search-section')} direction="row" spacing={2} alignItems="center">
        <section data-testid={buildTestId(testIdPrefix, 'date-type-field')} className={`${styles.selectField} ${styles.dateRangeContainer}`}>
          <SelectField
            data-testid={buildTestId(testIdPrefix, 'date-type-dropdown')}
            name="dateType"
            label={t('dateType')}
            value={values.dateType}
            onChange={(label, value) => {
              setValues((prev) => ({
                ...prev,
                [label]: value
              }))
            }}
            options={dateTypeOptions}
            height={'52px'}
          />
        </section>
        <section data-testid={buildTestId(testIdPrefix, 'date-range-container')} className={styles.dateRangeContainer}>
          <DateRangePicker
            label={t('requestCreationDateRange')}
            onChange={(range) => {
              setApplySearch(false)
              setValues((prev: any) => ({
                ...prev,
                requestCreationDateRange: range,
              }));
            }}
          />
        </section>
        <Button data-testid={buildTestId(testIdPrefix, 'search-button')} buttonVariant="secondary"
          onClick={() => {
            setApplySearch(true);
            setAppliedValues(values);
          }}> {t('search')}
        </Button>
      </Stack>
      <section data-testid={buildTestId(testIdPrefix, 'table-container')} className={styles.tableContainer}>
        <TableWithTab
          data-testid={buildTestId(testIdPrefix, 'table')}
          tableData={returnedRedirectedTableData}
          filterButtons={downloadButton}
          selectedRows={[]}
          onCheckboxClick={() => { }}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={[]}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
        <DownloadDebtorDialog
          data-testid={buildTestId(testIdPrefix, 'download-dialog')}
          open={downloadDialogOpen}
          anchorEl={downloadAnchorEl}
          onClose={handleDownloadClose}
          onDownload={handleDownload}
          title={`${t('download')} ${t('reports').toLowerCase()}`}
        />
      </section>
    </section>
  );
};
export default ReturnedOrRedirected;
