'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ListRightPanelActions } from 'components/common';
import EmptyState from 'components/common/EmptyState';
import styles from './CurrencyRates.module.scss';
import { Button } from 'components/lib/Forms';
import { Icon, SelectField } from '@atoms/index';
import TableWithTab from '@molecules/TableWithTab';
import BreadcrumbList from 'components/lib/Page/Breadcrumb';
import { Grid, InputAdornment, TextField, Typography, useTheme, Alert, Box } from '@mui/material';
import { Heading } from 'components/lib/Page';
import { mockCurrencyRates, getCurrencyRatesByCode } from '@lib/mock/mockCurrencyRates';
import Image from 'next/image';
import { ErrorAlertIcon, ReloadRefreshIcon, SearchIcon } from 'lib/icons';

const TABLE_COLUMNS = [
  'currency',
  'foreignCurrency',
  'units',
  'bankBuyRate',
  'bankSellRate'
] as const;

const CurrencyRates = () => {
  const t = useTranslations('currencyRates');
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [showReferenceInfo, setShowReferenceInfo] = useState<boolean>(false);
  const [currencyError, setCurrencyError] = useState<string>('');

  // Helper function to format current date and time
  const getCurrentDateTimeString = useCallback(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} at ${hours}:${minutes}:${seconds} WAT`;
  }, []);

  // Standard Bank branch options
  const currencyOptions = useMemo(() => [
    { label: 'Stanbic Bank Kenya - Buy/Sell Rates', value: 'KES' },
    { label: 'Stanbic Bank South Sudan - Buy/Sell Rates', value: 'SSP' },
    { label: 'Stanbic Bank Zimbabwe Limited - Buy/Sell Rates', value: 'ZWL' },
    { label: 'Stanbic Botswana - Buy/Sell Rates', value: 'BWP' },
    { label: 'Stanbic Cote d\'Ivoire – Buy/Sell Rates', value: 'XOF' },
    { label: 'Stanbic Ghana - Buy/Sell Rates', value: 'GHS' },
    { label: 'Stanbic Nigeria - Buy/Sell Rates', value: 'NGN' },
    { label: 'Stanbic Tanzania - Buy/Sell Rates', value: 'TZS' },
    { label: 'Stanbic Uganda - Buy/Sell Rates', value: 'UGX' },
    { label: 'Stanbic Zambia - Buy/Sell Rates', value: 'ZMW' },
    { label: 'Standard Bank Angola - Buy/Sell Rates', value: 'AOA' },
    { label: 'Standard Bank London - Buy/Sell Rates', value: 'GBP' },
    { label: 'Standard Bank Malawi - Buy/Sell Rates', value: 'MWK' },
    { label: 'Standard Bank Mauritius - Buy/Sell Rates', value: 'MUR' },
    { label: 'Standard Bank Mozambique - Buy/Sell Rates', value: 'MZN' },
    { label: 'Standard Bank Namibia - Buy/Sell Rates', value: 'NAD' },
    { label: 'Standard Bank RDC s.a.r.l - Buy/Sell Rates', value: 'CDF' },
    { label: 'Standard Bank South Africa - Buy/Sell Rates', value: 'ZAR' },
    { label: 'Standard Bank Swaziland Ltd - Buy/Sell Rates', value: 'SZL' },
    { label: 'Standard Lesotho Bank - Buy/Sell Rates', value: 'LSL' },
  ], []);

  // Note: Filtering can be implemented later if needed

  const handlePageChange = useCallback((newPage: number) => {
    // Pagination will be implemented when backend supports it
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    // Per-page change will be implemented when backend supports it
  }, []);

  const handleReload = useCallback(() => {
    setHasError(false);
  }, []);

  const handleListRates = useCallback(() => {
    if (!selectedCurrency) {
      setCurrencyError(t('currencyGroupRequired'));
      return;
    }
    setCurrencyError('');
    setShowReferenceInfo(true);
  }, [selectedCurrency, t]);

  // Memoize action buttons for right panel
  const rightPanelButtons = useMemo(() => {
    const hasFilters = searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={0}
        hasFilters={hasFilters}
      />
    );
  }, [searchText]);

  // Memoize empty state content
  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('noResultsFound')}
      description={t('noResultsDescription')}
      icon={
        <Image
          src={SearchIcon}
          alt="No results icon"
          width={48}
          height={48}
        />
      }
      testIdPrefix="currency-rates"
    />
  ), [t]);

  // Memoize error state content
  const errorStateContent = useMemo(() => (
    <EmptyState
      title={t('failedToLoad')}
      description={t('failedToLoadDescription')}
      buttonLabel={t('reload')}
      onButtonClick={handleReload}
      icon={
        <Image
          src={ErrorAlertIcon}
          alt="Error icon"
          width={48}
          height={48}
        />
      }
      buttonIcon={
        <Image
          src={ReloadRefreshIcon}
          alt="Reload icon"
          width={20}
          height={20}
        />
      }
      testIdPrefix="currency-rates"
    />
  ), [t, handleReload]);

  // Memoize table head cells
  const tableHeadCells = useMemo(
    () => [
      { id: 'currency', label: t('currency'), numeric: false, colWidth: '32%' },
      { id: 'foreignCurrency', label: t('currencyName'), numeric: false, colWidth: '32%' },
      { id: 'units', label: t('units'), numeric: false },
      { id: 'bankBuyRate', label: t('bankBuyRate'), numeric: false },
      { id: 'bankSellRate', label: t('bankSellRate'), numeric: false }
    ],
    [t],
  );

  // Memoize filtered table data based on search and selected currency
  const filteredCurrencyRates = useMemo(() => {
    // Get rates for the selected currency
    const currencyRates = getCurrencyRatesByCode(selectedCurrency);

    // Filter by search text
    if (!searchText.trim()) {
      return currencyRates;
    }

    const lowerSearchText = searchText.toLowerCase();
    return currencyRates.filter(rate =>
      rate.currency.toLowerCase().includes(lowerSearchText) ||
      rate.foreignCurrency.toLowerCase().includes(lowerSearchText)
    );
  }, [searchText, selectedCurrency]);

  // Memoize table data
  const consolidatedTableData = useMemo(
    () => ({
      columns: TABLE_COLUMNS,
      headCells: tableHeadCells,
      rowButton: false,
      rows: filteredCurrencyRates,
      pageSize: 15,
      rowCount: filteredCurrencyRates.length,
      rowVariant: 'default',
      emptyStateContent: hasError ? errorStateContent : emptyStateContent,
    }),
    [tableHeadCells, hasError, errorStateContent, emptyStateContent, filteredCurrencyRates],
  );

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/currency-rates', label: t('currencyRates') },
    ],
    [t],
  );

  return (
    <section className={styles.container} data-testid="currency-rates-container">
      <BreadcrumbList links={breadcrumbLinks} data-testid="currency-rates-breadcrumb" />
      <Grid
        size={12}
        className={styles.headerRow}
        data-testid="currency-rates-header"
      >
        <Heading as="h4" fontSize="28px">
          {t('currencyRates')}
        </Heading>
      </Grid>
      <Grid
        size={12}>
        <Alert severity='info' sx={{ mb: 2, borderRadius: '8px', mt: -3, ml: -2, backgroundColor: 'transparent' }} data-testid="currency-rates-info">
          {t('rateInformation')}
        </Alert>
      </Grid>
      <section className={styles.tabContent} data-testid="currency-rates-content">
        <section className={styles.gridContainer}>
          <section className={styles.selectField}>
            <SelectField
              name={t('selectCurrency')}
              label={t('selectCurrency')}
              value={selectedCurrency}
              onChange={(name, value) => {
                setSelectedCurrency(String(value));
                setCurrencyError('');
                setShowReferenceInfo(false);
              }}
              options={currencyOptions}
              data-testid="currency-rates-select"
              error={!!currencyError}
            />
            {currencyError && (
              <Typography
                variant="caption"
                className={styles.selectFieldError}
                data-testid="currency-error-message"
              >
                {currencyError}
              </Typography>
            )}
          </section>
          <Button buttonVariant="secondary-on-colour" onClick={handleListRates} className={styles.listRatesButton}> {t('listRates')} </Button>
          <section className={styles.currencyInfo}>
            <Typography variant="body2" className={styles.currencyInfoLabel}>
              {t('referenceCurrency')}
            </Typography>
            <Typography variant="body1" className={styles.currencyInfoValue}>
              {showReferenceInfo ? (selectedCurrency || 'BWP') : '—'}
            </Typography>
          </section>
          <section className={styles.currencyInfo}>
            <Typography variant="body2" className={styles.currencyInfoLabel}>
              {t('lastRateUpdate')}
            </Typography>
            <Typography variant="body1" className={styles.currencyInfoValue}>
              {showReferenceInfo ? getCurrentDateTimeString() : '—'}
            </Typography>
          </section>
        </section>
        <Grid size={12} className={styles.searchRow} data-testid="currency-rates-search-row">
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            data-testid="currency-rates-search-field"
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
        <section className={styles.tableContainer} data-testid="currency-rates-table-container">
          <TableWithTab
            tableData={consolidatedTableData}
            filterButtons={[]}
            selectedRows={[]}
            onCheckboxClick={() => { }}
            onRowClick={(rowData: any) => console.log('rowData', rowData)}
            rightPanelButtons={rightPanelButtons}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            data-testid="currency-rates-table"
          />
        </section>
      </section>
    </section>
  );
};
export default CurrencyRates;
