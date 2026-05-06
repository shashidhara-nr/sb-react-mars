'use client';

import { useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
} from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import CloseIcon from '@mui/icons-material/Close';

interface DownloadAuditTrailPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (format: string, sortOrder: string) => void;
}

function DownloadAuditTrailPopover({
  open,
  anchorEl,
  onClose,
  onDownload,
}: DownloadAuditTrailPopoverProps) {
  const [exportFormat, setExportFormat] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');
  const [touched, setTouched] = useState(false);

  const handleFormatChange = (e: SelectChangeEvent) => {
    setExportFormat(e.target.value);
    if (!touched) setTouched(true);
  };

  const handleDownload = () => {
    if (!exportFormat) {
      setTouched(true);
      return;
    }
    onDownload(exportFormat, sortOrder);
    onClose();
  };

  const handleCancel = () => {
    setExportFormat('');
    setSortOrder('ascending');
    setTouched(false);
    onClose();
  };

  const isFormatInvalid = touched && exportFormat === '';
  const isSortDisabled = !exportFormat;

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
        style: {
          borderRadius: '8px',
          padding: '16px',
          width: '765px',
          marginTop: '-80px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <Typography variant="h6" style={{ fontWeight: 600, fontSize: '18px' }}>
            Download audit trail
          </Typography>
          <IconButton onClick={onClose} size="small" style={{ padding: '4px' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          variant="subtitle2"
          style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}
        >
          Select export format
        </Typography>

        <Box
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <FormControl fullWidth error={isFormatInvalid}>
            <InputLabel id="export-format-label">Select export format</InputLabel>
            <MuiSelect
              labelId="export-format-label"
              id="export-format"
              value={exportFormat}
              onChange={handleFormatChange}
              label="Select export format"
              sx={{ height: '48px' }}
            >
              <MenuItem value="">
                <Typography color="text.secondary">Select export format</Typography>
              </MenuItem>
              <MenuItem value="pdf">Portable document (.pdf)</MenuItem>
              <MenuItem value="csv">Comma delimited (.csv)</MenuItem>
              <MenuItem value="txt">Fixed length (.txt)</MenuItem>
            </MuiSelect>
            {isFormatInvalid && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                Please select an export format.
              </Typography>
            )}
          </FormControl>
        </Box>

        <Box style={{ marginBottom: '24px' }} />

        {/* Grey divider line above Sort by */}
        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Sort By Radio Buttons */}
        <Typography
          variant="subtitle2"
          style={{
            marginBottom: '12px',
            fontWeight: 600,
            fontSize: '14px',
            color: isSortDisabled ? '#9E9E9E' : '#000000',
          }}
        >
          Sort by
        </Typography>
        <RadioGroup
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ marginBottom: '24px' }}
        >
          <FormControlLabel
            value="ascending"
            control={<Radio />}
            label="Ascending"
            disabled={isSortDisabled}
          />
          <FormControlLabel
            value="descending"
            control={<Radio />}
            label="Descending"
            disabled={isSortDisabled}
          />
        </RadioGroup>

        {/* Grey divider line above buttons */}
        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
          }}
        >
          <Button
            onClick={handleCancel}
            buttonVariant="tertiary"
            style={{
              height: '48px',
              minHeight: '48px',
              width: '82px',
              fontWeight: 700,
              fontSize: '14px',
              fontStyle: 'bold',
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleDownload}
            buttonVariant="primary"
            disabled={isSortDisabled}
            style={{
              height: '48px',
              minHeight: '48px',
              width: '132px',
              fontWeight: 700,
              fontSize: '14px',
              fontStyle: 'bold',
            }}
          >
            DOWNLOAD
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

export default DownloadAuditTrailPopover;
