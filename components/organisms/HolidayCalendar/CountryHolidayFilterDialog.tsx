import * as React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
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
import { getCountries } from '@lib/api/beneficiaryApi';

// Flag icon mapping for known countries
const FLAG_ICON_MAP: Record<string, any> = {
  'ZA': FlagSouthAfrica,
  'US': FlagUsa,
  'UK': FlagUk,
};

const dayOfWeekList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export interface FilterValues {
  countryCode?: string;
  fromDate?: number;
  holidayDescription?: string;
  dayOfWeek?: string;
}

export interface CountryHolidayFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** List of country codes for dropdown */
  countryCodesList?: string[];
}

const DEFAULT_VALUES: FilterValues = {
  countryCode: 'ZA',
  fromDate: undefined,
  holidayDescription: '',
  dayOfWeek: '',
};

export default function CountryHolidayFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  countryCodesList = ['ZA']
}: CountryHolidayFilterDialogProps) {
  const t = useTranslations('holidayCalendar');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
  });
  const [countryList, setCountryList] = useState<Array<{ label: string; value: string; flagIcon?: any }>>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Fetch countries from API on mount
  useEffect(() => {
    const fetchCountriesData = async () => {
      try {
        setLoadingCountries(true);
        const apiResponse: any = await getCountries();
        
        console.log('📥 Raw API Response:', apiResponse);
        
        // Handle different response formats
        let countriesArray: any[] = [];
        if (Array.isArray(apiResponse)) {
          countriesArray = apiResponse;
        } else if (apiResponse && Array.isArray(apiResponse.countries)) {
          countriesArray = apiResponse.countries;
        } else if (apiResponse && Array.isArray(apiResponse.list)) {
          countriesArray = apiResponse.list;
        }
        
        console.log('📦 Extracted countries array:', countriesArray);
        
        // Transform API response to dropdown format
        const transformedCountries = (countriesArray || [])
          .map((country: any) => {
            const countryCode = country.countryCode || country.code || '';
            return {
              label: country.countryName || country.name || '',
              value: countryCode,
              flagIcon: FLAG_ICON_MAP[countryCode] || FlagSouthAfrica,
            };
          })
          .filter((c: any) => c.value && c.label); // Filter out empty entries

        console.log('🎨 Transformed countries:', transformedCountries);

        if (transformedCountries.length > 0) {
          // Move South Africa to the top if it exists
          const zaIndex = transformedCountries.findIndex(c => c.value === 'ZA');
          if (zaIndex > 0) {
            const za = transformedCountries.splice(zaIndex, 1)[0];
            transformedCountries.unshift(za);
          } else if (zaIndex < 0) {
            // Add South Africa if not in list
            transformedCountries.unshift({
              label: 'South Africa',
              value: 'ZA',
              flagIcon: FlagSouthAfrica,
            });
          }
        }

        setCountryList(transformedCountries);
        console.log('✅ Final country list:', transformedCountries);
      } catch (err) {
        console.error('❌ Failed to fetch countries:', err);
        // Fallback to default countries
        const fallbackCountries = [
          { label: 'South Africa', value: 'ZA', flagIcon: FlagSouthAfrica },
          { label: 'United States', value: 'US', flagIcon: FlagUsa },
          { label: 'United Kingdom', value: 'UK', flagIcon: FlagUk }
        ];
        setCountryList(fallbackCountries);
        console.log('⚠️ Using fallback countries:', fallbackCountries);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountriesData();
  }, []);

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
    console.log(`🎯 Dialog - ${key} selected:`, value);
    setValues((v) => {
      const updated = { ...v, [key]: value };
      console.log(`🎯 Dialog - Updated values:`, updated);
      return updated;
    });
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
          {t('filter')} {t('countryHolidays')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth disabled={loadingCountries}>
            <InputLabel id="country-label">{t('country')}</InputLabel>
            <Select
              labelId="country-label"
              label={t('country')}
              value={values.countryCode || 'ZA'}
              onChange={handleSelect('countryCode')}
              displayEmpty={false}
              renderValue={(selected) => {
                const selectedCountry = countryList.find(c => c.value === selected);
                if (!selectedCountry) return 'South Africa';
                return <span>{selectedCountry.label}</span>;
              }}
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
          <DatePickerComponent
            label={t('date')}
            value={values.fromDate ? new Date(values.fromDate) : null}
            onChange={(value: any) => {
              setValues((v) => ({ 
                ...v, 
                fromDate: value ? new Date(value).getTime() : undefined 
              }));
            }}
            fullWidth
            minDate={new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate())}
            maxDate={new Date()}
            actions={[
              {
                label: t('cancel'),
                onClick: () => setValues((v) => ({ ...v, fromDate: undefined })),
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
              value={values.dayOfWeek || ''}
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
