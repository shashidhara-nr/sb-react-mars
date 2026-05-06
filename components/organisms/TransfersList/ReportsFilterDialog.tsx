'use client';
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
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import styles from './TransferList.module.scss';

export interface ReportsFilterValues {
  accountName: string;
  batchId: string;
  transferCurrency: string;
  serviceLevel: string;
  returnType: string;
}

export interface ReportsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: ReportsFilterValues) => void;
  initialValues?: Partial<ReportsFilterValues>;
  currencyOptions?: string[];
  serviceLevelOptions?: string[];
  returnTypeOptions?: string[];
}

const DEFAULT_VALUES: ReportsFilterValues = {
  accountName: '',
  batchId: '',
  transferCurrency: '',
  serviceLevel: '',
  returnType: '',
};

export default function ReportsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  currencyOptions = ['All', 'GBP', 'EUR', 'USD'],
  serviceLevelOptions = ['All', 'Standard', 'Express', 'Priority'],
  returnTypeOptions = ['', 'Returned', 'Redirects'],
}: ReportsFilterDialogProps) {
  const t = useTranslations('transfers');
  const [values, setValues] = React.useState<ReportsFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText = (key: keyof ReportsFilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSelect = (key: keyof ReportsFilterValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleRadio = (key: keyof ReportsFilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

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
          {t('filterReports')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('accountName')}
            value={values.accountName}
            onChange={handleText('accountName')}
            fullWidth
            placeholder={t('accountName')}
          />

          <TextField
            label={t('batchId')}
            value={values.batchId}
            onChange={handleText('batchId')}
            fullWidth
            placeholder={t('batchId')}
          />

          <FormControl fullWidth>
            <InputLabel id="transfer-currency-label">{t('transferCurrency')}</InputLabel>
            <Select
              labelId="transfer-currency-label"
              label={t('transferCurrency')}
              value={values.transferCurrency}
              onChange={handleSelect('transferCurrency')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {currencyOptions.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="service-level-label">{t('serviceLevel')}</InputLabel>
            <Select
              labelId="service-level-label"
              label={t('serviceLevel')}
              value={values.serviceLevel}
              onChange={handleSelect('serviceLevel')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {serviceLevelOptions.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="body2" className={styles.inputLabel}>
              {t('returnType')}
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={values.returnType}
                onChange={handleRadio('returnType')}
              >
                {returnTypeOptions.map((type) => (
                  type && (
                    <FormControlLabel
                      key={type}
                      value={type}
                      control={<Radio />}
                      label={type}
                    />
                  )
                ))}
              </RadioGroup>
            </FormControl>
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
