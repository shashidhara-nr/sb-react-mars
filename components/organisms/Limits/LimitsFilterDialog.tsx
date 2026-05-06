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
import styles from './Limits.module.scss';

const limitTypeName = ['all', 'collectionTypeSA', 'overall', 'paymentType'];
const limitType = ['Limit type 1', 'Limit type 2', 'Limit type 3'];
const limitCurrency = ['USD', 'ZAR', 'EUR', 'GBP'];
const period = ['daily', 'weekly', 'monthly'];
const productType = ['Product type 1', 'Product type 2', 'Product type 3'];
const status = ['active', 'inactive'];

export interface FilterValues {
  limitTypeName: string;
  limitType: string;
  limitCurrency: string;
  period: string;
  productType: string;
  status: string;
}

export interface LimitsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  limitTypeName: '',
  limitType: '',
  limitCurrency: '',
  period: '',
  productType: '',
  status: '',
};

export default function LimitsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: LimitsFilterDialogProps) {
  const t = useTranslations('limits');
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
          {t('filter')} {t('limits')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="limit-type-name-label">{t('limitTypeName')}</InputLabel>
            <Select
              labelId="limit-type-name-label"
              label={t('limitTypeName')}
              value={values.limitTypeName}
              onChange={handleSelect('limitTypeName')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {limitTypeName.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="limit-type-label">{t('limitType')}</InputLabel>
            <Select
              labelId="limit-type-label"
              label={t('limitType')}
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
            <InputLabel id="limit-currency-label">{t('limitCurrency')}</InputLabel>
            <Select
              labelId="limit-currency-label"
              label={t('limitCurrency')}
              value={values.limitCurrency}
              onChange={handleSelect('limitCurrency')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {limitCurrency.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="period-label">{t('period')}</InputLabel>
            <Select
              labelId="period-label"
              label={t('period')}
              value={values.period}
              onChange={handleSelect('period')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {period.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="product-type-label">{t('productType')}</InputLabel>
            <Select
              labelId="product-type-label"
              label={t('productType')}
              value={values.productType}
              onChange={handleSelect('productType')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {productType.map((tc) => (
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
