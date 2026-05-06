import * as React from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Popper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import GlobalStyles from '@mui/material/GlobalStyles';
import CloseIcon from '@mui/icons-material/Close';
import { Button, DatePicker } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

export interface DebtorHistoryFilterValues {
  collectionId: string;
  dateFrom: string; // ISO yyyy-MM-dd
  dateTo: string;   // ISO yyyy-MM-dd
  currency: string;
  amountFrom: string;
  amountTo: string;
  status: string;
}

export interface DebtorHistoryFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: DebtorHistoryFilterValues) => void;
  initialValues?: Partial<DebtorHistoryFilterValues>;
  currencyOptions?: string[];
  statusOptions?: string[];
}

const DEFAULT_VALUES: DebtorHistoryFilterValues = {
  collectionId: '',
  dateFrom: '',
  dateTo: '',
  currency: '',
  amountFrom: '',
  amountTo: '',
  status: '',
};

const DEFAULT_CURRENCIES = [
  'South African Rand (ZAR)',
  'US Dollar (USD)',
  'Euro (EUR)'
];

const DEFAULT_STATUSES = [
  'Processed',
  'Processing',
];

export default function DebtorHistoryFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  currencyOptions = DEFAULT_CURRENCIES,
  statusOptions = DEFAULT_STATUSES,
}: DebtorHistoryFilterDialogProps) {
  const testIdPrefix = 'debtor-history-filter';
  const t = useTranslations('collections');
  const [values, setValues] = React.useState<DebtorHistoryFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  React.useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText = (key: keyof DebtorHistoryFilterValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
    };

  const handleApply = () => {
    onApply(values);
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" style={{ zIndex: 2000 }} data-testid={buildTestId(testIdPrefix, 'popper')}>
      <Paper
        elevation={0}
        data-testid={buildTestId(testIdPrefix, 'dialog')}
        sx={{
          width: 400,
          p: 3,
          pt: 2,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'visible',
          boxSizing: 'border-box',
          border: '1px solid #CED3D9',
          top: '-110px',
          position: 'absolute',
          right: '-10',
        }}
      >
        {/* Ensure MUI DatePicker popper sits above dialog */}
        <GlobalStyles styles={{
          '.MuiPopper-root.MuiPickerPopper-root': { zIndex: 3000 },
          '.MuiPickersPopper-root': { zIndex: 3000 },
        }} />
        <IconButton 
          aria-label="close" 
          onClick={onClose} 
          data-testid={buildTestId(testIdPrefix, 'close-button')}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {t('filterDialogTitle')}
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          mt={1}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              height: '48px',
            },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              top: '0px',
              left: '0px',
            },
          }}
        >
          <TextField
            label={t('filterLabelCollectionId')}
            value={values.collectionId}
            onChange={handleText('collectionId')}
            fullWidth
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-collection-id')
            }}
          />

         
          <DatePicker
            label={t('filterLabelDateCreated')}
            value={values.dateFrom}
            onChange={(value: any) => setValues((v) => ({ ...v, dateFrom: value }))}
            fullWidth
            height="48px"
            data-testid={buildTestId(testIdPrefix, 'datepicker-from')}
            actions={[
              {
                label: t('buttonCancel'),
                variant: 'tertiary',
                onClick: () => setValues((v) => ({ ...v, dateFrom: '' })),
              },
              {
                label: t('buttonOk'),
                variant: 'tertiary',
                onClick: () => {},
              },
            ]}
          />
         
          <FormControl fullWidth>
            <InputLabel id="currency-label">{t('filterLabelCurrency')}</InputLabel>
            <Select
              labelId="currency-label"
              label={t('filterLabelCurrency')}
              value={values.currency}
              onChange={(e) => setValues((v) => ({ ...v, currency: String(e.target.value) }))}
              MenuProps={{ sx: { zIndex: 3000 } }}
              data-testid={buildTestId(testIdPrefix, 'select-currency')}
            >
              <MenuItem value=""><em>{t('filterOptionAny')}</em></MenuItem>
              {currencyOptions.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>{t('filterLabelAmount')}</Typography>
          <TextField
            label={t('filterLabelAmountFrom')}
            value={values.amountFrom}
            onChange={handleText('amountFrom')}
            fullWidth
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-amount-from')
            }}
          />
          <TextField
            label={t('filterLabelAmountTo')}
            value={values.amountTo}
            onChange={handleText('amountTo')}
            fullWidth
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-amount-to')
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="status-label">{t('filterLabelStatus')}</InputLabel>
            <Select
              labelId="status-label"
              label={t('filterLabelStatus')}
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: String(e.target.value) }))}
              MenuProps={{ sx: { zIndex: 3000 } }}
              data-testid={buildTestId(testIdPrefix, 'select-status')}
            >
              <MenuItem value=""><em>{t('filterOptionAny')}</em></MenuItem>
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
            style={{
              width: '82px',
              height: '48px',
              minWidth: '82px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            {t('buttonCancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            data-testid={buildTestId(testIdPrefix, 'apply-button')}
            style={{
              width: '153px',
              height: '48px',
              minWidth: '153px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            {t('buttonUpdateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
