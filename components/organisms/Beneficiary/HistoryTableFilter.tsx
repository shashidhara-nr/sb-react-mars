'use client';

import { useState, useEffect } from 'react';
import { Box, Popover, IconButton, TextField, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Select, Button, DatePicker } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

interface HistoryTableFilterProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApplyFilter: (filters: FilterValues) => void;
  values?: FilterValues;
  testIdPrefix?: string;
}

export interface FilterValues {
  paymentId: string;
  dateCreated: string;
  currency: string;
  from: string;
  to: string;
  status: string;
}

const HistoryTableFilter = ({
  open,
  anchorEl,
  onClose,
  onApplyFilter,
  values,
  testIdPrefix = 'beneficiary-history-filter',
}: HistoryTableFilterProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    paymentId: '',
    dateCreated: '',
    currency: '',
    from: '',
    to: '',
    status: '',
  });

  // Sync internal state with parent's values
  useEffect(() => {
    if (values) {
      setFilters(values);
    }
  }, [values]);

  const handleChange = (field: keyof FilterValues, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFilters({
      paymentId: '',
      dateCreated: '',
      currency: '',
      from: '',
      to: '',
      status: '',
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
      data-testid={buildTestId(testIdPrefix, 'popover')}
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
          height: '616px',
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
        <Box sx={{ fontSize: '18px', fontWeight: 600, color: '#24292f' }}>Filter beneficiary history</Box>
        <IconButton
          onClick={onClose}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
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
          gap: '32px',
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
            label="Payment ID"
            value={filters.paymentId}
            onChange={(e: any) => handleChange('paymentId', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'payment-id-input')}
          />
        </Box>

{/* Date Created */}
<Box
  data-testid={buildTestId(testIdPrefix, 'date-created-picker')}
  sx={{
    width: '100%',
    // ✅ Target the DemoContainer wrapper
    '& . MuiStack-root': {
      paddingTop: '0 !important',
      marginTop: '0 !important',
    },
    // ✅ Target the inner div
    '& .MuiStack-root > div': {
      paddingTop: '0 !important',
      marginTop: '0 !important',
    },
    '& .MuiTextField-root': {
      marginTop:  '0 !important',
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px ! important',
      },
    },
    '& .MuiFormControl-root': {
      marginTop: '0 !important',
      '& .MuiOutlinedInput-root':  {
        borderRadius: '8px !important',
      },
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px !important',
      height: '48px !important',
      '& fieldset': {
        borderRadius: '8px ! important',
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
      borderRadius:  '8px !important',
    },
    '& fieldset':  {
      borderRadius: '8px !important',
    },
    // ✅ Fix label positioning - when NOT shrunk (empty field) - CENTER IT
    '& .MuiInputLabel-root: not(.MuiInputLabel-shrink)': {
      top: '24px !important', // ✅ Changed from 50% to exact pixel
      transform: 'translateY(-50%) !important',
      left: '14px !important',
    },
    // ✅ Fix label positioning - when shrunk (filled/focused field)
    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
      top: '0px !important',
      left: '0px !important',
      transform: 'translate(14px, -9px) scale(0.75) !important',
    },
    // ✅ Fix the input text alignment
    '& .MuiInputBase-input': {
      padding: '0 14px !important',
      height:  '48px !important',
      display: 'flex',
      alignItems: 'center',
    },
  }}
>
  <DatePicker
    label="Date Created"
    value={filters.dateCreated}
    onChange={(value: any) => handleChange('dateCreated', value)}
    fullWidth
    height="48px"
    actions={[
      {
        label: 'CANCEL',
        variant: 'tertiary',
        onClick: () => {
          handleChange('dateCreated', '');
        },
      },
      {
        label: 'OK',
        variant: 'tertiary',
        onClick: () => {
          // Date is already set via onChange
        },
      },
    ]}
  />
</Box>

        {/* Currency */}
        <Box
          data-testid={buildTestId(testIdPrefix, 'currency-field')}
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
            label="Currency"
            value={filters.currency}
            onChange={(e: any) => handleChange('currency', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'currency-input')}
          />
        </Box>

        {/* Divider */}
        <Divider sx={{ margin: '0 !important' }} />

        {/* Amount Heading */}
        <Box
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#24292f',
            marginTop: '8px',
            marginBottom: '-16px',
          }}
        >
          Amount
        </Box>

        {/* From */}
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
            label="From"
            value={filters.from}
            onChange={(e: any) => handleChange('from', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'amount-from-input')}
          />
        </Box>

        {/* To */}
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
  label="To"
  value={filters.to}
  onChange={(e) => handleChange('to', e.target.value)}
  fullWidth
  variant="outlined"
  data-testid={buildTestId(testIdPrefix, 'amount-to-input')}
/>
        </Box>

        {/* Divider */}
        <Divider sx={{ margin: '0 !important' }} />

        {/* Status */}
        <Box
          data-testid={buildTestId(testIdPrefix, 'status-select')}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& . MuiInputLabel-root. MuiInputLabel-shrink': {
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
              { label: 'List Item 1', value: 'List Item 1' },
              { label: 'List Item 2', value: 'List Item 2' },
              { label: 'List Item 3', value: 'List Item 3' },
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
          data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          style={{ height: '48px', minHeight: '48px', width: '82px' }}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleApply}
          data-testid={buildTestId(testIdPrefix, 'apply-button')}
          style={{ height: '48px', minHeight: '48px', width: '153px' }}
        >
          UPDATE TABLE
        </Button>
      </Box>
    </Popover>
  );
};

export default HistoryTableFilter;
