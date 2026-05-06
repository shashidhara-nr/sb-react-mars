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
import styles from './BankingAccounts.module.scss';

// Generate bank names from mock data (Bank 1-20 shown as options)
const bankNameList = Array.from({ length: 20 }, (_, i) => `Bank ${i + 1}`);

const accountTypeList = ['Current account', 'Savings account', 'Credit account', 'Loan account'];

export interface FilterValues {
  bankName?: string;
  accountType?: string;
  accountName?: string;
  accountNumber?: string;
  branchSortCode?: string;
}

export interface BankingAccountsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  bankName: '',
  accountType: '',
};

export default function BankingAccountsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: BankingAccountsFilterDialogProps) {
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

  const handleSelect = (field: keyof FilterValues) => (event: SelectChangeEvent<string>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleApply = () => {
    // Only send non-empty filters
    const appliedFilters = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value !== '')
    );
    onApply(appliedFilters);
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" className={styles.filterDialogPopper} data-testid="banking-accounts-filter-popper">
      <Paper elevation={0} className={styles.filterDialogContainer}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
          data-testid="banking-accounts-filter-close-button"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle}>
          {t('filter')} {t('bankingAccounts')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="bank-name-label">{t('bankName')}</InputLabel>
            <Select
              labelId="bank-name-label"
              label={t('bankName')}
              value={values.bankName}
              onChange={handleSelect('bankName')}
              displayEmpty={false}
              data-testid="banking-accounts-filter-bank-name"
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {bankNameList.map((bankName) => (
                <MenuItem key={bankName} value={bankName}>
                  {bankName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="account-type-label">{t('accountType')}</InputLabel>
            <Select
              labelId="account-type-label"
              label={t('accountType')}
              value={values.accountType}
              onChange={handleSelect('accountType')}
              data-testid="banking-accounts-filter-account-type"
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {accountTypeList.map((accountType) => (
                <MenuItem key={accountType} value={accountType}>
                  {accountType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid="banking-accounts-filter-cancel-button"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            data-testid="banking-accounts-filter-update-button"
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
