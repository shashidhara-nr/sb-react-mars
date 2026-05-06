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
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

type ExportFormat = 'csv' | 'txt' | 'pdf';
type SortBy = 'ascending' | 'descending';
export interface ExportFieldOption {
  key: string;
  label: string;
  mandatory: boolean;
}

export interface ExportFormatOption {
  label: string;
  value: ExportFormat;
}

export const BENEFICIARY_EXPORT_FIELDS: ExportFieldOption[] = [
  { key: 'bankAddress1', label: 'Debtor Bank Address 1', mandatory: false },
  { key: 'bankAddress2', label: 'Debtor Bank Address 2', mandatory: false },
  { key: 'address2', label: 'Debtor Address 2', mandatory: false },
  { key: 'address3', label: 'Debtor Address 3', mandatory: false },
];

export const DEFAULT_EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  { label: 'Portable Document (.pdf)', value: 'pdf' },
  { label: 'Comma delimited (.csv)', value: 'csv' },
  { label: 'Fixed length (.txt)', value: 'txt' },
];

export interface DownloadDebtorDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (payload: { format: ExportFormat; sortBy: SortBy }) => void;
  /** Dialog title (default: 'Download debtor') */
  title?: string;
  /** Defaults: ['csv','xlsx','pdf'] */
  availableFormats?: ExportFormat[];
  /** Optional default sort (defaults to 'ascending') */
  defaultSortBy?: SortBy;
  /** Optional default format (defaults to empty/placeholder) */
  defaultFormat?: ExportFormat | '';
  /** Disable while submitting */
  loading?: boolean;
  testIdPrefix?: string;
  beneficiaryExportFields?: ExportFieldOption[];
  exportFormatOptions?: ExportFormatOption[];
  /** Number of selected records */
  selectedCount?: number;
  hideSorting?: boolean;
}

export default function DownloadDebtorDialog({
  open,
  anchorEl,
  onClose,
  onDownload,
  title = 'Download debtor',
  availableFormats = ['pdf', 'csv', 'txt'],
  defaultSortBy = 'ascending',
  defaultFormat = '',
  loading = false,
  testIdPrefix = 'download-debtor-dialog',
  beneficiaryExportFields = BENEFICIARY_EXPORT_FIELDS,
  exportFormatOptions = DEFAULT_EXPORT_FORMAT_OPTIONS,
  selectedCount = 0,
  hideSorting=false,
}: DownloadDebtorDialogProps) {
  const [format, setFormat] = useState<ExportFormat | ''>(defaultFormat);
  const [sortBy, setSortBy] = useState<SortBy>(defaultSortBy);
  const [touched, setTouched] = useState(false);
  const [formatType, setFormatType] = useState<'standard' | 'delimited'>('standard');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      // reset local state whenever dialog opens
      setFormat(defaultFormat);
      setSortBy(defaultSortBy);
      setTouched(false);
      setFormatType('standard');
      // Reset to empty selection
      setSelectedFields(new Set());
    }
  }, [open, defaultFormat, defaultSortBy]);

  const handleFormatChange = (e: SelectChangeEvent) => {
    setFormat(e.target.value as ExportFormat);
    if (!touched) setTouched(true);
    // Reset field selection when format changes
    setSelectedFields(new Set());
  };

  const handleFormatTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormatType((e.target as HTMLInputElement).value as 'standard' | 'delimited');
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  };

  const handleResetFields = () => {
    setSelectedFields(new Set());
  };

  // Split fields into two columns for display
  const midpoint = Math.ceil(beneficiaryExportFields.length / 2);
  const leftColumnFields = beneficiaryExportFields.slice(0, midpoint);
  const rightColumnFields = beneficiaryExportFields.slice(midpoint);

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
    // Pass format, sortBy, formatType, and selected fields
    onDownload({
      format,
      sortBy,
      formatType,
      selectedFields: Array.from(selectedFields)
    } as any);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      data-testid={buildTestId(testIdPrefix, 'popover')}
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
              sx={{ 
                height: '48px',
                '& .MuiSvgIcon-root': {
                  color: '#0051FF',
                }
              }}
              data-testid={buildTestId(testIdPrefix, 'format-select')}
            >
              <MenuItem value="">
                <Typography color="text.secondary">Select export format</Typography>
              </MenuItem>
              {exportFormatOptions.map((option: ExportFormatOption) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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

        {/* Show field selection if delimited selected */}
        {(format === 'csv' || format === 'txt') && formatType === 'delimited' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: '16px' }}>
              Customize export fields
            </Typography>

            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={1}>
                {/* Left column */}
                <Grid size={6}>
                  {leftColumnFields.map((field) => (
                    <Box key={field.key} sx={{ mb: 1 }}>
                      <FormControlLabel
                        control={
                          <input
                            type="checkbox"
                            checked={selectedFields.has(field.key)}
                            onChange={() => handleFieldToggle(field.key)}
                            style={{
                              marginRight: '8px',
                              cursor: 'pointer'
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: '14px' }}
                          >
                            {field.label}
                          </Typography>
                        }
                        sx={{ margin: 0 }}
                      />
                    </Box>
                  ))}
                </Grid>

                {/* Right column */}
                <Grid size={6}>
                  {rightColumnFields.map((field) => (
                    <Box key={field.key} sx={{ mb: 1 }}>
                      <FormControlLabel
                        control={
                          <input
                            type="checkbox"
                            checked={selectedFields.has(field.key)}
                            onChange={() => handleFieldToggle(field.key)}
                            style={{
                              marginRight: '8px',
                              cursor: 'pointer'
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: '14px' }}
                          >
                            {field.label}
                          </Typography>
                        }
                        sx={{ margin: 0 }}
                      />
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Sort by */}
        {!hideSorting && (
          <>
            <FormControl component="fieldset" fullWidth disabled={!format || ((format === 'csv' || format === 'txt') && selectedCount === 1)}>
          <FormLabel component="legend">
            <Typography
              variant="subtitle2"
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: !format || ((format === 'csv' || format === 'txt') && selectedCount === 1) ? '#9E9E9E' : '#000000',
              }}
            >
              {(format === 'csv' || format === 'txt') ? 'Sort by action code and debtor code' : 'Sort by'}
            </Typography>
          </FormLabel>
          <RadioGroup
            aria-label="Sort by"
            name="sort-by"
            value={sortBy}
            onChange={handleSortChange}
            sx={{ mt: 1 }}
            data-testid={buildTestId(testIdPrefix, 'sort-by-radio-group')}
          >
            <FormControlLabel
              value="ascending"
              control={<Radio />}
              label="Ascending"
              disabled={!format || ((format === 'csv' || format === 'txt') && selectedCount === 1)}
            />
            <FormControlLabel
              value="descending"
              control={<Radio />}
              label="Descending"
              disabled={!format || ((format === 'csv' || format === 'txt') && selectedCount === 1)}
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />
          </>
        )
        }
        

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
            {loading ? 'PREPARING…' : 'DOWNLOAD'}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
