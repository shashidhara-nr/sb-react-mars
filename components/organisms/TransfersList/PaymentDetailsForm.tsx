'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CreateTransfers.module.scss';
import { Box, Typography, TextField, InputAdornment, Button as MuiButton, FormHelperText, Tooltip } from '@mui/material';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import RHFProvider from 'components/common/forms/RHFProvider';
import { CreateJournyForm } from 'components/common';
import { Controller, UseFormReturn } from 'react-hook-form';
import DatePicker from 'components/lib/DatePicker';
import { Dayjs } from 'dayjs';
import { COLORS } from './constant';
import BatchListSection from './BatchListSection';

interface PaymentDetailsFormProps {
  transferMode: number;
  setTransferMode: (mode: number) => void;
  transferDetails: any;
  handleChange: (name: string, value: any) => void;
  transferFromFields: any[];
  methodsDetails: UseFormReturn<any>;
  ACCOUNT_INFO_OPTIONS: any[];
  transferToFields: any[];
  handleAddToBatch: () => void;
  handleClearBatch: () => void;
  batchItems: any[];
  searchBatch: string;
  setSearchBatch: (search: string) => void;
  expandedBatchItem: number | false;
  handleExpandBatchItem: (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  handleRemoveBatchItem: (id: number) => void;
  paginatedBatchItems: any[];
  currentPage: number;
  rowsPerPage: 15 | 30 | 50;
  handlePageChange: (_: ChangeEvent<unknown>, newPage: number) => void;
  handleRowsPerPageChange: (newRowsPerPage: number) => void;
  totalBatchAmount: number;
  filteredBatchItems: any[];
  paymentId: string;
  setPaymentId: (id: string) => void;
  paymentDate: Dayjs | null;
  handlePaymentDateChange: (date: unknown) => void;
  handleAddInstruction: () => void;
  instructionCount: number;
  instructions: any[];
  IconChevronDown: any;
  IconSearch: any;
  getRulesForField: (name: string, getVals: () => any) => any;
}

const PaymentDetailsForm: React.FC<PaymentDetailsFormProps> = ({
  transferMode,
  setTransferMode,
  transferDetails,
  handleChange,
  transferFromFields,
  methodsDetails,
  ACCOUNT_INFO_OPTIONS,
  transferToFields,
  handleAddToBatch,
  handleClearBatch,
  batchItems,
  searchBatch,
  setSearchBatch,
  expandedBatchItem,
  handleExpandBatchItem,
  handleRemoveBatchItem,
  paginatedBatchItems,
  currentPage,
  rowsPerPage,
  handlePageChange,
  handleRowsPerPageChange,
  totalBatchAmount,
  filteredBatchItems,
  paymentId,
  setPaymentId,
  paymentDate,
  handlePaymentDateChange,
  handleAddInstruction,
  instructionCount,
  instructions,
  IconChevronDown,
  IconSearch,
  getRulesForField,
}) => {
  const t = useTranslations('transfers');

  return (
    <Box sx={{ marginBottom: 3 }}>
      <Box className={styles.transferFormContainer}>
        {/* Transfer From Section */}
        <Box className={styles.sectionInner}>
          <Box className={styles.sectionHeader} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon name="bank" width="24" height="24" bgColor={"#0051FF"} />
              <Typography variant="h6">{t('paymentDetails')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon 
                name="chevronUp" 
                width="20" 
                height="20" 
                bgColor={"#0051FF"}
              />
            </Box>
          </Box>
          <Box className={styles.sectionContent}>
            <Box className={styles.transferModeContainer}>
              <Box onClick={() => setTransferMode(0)} className={`${styles.transferModeButton} ${transferMode === 0 ? styles.active : ''}`}>{t('singleToMultiple')}</Box>
              <Box onClick={() => setTransferMode(1)} className={`${styles.transferModeButton} ${transferMode === 1 ? styles.active : ''}`}>{t('multipleToSingle')}</Box>
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
                  rules={getRulesForField('sourceAccount', () => transferDetails)}
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

        {/* Batch List Section - Only show below Transfer From for Multiple to Single */}
        {transferMode === 1 && (
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
                  <Typography variant="body2">{paymentId}</Typography>
                  <Box onClick={() => setPaymentId('')} className={styles.editButton}>
                    <Icon name="edit" width="18" height="18" bgColor={"#0051FF"} />
                  </Box>
                </Box>
              }
            />
          </>
        )}

        <Box className={styles.sectionDivider} />

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
                  rules={getRulesForField('destinationAccount', () => transferDetails)}
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
                  <Typography variant="body2">{paymentId}</Typography>
                  <Box onClick={() => setPaymentId('')} className={styles.editButton}>
                    <Icon name="edit" width="18" height="18" bgColor={"#0051FF"} />
                  </Box>
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
                rules={getRulesForField('paymentDate', () => transferDetails)}
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
    </Box>
  );
};

export default PaymentDetailsForm;
