import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  FormControl,
  InputLabel,
  Popper,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import styles from './AccountsAndBalancesList.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';

export type StatementStatus =
  | 'FINAL'
  | 'INTERIM'
  | 'BOTH';

export type TransactionTypes = 'Invoice' | 'Refund' | 'Salary';

export interface FilterValues {
  fromDate: string;
  toDate: string;
  fromNumber: string;
  toNumber: string;
  statementStatusCode: StatementStatus | '';
}

export interface StatementFilterDialogProps {
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
  fromDate: '',
  toDate: '',
  fromNumber: '',
  toNumber: '',
  statementStatusCode: '',
};

const STATEMENT_STATUS_LABELS: Record<StatementStatus, string> = {
  FINAL: 'final',
  INTERIM: 'interim',
  BOTH: 'both',
};

export default function StatementFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  statementStatuses = [
    'FINAL',
    'INTERIM',
    'BOTH',
  ],
}: StatementFilterDialogProps) {
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
          {t('filter')} {t('statements')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <Box className={styles.fiilterInnerContainer}>
            <Typography variant="body2" className={styles.inputLabel}>
              {t('closingBalanceDate')}
            </Typography>
            <DatePickerComponent
              label={t('from')}
              value={values.fromDate}
              onChange={(value: any) => {}}
              fullWidth
              actions={[
                {
                  label: t('cancel'),
                  onClick: () => {},
                  variant: 'tertiary',
                },
                {
                  label: t('ok'),
                  onClick: () => {},
                  variant: 'tertiary',
                },
              ]} 
            />
            <DatePickerComponent
              label={t('to')}
              value={values.toDate}
              onChange={(value: any) => {}}
              fullWidth
              actions={[
                {
                  label: t('cancel'),
                  onClick: () => {},
                  variant: 'tertiary',
                },
                {
                  label: t('ok'),
                  onClick: () => {},
                  variant: 'tertiary',
                },
              ]} 
            />
          </Box>
          <Box className={styles.fiilterInnerContainer + ' ' + styles.marginBottomSpace1}>
            <Typography variant="body2" className={styles.inputLabel}>
              {t('statementNumber')}
            </Typography>
            <TextField
              label={t('from')}
              value={values.fromNumber}
              onChange={handleText('fromNumber')}
              fullWidth
              size="medium"
            />
            <TextField
              label={t('to')}
              value={values.toNumber}
              onChange={handleText('toNumber')}
              fullWidth
              size="medium"
            />
          </Box>
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
