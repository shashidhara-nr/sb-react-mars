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
import { useTranslations } from 'next-intl';
import styles from './AccountsAndBalancesList.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';
import { Button } from 'components/lib/Forms';

const consolidatedCurrencyList = ['USD', 'EUR', 'GBP'];
const consolidationLevelList = ['accountOwner', 'accountSubGroup', 'accountType', 'bicSwift', 'currency'];
const bicSwiftList = ['BIC1', 'BIC2', 'BIC3'];
const balanceTypeList = ['Type 1', 'Type 2', 'Type 3'];
const currencyTypeList = ['USD', 'EUR', 'GBP'];
const accountList = ['Account 1', 'Account 2', 'Account 3'];
const accountSubGroupList = ['SubGroup 1', 'SubGroup 2', 'SubGroup 3'];

export interface FilterValues {
  consolidatedCurrency: string;
  consolidatedLevel1: string;
  consolidatedLevel2: string;
  date: string;
  bicSwift: string;
  balanceType: string;
  currency: string;
  accountList: string;
  accountSubGroup: string | string[];
}

export interface ConsolidatedBalancesFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  consolidatedCurrency: '',
  consolidatedLevel1: '',
  consolidatedLevel2: '',
  date: '',
  bicSwift: '',
  balanceType: '',
  currency: '',
  accountList: '',
  accountSubGroup: '',
};

export default function ConsolidatedBalancesFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: ConsolidatedBalancesFilterDialogProps) {
  const t = useTranslations('accountsAndBalances');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
    accountSubGroup: initialValues?.accountSubGroup || [],
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
    if (key === 'accountSubGroup') {
      value = Array.isArray(value) ? value : [value];
    }
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
          {t('filter')} {t('consolidatedBalances')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="consolidated-currency-label">{t('consolidationCurrency')}</InputLabel>
            <Select
              labelId="consolidated-currency-label"
              label={t('consolidationCurrency')}
              value={values.consolidatedCurrency}
              onChange={handleSelect('consolidatedCurrency')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {consolidatedCurrencyList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="consolidated-level1-label">{t('consolidationLevel')} 1</InputLabel>
            <Select
              labelId="consolidated-level1-label"
              label={`${t('consolidationLevel')} 1`}
              value={values.consolidatedLevel1}
              onChange={handleSelect('consolidatedLevel1')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {consolidationLevelList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="consolidated-level2-label">{t('consolidationLevel')} 2</InputLabel>
            <Select
              labelId="consolidated-level2-label"
              label={`${t('consolidationLevel')} 2`}
              value={values.consolidatedLevel2}
              onChange={handleSelect('consolidatedLevel2')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {consolidationLevelList.map((tc) => (
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
          <FormControl fullWidth>
            <InputLabel id="bic-swift-label">{t('bicSwift')}</InputLabel>
            <Select
              labelId="bic-swift-label"
              label={t('bicSwift')}
              value={values.bicSwift}
              onChange={handleSelect('bicSwift')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {bicSwiftList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="category-label">{t('balanceType')}</InputLabel>
            <Select
              labelId="category-label"
              label={t('balanceType')}
              value={values.balanceType}
              onChange={handleSelect('balanceType')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {balanceTypeList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="consolidated-currency-label">{t('currency')}</InputLabel>
            <Select
              labelId="consolidated-currency-label"
              label={t('currency')}
              value={values.currency}
              onChange={handleSelect('currency')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {currencyTypeList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box className={`${styles.fiilterInnerContainer} ${styles.filterSelectContainer}`}>
            <Box className={`${styles.filterSelectBox}`}>
              <Typography variant="body2" className={styles.inputLabel}>
                {t('accountList')}
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="account-list-label">{t('selectAccount')}</InputLabel>
                <Select
                  labelId="account-list-label"
                  label={t('selectAccount')}
                  value={values.accountList}
                  onChange={handleSelect('accountList')}
                  displayEmpty={false}
                  MenuProps={{
                    sx: { zIndex: 1500 },
                  }}
                >
                  {accountList.map((tc) => (
                    <MenuItem key={tc} value={tc}>
                      {tc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box className={`${styles.filterSelectBox}`}>
              <Typography variant="body2" className={styles.inputLabel}>
                {t('accountSubGroups')}
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="account-sub-group-label">{t('selectAccountSubGroup')}</InputLabel>
                <Select
                  labelId="account-sub-group-label"
                  label={t('selectAccountSubGroup')}
                  value={values.accountSubGroup}
                  onChange={handleSelect('accountSubGroup')}
                  displayEmpty={false}
                  MenuProps={{
                    sx: { zIndex: 1500 },
                  }}
                  multiple={true}
                >
                  {accountSubGroupList.map((tc) => (
                    <MenuItem key={tc} value={tc}>
                      {tc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
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
