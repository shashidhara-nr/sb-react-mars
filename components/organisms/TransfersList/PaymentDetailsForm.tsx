'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CreateTransfers.module.scss';
import { Box, Typography, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, Button as MuiButton, FormHelperText, Tooltip } from '@mui/material';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import RHFProvider from 'components/common/forms/RHFProvider';
import { CreateJournyForm } from 'components/common';
import CustomPagination from 'components/lib/Tables/TablePagination';
import { Controller, UseFormReturn } from 'react-hook-form';
import DatePicker from 'components/lib/DatePicker';
import { Dayjs } from 'dayjs';
import { COLORS } from './constant';

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
                <Typography variant="body2">{paymentId}</Typography>
                <Box onClick={() => setPaymentId('')} className={styles.editButton}>
                  <Icon name="edit" width="18" height="18" bgColor={"#0051FF"} />
                </Box>
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
