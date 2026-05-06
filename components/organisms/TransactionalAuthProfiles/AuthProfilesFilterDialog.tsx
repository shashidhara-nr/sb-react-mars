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
import styles from './TransactionalAuthProfiles.module.scss';
import { Button } from 'components/lib/Forms';

const currencyList = ['USD', 'EUR', 'GBP'];

export type StatementStatus =
  | 'FINAL'
  | 'INTERIM'
  | 'BOTH';

export type NoOfInstructionsList = 1 | 2 | 3 | 4 | 5;

export interface FilterValues {
  authProfileName: string;
  currency: string;
  status: string;
}

export interface TrackPaymentFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  noOfInstructionsList?: NoOfInstructionsList[];
  statusList?: StatementStatus[];
}

const DEFAULT_VALUES: FilterValues = {
  authProfileName: '',
  currency: '',
  status: '',
};

export default function TrackPaymentFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  statusList = [
    'FINAL',
    'INTERIM',
    'BOTH',
  ],
}: TrackPaymentFilterDialogProps) {
  const t = useTranslations('transactionalAuthProfiles');
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
          {t('filter')} {t('authProfiles').toLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('authProfileName')}
            value={values.authProfileName}
            onChange={handleText('authProfileName')}
            fullWidth
            size="medium"
          />
          <FormControl fullWidth>
            <InputLabel id="currency-label">{t('currency')}</InputLabel>
            <Select
              labelId="currency-label"
              label={t('currency')}
              value={values.currency} 
              onChange={handleSelect('currency')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {currencyList.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
              {statusList.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
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
