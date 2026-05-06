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
  chargeCode: string;
}

export interface BillingAdviceDetailsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  chargeCode: '',
};

export default function BillingAdviceDetailsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: BillingAdviceDetailsFilterDialogProps) {
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
          {t('filter')} {t('billingAdvice')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('chargeCode')}
            value={values.chargeCode}
            onChange={handleText('chargeCode')}
            fullWidth
            size="medium"
          />
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
