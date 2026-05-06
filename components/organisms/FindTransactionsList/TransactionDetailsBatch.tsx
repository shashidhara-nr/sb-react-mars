'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './TransactionDetails.module.scss';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import { Icon } from '@atoms/index';
import theme from 'components/lib/styles/theme';
import CustomPagination from 'components/lib/Tables/TablePagination';
import { mockPaymentDetailsData as mockPaymentDetails } from '@lib/mock/mockPaymentDetails';
import TransactionDetailsBatchFilterDialog from './TransactionDetailsBatchFilterDialog';

interface TransactionDetailsBatchItem { 
  accountName: string;
  accountNumber: string;
  branchSortCode: string;
  bicSwift: string;
  beneficiaryCode: string;
  beneficiaryType: string;
  beneficiaryCdiReference: string;
  transferAmount: number;
  transactionCurrency: string;
  currency: string;
  countryRegion: string;
  feeOption: string;
  id?: string;
}

const TransactionDetailsBatch = () => {
  const t = useTranslations('findTransaction');
  const [searchText, setSearchText] = useState('');
  const [expandCollapseIndex, setExpandCollapseIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState<15 | 30 | 50>(15);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const batchItemLabelList: (keyof TransactionDetailsBatchItem)[] = [
    'branchSortCode',
    'bicSwift',
    'beneficiaryType',
    'beneficiaryCdiReference',
    'transferAmount',
    'transactionCurrency'
  ];

  const filteredList = mockPaymentDetails.filter((item: any) =>
    item.accountBalance?.number
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage);
    setExpandCollapseIndex(null);
  };

  const handleRowsPerPageChange = (newPerPage: number) => {
    if (newPerPage === 15 || newPerPage === 30 || newPerPage === 50) {
      setPerPage(newPerPage);
      setPage(0);
      setExpandCollapseIndex(null);
    }
  };

  const handleFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFilterDialogOpen(true);
    setFilterAnchorEl(event.currentTarget);
  }, []);

  return (
    <Box className={styles.batchContainer}>
      <Box className={styles.batchInnerContent}>
        {/* Header */}
        <Box className={styles.batchInnerHeader}>
          <Box className={styles.batchInnerLeft}>
            <Icon
              name="accounts"
              width="24px"
              height="24px"
              bgColor={theme.palette.text.secondary}
            />
            <Typography variant="h6" className={styles.batchInnerHeaderTitle}>
              [{t('transactionID')}]
            </Typography>
          </Box>
          <Box className={styles.batchInnerRight}>
            <TextField
              fullWidth
              placeholder={t('searchWithinBatch')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon
                      name="search"
                      width="24px"
                      height="24px"
                      bgColor={theme.palette.text.secondary}
                    />
                  </InputAdornment>
                ),
              }}
              className={styles.searchField}
            />

            <Box onClick={handleFilterOpen} className={styles.filterBtn}>
              <Icon
                name="filter"
                width="28px"
                height="28px"
                bgColor={theme.palette.secondary.main}
              />
              {t('filter')}
            </Box>
              
            <TransactionDetailsBatchFilterDialog
              open={filterDialogOpen}
              anchorEl={filterAnchorEl}
              onClose={() => setFilterDialogOpen(false)}
              onApply={(newFilters) => setFilters(newFilters)}
              initialValues={filters}
            />
          </Box>
        </Box>

        {/* Collapsible list */}
        <Box className={styles.batchList}>
          {filteredList
            .slice(page * perPage, page * perPage + perPage)
            .map((account: TransactionDetailsBatchItem, idx) => {
              const globalIdx = page * perPage + idx;

              return (
                <Box className={styles.batchListItem} key={account.id ?? globalIdx}>
                  <Box
                    className={styles.batchListItemHeader}
                    onClick={() =>
                      setExpandCollapseIndex(
                        expandCollapseIndex === globalIdx ? null : globalIdx
                      )
                    }
                  >
                    <Box className={styles.batchListItemHeaderLeft}>
                      <Icon
                        name="user"
                        width="24px"
                        height="24px"
                        bgColor={theme.palette.text.secondary}
                      />
                      <Typography variant="h3" className={styles.batchListItemHeaderText}>
                        {globalIdx + 1}. {account.accountName}
                      </Typography>
                    </Box>

                    <Box className={styles.batchListItemHeaderRight}>
                      <Typography
                        variant="body2"
                        className={styles.slashBlue}
                      >
                        |
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.batchListItemHeaderLabel}
                      >
                        {t('accountNumber')}:
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.batchListItemHeaderValue}
                      >
                        {account.accountNumber}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.slashBlue}
                      >
                        |
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.batchListItemHeaderLabel}
                      >
                        {t('benCode')}:
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.batchListItemHeaderValue}
                      >
                        {account.beneficiaryCode}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.slashBlue}
                      >
                        |
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.batchListItemHeaderLabel}
                      >
                        {t('transferAmount')}:
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.batchListItemHeaderValue}
                      >
                        {account.transferAmount}
                      </Typography>
                      <Icon
                        name="arrow"
                        width="24px"
                        height="24px"
                        bgColor={theme.palette.secondary.main}
                      />
                    </Box>
                  </Box>

                  <Box
                    className={`${styles.batchListItemContent} ${
                      expandCollapseIndex === globalIdx ? styles.expanded : ''
                    }`}
                  >
                    {batchItemLabelList.map((item, itemIdx) => (
                      <Box
                        className={styles.batchListItemContentRow}
                        key={itemIdx}
                      >
                        <Typography
                          variant="body2"
                          className={styles.batchListItemContentRowLabel}
                        >
                          {t(item)}
                        </Typography>
                        <Typography
                          variant="body2"
                          className={styles.batchListItemContentRowValue}
                        >
                          {item === 'transferAmount'
                            ? account.transferAmount
                            : account[item]}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
        </Box>

        {/* Pagination */}
        <Box className={styles.batchInnerFooter}>
          <CustomPagination
            rows={filteredList}
            page={page}
            rowsPerPage={perPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TransactionDetailsBatch;