'use client';

import * as React from 'react';
import {
  Box,
  Popover,
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

type ExportFormat = 'csv' | 'txt' | 'pdf';
type SortBy = 'ascending' | 'descending';

export interface DownloadCollectionDialogProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (payload: { format: ExportFormat; sortBy: SortBy }) => void;
  /** Dialog title (default: 'Download debtor history') */
  title?: string;
  /** Defaults: ['csv','txt','pdf'] */
  availableFormats?: ExportFormat[];
  /** Optional default sort (defaults to 'ascending') */
  defaultSortBy?: SortBy;
  /** Optional default format (defaults to empty/placeholder) */
  defaultFormat?: ExportFormat | '';
  /** Disable while submitting */
  loading?: boolean;
}

export default function DownloadCollectionDialog({
  open,
  anchorEl,
  onClose,
  onDownload,
  title = 'Download debtor history',
  availableFormats = ['pdf', 'csv', 'txt'],
  defaultSortBy = 'ascending',
  defaultFormat = '',
  loading = false,
}: DownloadCollectionDialogProps) {
  const testIdPrefix = 'download-collection';
  const [format, setFormat] = React.useState<ExportFormat | ''>(defaultFormat);
  const [sortBy, setSortBy] = React.useState<SortBy>(defaultSortBy);
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      // reset local state whenever dialog opens
      setFormat(defaultFormat);
      setSortBy(defaultSortBy);
      setTouched(false);
    }
  }, [open, defaultFormat, defaultSortBy]);

  const handleFormatChange = (e: SelectChangeEvent) => {
    setFormat(e.target.value as ExportFormat);
    if (!touched) setTouched(true);
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
    onDownload({ format, sortBy });
  };

  const getFormatLabel = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'pdf':
        return 'Portable Document Format (.pdf)';
      case 'csv':
        return 'Comma Separated Values (.csv)';
      case 'txt':
        return 'Text File (.txt)';
      default:
        return fmt;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      data-testid={buildTestId(testIdPrefix, 'dialog')}
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
          padding: '24px',
          width: '540px',
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
            aria-label="Close dialog"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Select export format */}
        <FormControl fullWidth error={isFormatInvalid} sx={{ marginBottom: '24px' }}>
          <Typography
            variant="subtitle2"
            sx={{ marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}
          >
            Select export format
          </Typography>
          <Select
            value={format}
            onChange={handleFormatChange}
            displayEmpty
            disabled={loading}
            data-testid={buildTestId(testIdPrefix, 'select-format')}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '8px',
              },
            }}
          >
            <MenuItem value="" disabled>
              <em>Select format</em>
            </MenuItem>
            {availableFormats.map((fmt) => (
              <MenuItem key={fmt} value={fmt}>
                {getFormatLabel(fmt)}
              </MenuItem>
            ))}
          </Select>
          {isFormatInvalid && (
            <Typography variant="caption" color="error" sx={{ marginTop: '4px' }}>
              Please select an export format
            </Typography>
          )}
        </FormControl>

        {/* Sort by */}
        <FormControl component="fieldset" sx={{ marginBottom: '32px' }}>
          <FormLabel
            component="legend"
            sx={{ marginBottom: '12px', fontWeight: 500, fontSize: '14px', color: '#000' }}
          >
            Sort by
          </FormLabel>
          <RadioGroup value={sortBy} onChange={handleSortChange} data-testid={buildTestId(testIdPrefix, 'radio-group-sort')}>
            <FormControlLabel
              value="ascending"
              control={<Radio disabled={loading} data-testid={buildTestId(testIdPrefix, 'radio-ascending')} />}
              label="Ascending"
            />
            <FormControlLabel
              value="descending"
              control={<Radio disabled={loading} data-testid={buildTestId(testIdPrefix, 'radio-descending')} />}
              label="Descending"
            />
          </RadioGroup>
        </FormControl>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            buttonVariant="tertiary"
            style={{ flex: 1 }}
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!canDownload}
            buttonVariant="primary"
            style={{ flex: 1 }}
            data-testid={buildTestId(testIdPrefix, 'download-button')}
          >
            {loading ? 'DOWNLOADING...' : 'DOWNLOAD'}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
