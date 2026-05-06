import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Popper,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import styles from './BillingAdviceList.module.scss';

export interface FilterValues {
  billingAdviceId: string;
  accountNumber: string;
  currency: string;
  amountFrom: string;
  amountTo: string;
  branchSortCode: string;
  bicSwift: string;
}

export interface BillingAdviceFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  billingAdviceId: '',
  accountNumber: '',
  currency: '',
  amountFrom: '',
  amountTo: '',
  branchSortCode: '',
  bicSwift: '',
};

export default function BillingAdviceFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: BillingAdviceFilterDialogProps) {
  const t = useTranslations('billingAdviceList');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText = (key: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleApply = () => {
    onApply(values);
  };

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
          {t('filter')} {t('billingAdviceList')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('billingAdviceId')}
            value={values.billingAdviceId}
            onChange={handleText('billingAdviceId')}
            fullWidth
            size="medium"
          />
          <TextField
            label={t('accountNumber')}
            value={values.accountNumber}
            onChange={handleText('accountNumber')}
            fullWidth
            size="medium"
          />
          <TextField
            label={t('currency')}
            value={values.currency}
            onChange={handleText('currency')}
            fullWidth
            size="medium"
          />
          <Box className={`${styles.fiilterInnerContainer} ${styles.firstFilterBox}`}>
            <Typography variant="body2" className={styles.inputLabel}>
              {t('amount')}
            </Typography>
            <TextField
              label={t('from')}
              value={values.amountFrom}
              onChange={handleText('amountFrom')}
              fullWidth
              size="medium"
            />
            <TextField
              label={t('to')}
              value={values.amountTo}
              onChange={handleText('amountTo')}
              fullWidth
              size="medium"
            />
          </Box>
          <Box className={`${styles.fiilterInnerContainer}`}>
            <TextField
              label={t('branchSortCode')}
              value={values.branchSortCode}
              onChange={handleText('branchSortCode')}
              fullWidth
              size="medium"
            />
            <TextField
              label={t('bicSwift')}
              value={values.bicSwift}
              onChange={handleText('bicSwift')}
              fullWidth
              size="medium"
            />
          </Box>
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
