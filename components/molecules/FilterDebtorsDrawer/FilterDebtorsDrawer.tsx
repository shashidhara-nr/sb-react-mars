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

export type DebtorStatus =
  | 'ACT'
  | 'ABA'
  | 'ACA'
  | 'ACI'
  | 'ACR';

export interface FilterValues {
  debtorName: string;
  accountNumber: string;
  debtorCode: string;
  collectionType: string;
  bic: string;
  bankName: string;
  status: DebtorStatus | '';
}

export interface FilterDebtorsDrawerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  collectionTypes?: string[];
  statuses?: DebtorStatus[];
}

const DEFAULT_VALUES: FilterValues = {
  debtorName: '',
  accountNumber: '',
  debtorCode: '',
  collectionType: '',
  bic: '',
  bankName: '',
  status: '',
};

// Map status codes to display labels
const getStatusLabel = (code: DebtorStatus): string => {
  const statusLabelMap: Record<DebtorStatus, string> = {
    ACT: 'Active',
    ABA: 'Awaiting Bank Authorisation',
    ACA: 'Awaiting Customer Authorisation',
    ACI: 'Awaiting Customer Audit',
    ACR: 'Awaiting Customer Repair',
  };
  return statusLabelMap[code];
};

export default function FilterDebtorsDrawer({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  collectionTypes = [],
  statuses = [
    'ACT',
    'ABA',
    'ACA',
    'ACI',
    'ACR',
  ],
}: FilterDebtorsDrawerProps) {
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
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filter debtors
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
            label="Debtor name"
            value={values.debtorName}
            onChange={handleText('debtorName')}
            fullWidth
            size="medium"
          />
          <TextField
            label="Account number"
            value={values.accountNumber}
            onChange={handleText('accountNumber')}
            fullWidth
          />
          <TextField
            label="Debtor code"
            value={values.debtorCode}
            onChange={handleText('debtorCode')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="collection-type-label">Collection types</InputLabel>
            <Select
              labelId="collection-type-label"
              label="Collection types"
              value={values.collectionType}
              onChange={handleSelect('collectionType')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {collectionTypes.map((ct) => (
                <MenuItem key={ct} value={ct}>
                  {ct}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="BIC (SWIFT)"
            value={values.bic}
            onChange={handleText('bic')}
            fullWidth
            inputProps={{ maxLength: 11 }}
          />

          <TextField
            label="Bank Name"
            value={values.bankName}
            onChange={handleText('bankName')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={values.status}
              onChange={handleSelect('status')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {getStatusLabel(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
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
