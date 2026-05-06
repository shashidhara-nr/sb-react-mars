import React from 'react';
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
import styles from './BankingAccounts.module.scss';
import { buildTestId } from 'src/utils/testIds';

const bankNameList = ['standardBankSouthAfrica', 'stanbicBankKenyaLimited', 'nedbankLimited', 'firstNationalBank', 'capitecBank'];

const countryRegionList = [
  { label: 'South Africa', value: 'ZA' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' }
];

const statusList = ['active', 'inactive', 'closed'];

const testIdPrefix = 'banking-account-filter-dialog';

export interface FilterValues {
  bankName: string;
  countryRegion: string;
  status: string;
}

export interface BankingAccountDetailFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  bankName: '',
  countryRegion: '',
  status: '',
};

export default function BankingAccountDetailFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: BankingAccountDetailFilterDialogProps) {
  const t = useTranslations('bankingAccounts');
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

  const handleSelect = (field: keyof FilterValues) => (event: SelectChangeEvent<string>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleDateChange = (date: string) => {
    setValues((prev) => ({ ...prev, date }));
  };

  const handleApply = () => {
    onApply(values);
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" className={styles.filterDialogPopper}>
      <Paper elevation={0} className={styles.filterDialogContainer} data-testid={buildTestId(testIdPrefix, 'panel')}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle} data-testid={buildTestId(testIdPrefix, 'title')}>
          {t('filter')} {t('bankingAccounts')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="bank-name-label" data-testid={buildTestId(testIdPrefix, 'bank-name-label')}>{t('bankName')}</InputLabel>
            <Select
              labelId="bank-name-label"
              label={t('bankName')}
              value={values?.bankName}
              onChange={handleSelect('bankName')}
              displayEmpty={false}
              data-testid={buildTestId(testIdPrefix, 'bank-name-select')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {bankNameList.map((tc) => (
                <MenuItem key={tc} value={tc} data-testid={buildTestId(testIdPrefix, `bank-name-option-${tc}`)}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="country-region-label" data-testid={buildTestId(testIdPrefix, 'country-region-label')}>{t('countryRegion')}</InputLabel>
            <Select
              labelId="country-region-label"
              label={t('countryRegion')}
              value={values.countryRegion}
              onChange={handleSelect('countryRegion')}
              data-testid={buildTestId(testIdPrefix, 'country-region-select')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {countryRegionList.map((tc) => (
                <MenuItem key={tc.value} value={tc.value} data-testid={buildTestId(testIdPrefix, `country-region-option-${tc.value}`)}>
                  {tc.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-label" data-testid={buildTestId(testIdPrefix, 'status-label')}>{t('status')}</InputLabel>
            <Select
              labelId="status-label"
              label={t('status')}
              value={values.status}
              onChange={handleSelect('status')}
              data-testid={buildTestId(testIdPrefix, 'status-select')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statusList.map((s) => (
                <MenuItem key={s} value={s} data-testid={buildTestId(testIdPrefix, `status-option-${s}`)}>
                  {t(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            data-testid={buildTestId(testIdPrefix, 'update-button')}
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
