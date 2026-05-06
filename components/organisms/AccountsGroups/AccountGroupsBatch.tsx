'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AccountGroups.module.scss';
import {
  Box,
  Typography,
  useTheme,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Icon } from '@atoms/index';
import CustomPagination from 'components/lib/Tables/TablePagination';
import { AccountGroupAccountDetails } from 'types/accountGroupDetails';
import Image from 'next/image';
import DeleteIcon from 'public/icons/icn_bin.svg';
import DeleteIconRed from 'public/icons/icn_bin_red.svg';
import PencilIcon from 'public/icons/col-icon-left-pencil.svg';
import AddAccountsIcon from 'public/icons/icn_add_accounts.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

const AccountGroupsBatch = ({
  title = '',
  accountData,
  edit = true,
  accordion = false,
  isEditable = false,
  index,
  handleCheckboxChange,
  handleDeleteSubGroup,
  handleDeleteSelectedAccounts,
  handleRenameSubGroup,
}: {
  title?: string;
  accountData: AccountGroupAccountDetails[];
  edit: boolean;
  accordion?: boolean;
  index?: number;
  isEditable?: boolean;
  handleCheckboxChange: (id: string) => void;
  handleDeleteSubGroup: () => void;
  handleDeleteSelectedAccounts: () => void;
  handleRenameSubGroup?: () => void;
}) => {
  const t = useTranslations('accountGroups');
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [expandCollapseIndex, setExpandCollapseIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState<15 | 30 | 50>(15);
  const testIdPrefix = 'manage-account-groups-batch';

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setExpandCollapseIndex(null); // Collapse any expanded item when page changes
  };

  const showSubGroupActions = isEditable && !!handleRenameSubGroup;
  const canEdit = isEditable === true;

  const handleAccordionChange = () => {
    if (!accordion) return;
    setExpanded(!expanded);
  };

  const slectedAccountsCount = accountData.filter((account) => account.checkbox).length;

  const handleRowsPerPageChange = (newPerPage: number) => {
    // Ensure only allowed values are set
    if (newPerPage === 15 || newPerPage === 30 || newPerPage === 50) {
      setPerPage(newPerPage);
      setPage(1); // Reset to first page when rows per page changes
      setExpandCollapseIndex(null); // Collapse any expanded item when rows per page changes
    }
  };

  const batchItemLabelList: { label: string; valueKey: keyof AccountGroupAccountDetails }[] = [
    { label: 'accountName', valueKey: 'name' },
    { label: 'accountNumber', valueKey: 'accNumber' },
    { label: 'branchSortCode', valueKey: 'sortCode' },
    { label: 'bicSwift', valueKey: 'bic' },
    { label: 'currency', valueKey: 'currency' },
    { label: 'countryRegion', valueKey: 'countryRegion' },
  ];

  return (
    <>
      <Box
        className={styles.batchContainer}
        sx={{ border: 0 }}
        data-testid={buildTestId(testIdPrefix, 'container')}
      >
        <Box className={styles.batchInnerContent}>
          <Accordion expanded={expanded} onChange={handleAccordionChange}>
            <AccordionSummary
              component="div"
              expandIcon={accordion ? expanded ? <ExpandLess /> : <ExpandMoreIcon /> : null}
              sx={{
                minHeight: '48px !important',
                height: '48px',
                px: 2,
                py: 0,
                '&.Mui-expanded': {
                  minHeight: '48px',
                  height: '48px',
                },
                '& .MuiAccordionSummary-content': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  my: 0,
                },
                '& .MuiAccordionSummary-content.Mui-expanded': {
                  my: 0,
                },
                '& .MuiAccordionSummary-expandIconWrapper': {
                  order: 3,
                  color: '#0051FF',
                },
              }}
            >
              <Box display="block" width="100%">
                {!edit ? (
                  <Box
                    className={styles.batchHeaderTitle}
                    data-testid={buildTestId(testIdPrefix, 'header-title')}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon
                        name="accounts"
                        width="21px"
                        height="21px"
                        bgColor={theme.palette.text.secondary}
                      />
                      <Typography variant="h2" className={styles.batchHeaderTitleText}>
                        {title === '' ? t('addedAccounts') : title}
                        {accountData.length === 0 && (
                          <>
                            {'('}
                            <Typography
                              variant="caption"
                              className={styles.stepDescription}
                              fontSize={18}
                            >
                              {accountData.length} {t('accounts')}
                            </Typography>
                            {')'}
                          </>
                        )}
                      </Typography>
                      {accountData.length >= 1 && (
                        <Button
                          buttonVariant="error-tertiary"
                          disabled={!canEdit || slectedAccountsCount === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSelectedAccounts();
                          }}
                        >
                          {t('remove')} ({slectedAccountsCount})
                        </Button>
                      )}
                    </Box>
                    {showSubGroupActions && (
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        data-testid={buildTestId(testIdPrefix, 'subgroup-actions')}
                      >
                        <Button
                          data-testid={buildTestId(testIdPrefix, 'rename-subgroup-button')}
                          buttonVariant="tertiary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameSubGroup?.();
                          }}
                          startIcon={<Image src={PencilIcon} alt="Rename" width={24} height={24} />}
                          style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                        >
                          {t('rename')}
                        </Button>
                        <Button
                          data-testid={buildTestId(testIdPrefix, 'add-accounts-button')}
                          buttonVariant="tertiary"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          startIcon={
                            <Image
                              src={AddAccountsIcon}
                              alt="Add Accounts"
                              width={24}
                              height={24}
                            />
                          }
                          style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                        >
                          {t('addAccounts')}
                        </Button>
                        <Button
                          data-testid={buildTestId(testIdPrefix, 'delete-subgroup-button')}
                          buttonVariant="tertiary"
                          onClick={() => handleDeleteSubGroup()}
                          startIcon={<Image src={DeleteIcon} alt="Delete" width={24} height={24} />}
                          style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                        >
                          {t('delete')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    className={styles.batchHeaderTitle}
                    data-testid={buildTestId(testIdPrefix, 'header-title')}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon
                        name="accounts"
                        width="21px"
                        height="21px"
                        bgColor={theme.palette.text.secondary}
                      />
                      <Typography
                        variant="h2"
                        className={styles.batchHeaderTitleText}
                        data-testid={buildTestId(testIdPrefix, 'header-title-text')}
                      >
                        {title === '' ? t('addedAccounts') : title}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Button
                        buttonVariant="tertiary"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        startIcon={<Image src={PencilIcon} alt="Rename" width={24} height={24} />}
                        style={{ padding: '6px 16px', minWidth: '32px', height: '32px' }}
                        data-testid={buildTestId(testIdPrefix, 'edit-subgroup-button')}
                      >
                        {t('edit')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails
              sx={{ p: 0 }}
              data-testid={buildTestId(testIdPrefix, 'accordion-details')}
            >
              <Box className={styles.batchInnerBody}>
                <Box className={styles.batchInnerBodyContent}>
                  <Box className={styles.batchList} sx={{ border: 0 }}>
                    {accountData
                      ?.slice(page * perPage, page * perPage + perPage)
                      .map((account: AccountGroupAccountDetails, idx: number) => {
                        const globalIdx = page * perPage + idx;
                        return (
                          <Box
                            className={styles.batchListItem}
                            key={account.id ?? globalIdx}
                            data-testid={buildTestId(testIdPrefix, `account-${globalIdx}`)}
                          >
                            <Box
                              className={styles.batchListItemHeader}
                              onClick={() => {
                                setExpandCollapseIndex(
                                  expandCollapseIndex === globalIdx ? null : globalIdx,
                                );
                              }}
                            >
                              <Box className={styles.batchListItemHeaderLeft}>
                                <Checkbox
                                  checked={account.checkbox || false}
                                  disabled={!canEdit}
                                  onChange={() => handleCheckboxChange(account.id)}
                                  sx={{ p: 0 }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Typography variant="h3" className={styles.batchListItemHeaderText}>
                                  {globalIdx + 1}. {t('accountName')}
                                </Typography>
                              </Box>
                              <Box className={styles.batchListItemHeaderRight}>
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
                                  {account.accNumber}
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
                              className={`${styles.batchListItemContent} ${expandCollapseIndex === globalIdx ? styles.expanded : ''}`}
                            >
                              {batchItemLabelList.map((item, itemIdx) => (
                                <Box
                                  className={styles.batchListItemContentRow}
                                  key={itemIdx}
                                  data-testid={buildTestId(
                                    testIdPrefix,
                                    `account-${globalIdx}-detail-${item.valueKey}`,
                                  )}
                                >
                                  <Typography
                                    variant="body2"
                                    className={styles.batchListItemContentRowLabel}
                                  >
                                    {t(item.label)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    className={styles.batchListItemContentRowValue}
                                  >
                                    {account[item.valueKey]}
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
              <Box
                className={styles.batchInnerFooter}
                data-testid={buildTestId(testIdPrefix, 'inner-footer')}
              >
                {accountData?.length !== 0 && (
                  <CustomPagination
                    rows={accountData}
                    page={page}
                    rowsPerPage={perPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </>
  );
};
export default AccountGroupsBatch;
