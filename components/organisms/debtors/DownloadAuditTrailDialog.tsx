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
  FormLabel,
  Grid,
} from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';

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
  const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtor-download-audit-trail';
  const [exportFormat, setExportFormat] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');
  const [touched, setTouched] = useState(false);
  const [formatType, setFormatType] = useState<'standard' | 'delimited'>('standard');
  const [delimitedOptions, setDelimitedOptions] = useState<string[]>([]);

  const handleFormatChange = (e: SelectChangeEvent) => {
    setExportFormat(e.target.value);
    if (!touched) setTouched(true);
    setFormatType('standard');
    setDelimitedOptions([]);
  };

  const handleFormatTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormatType(e.target.value as 'standard' | 'delimited');
    setDelimitedOptions([]);
  };

  const handleDelimitedOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDelimitedOptions((prev) =>
      e.target.checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
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
    setFormatType('standard');
    setDelimitedOptions([]);
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
      data-testid={buildTestId(testIdPrefix, 'popover')}
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
          data-testid={buildTestId(testIdPrefix, 'header')}
        >
          <Typography variant="h6" style={{ fontWeight: 600, fontSize: '18px' }}>
            {translateLang('downloadAuditTrail')}
          </Typography>
          <IconButton onClick={onClose} size="small" style={{ padding: '4px' }} data-testid={buildTestId(testIdPrefix, 'close-button')}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          variant="subtitle2"
          style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}
        >
          {translateLang('selectExportFormat')}
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
          data-testid={buildTestId(testIdPrefix, 'format-select-container')}
        >
          <FormControl fullWidth error={isFormatInvalid}>
            <InputLabel id="export-format-label">{translateLang('selectExportFormat')}</InputLabel>
            <MuiSelect
              labelId="export-format-label"
              id="export-format"
              value={exportFormat}
              onChange={handleFormatChange}
              label={translateLang('selectExportFormat')}
              sx={{ height: '48px' }}
              data-testid={buildTestId(testIdPrefix, 'format-select')}
            >
              <MenuItem value="">
                <Typography color="text.secondary">{translateLang('selectExportFormat')}</Typography>
              </MenuItem>
              <MenuItem value="pdf">{translateLang('portableDocument')}</MenuItem>
              <MenuItem value="csv">{translateLang('commaSeparated')}</MenuItem>
              <MenuItem value="txt">{translateLang('fixedLength')}</MenuItem>
            </MuiSelect>
            {isFormatInvalid && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {translateLang('pleaseSelectExportFormat')}
              </Typography>
            )}
          </FormControl>
        </Box>

        <Box style={{ marginBottom: '24px' }} />

        {/* ✅ Grey divider line above Sort by */}
        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Sort By Radio Buttons */}
        <Typography
          variant="subtitle2"
          style={{
            marginBottom: '12px',
            fontWeight: 600,
            fontSize: '14px',
            color: isSortDisabled ? '#9E9E9E' : '#000000', // ✅ Grey out text when disabled
          }}
        >
          {translateLang('sortBy')}
        </Typography>
        <RadioGroup
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ marginBottom: '24px' }}
          data-testid={buildTestId(testIdPrefix, 'sort-radio-group')}
        >
          <FormControlLabel
            value="ascending"
            control={<Radio />}
            label={translateLang('ascending')}
            disabled={isSortDisabled} // ✅ Disable when no format selected
          />
          <FormControlLabel
            value="descending"
            control={<Radio />}
            label={translateLang('descending')}
            disabled={isSortDisabled} // ✅ Disable when no format selected
          />
        </RadioGroup>

        {/* ✅ Grey divider line above buttons */}
        <Divider sx={{ marginY: '24px', backgroundColor: '#CED3D9' }} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
          }}
          data-testid={buildTestId(testIdPrefix, 'action-buttons')}
        >
          <Button
            onClick={handleCancel}
            buttonVariant="tertiary"
            style={{
              height: '48px',
              minHeight: '48px',
              width: '82px',
              fontWeight:  700,
              fontSize: '14px',
              fontStyle:  'bold',
            }}
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          >
            {translateLang('cancel')}
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
            data-testid={buildTestId(testIdPrefix, 'download-button')}
          >
            {translateLang('download')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

export default DownloadAuditTrailPopover;