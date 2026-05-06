'use client';
import { useCallback, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './BillingAccounts.module.scss';
import { Box, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { Button } from 'components/lib/Forms';
import { Icon, SelectField } from '@atoms/index';
import { mockBillingAccountsBatchData } from '@lib/mock/mockBillingAccounts';
import CustomPagination from 'components/lib/Tables/TablePagination';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import { ACCOUNT_LIST } from './constant';
import IconChevronDown from 'public/icons/chevron_down.svg';
import IconSearch from 'public/icons/icn_search.svg';
import BatchAccountsFilterDialog from './BatchAccountsFilterDialog';

interface BillingAccountsBatchInterface {
  accountName: string;
  accountNumber: string;
  branchSortCode: string;
  bicSwift: string;
  currency: string;
  countryRegion: string;
  feeOption: string;
  billingAccount?: string;
  id?: string;
}

const BillingAccountsBatch = ({edit = true}: {edit: boolean}) => {
  const t = useTranslations('billingAccounts');
  const theme = useTheme();
  const [editingActive, setEditingActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [expandCollapseIndex, setExpandCollapseIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState<15 | 30 | 50>(15);
  const [billingAccountInfo, setBillingAccountInfo] = useState<Partial<BillingAccountsBatchInterface>>({});
  const [addedAccountList, setAddedAccountList] = useState<any[]>(mockBillingAccountsBatchData);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null); 

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setExpandCollapseIndex(null); // Collapse any expanded item when page changes
  };

  const handleRowsPerPageChange = (newPerPage: number) => {
    // Ensure only allowed values are set
    if (newPerPage === 15 || newPerPage === 30 || newPerPage === 50) {
      setPerPage(newPerPage);
      setPage(1); // Reset to first page when rows per page changes
      setExpandCollapseIndex(null); // Collapse any expanded item when rows per page changes
    }
  };

  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);
  
  const batchItemLabelList: (keyof BillingAccountsBatchInterface)[] = [
    'accountName',
    'accountNumber',
    'branchSortCode',
    'bicSwift',
    'currency',
    'countryRegion',
    'feeOption'
  ];

  // Memoize filtered accounts
  const filteredAccountList = useMemo(() => {
    let filtered = addedAccountList;

    // Apply filters
    if (filters.country) {
      filtered = filtered.filter((account: BillingAccountsBatchInterface) => 
        account.countryRegion === filters.country
      );
    }
    if (filters.currency) {
      filtered = filtered.filter((account: BillingAccountsBatchInterface) => 
        account.currency === filters.currency
      );
    }
    if (filters.branchSortCode) {
      const search = filters.branchSortCode.toLowerCase();
      filtered = filtered.filter((account: BillingAccountsBatchInterface) => 
        account.branchSortCode?.toLowerCase().includes(search)
      );
    }
    if (filters.bicSwift) {
      const search = filters.bicSwift.toLowerCase();
      filtered = filtered.filter((account: BillingAccountsBatchInterface) => 
        account.bicSwift?.toLowerCase().includes(search)
      );
    }

    // Apply search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((account: BillingAccountsBatchInterface) =>
        account.accountName?.toLowerCase().includes(search) ||
        account.accountNumber?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [addedAccountList, filters, searchText]);

  const getBalances = (account: { sortCode: string; bic: string; currency: string; countryRegion: string }) => [
    { label: t('bicSwift'), value: account.bic },
    { label: t('sortCode'), value: account.sortCode },
    { label: t('currency'), value: account.currency },
    { label: t('countryRegion'), value: account.countryRegion },
  ];

  const ACCOUNT_INFO_OPTIONS = ACCOUNT_LIST.map((account) => ({
    value: account.id,
    name: account.name,
    masked: account.masked,
    accNumber: account.accNumber,
    sortCode: account.sortCode,
    bic: account.bic,
    balances: getBalances(account),
    currency: account.currency,
    countryRegion: account.countryRegion,
    iconChevronDown: IconChevronDown,
  }));

  const handleChange = (name: string, value: any) => {
    const tempBillingAccountInfo = { ...billingAccountInfo, [name]: value };
    setBillingAccountInfo(tempBillingAccountInfo);
  };

  const feeOptionList = [
    { value: 'fixed', label: t('fixed') },
    { value: 'variable', label: t('variable') },
  ];

  const addAccountsToBatch = () => {
    if (billingAccountInfo?.billingAccount && billingAccountInfo?.feeOption) {
      const tempSelectedAccount = ACCOUNT_LIST.find((account) => account.id === billingAccountInfo.billingAccount);
      const newAccount = {
        ...billingAccountInfo,
        accountName: tempSelectedAccount?.name,
        accountNumber: tempSelectedAccount?.accNumber,
        branchSortCode: tempSelectedAccount?.sortCode,
        bicSwift: tempSelectedAccount?.bic,
        currency: tempSelectedAccount?.currency,
        countryRegion: tempSelectedAccount?.countryRegion,
        id: `${addedAccountList.length + 1}`,
        feeOption: billingAccountInfo.feeOption,
      };
      setAddedAccountList([...addedAccountList, newAccount]);
      setBillingAccountInfo({});
    }
  };

  return (
    <Box className={styles.batchContainer}>
      <Box className={styles.batchHeader}>
        <Box className={styles.batchHeaderTitle}>
          <Icon name="billingAccountEnter" width="24px" height="24px" bgColor={theme.palette.text.secondary} />
          <Typography variant="h2" className={styles.batchHeaderTitleText}>
            {t('accounts')}
          </Typography>
        </Box>
        {edit ? 
          editingActive ? (
            <Box className={styles.batchActionBtns}>
              <Button
                buttonVariant="text"
                className={styles.cancelBtn}
                onClick={() => setEditingActive(false)}
              >
                <Icon name="cancel" width="24px" height="24px" bgColor={theme.palette.secondary.main} />
                {t('cancel')}
              </Button>
              <Button
                buttonVariant="text"
                className={styles.saveBtn}
                onClick={() => setEditingActive(false)}
              >
                <Icon name="save" width="24px" height="24px" bgColor={theme.palette.secondary.main} />
                {t('save')}
              </Button>
            </Box>
          ) : (
            <Button
              buttonVariant="text"
              className={styles.editBtn}
              onClick={() => setEditingActive(true)}
            >
              <Icon name="edit" width="24px" height="24px" bgColor={theme.palette.secondary.main} />
              {t('edit')}
            </Button>
          )
        : null}
      </Box>
      <Box className={styles.batchContent}>
        {(!edit || editingActive) && (
          <Box className={styles.accountDropdownBox}>
            <Box className={styles.accountDropdown}>
              <AccountInfoDropdown
                label={t('selectAccounts')}
                value={billingAccountInfo?.billingAccount || ''}
                options={ACCOUNT_INFO_OPTIONS}
                onChange={(e: any) => handleChange('billingAccount', e.target.value)}
                iconChevronDown={IconChevronDown}
                startIcon={IconSearch}
                fullWidth
              />
            </Box>
            <Box className={styles.feeOptionSelect}>
              <SelectField
                name={'feeOption'}
                label={t('feeOption')}
                value={billingAccountInfo?.feeOption ?? ''}
                onChange={(name, value) => handleChange('feeOption', value)}
                options={feeOptionList || []}
                height={'52px'}
              />
            </Box>
            <Box className={styles.batchBtnContainer}>
              <Button
                buttonVariant="tertiary"
                startIcon={<Icon name="delete" width="24" height="24" bgColor='#0051FF' />}
                onClick={() => setBillingAccountInfo({})}
              >
                {t('clearBatch')?.toLocaleUpperCase()}
              </Button>
              <Button
                buttonVariant="secondary"
                startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
                onClick={addAccountsToBatch}
              >
                {t('addAccounts')}
              </Button>
            </Box>
          </Box>
        )}
        <Box className={styles.batchInnerContent}>
          <Box className={styles.batchInnerHeader}>
            {!edit && (
              <Box className={styles.batchHeaderTitle}>
                <Icon name="accounts" width="24px" height="24px" bgColor={theme.palette.text.secondary} />
                <Typography variant="h2" className={styles.batchHeaderTitleText}>
                  {t('accounts')}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('searchWithinBatch')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={
                {
                  startAdornment: (
                      <InputAdornment position="start">{<Icon name="search" width="24px" height="24px" bgColor={theme.palette.text.secondary} />}</InputAdornment>
                  ),
                }
              }
              className={styles.searchField}
            />
            <Button
              buttonVariant="text"
              className={styles.filterBtn}
              onClick={handleFilterOpen}
            >
              <Icon name="filter" width="28px" height="28px" bgColor={theme.palette.secondary.main} />
              {t('filter')}
            </Button>
            <BatchAccountsFilterDialog
              open={filterDialogOpen}
              anchorEl={filterAnchorEl}
              onClose={() => setFilterDialogOpen(false)}
              onApply={(newFilters) => setFilters(newFilters)}
              initialValues={filters}
            />
          </Box>
          <Box className={styles.batchInnerBody}>
            <Box className={styles.batchInnerBodyContent}>
              <Box className={styles.batchList}>
                {filteredAccountList
                  ?.slice(page * perPage, page * perPage + perPage)
                  .map((account: BillingAccountsBatchInterface, idx) => {
                    const globalIdx = page * perPage + idx;
                    return (
                      <Box className={styles.batchListItem} key={account.id ?? globalIdx}>
                        <Box className={styles.batchListItemHeader} onClick={() => setExpandCollapseIndex(expandCollapseIndex === globalIdx ? null : globalIdx)}>
                          <Box className={styles.batchListItemHeaderLeft}>
                            <Icon name="user" width="24px" height="24px" bgColor={theme.palette.text.secondary} />
                            <Typography variant="h3" className={styles.batchListItemHeaderText}>
                              {globalIdx + 1}. {t('accountName')}
                            </Typography>
                          </Box>
                          <Box className={styles.batchListItemHeaderRight}>
                            <Typography variant="body2" className={styles.batchListItemHeaderLabel}>
                              {t('accountNumber')}: 
                            </Typography>
                            <Typography variant="body2" className={styles.batchListItemHeaderValue}>
                              {account.accountNumber}
                            </Typography>
                            <Icon name="arrow" width="24px" height="24px" bgColor={theme.palette.secondary.main} />
                          </Box>
                        </Box>
                        <Box className={`${styles.batchListItemContent} ${expandCollapseIndex === globalIdx ? styles.expanded : ''}`}>
                          {batchItemLabelList.map((item, itemIdx) => (
                            <Box className={styles.batchListItemContentRow} key={itemIdx}>
                              <Typography variant="body2" className={styles.batchListItemContentRowLabel}>
                                {t(item)}
                              </Typography>
                              <Typography variant="body2" className={styles.batchListItemContentRowValue}>
                                {account[item]}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          </Box>
          <Box className={styles.batchInnerFooter}>
            {filteredAccountList.length !== 0 && (
              <CustomPagination
                rows={filteredAccountList}
                page={page}
                rowsPerPage={perPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default BillingAccountsBatch;
