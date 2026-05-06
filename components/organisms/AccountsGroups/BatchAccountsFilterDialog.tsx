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
import styles from './AccountGroups.module.scss';
import { buildTestId } from 'src/utils/testIds';

const currencyList = ['USD', 'EUR', 'GBP'];

const countryList = [
  { label: 'South Africa', value: 'ZA' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' },
];

export interface FilterValues {
  country: string;
  currency: string;
  branchSortCode: string;
  bicSwift: string;
}

export interface BatchAccountsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  country: '',
  currency: '',
  branchSortCode: '',
  bicSwift: '',
};

export default function BatchAccountsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: BatchAccountsFilterDialogProps) {
  const t = useTranslations('billingAccounts');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const testIdPrefix = 'manage-account-groups-batch-filter-dialog';

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
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          variant="h6"
          className={styles.filterDialogTitle}
          data-testid={buildTestId(testIdPrefix, 'dialog-title')}
        >
          {t('filter')} {t('accounts')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="country-label">{t('country')}</InputLabel>
            <Select
              labelId="country-label"
              label={t('country')}
              value={values.country}
              onChange={handleSelect('country')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {countryList.map((tc) => (
                <MenuItem
                  key={tc.value}
                  value={tc.value}
                  data-testid={buildTestId(testIdPrefix, `country-item-${tc.value}`)}
                >
                  {tc.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
              {currencyList.map((tc) => (
                <MenuItem
                  key={tc}
                  value={tc}
                  data-testid={buildTestId(testIdPrefix, `currency-item-${tc}`)}
                >
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('branchSortCode')}
            value={values.branchSortCode}
            onChange={handleText('branchSortCode')}
            fullWidth
            size="medium"
            data-testid={buildTestId(testIdPrefix, 'branch-sort-code')}
          />
          <TextField
            label={t('bicSwift')}
            value={values.bicSwift}
            onChange={handleText('bicSwift')}
            fullWidth
            size="medium"
            data-testid={buildTestId(testIdPrefix, 'bic-swift')}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            data-testid={buildTestId(testIdPrefix, 'apply-button')}
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
