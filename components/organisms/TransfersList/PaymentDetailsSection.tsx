'use client';

import { Box, Typography, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, FormHelperText } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Controller, UseFormReturn } from 'react-hook-form';
import RHFProvider from 'components/common/forms/RHFProvider';
import { CreateJournyForm } from 'components/common';
import { Button } from 'components/lib/Forms';
import AccountInfoDropdown from 'components/common/AccountDropDown';
import { Icon } from '@atoms/index';
import DatePicker from 'components/lib/DatePicker';
import CustomPagination from 'components/lib/Tables/TablePagination';
import { getRulesForField } from 'src/utils/transferCreateLogic';
import styles from './CreateTransfers.module.scss';
import { Dayjs } from 'dayjs';

interface PaymentDetailsSectionProps {
  formMethods: UseFormReturn<any>;
  transferDetails: any;
  transferMode: number;
  transferFromFields: any[];
  transferToFields: any[];
  accountInfoOptions: any[];
  batchItems: any[];
  searchBatch: string;
  paymentId: string;
  paymentDate: Dayjs | null;
  expandedBatchItem: number | false;
  paginatedBatchItems: any[];
  filteredBatchItems: any[];
  currentPage: number;
  rowsPerPage: 15 | 30 | 50;
  totalBatchAmount: number;
  onChangeField: (field: string, value: any) => void;
  onSetTransferMode: (mode: number) => void;
  onSetSearchBatch: (search: string) => void;
  onSetPaymentId: (id: string) => void;
  onSetExpandedBatchItem: (item: number | false) => void;
  onAddToBatch: () => void;
  onClearBatch: () => void;
  onRemoveBatchItem: (id: number) => void;
  onExpandBatchItem: (id: number) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onPaymentDateChange: (date: any) => void;
  iconChevronDown: any;
  iconSearch: any;
  disabled?: boolean;
  isSavedInstruction?: boolean;
  instructionIndex?: number;
}

const PaymentDetailsSection = ({
  formMethods,
  transferDetails,
  transferMode,
  transferFromFields,
  transferToFields,
  accountInfoOptions,
  batchItems,
  searchBatch,
  paymentId,
  paymentDate,
  expandedBatchItem,
  paginatedBatchItems,
  filteredBatchItems,
  currentPage,
  rowsPerPage,
  totalBatchAmount,
  onChangeField,
  onSetTransferMode,
  onSetSearchBatch,
  onSetPaymentId,
  onSetExpandedBatchItem,
  onAddToBatch,
  onClearBatch,
  onRemoveBatchItem,
  onExpandBatchItem,
  onPageChange,
  onRowsPerPageChange,
  onPaymentDateChange,
  iconChevronDown,
  iconSearch,
  disabled = false,
  isSavedInstruction = false,
  instructionIndex = 0,
}: PaymentDetailsSectionProps) => {
  const t = useTranslations('transfers');

  return (
    <Box className={styles.transferFormContainer}>
      {/* Transfer From Section */}
      <Box className={styles.sectionInner}>
        <Box className={styles.sectionHeader}>
          <Icon name="bank" width="24" height="24" bgColor={"#0051FF"} />
          <Typography variant="h6">
            {isSavedInstruction ? `Instruction ${instructionIndex + 1}` : t('paymentDetails')}
          </Typography>
        </Box>
        <Box className={styles.sectionContent}>
          <Box className={styles.transferModeContainer}>
            <Box onClick={() => onSetTransferMode(0)} className={`${styles.transferModeButton} ${transferMode === 0 ? styles.active : ''}`}>{t('singleToMultiple')}</Box>
            <Box onClick={() => onSetTransferMode(1)} className={`${styles.transferModeButton} ${transferMode === 1 ? styles.active : ''}`}>{t('multipleToSingle')}</Box>
          </Box>
          <Box className={styles.divider} />
          <Box className={styles.sectionSubHeader}>
            <Icon name="accounts" width="24" height="24"  bgColor={"#0051FF"} />
            <Typography variant="h6">{t(transferMode === 0 ? 'transferFrom' : 'transferTo')}</Typography>
          </Box>
          <Box className={styles.accountDropdownContainer}>
            <Box className={styles.accountDropdown}>
              {isSavedInstruction ? (
                // For saved instructions, display the selected account without form control
                <AccountInfoDropdown 
                  disabled={disabled} 
                  label={t('selectSourceAccount')} 
                  value={transferDetails?.sourceAccount || ''} 
                  options={accountInfoOptions} 
                  onChange={(e: any) => onChangeField('sourceAccount', e.target.value)} 
                  iconChevronDown={iconChevronDown} 
                  startIcon={iconSearch} 
                  fullWidth 
                />
              ) : (
                // For current form being edited, use form control
                <Controller
                  name="sourceAccount"
                 control={formMethods.control}
                  rules={getRulesForField('sourceAccount', () => transferDetails)}
                  render={({ field, fieldState: { error } }) => (
                    <Box>
                      <AccountInfoDropdown disabled={disabled} label={t('selectSourceAccount')} value={field.value || ''} options={accountInfoOptions} onChange={(e: any) => { field.onChange(e.target.value); onChangeField('sourceAccount', e.target.value); }} iconChevronDown={iconChevronDown} startIcon={iconSearch} fullWidth />
                      {error && <FormHelperText error sx={{ mt: 0.5 }}>{error.message}</FormHelperText>}
                    </Box>
                  )}
                />
              )}
            </Box>
          </Box>

          {/* Display saved Transfer From account details for saved instructions */}
          {/* {isSavedInstruction && transferDetails?.sourceAccountName && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 2, padding: 2, backgroundColor: '#F5F7FA', borderRadius: '8px' }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('accountName') || 'Account Name'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.sourceAccountName || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('accountNumber') || 'Account Number'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.sourceAccountNumber || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('branchCode') || 'Branch/Sort Code'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.sourceAccountBranch || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('bicSwift') || 'BIC/SWIFT'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.sourceAccountBic || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('country') || 'Country/Region'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.sourceAccountCountry || '-'}</Typography>
              </Box>
            </Box>
          )} */}

          {/* Display saved Transfer From fields (Transfer Currency, Debit Currency, Debit Reference) for saved instructions */}
          {/* {isSavedInstruction && (transferDetails?.transferCurrency || transferDetails?.debitCurrency || transferDetails?.debitReference) && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 2, padding: 2, backgroundColor: '#F5F7FA', borderRadius: '8px' }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('currency') || 'Transfer Currency'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.transferCurrency || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('debitCurrency') || 'Debit Currency'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.debitCurrency || '-'}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('debitReference') || 'Debit Reference'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.debitReference || '-'}</Typography>
              </Box>
            </Box>
          )} */}

          {!isSavedInstruction && (
          <RHFProvider methods={formMethods} onSubmit={() => {}} asForm={false}>
            <Box className={styles.createTransfersFormCont}>
              <CreateJournyForm 
                fields={transferFromFields as any} 
                onChange={onChangeField} 
                mode="edit" 
                ShowActionBtns={false} 
                renderWithRHF 
                formMethods={formMethods}
                rulesProvider={(name, getVals) => getRulesForField(name as any, getVals)}
              />
            </Box>
          </RHFProvider>
          )}
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
              {isSavedInstruction ? (
                // For saved instructions, display the selected account without form control
                <AccountInfoDropdown 
                  disabled={disabled} 
                  label={t('searchAccounts')} 
                  value={transferDetails?.destinationAccount || ''} 
                  options={accountInfoOptions} 
                  onChange={(e: any) => onChangeField('destinationAccount', e.target.value)} 
                  iconChevronDown={iconChevronDown} 
                  startIcon={iconSearch} 
                  fullWidth 
                />
              ) : (
                // For current form being edited, use form control
                <Controller
                  name="destinationAccount"
                  control={formMethods.control}
                  rules={getRulesForField('destinationAccount', () => transferDetails)}
                  render={({ field, fieldState: { error } }) => (
                    <Box>
                      <AccountInfoDropdown disabled={disabled} label={t('searchAccounts')} value={field.value || ''} options={accountInfoOptions} onChange={(e: any) => { field.onChange(e.target.value); onChangeField('destinationAccount', e.target.value); }} iconChevronDown={iconChevronDown} startIcon={iconSearch} fullWidth />
                      {error && <FormHelperText error sx={{ mt: 0.5 }}>{error.message}</FormHelperText>}
                    </Box>
                  )}
                />
              )}
            </Box>
          </Box>

          {/* Display saved Transfer To fields for saved instructions */}
          {isSavedInstruction && (transferDetails?.transferAmount || transferDetails?.creditReference) && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 2, padding: 2, backgroundColor: '#F5F7FA', borderRadius: '8px' }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('transferAmount') || 'Transfer Amount'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.transferAmount || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('creditReference') || 'Credit Reference'}</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{transferDetails.creditReference || '-'}</Typography>
              </Box>
            </Box>
          )}

          {!isSavedInstruction && (
          <>
          <RHFProvider methods={formMethods} onSubmit={() => {}} asForm={false}>
            <Box className={styles.createTransfersFormCont}>
              <CreateJournyForm 
                fields={transferToFields as any} 
                onChange={onChangeField} 
                mode="edit" 
                ShowActionBtns={false} 
                renderWithRHF 
                formMethods={formMethods}
                disabled={disabled}
                rulesProvider={(name, getVals) => getRulesForField(name as any, getVals)}
              />
            </Box>
          </RHFProvider>
          <Box className={styles.batchButtonsContainer}>
            <Button disabled={disabled} buttonVariant="tertiary" startIcon={<Icon name="delete" width="20" height="20"  bgColor={"#0051FF"} />} onClick={onClearBatch} className={styles.batchButton}>{t('clearBatch')}</Button>
            <Button disabled={disabled} buttonVariant="secondary" startIcon={<Icon name="add" width="20" height="20" bgColor={"#0051FF"} />} onClick={onAddToBatch} className={styles.batchButton}>{t('addToBatch')}</Button>
          </Box>
          </>
          )}
        </Box>
      </Box>

      {/* Batch List Section - Show only for non-saved or when batch items exist */}
      {(!isSavedInstruction || (isSavedInstruction && batchItems.length > 0)) && (
      <Box className={styles.batchSectionContainer}>
        <Box className={styles.batchHeader}>
          <Box className={styles.batchHeaderContainer}>
            <Box className={styles.paymentIdSection}>
              <Icon name="accounts" width="24" height="24" bgColor={"#0051FF"} />
              <Typography variant="body2">{paymentId}</Typography>
              <Box onClick={() => onSetPaymentId('')} className={styles.editButton}>
                <Icon name="edit" width="18" height="18" bgColor={"#0051FF"} />
              </Box>
            </Box>
            <Box className={styles.searchAndFilterSection}>
              <TextField disabled={disabled} fullWidth value={searchBatch} onChange={(e) => onSetSearchBatch(e.target.value)} placeholder={t('searchWithinBatch')} variant="outlined" size="small" className={styles.searchField} InputProps={{ startAdornment: (<InputAdornment position="start"><Icon name="search" width="18" height="18"  bgColor={"#0051FF"} /></InputAdornment>) }} />
              <Button disabled={disabled} buttonVariant="tertiary" startIcon={<Icon name="filter" width="18" height="18"  bgColor={"#0051FF"} />} className={styles.filterButton}>{t('filter')}</Button>
            </Box>
          </Box>
        </Box>
        <Box className={styles.batchItemsContainer}>
          {paginatedBatchItems.length > 0 ? (
            paginatedBatchItems.map((item, index) => (
              <Accordion key={item.id} expanded={expandedBatchItem === item.id} onChange={onExpandBatchItem(item.id)} className={styles.accordion}>
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
                      <Box onClick={(e) => { e.stopPropagation(); onRemoveBatchItem(item.id); }} className={styles.deleteButton}>
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
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          )}
        </Box>
      </Box>
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
                control={formMethods.control}
                rules={getRulesForField('paymentDate', () => transferDetails)}
                render={({ field, fieldState: { error } }) => (
                  <Box>
                    <DatePicker label="" value={field.value || paymentDate} onChange={(date) => { field.onChange(date); onPaymentDateChange(date); }} placeholder="31/05/2023" fullWidth />
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

export default PaymentDetailsSection;
