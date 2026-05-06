import * as React from 'react';
import {
  Box,
  Paper,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Popper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';

export type PostingOption =
  | 'All'
  | 'Itemized'
  | 'Consolidate per agent bank'
  | 'Consolidate across all agent banks';

export interface UnpaidOptionsFilterValues {
  name: string;
  postingOption: PostingOption | '';
}

export interface UnpaidOptionsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: UnpaidOptionsFilterValues) => void;
  initialValues?: Partial<UnpaidOptionsFilterValues>;
}

const DEFAULT_VALUES: UnpaidOptionsFilterValues = {
  name: '',
  postingOption: 'All',
};

const POSTING_OPTIONS: PostingOption[] = [
  'All',
  'Itemized',
  'Consolidate per agent bank',
  'Consolidate across all agent banks',
];

export default function UnpaidOptionsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: UnpaidOptionsFilterDialogProps) {
  const [values, setValues] = React.useState<UnpaidOptionsFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  React.useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText =
    (key: keyof UnpaidOptionsFilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
    };

  const handleSelect = (key: keyof UnpaidOptionsFilterValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value as any }));
  };

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" style={{ zIndex: 1400 }}>
      <Paper
        elevation={0}
        sx={{
          width: 400,
          p: 3,
          pt: 2,
          borderRadius: 2,
          minHeight: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          border: '1px solid #CED3D9',
          top: '-110px',
          position: 'absolute',
          right: '-10',
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filter unpaid options
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          mt={1}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              height: '48px',
            },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              top: '0px',
              left: '0px',
            },
          }}
        >
          <TextField
            label="Name"
            value={values.name}
            onChange={handleText('name')}
            fullWidth
            size="medium"
          />

          <FormControl fullWidth>
            <InputLabel id="posting-option-label">Posting option</InputLabel>
            <Select
              labelId="posting-option-label"
              label="Posting option"
              value={values.postingOption}
              onChange={handleSelect('postingOption')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {POSTING_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            style={{
              width: '82px',
              height: '48px',
              minWidth: '82px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            style={{
              width: '153px',
              height: '48px',
              minWidth: '153px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            UPDATE TABLE
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
