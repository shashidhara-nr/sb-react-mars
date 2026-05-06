import * as React from 'react';
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
import { Button } from 'components/lib/Forms';
import styles from './CredentialHistoryFilter.module.scss';
import { useTranslations } from 'next-intl';

export type CredentialType = 'Password' | 'Token' | 'Certificate' | 'Other';
export type CredentialState = 'Active' | 'Inactive' | 'Expired' | 'Pending';

export interface FilterValues {
  credential: CredentialType | '';
  state: CredentialState | '';
  date: string;
}

export interface CredentialHistoryFilterProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  credentials?: CredentialType[];
  states?: CredentialState[];
}

const DEFAULT_VALUES: FilterValues = {
  credential: '',
  state: '',
  date: '',
};

export default function CredentialHistoryFilter({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  credentials = ['Password', 'Token', 'Certificate', 'Other'],
  states = ['Active', 'Inactive', 'Expired', 'Pending'],
}: CredentialHistoryFilterProps) {
  const t = useTranslations('userDetails');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  // Reset when dialog opens (so repeated opens reflect latest defaults)
  React.useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  // Handlers
  const handleSelect = (key: keyof FilterValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value as any }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, date: e.target.value }));
  };

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      className={styles.filterDialogPopper}
    >
      <Paper elevation={0} className={styles.filterDialogContainer}>
        <IconButton aria-label="close" onClick={onClose} className={styles.filterCloseButton}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle}>
          Filter credential history
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="credential-label">Credential</InputLabel>
            <Select
              labelId="credential-label"
              label="Credential"
              value={values.credential}
              onChange={handleSelect('credential')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {credentials.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="state-label">State</InputLabel>
            <Select
              labelId="state-label"
              label="State"
              value={values.state}
              onChange={handleSelect('state')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {states.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Label 1"
            type="date"
            value={values.date}
            onChange={handleDateChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              style: { cursor: 'pointer' },
            }}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          mt={4}
          className={styles.filterDialogActions}
        >
          <Button onClick={onClose} buttonVariant="tertiary">
            {t('cancel')}
          </Button>
          <Button onClick={handleApply} buttonVariant="primary">
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
