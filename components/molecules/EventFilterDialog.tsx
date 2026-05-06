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
import { Button,DatePicker } from 'dist/standard-bank-react';

export interface EventFilterValues {
  userAccountName: string;
  eventFunction: string;
  entityName: string;
  initiatorUserId: string;
  valueDate: Date | null;
}

export interface EventFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: EventFilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<EventFilterValues>;
  /** Supply custom option sets if needed */
  eventFunctions?: string[];
}

const DEFAULT_VALUES: EventFilterValues = {
  userAccountName: '',
  eventFunction: '',
  entityName: '',
  initiatorUserId: '',
  valueDate: null,
};

const DEFAULT_EVENT_FUNCTIONS = [
  'Activate',
  'Add',
  'Cancel',
  'Create',
  'Decline',
  'Delete',
  'Enable',
  'Repair',
  'Suspend',
  'Update',
];

export default function EventFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  eventFunctions = DEFAULT_EVENT_FUNCTIONS,
}: EventFilterDialogProps) {
  const [values, setValues] = React.useState<EventFilterValues>({
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
  const handleText = (key: keyof EventFilterValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
    };

  const handleSelect = (key: keyof EventFilterValues) =>
    (e: SelectChangeEvent<string>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
    };

  const handleDateChange = (date: unknown) => {
    setValues((v) => ({ ...v, valueDate: date as Date | null }));
  };

  const handleApply = () => {
    onApply(values);
  };

  if (!open) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ zIndex: (theme) => theme.zIndex.modal - 1 }}
    >
      <Paper
        elevation={8}
        sx={{
          width: 400,
          p: 3,
          pt: 2,
          borderRadius: 2,
          minHeight: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
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
          Filter event types
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
            label="User account name"
            value={values.userAccountName}
            onChange={handleText('userAccountName')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="event-function-label">Event function</InputLabel>
            <Select
              labelId="event-function-label"
              label="Event function"
              value={values.eventFunction}
              onChange={handleSelect('eventFunction')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {eventFunctions.map((fn) => (
                <MenuItem key={fn} value={fn}>
                  {fn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Entity name"
            value={values.entityName}
            onChange={handleText('entityName')}
            fullWidth
          />

          <TextField
            label="Initiator user ID"
            value={values.initiatorUserId}
            onChange={handleText('initiatorUserId')}
            fullWidth
          />

          <Box sx={{ '& .MuiPopper-root': { zIndex: 9999 } }}>
            <DatePicker
              label="Date or date range"
              value={values.valueDate}
              onChange={handleDateChange}
              fullWidth
              actions={[
                {
                  label: 'CANCEL',
                  variant: 'tertiary',
                  onClick: () => setValues((v) => ({ ...v, valueDate: null })),
                },
                {
                  label: 'OK',
                  variant: 'tertiary',
                  onClick: () => {},
                },
              ]}
            />
          </Box>
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
 