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
} from '@mui/material';
import { Button, Select } from 'dist/standard-bank-react';
import CloseIcon from '@mui/icons-material/Close';
import { buildTestId } from 'src/utils/testIds';

interface DownloadAuditTrailPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDownload: (format:  string, sortOrder: string) => void;
  testIdPrefix?: string;
}

function DownloadAuditTrailPopover({
  open,
  anchorEl,
  onClose,
  onDownload,
  testIdPrefix = 'download-audit-trail-popover',
}:  DownloadAuditTrailPopoverProps) {
  const [exportFormat, setExportFormat] = useState(''); // ✅ Changed to empty string
  const [sortOrder, setSortOrder] = useState('ascending');

  const handleDownload = () => {
    onDownload(exportFormat, sortOrder);
    onClose();
  };

  const handleCancel = () => {
    setExportFormat(''); // ✅ Reset to empty
    setSortOrder('ascending');
    onClose();
  };

  const handleFormatChange = (value: string) => {
    setExportFormat(value);
  };

  // ✅ Disable sort options if no format is selected
  const isSortDisabled = !exportFormat;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      data-testid={buildTestId(testIdPrefix, 'popover')}
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
          marginTop: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Box>
        {/* Header */}
        <Box
          data-testid={buildTestId(testIdPrefix, 'header')}
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
          <IconButton
            onClick={onClose}
            size="small"
            style={{ padding: '4px' }}
            data-testid={buildTestId(testIdPrefix, 'close-button')}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          variant="subtitle2"
          style={{ marginTop: '16px', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}
        >
          Select export format
        </Typography>

        <Box
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            '& .MuiInputLabel-root': {
              top: '4px',
            },
            '& .MuiInputLabel-shrink': {
              top: '0px',
            },
          }}
        >
          <Box data-testid={buildTestId(testIdPrefix, 'format-select')}>
            <Select
              options={[
                { label: 'Portable document (.pdf)', value: 'pdf' },
                { label: 'Comma delimited (.csv)', value: 'csv' },
                { label: 'Fixed length (.txt)', value: 'txt' },
              ]}
              selectProps={{
                label: 'Select export format',
                required: true,
                labelId: 'export-format-select',
                onChange: (e: any) => handleFormatChange(e.target.value),
              }}
              name="exportFormat"
              value={exportFormat}
              error={false}
              helperText=""
              height="48px"
            />
          </Box>
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
          Sort by
        </Typography>
        <RadioGroup
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ marginBottom: '24px' }}
          data-testid={buildTestId(testIdPrefix, 'sort-order-radio-group')}
        >
          <FormControlLabel
            value="ascending"
            control={<Radio />}
            label="Ascending"
            disabled={isSortDisabled} // ✅ Disable when no format selected
          />
          <FormControlLabel
            value="descending"
            control={<Radio />}
            label="Descending"
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
        >
        <Button
          onClick={handleCancel}
          buttonVariant="tertiary"
          data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          style={{
              height: '48px',
              minHeight: '48px',
              width: '82px',
              fontWeight:  700,
              fontSize: '14px',
              fontStyle:  'bold',
            }}
          >
            CANCEL
          </Button>
        <Button
          onClick={handleDownload}
          buttonVariant="primary"
          disabled={isSortDisabled}
          data-testid={buildTestId(testIdPrefix, 'download-button')}
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
