'use client';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import styles from './BankingAccounts.module.scss';
import { Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import JournyForm from 'components/common/JournyForm';
import { useForm } from 'react-hook-form';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import { Icon } from '@atoms/index';
import { buildManageBankAccountOwnerFields, buildManageBankDetailsFields } from 'src/utils/manageBankAccount';
import TableWithTab from '@molecules/TableWithTab';
import { mockBankingAccountDetailsData } from '@lib/mock/mockBankingAccounts';
import { ListRightPanelActions } from 'components/common';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import BankingAccountDetailFilterDialog from './BankingAccountDetailFilterDialog';
import { buildTestId } from 'src/utils/testIds';
import EmptyState from 'components/common/EmptyState';
import Loader from 'components/lib/Page/Loader';
import { ErrorAlertIcon, ReloadRefreshIcon } from '@lib/icons';

const TABLE_COLUMNS = [
  'customerName',
  'customerId',
  'companyRegistrationNumber',
  'bankName',
  'countryRegion',
  { key: 'status', type: 'chip' },
] as const;

const testIdPrefix = 'manage-banking-account';

const ManageBankAccount = ({ accountIdParam }: { accountIdParam?: string } = {}) => {
  const t = useTranslations('bankingAccounts');
  const locale = useLocale();
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize accountId from param first, update from query params in effect
  const [accountId, setAccountId] = useState<string | null>(accountIdParam ?? null);

  const bankAccountDetails = useSelector((state: RootState) => state.bankAccountDetails.details);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update accountId from query params after hydration if not provided as prop
  useEffect(() => {
    if (!accountIdParam && searchParams) {
      const queryAccountId = searchParams.get('accountId');
      if (queryAccountId) {
        setAccountId(queryAccountId);
      }
    }
  }, [searchParams, accountIdParam]);

  const accountOwnerFields = useMemo(() => {
    // Use mock data if accountId is provided, otherwise use Redux store data
    const dataToUse = accountId
      ? mockBankingAccountDetailsData.find(acc => acc.id === accountId)
      : bankAccountDetails;
    return buildManageBankAccountOwnerFields(t, dataToUse as any);
  }, [t, bankAccountDetails, accountId]);

  const bankDetailsFields = useMemo(() => {
    // Use mock data if accountId is provided, otherwise use Redux store data
    const dataToUse = accountId
      ? mockBankingAccountDetailsData.find(acc => acc.id === accountId)
      : bankAccountDetails;
    return buildManageBankDetailsFields(t, dataToUse as any);
  }, [t, bankAccountDetails, accountId]);

  const detailsDefaultValues = {} as const;
  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const detailsValues = methodsDetails.getValues();

  const applyOverrides = (fieldsArr: any[], overrides: Record<string, any>) =>
    (Array.isArray(fieldsArr) ? fieldsArr : []).map((f: any) => {
      const nf: any = { ...f };
      if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name)) nf.value = overrides[f.name];
      if (f.type === 'amount') {
        const currencyName = f.amountCurrencyTargetName || `${f.name}Currency`;
        if (Object.prototype.hasOwnProperty.call(overrides || {}, currencyName))
          nf.amountCurrency = overrides[currencyName];
      }
      return nf;
    });

  const accountOwnerFieldsOv = applyOverrides(accountOwnerFields as any[], detailsValues as any);
  const bankDetailsFieldsOv = applyOverrides(bankDetailsFields as any[], detailsValues as any);
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/banking-accounts', label: t('bankingAccounts') },
      { href: '/banking-accounts/manage-bank-account', label: accountId ? t('viewAccountDetails') : t('viewDetails') },
    ],
    [t, accountId],
  );

  const handleChange = () => { };

  const mappedRows = useMemo(() => {
    let filtered = mockBankingAccountDetailsData;

    // If accountId is present, exclude the selected account from the list
    if (accountId) {
      filtered = filtered.filter((row: any) => row.id !== accountId);
    }

    // Apply filter: Country/Region
    if (filters.countryRegion) {
      filtered = filtered.filter((row: any) => row.countryRegion === filters.countryRegion);
    }

    // Apply filter: Status
    if (filters.status) {
      filtered = filtered.filter((row: any) => {
        return row?.status?.value === filters.status;
      });
    }

    // Apply filter: Bank Name (exact match, not case-insensitive)
    if (filters.bankName) {
      filtered = filtered.filter((row: any) => row.bankName === filters.bankName);
    }

    // Apply search text (combined with filters - AC6)
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (row: any) =>
          row?.customerName?.toLowerCase().includes(search) ||
          row?.customerId?.toLowerCase().includes(search) ||
          row?.companyRegistrationNumber?.toLowerCase().includes(search),
      );
    }

    const withAccountDetails = filtered.map((row: any) => {
      const countryRegionMap: { [key: string]: string } = {
        'ZA': 'South Africa',
        'US': 'United States',
        'UK': 'United Kingdom'
      };

      return {
        ...row,
        bankName: t(row?.bankName || ''),
        countryRegion: countryRegionMap[row?.countryRegion] || row?.countryRegion,
        status: {
          value: t(row?.status?.value || ''),
          color: row?.status?.color || 'default'
        }
      };
    });

    return withAccountDetails;
  }, [filters, searchText, t, mockBankingAccountDetailsData, accountId]);

  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSelectedRows([]);
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDialogOpen(false);
    setFilterAnchorEl(null);
    setSelectedRows([]);
  }, []);

  const handleFilterApply = useCallback((appliedFilters: any) => {
    setError(null);
    setIsLoading(true);
    setSelectedRows([]);

    setTimeout(() => {
      try {
        setFilters(appliedFilters);
        setIsLoading(false);
        setFilterDialogOpen(false);
        setFilterAnchorEl(null);
      } catch (err) {
        setError('Failed to apply filters. Please try again.');
        setIsLoading(false);
      }
    }, 500);
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      try {
        setFilters({});
        setSearchText('');
        setIsLoading(false);
      } catch (err) {
        setError('Failed to remove filters. Please try again.');
        setIsLoading(false);
      }
    }, 500);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRows([]);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setSelectedRows([]);
  }, []);

  // Handle link click for manage beneficiary
  const handleLinkClick = useCallback((row: any, index: number, link: any) => {
    const localizedPath = `/${locale}${link.href}`;
    router.push(localizedPath as any);
  }, [router, locale]);

  const handleReload = useCallback(() => {
    handleRemoveFilters();
  }, [handleRemoveFilters]);

  const emptyStateContent = useMemo(() => (
    <EmptyState
      title={t('noDataAvailable')}
      description={t('noBankingAccountsFound')}
      testIdPrefix="manage-banking-account-empty-state"
    />
  ), [t]);

  const errorStateContent = useMemo(() => (
    <EmptyState
      title={t('failedToLoad')}
      description={t('failedToLoadDescription')}
      buttonLabel={t('reload')}
      onButtonClick={handleReload}
      icon={<Image src={ErrorAlertIcon} alt="Error" width={48} height={48} />}
      buttonIcon={<Image src={ReloadRefreshIcon} alt="Reload" width={20} height={20} />}
      testIdPrefix="manage-banking-account-error-state"
    />
  ), [t, handleReload]);

  const rightPanelButtons = useMemo(() => {
    const count = selectedRows.length;
    const hasFilters = Object.keys(filters).length > 0 || searchText.trim().length > 0;

    return (
      <ListRightPanelActions
        selectedCount={count}
        hasFilters={hasFilters}
        onRemoveFilters={handleRemoveFilters}
      />
    );
  }, [selectedRows.length, filters, searchText, handleRemoveFilters]);

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
        'data-testid': buildTestId(testIdPrefix, 'filter-button'),
      },
    ];
  }, [handleFilterOpen, t, theme.palette.secondary.main]);

  const tableHeadCells = useMemo(
    () => [
      { id: 'customerName', label: t('customerName'), numeric: false, colWidth: '220px' },
      { id: 'customerId', label: t('customerId'), numeric: false, colWidth: '180px' },
      { id: 'companyRegistrationNumber', label: t('companyRegistrationNumber'), numeric: false, colWidth: '320px' },
      { id: 'bankName', label: t('bankName'), numeric: false, colWidth: '240px' },
      { id: 'countryRegion', label: t('countryRegion'), numeric: false, colWidth: '200px' },
      { id: 'status', label: t('status'), numeric: false, colWidth: '120px' },
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
      emptyStateContent: error ? errorStateContent : emptyStateContent,
    }),
    [tableHeadCells, mappedRows, errorStateContent, emptyStateContent, error],
  );

  return (
    <section className={styles.container} data-testid={buildTestId(testIdPrefix, 'container')}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow} data-testid={buildTestId(testIdPrefix, 'header')}>
        <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'title')}>
          {t('bankingAccount')}
        </Heading>
      </Grid>
      <section data-testid={buildTestId(testIdPrefix, 'owner-details-section')}>
        <JournyForm
          onChange={handleChange}
          mode="view"
          ShowActionBtns={false}
          renderWithRHF
          formMethods={methodsDetails}
          syncOnChange={false}
          sections={[{
            title: t('accountOwnerDetails'),
            titleIcon: '',
            titleIconEelement: <Icon name="userAccount" width="24px" height="24px" bgColor={theme.palette.text.secondary} />,
            fields: accountOwnerFieldsOv as any,
            ShowActionBtns: false,
            readOnly: true
          }]}
          onSubmit={(data: any) => {
            Object.entries(data || {}).forEach(([name, value]) => handleChange());
          }}
          onValidationFail={() => {
            // handle validation fail
          }}
        />
      </section>
      <section data-testid={buildTestId(testIdPrefix, 'bank-details-section')}>
        <JournyForm
          onChange={handleChange}
          mode="view"
          ShowActionBtns={false}
          renderWithRHF
          formMethods={methodsDetails}
          syncOnChange={false}
          sections={[{
            title: t('bankAccountDetails'),
            titleIcon: '',
            titleIconEelement: <Icon name="bank" width="20px" height="20px" bgColor={theme.palette.text.secondary} />,
            fields: bankDetailsFieldsOv as any,
            ShowActionBtns: false,
            readOnly: true
          }]}
          onSubmit={(data: any) => {
            Object.entries(data || {}).forEach(([name, value]) => handleChange());
          }}
          onValidationFail={() => {
            // handle validation fail
          }}
        />
      </section>
      <section className={styles.tabContent} data-testid={buildTestId(testIdPrefix, 'additional-info-section')}>
        <Grid size={12} className={styles.headerRow} data-testid={buildTestId(testIdPrefix, 'additional-info-header')}>
          <Heading as="h5" fontSize="18px" data-testid={buildTestId(testIdPrefix, 'additional-info-title')}>
            {t('additionalCustomerInformation')}
          </Heading>
        </Grid>
        <Grid size={12} className={styles.searchRow} data-testid={buildTestId(testIdPrefix, 'additional-info-description')}>
          <p className={styles.additionalInfoDescription}>
            {t('additionalCustomerAccessDescription')}
          </p>
        </Grid>
        <Grid size={12} className={styles.searchRow} data-testid={buildTestId(testIdPrefix, 'search-row')}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('searchCustomers')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            inputProps={{ 'data-testid': buildTestId(testIdPrefix, 'search-input') }}
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
        <section className={styles.tableContainer} data-testid={buildTestId(testIdPrefix, 'table-container')}>
          <Loader loaded={!isLoading} size={40}>
            <TableWithTab
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
          </Loader>

          <BankingAccountDetailFilterDialog
            open={filterDialogOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialValues={filters}
          />
        </section>
      </section>
    </section>
  );
};

export default ManageBankAccount;
