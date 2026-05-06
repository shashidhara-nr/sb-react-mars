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
import { Button, DatePicker } from 'dist/standard-bank-react';

export interface FilterUpcomingBillsValues {
  billerName: string;
  billerId: string;
  countryRegion: string;
  dueDate: Date | null;
}

export interface FilterUpcomingBillsDrawerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterUpcomingBillsValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterUpcomingBillsValues>;
  /** Supply custom option sets if needed */
  countryRegions?: string[];
}

const DEFAULT_VALUES: FilterUpcomingBillsValues = {
  billerName: '',
  billerId: '',
  countryRegion: '',
  dueDate: null,
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

export default function FilterUpcomingBillsDrawer({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  countryRegions = DEFAULT_COUNTRIES,
}: FilterUpcomingBillsDrawerProps) {
  const [values, setValues] = React.useState<FilterUpcomingBillsValues>({
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
  const handleText = (key: keyof FilterUpcomingBillsValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSelect = (key: keyof FilterUpcomingBillsValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
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
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filter bills
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
          />
          <TextField
            label="Biller ID"
            value={values.billerId}
            onChange={handleText('billerId')}
            fullWidth
          />

          <TextField
            label="Country / region"
            name="countryRegion"
            value={values.countryRegion}
            onChange={(e) => setValues((v) => ({ ...v, countryRegion: e.target.value }))}
            select
            fullWidth
          >
            {countryRegions.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ '& .MuiPopper-root': { zIndex: 9999 } }}>
            <DatePicker
              label="Due date"
              value={values.dueDate}
              onChange={(date) => setValues((v) => ({ ...v, dueDate: date as Date | null }))}
              fullWidth
            />
          </Box>
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
              height: '48px',
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
