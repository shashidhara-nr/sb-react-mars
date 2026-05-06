'use client';

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
import styles from './TransactionList.module.scss';

export interface TransferFilterValues {
  instructionId: string;
  batchId: string;
  transactionId: string;
  debitAccountNumber: string;
  creditAccountNumber: string;
  accountNumber: string;
  amount: string;
  paymentType: string;
}

const DEFAULT_VALUES: TransferFilterValues = {
  instructionId: '',
  batchId: '',
  transactionId: '',
  debitAccountNumber: '',
  creditAccountNumber: '',
  accountNumber: '',
  amount: '',
  paymentType: '',
};

export default function TransferFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: TransferFilterValues) => void;
  initialValues?: Partial<TransferFilterValues>;
}) {
  const t = useTranslations('findTransaction');

  const [values, setValues] = React.useState<TransferFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText =
    (key: keyof TransferFilterValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSelect =
    (key: keyof TransferFilterValues) =>
    (e: SelectChangeEvent<string>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
      <Paper className={styles.filterDialogContainer}>
        <IconButton onClick={onClose} className={styles.filterCloseButton}>
          <CloseIcon />
        </IconButton>

        <Typography className={styles.filterDialogTitle}>
          {t('filter')} {t('tabTransfers')}
        </Typography>

        <Box className={styles.filterDialogContent}>
          <TextField label={t('instructionId')} value={values.instructionId} onChange={handleText('instructionId')} />
          <TextField label={t('batchId')} value={values.batchId} onChange={handleText('batchId')} />
          <TextField label={t('transactionId')} value={values.transactionId} onChange={handleText('transactionId')} />
          <TextField label={t('debitAccountNumber')} value={values.debitAccountNumber} onChange={handleText('debitAccountNumber')} />
          <TextField label={t('creditAccountNumber')} value={values.creditAccountNumber} onChange={handleText('creditAccountNumber')} />

          <FormControl>
            <InputLabel>{t('accountNumber')}</InputLabel>
            <Select label={t('accountNumber')} displayEmpty={false} value={values.accountNumber} onChange={handleSelect('accountNumber')}>
              <MenuItem value="">—</MenuItem>
              <MenuItem value="12345678">12345678</MenuItem>
              <MenuItem value="87654321">87654321</MenuItem>
            </Select>
          </FormControl>

          <TextField label={t('amount')} value={values.amount} onChange={handleText('amount')} />

          <FormControl>
            <InputLabel>{t('paymentType')}</InputLabel>
            <Select label={t('paymentType')} displayEmpty={false} value={values.paymentType} onChange={handleSelect('paymentType')}>
              <MenuItem value="">—</MenuItem>
              <MenuItem value="Invoice">Invoice</MenuItem>
              <MenuItem value="Salary">Salary</MenuItem>
              <MenuItem value="Refund">Refund</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button buttonVariant="tertiary" onClick={onClose}>{t('cancel')}</Button>
          <Button buttonVariant="primary" onClick={() => onApply(values)}>{t('updateTable')}</Button>
        </Box>
      </Paper>
    </Popper>
  );
}
