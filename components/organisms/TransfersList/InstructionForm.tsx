'use client';

import { useCallback, useMemo, ChangeEvent, useState, useEffect } from 'react';
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
import BatchListSection from './BatchListSection';
import { Typography } from '@mui/material';

interface BatchItem {
  id: number;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bic: string;
  transferAmount: string;
  debitAmount?: string;
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
    debitAmount?: string;
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

  // Sync local transferMode when parent updates (from other instruction or PaymentDetailsForm changes)
  useEffect(() => {
    setTransferMode(instructionData.transferMode);
  }, [instructionData.transferMode]);

  // Handler for transfer mode button clicks - immediately notify parent
  const handleTransferModeChange = useCallback((mode: number) => {
    setTransferMode(mode);
    onUpdate(instructionData.instructionId, { 
      ...instructionData, 
      transferMode: mode
    });
  }, [instructionData, onUpdate]);

  const detailsDefaultValues = {
    sourceAccount: instructionData.sourceAccount || '',
    destinationAccount: instructionData.destinationAccount || '',
    transferCurrency: instructionData.transferCurrency || '',
    debitCurrency: instructionData.debitCurrency || '',
    debitAmount: instructionData.debitAmount || '',
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
    if (transferMode === 1 && (name === 'debitAmount' || name === 'sourceAccount')) {
      console.log('[Mode 1] Form change detected:', { name, value, instructionDataBefore: { sourceAccount: instructionData.sourceAccount, debitAmount: instructionData.debitAmount } });
    }
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
    // Mode 0: Single to Multiple - capture destination account
    if (transferMode === 0) {
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
    }
    // Mode 1: Multiple to Single - capture source account
    else if (transferMode === 1) {
      if (!instructionData.sourceAccount || !instructionData.debitAmount || instructionData.debitAmount.toString().trim() === '') {
        console.log('Mode 1 Add to Batch validation failed:', { sourceAccount: instructionData.sourceAccount, debitAmount: instructionData.debitAmount });
        return;
      }

      const selectedAccount = ACCOUNT_INFO_OPTIONS.find(
        (option) => option.value === instructionData.sourceAccount
      );

      const nextId = batchItems.length + 1;
      const newBatchItem: BatchItem = {
        id: nextId,
        accountName: selectedAccount?.name || '',
        accountNumber: selectedAccount?.accNumber || '',
        sortCode: selectedAccount?.sortCode || '',
        bic: selectedAccount?.bic || '',
        transferAmount: instructionData.debitAmount!,
        creditReference: instructionData.debitReference || `${nextId}`,
        currency: selectedAccount?.currency || 'ZAR',
        debitAmount: instructionData.debitAmount,
      };

      const updatedBatchItems = [...batchItems, newBatchItem];
      setBatchItems(updatedBatchItems);

      const updatedData = {
        ...instructionData,
        sourceAccount: '',
        debitAmount: '',
        debitReference: '',
        batchItems: updatedBatchItems,
      };

      onUpdate(instructionData.instructionId, updatedData);

      methodsDetails.setValue('sourceAccount', '');
      methodsDetails.setValue('debitAmount', '');
      methodsDetails.setValue('debitReference', '');
    }
  }, [instructionData, batchItems, transferMode, ACCOUNT_INFO_OPTIONS, methodsDetails, onUpdate])

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

  const transferFromFieldsSingleToMultiple = [
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

  const transferFromFieldsMultipleToSingle = [
    {
      name: 'transferCurrency',
      label: t('transferCurrency'),
      value: instructionData.transferCurrency || '',
      type: 'select' as const,
      required: true,
      options: CURRENCY_OPTIONS,
    },
    {
      name: 'debitAmount',
      label: t('debitAmount'),
      value: instructionData.debitAmount || '',
      type: 'text' as const,
      required: true,
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

  const transferToFieldsSingleToMultiple = [
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

  const transferToFieldsMultipleToSingle = [
    {
      name: 'creditReference',
      label: t('creditReference'),
      value: instructionData.creditReference || '',
      type: 'text' as const,
      required: false,
    },
  ];

  // Conditionally select the correct field arrays based on transfer mode
  const transferFromFields = transferMode === 0 ? transferFromFieldsSingleToMultiple : transferFromFieldsMultipleToSingle;
  const transferToFields = transferMode === 0 ? transferToFieldsSingleToMultiple : transferToFieldsMultipleToSingle;

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
            <Box onClick={() => handleTransferModeChange(0)} className={`${styles.transferModeButton} ${transferMode === 0 ? styles.active : ''}`}>{t('singleToMultiple')}</Box>
            <Box onClick={() => handleTransferModeChange(1)} className={`${styles.transferModeButton} ${transferMode === 1 ? styles.active : ''}`}>{t('multipleToSingle')}</Box>
          </Box>
          <Box className={styles.divider} />
          <Box className={styles.sectionSubHeader}>
            <Icon name="accounts" width="24" height="24"  bgColor={"#0051FF"} />
            <Typography variant="h6">{t('transferFrom')}</Typography>
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

      {/* Batch Buttons - Only show below Transfer From for Multiple to Single */}
      {transferMode === 1 && (
        <Box className={styles.batchButtonsContainer}>
          <Button buttonVariant="tertiary" startIcon={<Icon name="delete" width="20" height="20"  bgColor={"#0051FF"} />} onClick={handleClearBatch} className={styles.batchButton}>{t('clearBatch')}</Button>
          <Button buttonVariant="secondary" startIcon={<Icon name="add" width="20" height="20" bgColor={"#0051FF"} />} onClick={handleAddToBatch} className={styles.batchButton}>{t('addToBatch')}</Button>
        </Box>
      )}

      <Box className={styles.sectionDivider} />

      {/* Batch List Section - Only show below Transfer From for Multiple to Single */}
      {transferMode === 1 && (
        <>
          <BatchListSection
        transferMode={transferMode}
        searchBatch={searchBatch}
        setSearchBatch={setSearchBatch}
        paginatedBatchItems={paginatedBatchItems}
        expandedBatchItem={expandedBatchItem}
        handleExpandBatchItem={handleExpandBatchItem}
        handleRemoveBatchItem={handleRemoveBatchItem}
        filteredBatchItems={filteredBatchItems}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
        totalBatchAmount={totalBatchAmount}
        headerContent={
          <Box className={styles.paymentIdSection}>
            <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
            <Typography variant="body2">Instruction {instructionNumber} - Batch</Typography>
          </Box>
        }
      />
          <Box className={styles.sectionDivider} />
        </>
      )}

      {/* Transfer To Section */}
      <Box className={styles.sectionInner}>
        <Box className={styles.sectionHeader}>
          <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
          <Typography variant="h6">{t('transferTo')}</Typography>
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
        </Box>
      </Box>

      {/* Batch Buttons - Only show below Transfer To for Single to Multiple */}
      {transferMode === 0 && (
        <Box className={styles.batchButtonsContainer}>
          <Button buttonVariant="tertiary" startIcon={<Icon name="delete" width="20" height="20"  bgColor={"#0051FF"} />} onClick={handleClearBatch} className={styles.batchButton}>{t('clearBatch')}</Button>
          <Button buttonVariant="secondary" startIcon={<Icon name="add" width="20" height="20" bgColor={"#0051FF"} />} onClick={handleAddToBatch} className={styles.batchButton}>{t('addToBatch')}</Button>
        </Box>
      )}

      {/* Batch List Section - Only show below Transfer To for Single to Multiple */}
      {transferMode === 0 && (
        <>
          <Box className={styles.sectionDivider} />
          <BatchListSection
            transferMode={transferMode}
            searchBatch={searchBatch}
            setSearchBatch={setSearchBatch}
            paginatedBatchItems={paginatedBatchItems}
            expandedBatchItem={expandedBatchItem}
            handleExpandBatchItem={handleExpandBatchItem}
            handleRemoveBatchItem={handleRemoveBatchItem}
            filteredBatchItems={filteredBatchItems}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            handlePageChange={handlePageChange}
            handleRowsPerPageChange={handleRowsPerPageChange}
            totalBatchAmount={totalBatchAmount}
            headerContent={
              <Box className={styles.paymentIdSection}>
                <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
                <Typography variant="body2">Instruction {instructionNumber} - Batch</Typography>
              </Box>
            }
          />
        </>
      )}

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
                  <DatePicker label="" value={field.value || paymentDate} onChange={(date) => { field.onChange(date); handlePaymentDateChange(date); }} placeholder="31/05/2023" fullWidth minDate={dayjs()} />
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
