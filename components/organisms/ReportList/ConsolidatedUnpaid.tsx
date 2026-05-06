'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ReportList.module.scss';
import { Stack } from '@mui/material';
import TableWithTab from '@molecules/TableWithTab';
import { mockConsolidatedUnpaid } from '@lib/mock/mockReports';
import { DownloadIcon } from 'lib/icons';
import Image from 'next/image';
import { CONSOLIDATED_UNPAID_TABLE_COLUMNS, CONSOLIDATED_UNPAID_TABLE_HEAD_CELLS } from './constant';
import DownloadDebtorDialog from '@molecules/DownloadDebtorDialog/DownloadDebtorDialog';
import DateRangePicker from 'components/lib/DateRangePicker/DateRangePicker';
import dayjs from 'dayjs';
import { Button } from 'components/lib/Forms';
import { SelectField } from '@atoms/index';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { buildTestId } from 'src/utils/testIds';
import IcnInfoCircle from 'public/icons/icn_info_circle_grey.svg';
dayjs.extend(customParseFormat);

const testIdPrefix = 'consolidated-unpaid';

const DATE_TYPE_FIELD_MAP: Record<string, string> = {
  actionDate: 'returnDate',
  creationDate: 'creationDate'
};

const dateTypeOptions = [
  { label: 'Action Date', value: 'actionDate' },
  { label: 'Creation Date', value: 'creationDate' }
];

const ConsolidatedUnpaid = () => {
  const t = useTranslations('reports');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [applySearch, setApplySearch] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const minDate = dayjs().subtract(20, 'year');
  const maxDate = dayjs(new Date());
  const [values, setValues] = useState({
    dateType: '',
    accountName: '',
    requestCreationDateRange: {
      from: undefined,
      to: undefined
    }
  });
  const [appliedValues, setAppliedValues] = useState(values);


  const accountNameList = useMemo(() => {
    const uniqueAccounts = [
      ...new Map(
        mockConsolidatedUnpaid.map((item) => [
          item.accountNumber,
          item.accountName,
        ])
      ).entries(),
    ];

    return uniqueAccounts.map(([accountNumber, accountName]) => ({
      label: accountName,
      value: accountNumber,
    }));
  }, []);


  // Memoize filtered rows
  const mappedRows = useMemo(() => {
    // Initially show nothing
    if (!applySearch) return [];

    let filtered = mockConsolidatedUnpaid;
    const { from, to } = appliedValues.requestCreationDateRange;
    const selectedField = DATE_TYPE_FIELD_MAP[appliedValues.dateType];
    if (applySearch && from && to) {
      filtered = filtered.filter((row: any) => {
        const rawDate = row[selectedField];
        const rowDate = dayjs(rawDate, "DD/MM/YYYY", true);
        if (!rowDate.isValid()) return false;

        return (
          !rowDate.isBefore(from, "day") &&
          !rowDate.isAfter(to, "day")
        )
      })
    }

    // NEW: Account filter
    if (applySearch && appliedValues.accountName) {
      filtered = filtered.filter(
        (row) => String(row.accountNumber) === String(appliedValues.accountName)
      );
    }
    return filtered;
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
              src={DownloadIcon}
              alt={t('altIconDownload')}
              width={16}
              height={16}
              style={{ marginRight: 4 }}
              data-testid={buildTestId(testIdPrefix, 'download-icon')}
            />
            {t('buttonDownload')}
          </div>
        ),
        buttonVariant: 'tertiary' as const,
        onClick: handleDownloadOpen,
      },
    ];
  }, [handleDownloadOpen, t]);

  const consolidatedTableHeadCells = useMemo(
    () =>
      CONSOLIDATED_UNPAID_TABLE_HEAD_CELLS.map(cell => ({
        ...cell,
        label: t(cell.labelKey),
      })),
    [t],
  );

  // Memoize table data
  const consolidatedUnpaidTableData = useMemo(
    () => ({
      columns: CONSOLIDATED_UNPAID_TABLE_COLUMNS,
      headCells: consolidatedTableHeadCells,
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
    [consolidatedTableHeadCells, mappedRows],
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
        <section data-testid={buildTestId(testIdPrefix, 'date-range')} className={styles.dateRangeContainer}>
           <DateRangePicker
             label={t('requestCreationDateRange')}
             onChange={(range) => {
               setValues((prev: any) => ({
                 ...prev,
                 requestCreationDateRange: range,
               }));
             }}
           />
        </section>

        <section data-testid={buildTestId(testIdPrefix, 'account-name-field')} className={`${styles.selectField} ${styles.dateRangeContainer}`}>
          <SelectField
            data-testid={buildTestId(testIdPrefix, 'account-name-dropdown')}
            name="accountName"
            label={t('accountName')}
            value={values.accountName}
            onChange={(name, value) => {
              setValues((prev) => ({
                ...prev,
                [name]: value
              }))
            }}
            options={accountNameList}
            height={'54px'}
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
          tableData={consolidatedUnpaidTableData}
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
export default ConsolidatedUnpaid;
