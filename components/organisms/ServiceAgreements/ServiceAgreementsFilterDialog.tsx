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
import styles from './ServiceAgreements.module.scss';

const statusList = ['active', 'inactive', 'pending', 'expired', 'suspended'];

export interface FilterValues {
  serviceAgreementName: string;
  status: string;
}

export interface ServiceAgreementsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  serviceAgreementName: '',
  status: '',
};

export default function ServiceAgreementsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: ServiceAgreementsFilterDialogProps) {
  const t = useTranslations('serviceAgreements');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
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

  const handleSelect = (key: keyof FilterValues) => (e: SelectChangeEvent<any>) => {
    let value = e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
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
          {t('filter')} {t('serviceAgreements')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('serviceAgreementName')}
            value={values.serviceAgreementName}
            onChange={handleText('serviceAgreementName')}
            fullWidth
            size="medium"
          />
          <FormControl fullWidth>
            <InputLabel id="status-label">{t('status')}</InputLabel>
            <Select
              labelId="status-label"
              label={t('status')}
              value={values.status}
              onChange={handleSelect('status')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statusList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
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
