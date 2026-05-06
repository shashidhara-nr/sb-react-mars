import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Popper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import styles from './CollectionsList.module.scss';
import { Button } from 'components/lib/Forms';

export interface FilterValues {
  beneficiaryName: string;
  beneficiaryCode: string;
}

export interface CollectionHistoryFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  beneficiaryName: '',
  beneficiaryCode: ''
};

export default function CollectionHistoryFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: CollectionHistoryFilterDialogProps) {
  const t = useTranslations('collections');
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
          {t('filter')} {t('collections').toLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('beneficiaryName')}
            value={values.beneficiaryName}
            onChange={handleText('beneficiaryName')}
            fullWidth
          />
          <TextField
            label={t('beneficiaryCode')}
            value={values.beneficiaryCode}
            onChange={handleText('beneficiaryCode')}
            fullWidth
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
