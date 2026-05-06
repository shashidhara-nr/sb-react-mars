'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  TextField,
  FormControl,
  MenuItem,
  Divider,
  IconButton,
  Select as MuiSelect,
  SelectChangeEvent,
} from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import CloseIcon from '@mui/icons-material/Close';

export interface AuditFilterValues {
  username: string;
  eventType: string;
  date: string;
}

interface AuditTrailFilterProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApplyFilter: (filters: AuditFilterValues) => void;
  currentFilters?: AuditFilterValues | null;
}

const eventTypeOptions = [
  'Login',
  'Logout',
  'Create',
  'Update',
  'Delete',
  'Password Change',
  'Permission Change',
];

function AuditTrailFilter({
  open,
  anchorEl,
  onClose,
  onApplyFilter,
  currentFilters,
}: AuditTrailFilterProps) {
  const [username, setUsername] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (currentFilters) {
      setUsername(currentFilters.username || '');
      setEventType(currentFilters.eventType || '');
      setDate(currentFilters.date || '');
    }
  }, [currentFilters, open]);

  const handleCancel = () => {
    setUsername('');
    setEventType('');
    setDate('');
    onClose();
  };

  const handleUpdateTable = () => {
    onApplyFilter({
      username,
      eventType,
      date,
    });
    onClose();
  };

  const handleEventTypeChange = (e: SelectChangeEvent) => {
    setEventType(e.target.value);
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
        <Box sx={{ fontSize: '18px', fontWeight: 600, color: '#24292f' }}>Filter biller audit history</Box>
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
          {/* Username */}
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
              name="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Box>

          {/* Event Type */}
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
            <FormControl fullWidth>
              <MuiSelect
                displayEmpty
                value={eventType}
                onChange={handleEventTypeChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Box component="span" sx={{ color: '#9E9E9E' }}>Event type</Box>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="" disabled>
                  <Box component="span" sx={{ color: 'text.secondary' }}>Event type</Box>
                </MenuItem>
                {eventTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </Box>

          {/* Date */}
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
              type="date"
              name="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{ width: '100%' }}
              InputLabelProps={{
                shrink: true,
              }}
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
          onClick={handleUpdateTable}
          style={{ height: '48px', minHeight: '48px', width: '153px' }}
        >
          UPDATE TABLE
        </Button>
      </Box>
    </Popover>
  );
}

export default AuditTrailFilter;
