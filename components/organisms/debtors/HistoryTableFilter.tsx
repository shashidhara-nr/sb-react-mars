'use client';

import { useState } from 'react';
import { Box, Popover, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TextField, Select, Button, DatePicker } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';

interface HistoryTableFilterProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApplyFilter: (filters: FilterValues) => void;
}

export interface FilterValues {
  collectionId: string;
  dateCreated: string;
  currencyAmount: string;
  amountFrom: string;
  amountTo: string;
  status: string;
}

const HistoryTableFilter = ({
  open,
  anchorEl,
  onClose,
  onApplyFilter,
}: HistoryTableFilterProps) => {
  const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtor-history-filter';
  const [filters, setFilters] = useState<FilterValues>({
    collectionId: '',
    dateCreated: '',
    currencyAmount: '',
    amountFrom: '',
    amountTo: '',
    status: '',
  });

  const handleChange = (field: keyof FilterValues, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFilters({
      collectionId: '',
      dateCreated: '',
      currencyAmount: '',
      amountFrom: '',
      amountTo: '',
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
      data-testid={buildTestId(testIdPrefix, 'popover')}
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
        data-testid={buildTestId(testIdPrefix, 'header')}
      >
        <Box sx={{ fontSize: '18px', fontWeight: 600, color: '#24292f' }}>{translateLang('filterDebtors')}</Box>
        <IconButton
          onClick={onClose}
          sx={{
            padding: '4px',
            '&:hover': { backgroundColor: '#f6f8fa' },
          }}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
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
        {/* Collection ID */}
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
            name="collectionId"
            label={translateLang('collectionId')}
            value={filters.collectionId}
            onChange={(e: any) => handleChange('collectionId', e.target.value)}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* Date Created */}
        <Box
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
              marginTop: '0 !important',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px ! important',
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
              borderRadius: '8px !important',
            },
            '& fieldset': {
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
              height: '48px !important',
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <DatePicker
            label={translateLang('dateCreated')}
            value={filters.dateCreated}
            onChange={(value: any) => handleChange('dateCreated', value)}
            fullWidth
            height="48px"
            actions={[
              {
                label: translateLang('cancel'),
                variant: 'tertiary',
                onClick: () => handleChange('dateCreated', ''),
              },
              {
                label: translateLang('ok'),
                variant: 'tertiary',
                onClick: () => {},
              },
            ]}
          />
        </Box>

        {/* Currency Amount */}
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
            name="currencyAmount"
            label={translateLang('currencyAmount')}
            value={filters.currencyAmount}
            onChange={(e: any) => handleChange('currencyAmount', e.target.value)}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* Separator after Currency Amount */}
        <Box sx={{ borderBottom: '1px solid #e1e4e8', marginX: '-8px' }} />

        {/* Amount From / To */}
        <Box sx={{ fontSize: '12px', fontWeight: 600, color: '#24292f', mt: '2px', mb: '2px' }}>
          {translateLang('amount')}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              name="amountFrom"
              label={translateLang('from')}
              value={filters.amountFrom}
              onChange={(e: any) => handleChange('amountFrom', e.target.value)}
              sx={{ width: '100%' }}
            />
          </Box>
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
              name="amountTo"
              label={translateLang('to')}
              value={filters.amountTo}
              onChange={(e: any) => handleChange('amountTo', e.target.value)}
              sx={{ width: '100%' }}
            />
          </Box>
        </Box>

        {/* Separator after Amount From/To */}
        <Box sx={{ borderBottom: '1px solid #e1e4e8', marginX: '-8px' }} />

        {/* Status */}
        <Box
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
              { label: translateLang('processed'), value: 'Processed' },
              { label: translateLang('processing'), value: 'Processing' },
              { label: translateLang('pending'), value: 'Pending' },
              { label: translateLang('failed'), value: 'Failed' },
            ]}
            selectProps={{
              label: translateLang('status'),
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
          style={{ height: '48px', minHeight: '48px', width: '82px' }}
          data-testid={buildTestId(testIdPrefix, 'cancel-button')}
        >
          {translateLang('cancel')}
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleApply}
          style={{ height: '48px', minHeight: '48px', width: '153px' }}
          data-testid={buildTestId(testIdPrefix, 'apply-button')}
        >
          {translateLang('updateTable')}
        </Button>
      </Box>
    </Popover>
  );
};

export default HistoryTableFilter;
