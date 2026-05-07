'use client';

import { ChangeEvent, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CreateTransfers.module.scss';
import { Box, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, Typography, Button } from '@mui/material';
import { Icon } from '@atoms/index';
import CustomPagination from 'components/lib/Tables/TablePagination';

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

interface BatchListSectionProps {
  transferMode: number; // 0: Single to Multiple, 1: Multiple to Single
  searchBatch: string;
  setSearchBatch: (search: string) => void;
  paginatedBatchItems: BatchItem[];
  expandedBatchItem: number | false;
  handleExpandBatchItem: (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  handleRemoveBatchItem: (id: number) => void;
  filteredBatchItems: BatchItem[];
  currentPage: number;
  rowsPerPage: 15 | 30 | 50;
  handlePageChange: (_: ChangeEvent<unknown>, newPage: number) => void;
  handleRowsPerPageChange: (newRowsPerPage: number) => void;
  totalBatchAmount: number;
  // Optional header customization - if not provided, no custom header is rendered
  headerContent?: React.ReactNode;
}

const BatchListSection: React.FC<BatchListSectionProps> = ({
  transferMode,
  searchBatch,
  setSearchBatch,
  paginatedBatchItems,
  expandedBatchItem,
  handleExpandBatchItem,
  handleRemoveBatchItem,
  filteredBatchItems,
  currentPage,
  rowsPerPage,
  handlePageChange,
  handleRowsPerPageChange,
  totalBatchAmount,
  headerContent,
}) => {
  const t = useTranslations('transfers');

  // Determine labels based on transfer mode
  const isSingleToMultiple = transferMode === 0;
  const debitAmountLabel = isSingleToMultiple ? t('transferAmount') : t('debitAmount');
  const creditAmountLabel = isSingleToMultiple ? t('creditAmount') : t('transferAmount');

  return (
    <Box className={styles.batchSectionContainer}>
      <Box className={styles.batchHeader}>
        <Box className={styles.batchHeaderContainer}>
          {headerContent}
          <Box className={styles.searchAndFilterSection}>
            <TextField fullWidth value={searchBatch} onChange={(e) => setSearchBatch(e.target.value)} placeholder={t('searchWithinBatch')} variant="outlined" size="small" className={styles.searchField} InputProps={{ startAdornment: (<InputAdornment position="start"><Icon name="search" width="18" height="18"  bgColor={"#0051FF"} /></InputAdornment>) }} />
            <Button variant="outlined" startIcon={<Icon name="filter" width="18" height="18"  bgColor={"#0051FF"} />} className={styles.filterButton}>{t('filter')}</Button>
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
                    <Typography className={styles.label}>{debitAmountLabel}</Typography>
                    <Typography className={styles.value}>{item.currency}</Typography>
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
                    <Typography className={styles.fieldLabel}>{creditAmountLabel}</Typography>
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
  );
};

export default BatchListSection;
