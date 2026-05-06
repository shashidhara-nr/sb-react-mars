import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Popper,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { Heading } from 'components/lib/Page';
import { useTranslations } from 'next-intl';
import styles from './ParticipatingBanks.module.scss';
import { PARTICIPATING_BANKS_SERVICE_TYPES, PARTICIPATING_BANKS_STATUS_OPTIONS } from './constant';

export interface FilterValues {
  serviceType: string;
  status: string;
}

export interface ParticipatingBanksFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  serviceType: '',
  status: '',
};

export default function ParticipatingBanksFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: ParticipatingBanksFilterDialogProps) {
  const t = useTranslations('participatingBanks');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleChange = (key: keyof FilterValues) => (e: any) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleApply = () => {
    onApply(values);
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" className={styles.filterDialogPopper} data-testid="participating-banks-filter-dialog">
      <Paper elevation={0} className={styles.filterDialogContainer} data-testid="filter-dialog-container">
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
          data-testid="filter-dialog-close-button"
        >
          <CloseIcon />
        </IconButton>
        <Heading as="h6" fontSize="24px" className={styles.filterDialogTitle} data-testid="filter-dialog-title">
          {t('filter')} {t('participatingBanks')?.toLocaleLowerCase()}
        </Heading>
        <Box className={styles.filterDialogContent} data-testid="filter-dialog-content">
          <FormControl fullWidth>
            <Select
              id="service-type-select"
              name="serviceType"
              value={values.serviceType}
              onChange={handleChange('serviceType')}
              displayEmpty
              className={styles.filterSelect}
              inputProps={{ 'data-testid': 'filter-service-type-field' }}
              MenuProps={{
                disablePortal: false,
                sx: { zIndex: 1401 }
              }}
              renderValue={(selected) => {
                if (selected === '') {
                  return <span className={styles.filterSelectPlaceholder}>{t('serviceType')}</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled>
                {t('serviceType')}
              </MenuItem>
              {PARTICIPATING_BANKS_SERVICE_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value} data-testid={`service-type-${option.value.toLowerCase().replace(/\s+/g, '-')}`}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <Select
              id="status-select"
              name="status"
              value={values.status}
              onChange={handleChange('status')}
              displayEmpty
              className={styles.filterSelect}
              inputProps={{ 'data-testid': 'filter-status-field' }}
              MenuProps={{
                disablePortal: false,
                sx: { zIndex: 1401 }
              }}
              renderValue={(selected) => {
                if (selected === '') {
                  return <span className={styles.filterSelectPlaceholder}>{t('status')}</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled>
                {t('status')}
              </MenuItem>
              {PARTICIPATING_BANKS_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} data-testid={`status-${option.value.toLowerCase()}`}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box className={styles.filterDialogActions} data-testid="filter-dialog-actions">
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid="filter-dialog-cancel-button"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            data-testid="filter-dialog-apply-button"
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
