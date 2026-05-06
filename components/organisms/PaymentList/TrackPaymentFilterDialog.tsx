import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Popper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import styles from './PaymentList.module.scss';
import { Button } from 'components/lib/Forms';
import DatePickerComponent from 'components/lib/DatePicker';

export type StatementStatus =
  | 'FINAL'
  | 'INTERIM'
  | 'BOTH';

export type NoOfInstructionsList = 1 | 2 | 3 | 4 | 5;

export interface FilterValues {
  paymentId: string;
  valueDate: string;
  beneficiaryName: string;
  noOfInstructions: NoOfInstructionsList | '';
  amountFrom: string;
  amountTo: string;
  status: string;
}

export interface TrackPaymentFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  noOfInstructionsList?: NoOfInstructionsList[];
  statusList?: StatementStatus[];
}

const DEFAULT_VALUES: FilterValues = {
  paymentId: '',
  valueDate: '',
  beneficiaryName: '',
  noOfInstructions: '',
  amountFrom: '',
  amountTo: '',
  status: '',
};

export default function TrackPaymentFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  noOfInstructionsList = [1, 2, 3, 4, 5],
  statusList = [
    'FINAL',
    'INTERIM',
    'BOTH',
  ],
}: TrackPaymentFilterDialogProps) {
  const t = useTranslations('payments');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
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

  const handleSelect = (key: keyof FilterValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value as any }));
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
          {t('filter')} {t('payments').toLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('paymentId')}
            value={values.paymentId}
            onChange={handleText('paymentId')}
            fullWidth
            size="medium"
          />
          <DatePickerComponent
            label={t('valueDate')}
            value={values.valueDate}
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
          <TextField
            label={t('beneficiaryName')}
            value={values.beneficiaryName}
            onChange={handleText('beneficiaryName')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="no-of-instructions-label">{t('noOfInstructions')}</InputLabel>
            <Select
              labelId="no-of-instructions-label"
              label={t('noOfInstructions')}
              value={values.noOfInstructions as any}
              onChange={handleSelect('noOfInstructions')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {noOfInstructionsList.map((ni) => (
                <MenuItem key={ni} value={ni}>
                  {ni}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
           <Box className={`${styles.fiilterInnerContainer}`}>
            <Typography variant="body2" className={styles.inputLabel}>
              {t('amount')}
            </Typography>
            <TextField
              label={t('from')}
              value={values.amountFrom}
              onChange={handleText('amountFrom')}
              fullWidth
              size="medium"
            />
            <TextField
              label={t('to')}
              value={values.amountTo}
              onChange={handleText('amountTo')}
              fullWidth
              size="medium"
            />
          </Box>
          <Box className={`${styles.fiilterInnerContainer}`}>
            <FormControl fullWidth>
              <InputLabel id="payment-status-label">{t('status')}</InputLabel>
              <Select
                labelId="payment-status-label"
                label={t('status')}
                value={values.status as any}
                onChange={handleSelect('status')}
                displayEmpty={false}
                MenuProps={{
                  sx: { zIndex: 1500 },
                }}
              >
                {statusList.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
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
