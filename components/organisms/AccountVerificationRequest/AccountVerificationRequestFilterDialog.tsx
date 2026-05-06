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
import styles from './BillingAccounts.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';

const currencyList = ['USD', 'EUR', 'GBP'];

const countryList = [
  { label: 'South Africa', value: 'ZA' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' }
];

const serviceTypeList = [
  { label: 'Swift', value: 'Swift' },
  { label: 'SEPA', value: 'SEPA' },
  { label: 'ACH', value: 'ACH' },
  { label: 'CHAPS', value: 'CHAPS' }
];

export interface FilterValues {
 
  paymentId: string;
  dateCreated: string;
  dateVerified: string;
  serviceType: string;
  accounts: string;
}

export interface AccountVerificationRequestFilterProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
 
  paymentId: '',
  dateCreated: '',
  dateVerified: '',
  serviceType: '',
  accounts: '',
};

export default function BillingAccountsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: AccountVerificationRequestFilterProps) {
  const t = useTranslations('accountVerificationRequest');
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
          {t('filter')} {t('accountVerificationRequest')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          {/* <FormControl fullWidth>
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
                <MenuItem key={tc.value} value={tc.value}>
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
                <MenuItem key={tc} value={tc}>
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
          />
          <FormControl fullWidth>
            <InputLabel id="billingAccountType-label">{t('billingAccountType')}</InputLabel>
            <Select
              labelId="billingAccountType-label"
              label={t('billingAccountType')}
              value={values.billingAccountType}
              onChange={handleSelect('billingAccountType')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {billingAccountTypeList.map((tc) => (
                <MenuItem key={tc.value} value={tc.value}>
                  {t(tc.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}


          <TextField
            label={t('paymentId')}
            value={values.paymentId}
            onChange={handleText('paymentId')}
            fullWidth
            size="medium"
          />
          <section className={styles.datePicker}>
  <DatePickerComponent
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
    label={t('dateCreated')}
    
  />
</section>
          <section className={styles.datePicker}>
  <DatePickerComponent
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
    label={t('dateVerified')}
  />
</section>
<FormControl fullWidth>
            <InputLabel id="serviceType-label">{t('serviceType')}</InputLabel>
            <Select
              labelId="serviceType-label"
              label={t('serviceType')}
              value={values.serviceType}
              onChange={handleSelect('serviceType')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {serviceTypeList.map((tc) => (
                <MenuItem key={tc.value} value={tc.value}>
                  {tc.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl> 
          <TextField
            label={t('accounts')}
            value={values.accounts}
            onChange={handleText('accounts')}
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
