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
import { FlagSouthAfrica, FlagUsa, FlagUk } from 'lib/icons';
import styles from './HolidayCalendar.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';
import Image from 'next/image';

const currencyList = ['USD', 'EUR', 'GBP'];
const countryList = [
  { label: 'South Africa', value: 'ZA', flagIcon: FlagSouthAfrica },
  { label: 'United States', value: 'US', flagIcon: FlagUsa },
  { label: 'United Kingdom', value: 'UK', flagIcon: FlagUk }
];
const dayOfWeekList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export interface FilterValues {
  currencyCode: string;
  country: string;
  date: string;
  dayOfWeek: string;
}

export interface CurrencyHolidayFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  currencyCode: '',
  country: '',
  date: '',
  dayOfWeek: '',
};

export default function CurrencyHolidayFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: CurrencyHolidayFilterDialogProps) {
  const t = useTranslations('holidayCalendar');
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
          {t('filter')} {t('currencyHolidays')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="currency-code-label">{t('currencyCode')}</InputLabel>
            <Select
              labelId="currency-code-label"
              label={t('currencyCode')}
              value={values.currencyCode}
              onChange={handleSelect('currencyCode')}
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
          <FormControl fullWidth>
            <InputLabel id="country-label">{t('country')}</InputLabel>
            <Select
              labelId="country-label"
              label={t('country')}
              value={values.country}
              onChange={handleSelect('country')}
              displayEmpty={false}
              renderValue={(selected) => {
                const selectedCountry = countryList.find(c => c.value === selected);
                if (!selectedCountry) return '';
                return (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Image 
                        src={selectedCountry.flagIcon} 
                        alt={selectedCountry.label}
                        width={28}
                        height={28}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </Box>
                    <span>{selectedCountry.label}</span>
                  </Box>
                );
              }}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {countryList.map((tc) => (
                <MenuItem key={tc.value} value={tc.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Image 
                        src={tc.flagIcon} 
                        alt={tc.label}
                        width={28}
                        height={28}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </Box>
                    <span>{tc.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePickerComponent
            label={t('date')}
            value={values.date}
            onChange={(value: any) => {
              setValues((v) => ({ ...v, date: value }));
            }}
            fullWidth
            actions={[
              {
                label: t('cancel'),
                onClick: () => setValues((v) => ({ ...v, date: '' })),
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
            <InputLabel id="day-of-week-label">{t('dayOfWeek')}</InputLabel>
            <Select
              labelId="day-of-week-label"
              label={t('dayOfWeek')}
              value={values.dayOfWeek}
              onChange={handleSelect('dayOfWeek')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {dayOfWeekList.map((tc) => (
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
