'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Popover,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Typography,
  IconButton,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

type ExportFormat = 'csv' | 'txt' | 'pdf';

export interface UnusableBeneficiariesDownloadDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (payload: { format: ExportFormat }) => void;
  /** Dialog title (default: 'Download') */
  title?: string;
  /** Disable while submitting */
  loading?: boolean;
  testIdPrefix?: string;
}

export default function UnusableBeneficiariesDownloadDialog({
  open,
  anchorEl,
  onClose,
  onDownload,
  title = 'Download',
  loading = false,
  testIdPrefix = 'unusable-beneficiaries-download-dialog',
}: UnusableBeneficiariesDownloadDialogProps) {
  const [format, setFormat] = useState<ExportFormat | ''>('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      // reset local state whenever dialog opens
      setFormat('');
      setTouched(false);
    }
  }, [open]);

  const handleFormatChange = (e: SelectChangeEvent) => {
    setFormat(e.target.value as ExportFormat);
    if (!touched) setTouched(true);
  };

  const isFormatInvalid = touched && format === '';
  const canDownload = !!format && !loading;

  const handleDownload = () => {
    if (!format) {
      setTouched(true);
      return;
    }
    onDownload({
      format,
    } as any);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      data-testid={buildTestId(testIdPrefix, 'popover')}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        style: {
          borderRadius: '8px',
          padding: '16px',
          width: '765px',
          marginTop: '12px',
          marginLeft: '-40px',
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
          <IconButton
            onClick={onClose}
            size="small"
            style={{ padding: '4px' }}
            data-testid={buildTestId(testIdPrefix, 'close-button')}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Select export format */}
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
            <Select
              labelId="export-format-label"
              id="export-format"
              value={format}
              onChange={handleFormatChange}
              label="Select export format"
              sx={{ height: '48px' }}
              data-testid={buildTestId(testIdPrefix, 'format-select')}
            >
              <MenuItem value="">
                <Typography color="text.secondary">Select export format</Typography>
              </MenuItem>
              <MenuItem value="pdf">Portable document (.pdf)</MenuItem>
              <MenuItem value="csv">Comma delimited (.csv)</MenuItem>
              <MenuItem value="txt">Fixed length (.txt)</MenuItem>
            </Select>
            {isFormatInvalid && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                Please select an export format.
              </Typography>
            )}
          </FormControl>
        </Box>

        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Sort by - always disabled */}
        <FormControl component="fieldset" fullWidth disabled={true}>
          <FormLabel component="legend">
            <Typography
              variant="subtitle2"
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#9E9E9E',
              }}
            >
              Sort by
            </Typography>
          </FormLabel>
          <RadioGroup
            aria-label="Sort by"
            name="sort-by"
            value="ascending"
            sx={{ mt: 1 }}
            data-testid={buildTestId(testIdPrefix, 'sort-by-radio-group')}
          >
            <FormControlLabel
              value="ascending"
              control={<Radio />}
              label="Ascending"
              disabled={true}
            />
            <FormControlLabel
              value="descending"
              control={<Radio />}
              label="Descending"
              disabled={true}
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
            style={{
              height: '48px',
              minHeight: '48px',
              width: '82px',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleDownload}
            buttonVariant="primary"
            disabled={!canDownload}
            data-testid={buildTestId(testIdPrefix, 'download-button')}
            style={{
              height: '48px',
              minHeight: '48px',
              width: '132px',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {loading ? 'DOWNLOADING...' : 'DOWNLOAD'}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
