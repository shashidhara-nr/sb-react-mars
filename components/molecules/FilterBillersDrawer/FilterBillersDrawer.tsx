'use client';

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
import { buildTestId } from 'src/utils/testIds';

export type BillerStatus = 'Active' | 'Inactive' | 'Awaiting Approval' | 'Processing' | 'Needs Action';

export interface FilterValues {
  billerName: string;
  billerCode: string;
  countryRegion: string;
  status: BillerStatus | '';
}

export interface FilterBillersDrawerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  countryRegions?: string[];
  statuses?: BillerStatus[];
  testIdPrefix?: string;
}

const DEFAULT_VALUES: FilterValues = {
  billerName: '',
  billerCode: '',
  countryRegion: '',
  status: '',
};

const DEFAULT_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Netherlands',
  'Italy',
  'Japan',
  'Singapore',
];

export default function FilterBillersDrawer({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  countryRegions = DEFAULT_COUNTRIES,
  statuses = ['Active', 'Inactive', 'Awaiting Approval', 'Processing', 'Needs Action'],
  testIdPrefix = 'filter-billers-drawer',
}: FilterBillersDrawerProps) {
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
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ zIndex: (theme) => theme.zIndex.modal - 1 }}
      data-testid={buildTestId(testIdPrefix, 'popper')}
    >
      <Paper
        elevation={8}
        sx={{
          width: 400,
          p: 3,
          pt: 2,
          borderRadius: 2,
          minHeight: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
        data-testid={buildTestId(testIdPrefix, 'panel')}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} data-testid={buildTestId(testIdPrefix, 'title')}>
          Filter billers
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
            label="Biller name"
            value={values.billerName}
            onChange={handleText('billerName')}
            fullWidth
            size="medium"
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-biller-name'),
            }}
          />
          <TextField
            label="Biller code"
            value={values.billerCode}
            onChange={handleText('billerCode')}
            fullWidth
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-biller-code'),
            }}
          />

          <TextField
            label="Country / Region"
            name="countryRegion"
            value={values.countryRegion}
            onChange={(e) => setValues((v) => ({ ...v, countryRegion: e.target.value }))}
            select
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'select-country')}
          >
            {countryRegions.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Status"
            name="status"
            value={values.status}
            onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as BillerStatus | '' }))}
            select
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'select-status')}
          >
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
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
            data-testid={buildTestId(testIdPrefix, 'button-cancel')}
            aria-label="Cancel filter"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            style={{
              height: '48px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
            data-testid={buildTestId(testIdPrefix, 'button-apply')}
            aria-label="Update table with filters"
          >
            UPDATE TABLE
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
