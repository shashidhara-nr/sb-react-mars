'use client';

import { useState } from 'react';
import { Box, Popover, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TextField, Select, Button, DatePicker } from 'dist/standard-bank-react';

interface HistoryTableFilterProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApplyFilter: (filters: FilterValues) => void;
}

export interface FilterValues {
  paymentId: string;
  currency: string;
  status: string;
  date: string;
}

const HistoryTableFilter = ({
  open,
  anchorEl,
  onClose,
  onApplyFilter,
}: HistoryTableFilterProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    paymentId: '',
    currency: '',
    status: '',
    date: '',
  });

  const handleChange = (field: keyof FilterValues, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFilters({
      paymentId: '',
      currency: '',
      status: '',
      date: '',
    });
    onClose();
  };

  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

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
          height: '480px',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header - Fixed */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexShrink: 0,
        }}
      >
        <Box sx={{ fontSize: '18px', fontWeight: 600, color: '#24292f' }}>Filter biller history</Box>
        <IconButton
          onClick={onClose}
          sx={{
            padding: '4px',
            '&:hover': { backgroundColor: '#f6f8fa' },
          }}
        >
          <CloseIcon sx={{ fontSize: '20px' }} />
        </IconButton>
      </Box>

      {/* Content - Scrollable */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px',
          paddingTop: '8px',
          marginRight: '-8px',

          // Custom scrollbar
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        {/* Payment ID */}
        <Box
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
            type="text"
            name="paymentId"
            label="Payment ID"
            value={filters.paymentId}
            onChange={(e: any) => handleChange('paymentId', e.target.value)}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* Currency */}
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
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
          <Select
            formOptions={{
              sx: {
                minWidth: '100%',
              },
            }}
            options={[
              { label: 'ZAR', value: 'ZAR' },
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
              { label: 'GBP', value: 'GBP' },
            ]}
            selectProps={{
              label: 'Currency',
              labelId: 'currency-select',
              onChange: (e: any) => handleChange('currency', e.target.value),
            }}
            name="currency"
            value={filters.currency}
            error={false}
            helperText=""
            height="48px"
          />
        </Box>

        {/* Status */}
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
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
          <Select
            formOptions={{
              sx: {
                minWidth: '100%',
              },
            }}
            options={[
              { label: 'Processed', value: 'Processed' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Failed', value: 'Failed' },
            ]}
            selectProps={{
              label: 'Status',
              labelId: 'status-select',
              onChange: (e: any) => handleChange('status', e.target.value),
            }}
            name="status"
            value={filters.status}
            error={false}
            helperText=""
            height="48px"
          />
        </Box>

        {/* Date */}
        <Box
          sx={{
            width: '100%',
            '& .MuiStack-root': {
              paddingTop: '0 !important',
              marginTop: '0 !important',
            },
            '& .MuiStack-root > div': {
              paddingTop: '0 !important',
              marginTop: '0 !important',
            },
            '& .MuiTextField-root': {
              marginTop: '0 !important',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px !important',
              },
            },
            '& .MuiFormControl-root': {
              marginTop: '0 !important',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px !important',
              },
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px !important',
              height: '48px !important',
              '& fieldset': {
                borderRadius: '8px !important',
              },
            },
            '& .MuiInputBase-root': {
              height: '48px !important',
              borderRadius: '8px !important',
              display: 'flex',
              alignItems: 'center',
              '& fieldset': {
                borderRadius: '8px !important',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '8px !important',
            },
            '& fieldset': {
              borderRadius: '8px !important',
            },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '24px !important',
              transform: 'translateY(-50%) !important',
              left: '14px !important',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              top: '0px !important',
              left: '0px !important',
              transform: 'translate(14px, -9px) scale(0.75) !important',
            },
            '& .MuiInputBase-input': {
              padding: '0 14px !important',
              height: '48px !important',
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <DatePicker
            label="Date"
            value={filters.date}
            onChange={(value: any) => handleChange('date', value)}
            fullWidth
            height="48px"
            actions={[
              {
                label: 'CANCEL',
                variant: 'tertiary',
                onClick: () => handleChange('date', ''),
              },
              {
                label: 'OK',
                variant: 'tertiary',
                onClick: () => {},
              },
            ]}
          />
        </Box>
      </Box>

      {/* Buttons - Fixed at bottom */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '16px',
          paddingLeft: '12px',
          paddingRight: '12px',
          marginTop: '16px',
          marginLeft: '-24px',
          marginRight: '-24px',
          borderTop: '1px solid #e1e4e8',
          flexShrink: 0,
        }}
      >
        <Button
          buttonVariant="text"
          onClick={handleCancel}
          style={{ height: '48px', minHeight: '48px', width: '82px' }}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleApply}
          style={{ height: '48px', minHeight: '48px', width: '153px' }}
        >
          UPDATE TABLE
        </Button>
      </Box>
    </Popover>
  );
};

export default HistoryTableFilter;
