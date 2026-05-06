import * as React from 'react';
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
  Popover,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

export type BeneficiaryStatus =
  | 'ACT'
  | 'ACA'
  | 'ACI'
  | 'ACR'
  | 'PCA'
  | 'ABA'
  | 'ABI'
  | 'ABR'
  | 'PBA'
  | 'ForMyAuthorisation'
  | 'INACTIVE';

export type PaymentCategory = 'Domestic' | 'International' | 'Company';

export interface FilterValues {
  counterPartyName: string;
  accountNumber: string;
  referenceIDX: string;
  paymentCategory: PaymentCategory | '';
  statusCode: BeneficiaryStatus | '';
}

export interface BeneficiaryFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  paymentCategories?: PaymentCategory[];
  statuses?: BeneficiaryStatus[];
}

const DEFAULT_VALUES: FilterValues = {
  counterPartyName: '',
  accountNumber: '',
  referenceIDX: '',
  paymentCategory: '',
  statusCode: '',
};

const STATUS_LABELS: Record<BeneficiaryStatus, string> = {
  ACT: 'Active',
  ACA: 'Awaiting Customer Authorisation',
  ACI: 'Awaiting Customer Audit',
  ACR: 'Awaiting Customer Repair',
  PCA: 'Partially Customer Authorised',
  ABA: 'Awaiting Bank Authorisation',
  ABI: 'Awaiting Bank Audit',
  ABR: 'Awaiting Bank Repair',
  PBA: 'Partially Bank Authorised',
  ForMyAuthorisation: 'For My Authorisation',
  INACTIVE: 'Inactive',
};

export default function BeneficiaryFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  paymentCategories = ['Domestic', 'International', 'Company'],
  statuses = [
    'ACT',
    'ABA',
    'ACA',
    'ACI',
    'ACR',
  ],
}: BeneficiaryFilterDialogProps) {
  const testIdPrefix = 'beneficiary-filter-dialog';
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  // Reset when dialog opens (so repeated opens reflect latest defaults)
  React.useEffect(() => {
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
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: '400px',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
      data-testid={buildTestId(testIdPrefix, 'popover')}
    >
        <IconButton
          aria-label="close"
          onClick={onClose}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filter beneficiaries
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
            label="Beneficiary name"
            value={values.counterPartyName}
            onChange={handleText('counterPartyName')}
            fullWidth
            size="medium"
            data-testid="beneficiary-name-input"
          />
          <TextField
            label="Beneficiary account number"
            value={values.accountNumber}
            onChange={handleText('accountNumber')}
            fullWidth
            data-testid="beneficiary-account-number-input"
          />
          <TextField
            label="Beneficiary code"
            value={values.referenceIDX}
            onChange={handleText('referenceIDX')}
            fullWidth
            data-testid="beneficiary-code-input"
          />

          <FormControl fullWidth>
            <InputLabel id="payment-category-label">Payment Category</InputLabel>
            <Select
              labelId="payment-category-label"
              label="Beneficiary type"
              value={values.paymentCategory}
              onChange={handleSelect('paymentCategory')}
              displayEmpty={false}
              data-testid="payment-category-select"
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {paymentCategories.map((pc) => (
                <MenuItem
                  key={pc}
                  value={pc}
                  data-testid={buildTestId(testIdPrefix, 'payment-category-option', pc)}
                >
                  {pc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={values.statusCode}
              onChange={handleSelect('statusCode')}
              data-testid="status-select"
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s} data-testid={buildTestId(testIdPrefix, 'status-option', s)}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid="filter-cancel-button"
            style={{
              width: '82px',
              height: '48px',
              minWidth: '82px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            data-testid="filter-update-button"
            style={{
              width: '153px',
              height: '48px',
              minWidth: '153px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            UPDATE TABLE
          </Button>
        </Box>
      </Popover>
  );
}