'use client';

import * as React from 'react';
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
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';

type ExportFormat = 'csv' | 'txt' | 'pdf';
type SortBy = 'billerName' | 'billerCode';

export interface DownloadBillerDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (payload: { format: ExportFormat; sortBy: SortBy }) => void;
  /** Dialog title (default: 'Download billers') */
  title?: string;
  /** Defaults: ['csv','xlsx','pdf'] */
  availableFormats?: ExportFormat[];
  /** Optional default sort (defaults to 'billerName') */
  defaultSortBy?: SortBy;
  /** Optional default format (defaults to empty/placeholder) */
  defaultFormat?: ExportFormat | '';
  /** Disable while submitting */
  loading?: boolean;
}

export default function DownloadBillerDialog({
  open,
  anchorEl,
  onClose,
  onDownload,
  title = 'Download billers',
  availableFormats = ['pdf', 'csv', 'txt'],
  defaultSortBy = 'billerName',
  defaultFormat = '',
  loading = false,
}: DownloadBillerDialogProps) {
  const [format, setFormat] = React.useState<ExportFormat | ''>(defaultFormat);
  const [sortBy, setSortBy] = React.useState<SortBy>(defaultSortBy);
  const [touched, setTouched] = React.useState(false);
  // New state for format type and delimited options
  const [formatType, setFormatType] = React.useState<'standard' | 'delimited'>('standard');
  const [delimitedOptions, setDelimitedOptions] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open) {
      // reset local state whenever dialog opens
      setFormat(defaultFormat);
      setSortBy(defaultSortBy);
      setTouched(false);
      setFormatType('standard');
      setDelimitedOptions([]);
    }
  }, [open, defaultFormat, defaultSortBy]);

  const handleFormatChange = (e: SelectChangeEvent) => {
    setFormat(e.target.value as ExportFormat);
    if (!touched) setTouched(true);
    setFormatType('standard');
    setDelimitedOptions([]);
  };
  const handleFormatTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormatType((e.target as HTMLInputElement).value as 'standard' | 'delimited');
    setDelimitedOptions([]);
  };

  const handleDelimitedOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDelimitedOptions((prev) =>
      e.target.checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy((e.target as HTMLInputElement).value as SortBy);
  };

  const isFormatInvalid = touched && format === '';
  const canDownload = !!format && !loading;

  const handleDownload = () => {
    if (!format) {
      setTouched(true);
      return;
    }
    // You may want to pass formatType and delimitedOptions in the payload as well
    onDownload({ format, sortBy });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
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
          <IconButton onClick={onClose} size="small" style={{ padding: '4px' }}>
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
            >
              <MenuItem value="">
                <Typography color="text.secondary">Select export format</Typography>
              </MenuItem>
              <MenuItem value="pdf">Portable Document (PDF)</MenuItem>
              <MenuItem value="csv">Comma separated (CSV)</MenuItem>
              <MenuItem value="txt">Fixed length (TXT)</MenuItem>
            </Select>
            {isFormatInvalid && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                Please select an export format.
              </Typography>
            )}
          </FormControl>
        </Box>

        {/* Show format type if CSV or TXT selected */}
        {(format === 'csv' || format === 'txt') && (
          <Box sx={{ mb: 2 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">
                <Typography variant="subtitle2" color="text.secondary">
                  Format type
                </Typography>
              </FormLabel>
              <RadioGroup
                aria-label="Format type"
                name="format-type"
                value={formatType}
                onChange={handleFormatTypeChange}
                sx={{ mt: 1 }}
              >
                <FormControlLabel value="standard" control={<Radio />} label="Standard format" />
                <FormControlLabel value="delimited" control={<Radio />} label="Delimited format" />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Show delimited options if delimited selected */}
        {(format === 'csv' || format === 'txt') && formatType === 'delimited' && (
          <Box sx={{ mb: 2, pl: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <FormControlLabel
                    control={
                      <input
                        type="checkbox"
                        value="option1"
                        checked={delimitedOptions.includes('option1')}
                        onChange={handleDelimitedOptionChange}
                      />
                    }
                    label="Include header row"
                  />
                </Grid>
                <Grid size={6}>
                  <FormControlLabel
                    control={
                      <input
                        type="checkbox"
                        value="option2"
                        checked={delimitedOptions.includes('option2')}
                        onChange={handleDelimitedOptionChange}
                      />
                    }
                    label="Quote all fields"
                  />
                </Grid>
                <Grid size={6}>
                  <FormControlLabel
                    control={
                      <input
                        type="checkbox"
                        value="option3"
                        checked={delimitedOptions.includes('option3')}
                        onChange={handleDelimitedOptionChange}
                      />
                    }
                    label="Use semicolon delimiter"
                  />
                </Grid>
                <Grid size={6}>
                  <FormControlLabel
                    control={
                      <input
                        type="checkbox"
                        value="option4"
                        checked={delimitedOptions.includes('option4')}
                        onChange={handleDelimitedOptionChange}
                      />
                    }
                    label="Escape special characters"
                  />
                </Grid>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <input
                        type="checkbox"
                        value="option5"
                        checked={delimitedOptions.includes('option5')}
                        onChange={handleDelimitedOptionChange}
                      />
                    }
                    label="Remove empty lines"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Sort by */}
        <FormControl component="fieldset" fullWidth disabled={!format}>
          <FormLabel component="legend">
            <Typography
              variant="subtitle2"
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: !format ? '#9E9E9E' : '#000000',
              }}
            >
              Sort by
            </Typography>
          </FormLabel>
          <RadioGroup
            aria-label="Sort by"
            name="sort-by"
            value={sortBy}
            onChange={handleSortChange}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value="billerName"
              control={<Radio />}
              label="Biller Name"
              disabled={!format}
            />
            <FormControlLabel
              value="billerCode"
              control={<Radio />}
              label="Biller Code"
              disabled={!format}
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
            style={{
              height: '48px',
              minHeight: '48px',
              width: '132px',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {loading ? 'PREPARING…' : 'DOWNLOAD'}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
