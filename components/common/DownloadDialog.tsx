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

export interface DownloadDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (format: string, sortOrder: string) => void;
  title?: string;
  formatLabel?: string;
  sortByLabel?: string;
  cancelLabel?: string;
  downloadLabel?: string;
  formats?: Array<{ value: string; label: string }>;
  showSortBy?: boolean;
  width?: string;
}

const DEFAULT_FORMATS = [
  { value: 'pdf', label: 'Portable Document (PDF)' },
  { value: 'csv', label: 'Comma separated (CSV)' },
  { value: 'txt', label: 'Fixed length (TXT)' },
];

function DownloadDialog({
  open,
  anchorEl,
  onClose,
  onDownload,
  title = 'Download',
  formatLabel = 'Select export format',
  sortByLabel = 'Sort by',
  cancelLabel = 'CANCEL',
  downloadLabel = 'DOWNLOAD',
  formats = DEFAULT_FORMATS,
  showSortBy = true,
  width = '765px',
}: DownloadDialogProps) {
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
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setExportFormat('');
    setSortOrder('ascending');
    setTouched(false);
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
          width,
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
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small" style={{ padding: '4px' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          variant="subtitle2"
          style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}
        >
          {formatLabel}
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
            <InputLabel id="export-format-label">{formatLabel}</InputLabel>
            <MuiSelect
              labelId="export-format-label"
              id="export-format"
              value={exportFormat}
              onChange={handleFormatChange}
              label={formatLabel}
              sx={{ height: '48px' }}
            >
              <MenuItem value="">
                <Typography color="text.secondary">{formatLabel}</Typography>
              </MenuItem>
              {formats.map((format) => (
                <MenuItem key={format.value} value={format.value}>
                  {format.label}
                </MenuItem>
              ))}
            </MuiSelect>
            {isFormatInvalid && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                Please select an export format.
              </Typography>
            )}
          </FormControl>
        </Box>

        <Box style={{ marginBottom: '24px' }} />

        {showSortBy && (
          <>
            {/* Divider */}
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
              {sortByLabel}
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
          </>
        )}

        {/* Divider */}
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
            {cancelLabel}
          </Button>
          <Button
            onClick={handleDownload}
            buttonVariant="primary"
            disabled={isSortDisabled && showSortBy}
            style={{
              height: '48px',
              minHeight: '48px',
              width: '132px',
              fontWeight: 700,
              fontSize: '14px',
              fontStyle: 'bold',
            }}
          >
            {downloadLabel}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

export default DownloadDialog;
