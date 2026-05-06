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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import styles from './CreditLimits.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';
import { type FilterValues } from 'types/creditLimits';

const limitType = ['TypeA', 'TypeB'];
const status = ['active', 'inactive'];



export interface CreditLimitsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  limitType: '',
  status: '',
  date: '',
};

export default function CreditLimitsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: CreditLimitsFilterDialogProps) {
  const t = useTranslations('creditLimits');
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
          {t('filter')} {t('creditLimits')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="limit-type-label">{t('creditLimitType')}</InputLabel>
            <Select
              labelId="limit-type-label"
              label={t('creditLimitType')}
              value={values.limitType}
              onChange={handleSelect('limitType')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {limitType.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
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
              {status.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePickerComponent
            label={t('date')}
            value={values.date}
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
        <Box display="flex" justifyContent="space-between" mt={4}>
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
