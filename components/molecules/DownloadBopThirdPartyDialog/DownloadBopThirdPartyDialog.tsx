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
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

type ExportFormat = 'csv' | 'txt' | 'pdf';
type SortBy = 'accountNumber' | 'accountName';

export interface DownloadBopThirdPartyDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (payload: { format: ExportFormat; sortBy: SortBy }) => void;
  /** Dialog title (default: 'Download BOP third party') */
  title?: string;
  /** Defaults: ['csv','xlsx','pdf'] */
  availableFormats?: ExportFormat[];
  /** Optional default sort (defaults to 'accountNumber') */
  defaultSortBy?: SortBy;
  /** Optional default format (defaults to empty/placeholder) */
  defaultFormat?: ExportFormat | '';
  /** Disable while submitting */
  loading?: boolean;
}

export default function DownloadBopThirdPartyDialog({
  open,
  anchorEl,
  onClose,
  onDownload,
  title = 'Download BOP third party',
  availableFormats = ['pdf', 'csv', 'txt'],
  defaultSortBy = 'accountNumber',
  defaultFormat = '',
  loading = false,
  ...props
}: DownloadBopThirdPartyDialogProps & { 'data-testid'?: string }) {
  const testIdPrefix = props['data-testid'] || 'bop-third-parties-download-dialog';
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
          <IconButton onClick={onClose} size="small" style={{ padding: '4px' }} data-testid={buildTestId(testIdPrefix, 'close-button')}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Select export format */}
        <Typography
          variant="subtitle2"
          style={{ marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}
        >
          Select export format
        </Typography>
        <FormControl
          fullWidth
          error={isFormatInvalid}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
          }}
        >
          <Select
            data-testid={buildTestId(testIdPrefix, 'format-select')}
            value={format}
            onChange={handleFormatChange}
            displayEmpty
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select a format
            </MenuItem>
            {availableFormats.map((fmt) => (
              <MenuItem key={fmt} value={fmt}>
                {fmt.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
          {isFormatInvalid && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
              Please select an export format
            </Typography>
          )}
        </FormControl>

        {/* Format Type */}
        {format === 'txt' && (
          <>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel
                component="legend"
                style={{ fontWeight: 500, fontSize: '14px', marginBottom: '8px', color: '#000' }}
              >
                Format type
              </FormLabel>
              <RadioGroup value={formatType} onChange={handleFormatTypeChange} data-testid={buildTestId(testIdPrefix, 'format-type-radio')}>
                <FormControlLabel value="standard" control={<Radio />} label="Standard format" />
                <FormControlLabel value="delimited" control={<Radio />} label="Delimited format" />
              </RadioGroup>
            </FormControl>

            {formatType === 'delimited' && (
              <Box sx={{ mb: 3, pl: 4 }}>
                <Typography
                  variant="subtitle2"
                  style={{ fontWeight: 500, fontSize: '14px', marginBottom: '8px' }}
                >
                  Delimited by
                </Typography>
                <FormControlLabel
                  control={
                    <input
                      type="checkbox"
                      value="comma"
                      checked={delimitedOptions.includes('comma')}
                      onChange={handleDelimitedOptionChange}
                    />
                  }
                  label="Comma"
                />
                <FormControlLabel
                  control={
                    <input
                      type="checkbox"
                      value="tab"
                      checked={delimitedOptions.includes('tab')}
                      onChange={handleDelimitedOptionChange}
                    />
                  }
                  label="Tab"
                />
                <FormControlLabel
                  control={
                    <input
                      type="checkbox"
                      value="semicolon"
                      checked={delimitedOptions.includes('semicolon')}
                      onChange={handleDelimitedOptionChange}
                    />
                  }
                  label="Semicolon"
                />
              </Box>
            )}
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Sort By */}
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            style={{ fontWeight: 500, fontSize: '14px', marginBottom: '8px', color: '#000' }}
          >
            Sort by
          </FormLabel>
          <RadioGroup value={sortBy} onChange={handleSortChange} data-testid={buildTestId(testIdPrefix, 'sort-by-radio')}>
            <FormControlLabel
              value="accountNumber"
              control={<Radio />}
              label="Account number (ascending)"
            />
            <FormControlLabel
              value="accountName"
              control={<Radio />}
              label="Account name (alphabetically)"
            />
          </RadioGroup>
        </FormControl>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
            onClick={onClose}
            buttonVariant="tertiary"
            style={{ width: '82px', height: '48px', borderRadius: '8px' }}
          >
            CANCEL
          </Button>
          <Button
            data-testid={buildTestId(testIdPrefix, 'download-button')}
            onClick={handleDownload}
            buttonVariant="primary"
            disabled={!canDownload}
            style={{ width: '153px', height: '48px', borderRadius: '8px' }}
          >
            DOWNLOAD
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
