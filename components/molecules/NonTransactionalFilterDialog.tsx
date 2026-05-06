import * as React from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Popper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
export interface FilterValues {
  predefinedAuthRuleName: string;
}

export interface NonTransactionalFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Test ID prefix for testing */
  testIdPrefix?: string;
}

const DEFAULT_VALUES: FilterValues = {
  predefinedAuthRuleName: '',
};

export default function NonTransactionalFilterDialog({
  testIdPrefix='non-transactional-filter-dialog',
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: NonTransactionalFilterDialogProps) {
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  // Reset when dialog opens (so repeated opens reflect latest defaults)
  React.useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  // Handlers
  const handleText = (key: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleClear = () => setValues(DEFAULT_VALUES);

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" style={{ zIndex: 1400 }} data-testid={buildTestId(testIdPrefix, 'popper')}>
      <Paper
        elevation={0}
        sx={{
          width: '400px',
          p: 3,
          pt: 2,
          borderRadius: 2,
          overflowY: 'auto',
          boxSizing: 'border-box',
          border: '1px solid #CED3D9',
          top: '0px',
          position: 'absolute',
          right: '-0px',
        }}
        data-testid={buildTestId(testIdPrefix, 'container')}
      >
        <IconButton
          aria-label="Close filter dialog"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          data-testid={buildTestId(testIdPrefix, 'button-close')}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: '48px', fontWeight: 600 }}>
          Filter predefined authorisation rules
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
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
            label="Predefined authorisation rule name"
            value={values.predefinedAuthRuleName}
            onChange={handleText('predefinedAuthRuleName')}
            fullWidth
            size="medium"
            data-testid={buildTestId(testIdPrefix, 'input-rule-name')}
          />
        </Box>

        <Box mt={2}>
          <Divider />
        </Box>

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            buttonVariant="tertiary"
            onClick={handleClear}
            style={{ width: '82px', height: '48px' }}
            data-testid={buildTestId(testIdPrefix, 'button-cancel')}
            aria-label="Cancel filter"
          >
            cancel
          </Button>
          <Button
            buttonVariant="primary"
            onClick={handleApply}
            style={{ width: '153px', height: '48px' }}
            data-testid={buildTestId(testIdPrefix, 'button-apply')}
            aria-label="Apply filter and update table"
          >
            Update table
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
