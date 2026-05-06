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
  Popper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';

export type AuthorisationProfileStatus =
  | 'Active'
  | 'Inactive'
  | 'Unusable'
  | 'Needs Action'
  | 'Awaiting Approval'
  | 'Processing';

export interface FilterValues {
  authorisationProfileName: string;
  currency: string;
  status: AuthorisationProfileStatus | '';
}

export interface FilterTransactionalAuthorisationProfileDrawerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  currencies?: string[];
  statuses?: AuthorisationProfileStatus[];
}

const DEFAULT_VALUES: FilterValues = {
  authorisationProfileName: '',
  currency: '',
  status: '',
};

export default function FilterTransactionalAuthorisationProfileDrawer({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  currencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD'],
  statuses = ['Active', 'Inactive', 'Unusable', 'Needs Action', 'Awaiting Approval', 'Processing'],
}: FilterTransactionalAuthorisationProfileDrawerProps) {
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

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      style={{ zIndex: 1400 }}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
    >
      <Paper
        elevation={0}
        sx={{
          width: 400,
          p: 3,
          pt: 2,
          borderRadius: 2,
          minHeight: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          border: '1px solid #CED3D9',
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
          Filter authorisation profile
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
            label="Authorisation profile name"
            value={values.authorisationProfileName}
            onChange={handleText('authorisationProfileName')}
            fullWidth
            size="medium"
          />

          <FormControl fullWidth>
            <InputLabel id="currency-label">Currency</InputLabel>
            <Select
              labelId="currency-label"
              label="Currency"
              value={values.currency}
              onChange={handleSelect('currency')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {currencies.map((curr) => (
                <MenuItem key={curr} value={curr}>
                  {curr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
                  {s}
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
      </Paper>
    </Popper>
  );
}
