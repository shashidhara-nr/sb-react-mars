'use client';

import { useCallback, useMemo, ChangeEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CreateTransfers.module.scss';
import { Box, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, FormHelperText } from '@mui/material';
import { Button } from 'components/lib/Forms';
import DatePicker from 'components/lib/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import RHFProvider from 'components/common/forms/RHFProvider';
import { useForm, Controller } from 'react-hook-form';
import { CreateJournyForm } from 'components/common';
import { Icon } from '@atoms/index';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import { 
  ACCOUNT_LIST, 
  CURRENCY_OPTIONS, 
  COLORS,
} from './constant';
import IconChevronDown from 'public/icons/icn_chevron_down.svg';
import IconChevronUp from 'public/icons/icn_chevron_up.svg';
import IconSearch from 'public/icons/icn_search.svg';
import { getRulesForField } from 'src/utils/transferCreateLogic';
import CustomPagination from 'components/lib/Tables/TablePagination';
import { Typography } from '@mui/material';

interface BatchItem {
  id: number;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bic: string;
  transferAmount: string;
  creditReference: string;
  currency: string;
}

interface InstructionFormProps {
  instructionNumber: number;
  instructionData: {
    instructionId: number;
    sourceAccount: string;
    sourceAccountName: string;
    sourceAccountNumber: string;
    sourceAccountBranch: string;
    sourceAccountBic: string;
    sourceAccountCountry: string;
    transferCurrency: string;
    debitCurrency: string;
    debitReference: string;
    destinationAccount: string;
    transferAmount: string;
    creditReference: string;
    paymentDate: Dayjs | null;
    batchItems: BatchItem[];
    transferMode: number;
  };
  onUpdate: (instructionId: number, updatedData: any) => void;
  onDelete: (instructionId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const InstructionForm: React.FC<InstructionFormProps> = ({
  instructionNumber,
  instructionData,
  onUpdate,
  onDelete,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const t = useTranslations('transfers');
  const [transferMode, setTransferMode] = useState(instructionData.transferMode || 0);
  const [searchBatch, setSearchBatch] = useState('');
  const [expandedBatchItem, setExpandedBatchItem] = useState<number | false>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<15 | 30 | 50>(15);
  const [batchItems, setBatchItems] = useState<BatchItem[]>(instructionData.batchItems || []);
  const [paymentDate, setPaymentDate] = useState<Dayjs | null>(instructionData.paymentDate || null);

  const detailsDefaultValues = {
    sourceAccount: instructionData.sourceAccount || '',
    destinationAccount: instructionData.destinationAccount || '',
    transferCurrency: instructionData.transferCurrency || '',
    debitCurrency: instructionData.debitCurrency || '',
    debitReference: instructionData.debitReference || '',
    transferAmount: instructionData.transferAmount || '',
    creditReference: instructionData.creditReference || '',
    paymentDate: instructionData.paymentDate || null,
  } as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });

  const getBalances = (account: { sortCode: string; bic: string; currency: string; countryRegion: string }) => [
    { label: 'BIC/SWIFT', value: account.bic },
    { label: 'Sort Code', value: account.sortCode },
    { label: 'Currency', value: account.currency },
    { label: 'Country/Region', value: account.countryRegion },
  ];

  const ACCOUNT_INFO_OPTIONS = useMemo(() => ACCOUNT_LIST.map((account) => ({
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
  })), []);

  const handleChange = useCallback((name: string, value: any) => {
    const updatedData = { ...instructionData, [name]: value };

    if (name === 'sourceAccount') {
      const selectedSourceAccount = ACCOUNT_INFO_OPTIONS.find((acc) => acc.value === value);
      if (selectedSourceAccount) {
        updatedData.sourceAccountName = selectedSourceAccount.name;
        updatedData.sourceAccountNumber = selectedSourceAccount.accNumber;
        updatedData.sourceAccountBranch = selectedSourceAccount.sortCode;
        updatedData.sourceAccountBic = selectedSourceAccount.bic;
        updatedData.sourceAccountCountry = selectedSourceAccount.countryRegion;
      }
    }

    updatedData.transferMode = transferMode;
    updatedData.batchItems = batchItems;
    updatedData.paymentDate = paymentDate;

    onUpdate(instructionData.instructionId, updatedData);
  }, [instructionData, ACCOUNT_INFO_OPTIONS, transferMode, batchItems, paymentDate, onUpdate]);

  const handleAddToBatch = useCallback(() => {
    if (!instructionData.destinationAccount || !instructionData.transferAmount) {
      return;
    }

    const selectedAccount = ACCOUNT_INFO_OPTIONS.find(
      (option) => option.value === instructionData.destinationAccount
    );

    const nextId = batchItems.length + 1;
    const newBatchItem: BatchItem = {
      id: nextId,
      accountName: selectedAccount?.name || '',
      accountNumber: selectedAccount?.accNumber || '',
      sortCode: selectedAccount?.sortCode || '',
      bic: selectedAccount?.bic || '',
      transferAmount: instructionData.transferAmount,
      creditReference: instructionData.creditReference || `${nextId}`,
      currency: selectedAccount?.currency || 'ZAR',
    };

    const updatedBatchItems = [...batchItems, newBatchItem];
    setBatchItems(updatedBatchItems);

    const updatedData = {
      ...instructionData,
      destinationAccount: '',
      transferAmount: '',
      creditReference: '',
      batchItems: updatedBatchItems,
    };

    onUpdate(instructionData.instructionId, updatedData);

    methodsDetails.setValue('destinationAccount', '');
    methodsDetails.setValue('transferAmount', '');
    methodsDetails.setValue('creditReference', '');
  }, [instructionData, batchItems, ACCOUNT_INFO_OPTIONS, methodsDetails, onUpdate]);

  const handleClearBatch = useCallback(() => {
    setBatchItems([]);
    const updatedData = {
      ...instructionData,
      batchItems: [],
    };
    onUpdate(instructionData.instructionId, updatedData);
  }, [instructionData, onUpdate]);

  const handleRemoveBatchItem = useCallback((id: number) => {
    const updatedBatchItems = batchItems.filter((item) => item.id !== id);
    setBatchItems(updatedBatchItems);
    const updatedData = {
      ...instructionData,
      batchItems: updatedBatchItems,
    };
    onUpdate(instructionData.instructionId, updatedData);
  }, [batchItems, instructionData, onUpdate]);

  const handleExpandBatchItem = useCallback(
    (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedBatchItem(isExpanded ? panel : false);
    },
    []
  );

  const filteredBatchItems = useMemo(() => {
    if (!searchBatch) return batchItems;
    return batchItems.filter(
      (item) =>
        item.accountName.toLowerCase().includes(searchBatch.toLowerCase()) ||
        item.accountNumber.includes(searchBatch) ||
        item.creditReference.toLowerCase().includes(searchBatch.toLowerCase())
    );
  }, [batchItems, searchBatch]);

  const paginatedBatchItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredBatchItems.slice(startIndex, endIndex);
  }, [filteredBatchItems, currentPage, rowsPerPage]);

  const handlePageChange = (_: ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage as 15 | 30 | 50);
    setCurrentPage(1);
  };

  const totalBatchAmount = useMemo(() => {
    return batchItems.reduce((sum, item) => sum + parseFloat(String(item.transferAmount) || '0'), 0);
  }, [batchItems]);

  const transferFromFields = [
    {
      name: 'transferCurrency',
      label: t('transferCurrency'),
      value: instructionData.transferCurrency || '',
      type: 'select' as const,
      required: true,
      options: CURRENCY_OPTIONS,
    },
    {
      name: 'debitCurrency',
      label: t('debitCurrency'),
      value: instructionData.debitCurrency || '',
      type: 'select' as const,
      required: true,
      options: CURRENCY_OPTIONS,
    },
    {
      name: 'debitReference',
      label: t('debitReference'),
      value: instructionData.debitReference || '',
      type: 'text' as const,
      required: false,
    },
  ];

  const transferToFields = [
    {
      name: 'transferAmount',
      label: t('transferAmount'),
      value: instructionData.transferAmount || '',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'creditReference',
      label: t('creditReference'),
      value: instructionData.creditReference || '',
      type: 'text' as const,
      required: false,
    },
  ];

  const handlePaymentDateChange = (date: unknown) => {
    if (date && dayjs.isDayjs(date)) {
      setPaymentDate(date as Dayjs);
      const updatedData = {
        ...instructionData,
        paymentDate: date as Dayjs,
      };
      onUpdate(instructionData.instructionId, updatedData);
    } else {
      setPaymentDate(null);
      const updatedData = {
        ...instructionData,
        paymentDate: null,
      };
      onUpdate(instructionData.instructionId, updatedData);
    }
  };

  return (
    <Box className={styles.transferFormContainer} sx={{ 
      height: isCollapsed ? '48px' : 'auto',
      overflow: isCollapsed ? 'hidden' : 'visible',
      transition: 'all 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Transfer From Section */}
      <Box className={styles.sectionInner} sx={{ flex: isCollapsed ? 'none' : '1' }}>
        <Box className={styles.sectionHeader} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          userSelect: 'none',
          minHeight: '48px',
          height: '48px',
          paddingRight: '16px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Icon name="bank" width="24" height="24" bgColor={"#0051FF"} />
            <Typography variant="h6">Instruction {instructionNumber}</Typography>
          </Box>
          {onToggleCollapse && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }} onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}>
              <Icon 
                name={isCollapsed ? "chevronDown" : "chevronUp"} 
                width="20" 
                height="20" 
                bgColor={"#0051FF"}
              />
            </Box>
          )}
        </Box>
        <Box className={styles.sectionContent}>
          <Box className={styles.transferModeContainer}>
            <Box onClick={() => { setTransferMode(0); handleChange('transferMode', 0); }} className={`${styles.transferModeButton} ${transferMode === 0 ? styles.active : ''}`}>{t('singleToMultiple')}</Box>
            <Box onClick={() => { setTransferMode(1); handleChange('transferMode', 1); }} className={`${styles.transferModeButton} ${transferMode === 1 ? styles.active : ''}`}>{t('multipleToSingle')}</Box>
          </Box>
          <Box className={styles.divider} />
          <Box className={styles.sectionSubHeader}>
            <Icon name="accounts" width="24" height="24"  bgColor={"#0051FF"} />
            <Typography variant="h6">{t(transferMode === 0 ? 'transferFrom' : 'transferTo')}</Typography>
          </Box>
          <Box className={styles.accountDropdownContainer}>
            <Box className={styles.accountDropdown}>
              <Controller
                name="sourceAccount"
                control={methodsDetails.control}
                rules={getRulesForField('sourceAccount', () => instructionData)}
                render={({ field, fieldState: { error } }) => (
                  <Box>
                    <AccountInfoDropdown label={t('selectSourceAccount')} value={field.value || ''} options={ACCOUNT_INFO_OPTIONS} onChange={(e: any) => { field.onChange(e.target.value); handleChange('sourceAccount', e.target.value); }} iconChevronDown={IconChevronDown} startIcon={IconSearch} fullWidth />
                    {error && <FormHelperText error sx={{ mt: 0.5 }}>{error.message}</FormHelperText>}
                  </Box>
                )}
              />
            </Box>
          </Box>
          <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
            <Box className={styles.createTransfersFormCont}>
              <CreateJournyForm 
                fields={transferFromFields as any} 
                onChange={handleChange} 
                mode="edit" 
                ShowActionBtns={false} 
                renderWithRHF 
                formMethods={methodsDetails}
                rulesProvider={(name, getVals) => getRulesForField(name as any, getVals)}
              />
            </Box>
          </RHFProvider>
        </Box>
      </Box>

      <Box className={styles.sectionDivider} />

      {/* Transfer To Section */}
      <Box className={styles.sectionInner}>
        <Box className={styles.sectionHeader}>
          <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
          <Typography variant="h6">{t(transferMode === 0 ? 'transferTo' : 'transferFrom')}</Typography>
        </Box>
        <Box className={styles.sectionContent}>
          <Box className={styles.accountDropdownContainer}>
            <Box className={styles.accountDropdown}>
              <Controller
                name="destinationAccount"
                control={methodsDetails.control}
                rules={getRulesForField('destinationAccount', () => instructionData)}
                render={({ field, fieldState: { error } }) => (
                  <Box>
                    <AccountInfoDropdown label={t('searchAccounts')} value={field.value || ''} options={ACCOUNT_INFO_OPTIONS} onChange={(e: any) => { field.onChange(e.target.value); handleChange('destinationAccount', e.target.value); }} iconChevronDown={IconChevronDown} startIcon={IconSearch} fullWidth />
                    {error && <FormHelperText error sx={{ mt: 0.5 }}>{error.message}</FormHelperText>}
                  </Box>
                )}
              />
            </Box>
          </Box>
          <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
            <Box className={styles.createTransfersFormCont}>
              <CreateJournyForm 
                fields={transferToFields as any} 
                onChange={handleChange} 
                mode="edit" 
                ShowActionBtns={false} 
                renderWithRHF 
                formMethods={methodsDetails}
                rulesProvider={(name, getVals) => getRulesForField(name as any, getVals)}
              />
            </Box>
          </RHFProvider>
          <Box className={styles.batchButtonsContainer}>
            <Button buttonVariant="tertiary" startIcon={<Icon name="delete" width="20" height="20"  bgColor={"#0051FF"} />} onClick={handleClearBatch} className={styles.batchButton}>{t('clearBatch')}</Button>
            <Button buttonVariant="secondary" startIcon={<Icon name="add" width="20" height="20" bgColor={"#0051FF"} />} onClick={handleAddToBatch} className={styles.batchButton}>{t('addToBatch')}</Button>
          </Box>
        </Box>
      </Box>

      {/* Batch List Section */}
      <Box className={styles.batchSectionContainer}>
        <Box className={styles.batchHeader}>
          <Box className={styles.batchHeaderContainer}>
            <Box className={styles.paymentIdSection}>
              <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
              <Typography variant="body2">Instruction {instructionNumber} - Batch</Typography>
            </Box>
            <Box className={styles.searchAndFilterSection}>
              <TextField fullWidth value={searchBatch} onChange={(e) => setSearchBatch(e.target.value)} placeholder={t('searchWithinBatch')} variant="outlined" size="small" className={styles.searchField} InputProps={{ startAdornment: (<InputAdornment position="start"><Icon name="search" width="18" height="18"  bgColor={"#0051FF"} /></InputAdornment>) }} />
              <Button buttonVariant="tertiary" startIcon={<Icon name="filter" width="18" height="18"  bgColor={"#0051FF"} />} className={styles.filterButton}>{t('filter')}</Button>
            </Box>
          </Box>
        </Box>
        <Box className={styles.batchItemsContainer}>
          {paginatedBatchItems.length > 0 ? (
            paginatedBatchItems.map((item, index) => (
              <Accordion key={item.id} expanded={expandedBatchItem === item.id} onChange={handleExpandBatchItem(item.id)} className={styles.accordion}>
                <AccordionSummary expandIcon={<Icon name="arrow" width="20" height="20"  bgColor={"#0051FF"} />} className={styles.accordionSummary}>
                  <Box className={styles.accordionSummaryLeft}>
                    <Icon name="user" width="24" height="24" bgColor={"#0051FF"} />
                    <Box className={styles.accordionSummaryContent}>
                      <Typography className={styles.accountName}>{index + 1}. {item.accountName}</Typography>
                    </Box>
                  </Box>
                  <Box className={styles.accordionSummaryRight}>
                    <Box className={styles.accountNumberLabel}>
                      <Typography className={styles.label}>{t('accNumber')}</Typography>
                      <Typography className={styles.value}>{item.accountNumber}</Typography>
                    </Box>
                    <Box className={styles.transferAmountSection}>
                      <Typography className={styles.label}>{t('transferAmount')}</Typography>
                      <Typography className={styles.value}>{item.currency} {item.transferAmount}</Typography>
                    </Box>
                    <Box className={styles.chevronAndDelete}>
                      <Box onClick={(e) => { e.stopPropagation(); handleRemoveBatchItem(item.id); }} className={styles.deleteButton}>
                        <Icon name="delete" width="18" height="18"  bgColor={"#0051FF"} />
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails className={styles.accordionDetails}>
                  <Box className={styles.detailsGrid}>
                    <Box className={styles.detailsField}>
                      <Typography className={styles.fieldLabel}>{t('branchSortCode')}</Typography>
                      <Box className={styles.fieldValuePlain}><Typography>{item.sortCode || '-'}</Typography></Box>
                    </Box>
                    <Box className={styles.detailsField}>
                      <Typography className={styles.fieldLabel}>{t('bicSwift')}</Typography>
                      <Box className={styles.fieldValuePlain}><Typography>{item.bic || '-'}</Typography></Box>
                    </Box>
                    <Box className={styles.detailsField}>
                      <Typography className={styles.fieldLabel}>{t('creditAmount')}</Typography>
                      <Box className={`${styles.fieldValue} ${styles.creditAmountField}`}><Typography>R {item.transferAmount}</Typography></Box>
                    </Box>
                    <Box className={styles.detailsField}>
                      <Typography className={styles.fieldLabel}>{t('creditReference')}</Typography>
                      <Box className={styles.fieldValue}><Typography>{item.creditReference}</Typography></Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box className={styles.emptyBatchState}>
              <Typography variant="body2" color="text.secondary">{t('noBatchItemsAdded')}</Typography>
            </Box>
          )}
        </Box>
        <Box className={styles.batchFooter}>
          <Typography className={styles.totalAmount}>{t('total')}: R {totalBatchAmount.toFixed(2)}</Typography>
          {filteredBatchItems.length !== 0 && (
            <CustomPagination
              rows={filteredBatchItems}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </Box>
      </Box>

      <Box className={styles.sectionDivider} />

      {/* Payment Schedule Section */}
      <Box className={styles.sectionInner}>
        <Box className={styles.sectionHeader}>
          <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
          <Typography variant="h6">{t('paymentSchedule')}</Typography>
        </Box>
        <Box className={styles.sectionContent}>
          <Box className={styles.datePickerContainer}>
            <Controller
              name="paymentDate"
              control={methodsDetails.control}
              rules={getRulesForField('paymentDate', () => instructionData)}
              render={({ field, fieldState: { error } }) => (
                <Box>
                  <DatePicker label="" value={field.value || paymentDate} onChange={(date) => { field.onChange(date); handlePaymentDateChange(date); }} placeholder="31/05/2023" fullWidth />
                  {error && <FormHelperText error sx={{ mt: 0.5 }}>{error.message}</FormHelperText>}
                </Box>
              )}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InstructionForm;
