import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Popper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import styles from './AccountsAndBalancesList.module.scss';
import { Button } from 'components/lib/Forms';

export type StatementStatus =
  | 'FINAL'
  | 'INTERIM'
  | 'BOTH';

export type TransactionTypes = 'Invoice' | 'Refund' | 'Salary';

export interface FilterValues {
  counterPartyName: string;
  accountNumber: string;
  transactionTypeList: TransactionTypes | '';
  statementStatusCode: StatementStatus | '';
  debitCredit: 'Debit' | 'Credit' | '';
}

export interface AccountsAndBalancesFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  transactionTypeList?: TransactionTypes[];
  statementStatuses?: StatementStatus[];
}

const DEFAULT_VALUES: FilterValues = {
  counterPartyName: '',
  accountNumber: '',
  transactionTypeList: '',
  statementStatusCode: '',
  debitCredit: '',
};

const STATEMENT_STATUS_LABELS: Record<StatementStatus, string> = {
  FINAL: 'final',
  INTERIM: 'interim',
  BOTH: 'both',
};

export default function AccountsAndBalancesFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  transactionTypeList = ['Invoice', 'Refund', 'Salary'],
  statementStatuses = [
    'FINAL',
    'INTERIM',
    'BOTH',
  ],
}: AccountsAndBalancesFilterDialogProps) {
  const t = useTranslations('accountsAndBalances');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  // Reset when dialog opens (so repeated opens reflect latest defaults)
  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  // Handlers
  const handleText = (key: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSelect = (key: keyof FilterValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value as any }));
  };

  const handleClear = () => setValues(DEFAULT_VALUES);

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" className={styles.filterDialogPopper}>
      <Paper elevation={0} className={styles.filterDialogContainer}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle}>
          {t('filter')} {t('accountsAndBalances')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('accountName')}
            value={values.counterPartyName}
            onChange={handleText('counterPartyName')}
            fullWidth
            size="medium"
          />
          <TextField
            label={t('accountNumber')}
            value={values.accountNumber}
            onChange={handleText('accountNumber')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="payment-category-label">{t('transactionType')}</InputLabel>
            <Select
              labelId="payment-category-label"
              label={t('transactionType')}
              value={values.transactionTypeList}
              onChange={handleSelect('transactionTypeList')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {transactionTypeList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-label">{t('statementStatus')}</InputLabel>
            <Select
              labelId="status-label"
              label={t('statementStatus')}
              value={values.statementStatusCode}
              onChange={handleSelect('statementStatusCode')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statementStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(STATEMENT_STATUS_LABELS[s])}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="debit-credit-label">{t('debit')} / {t('credit')}</InputLabel>
            <Select
              labelId="debit-credit-label"
              label={`${t('debit')} / ${t('credit')}`}
              value={values.debitCredit}
              onChange={handleSelect('debitCredit')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {[t('debit'), t('credit'), t('both')].map((dc) => (
                <MenuItem key={dc} value={dc}>
                  {dc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
