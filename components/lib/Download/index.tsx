import React, { useState } from 'react';
import CommonDialog from '../CommonDialog';
import Select from '../Forms/Select';
import DatePicker from '../DatePicker';
import RadioButton from '../RadioButton';
import Button from '../Forms/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { DownloadIcon } from 'assets/icons';

export interface DownloadDialogProps {
  exportOptions?: { value: string; label: string }[];
  sortOptions?: { value: string; label: string }[];
  dialogTitle?: string;
  titleSx?: object;
}

const defaultExportOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
];
const defaultSortOptions = [
  { value: 'accountNumber', label: 'Account Number' },
  { value: 'accountName', label: 'Account Name' },
];

export default function DownloadDialog({
  exportOptions = defaultExportOptions,
  sortOptions = defaultSortOptions,
  dialogTitle = 'DOWNLOAD',
  titleSx = {},
}: DownloadDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState(
    exportOptions[0]?.value || '',
  );
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState(sortOptions[0]?.value || '');

  const handleDownload = () => {
    // Implement download logic here
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        buttonVariant="text"
        onClick={() => setDialogOpen(true)}
        startIcon={<DownloadIcon width={24} height={24} />}
      >
        Download
      </Button>
      <CommonDialog
        open={dialogOpen}
        title={dialogTitle}
        onClose={() => setDialogOpen(false)}
        actions={
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Button buttonVariant="text" onClick={() => setDialogOpen(false)}>
              CANCEL
            </Button>
            <Button buttonVariant="primary" onClick={handleDownload}>
              DOWNLOAD
            </Button>
          </Box>
        }
        maxWidth="32rem"
        titleSx={titleSx}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflow: 'visible',
          }}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 600, fontSize: 15, color: '#222', mb: 1 }}
            >
              Select export format
            </Typography>
            <Select
              options={exportOptions}
              value={exportFormat}
              name="exportFormat"
              error={false}
              // @ts-expect-error - err
              onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                setExportFormat(e.target.value as string)
              }
            />
          </Box>
          <Divider />
          <Box>
            <Typography
              sx={{ fontWeight: 600, fontSize: 15, color: '#222', mb: 1 }}
            >
              Filter by date range (optional)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                value={fromDate}
                onChange={(date) => setFromDate(date as Date | null)}
              />
              <DatePicker
                value={toDate}
                onChange={(date) => setToDate(date as Date | null)}
              />
            </Box>
          </Box>
          <Divider />
          <Box>
            <Typography
              sx={{ fontWeight: 600, fontSize: 15, color: '#222', mb: 1 }}
            >
              Sort by
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sortOptions.map((option) => (
                <RadioButton
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  handleChange={() => setSortBy(option.value)}
                  // @ts-expect-error - err
                  checked={sortBy === option.value}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </CommonDialog>
    </>
  );
}
