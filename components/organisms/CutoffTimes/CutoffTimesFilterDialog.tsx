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
import styles from './CutoffTimes.module.scss';

const countryRegionList = [
  { label: 'South Africa', value: 'ZA' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' }
];

const instrumentNameList = [
  'all',
  'crossBorderPayment',
  'crossBorderPaymentZAROnly',
  'crossBorderRTGS',
  'domesticPaymentBase',
  'domesticPaymentBaseNormal',
  'domesticPaymentBaseSyncCredit',
  'domesticPaymentBaseSyncCreditAndDebit',
  'domesticPaymentBaseUrgent',
  'domesticPaymentBaseUrgentRTGS',
  'domesticPaymentFXBase',
  'domesticPaymentFXNonBase',
  'domesticPaymentNonBase',
  'mt101',
  'ownTransferBase',
  'ownTransferBaseManyToOne',
  'ownTransferBaseOneToMany',
  'ownTransferFX',
  'ownTransferNonBase',
  'sadcCrossBorderUrgent',
  'sbnDomesticPaymentFXBase',
  'sbnDomesticPaymentFXNonBase',
  'sbnOwnTransferFX',
  'sbnOwnTransferNonBase',
  'sbnCmaPaymentValueDated',
  'sbnCmaUpfrontCollection',
  'sbnCmaUrgentPayment',
  'sbnCmaPayment',
  'sbnCrossBorderPayment',
  'sbnDomesticEncrPaymentBase',
  'sbnDomesticEncrPaymentBaseValueDate',
  'sbnDomesticPaymentNonBase',
  'sbnDomesticUpfrontCollectionBaseSyncDebitAndCredit',
  'sbnDomesticValueOnSuccessCollectionBaseEndo',
  'sbnDomesticRtcUrgentPayment',
  'sbnCmaUpfrontCollectionValueDated'
];

const instrumentClassificationList = [
  'all',
  'cashDeposit',
  'collection',
  'interAccountTransfer',
  'thirdPartyPayment'
];

const transferCurrencyList = [
  'All',
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'ANG',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BMD',
  'BND',
  'BOB',
  'BRL',
  'BSD',
  'BTN',
  'BWP',
  'BYN',
  'BZD',
  'CAD',
  'CDF',
  'CHE',
  'CHF',
  'CHW',
  'CLF',
  'CLP',
  'CNY',
  'COP',
  'COU',
  'CRC',
  'CUC',
  'CUP',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'GBP',
  'GEL',
  'GHS',
  'GIP',
  'GMD',
  'GNF',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HRK',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KMF',
  'KPW',
  'KRW',
  'KWD',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'LYD',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MRU',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SLL',
  'SOS',
  'SRD',
  'SSP',
  'STN',
  'SYP',
  'SZL',
  'THB',
  'TJS',
  'TMT',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'USN',
  'UYI',
  'UYU',
  'UZS',
  'VES',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XAG',
  'XAU',
  'XBA',
  'XBB',
  'XBC',
  'XBD',
  'XCD',
  'XDR',
  'XOF',
  'XPD',
  'XPF',
  'XPT',
  'XSU',
  'XTS',
  'XUA',
  'XXX',
  'YER',
  'ZAR',
  'ZMW',
  'ZWL',
];

const transferTypeList = [
  'all',
  'sameDay',
  'nextDay',
  'immediate',
  'urgent'
];

export interface FilterValues {
  countryRegion: string;
  instrumentName: string;
  instrumentClassification: string;
  transferCurrency: string;
  transferType: string;
}

export interface CutoffTimesFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  countryRegion: '',
  instrumentName: '',
  instrumentClassification: '',
  transferCurrency: '',
  transferType: ''
};

export default function CutoffTimesFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: CutoffTimesFilterDialogProps) {
  const t = useTranslations('cutoffTimes');
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
      <Paper elevation={0} className={styles.filterDialogContainer}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle}>
          {t('filter')} {t('cutoffTimes')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="country-region-label">{t('countryRegion')}</InputLabel>
            <Select
              labelId="country-region-label"
              label={t('countryRegion')}
              value={values.countryRegion}
              onChange={handleSelect('countryRegion')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {countryRegionList.map((tc) => (
                <MenuItem key={tc.value} value={tc.value}>
                  {tc.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="instrument-name-label">{t('instrumentName')}</InputLabel>
            <Select
              labelId="instrument-name-label"
              label={t('instrumentName')}
              value={values.instrumentName}
              onChange={handleSelect('instrumentName')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {instrumentNameList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="instrument-classification-label">{t('instrumentClassification')}</InputLabel>
            <Select
              labelId="instrument-classification-label"
              label={t('instrumentClassification')}
              value={values.instrumentClassification}
              onChange={handleSelect('instrumentClassification')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {instrumentClassificationList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="transaction-currency-label">{t('transferCurrency')}</InputLabel>
            <Select
              labelId="transaction-currency-label"
              label={t('transferCurrency')}
              value={values.transferCurrency}
              onChange={handleSelect('transferCurrency')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {transferCurrencyList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {tc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="transaction-type-label">{t('transactionType')}</InputLabel>
            <Select
              labelId="transaction-type-label"
              label={t('transactionType')}
              value={values.transferType}
              onChange={handleSelect('transferType')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {transferTypeList.map((s) => (
                <MenuItem key={s} value={s}>
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
