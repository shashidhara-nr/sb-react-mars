import * as React from 'react';
import { Box, Paper, IconButton, Typography, Popper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button, PhoneNumber } from 'dist/standard-bank-react';
import Textfield from '@atoms/Textfield/Textfield';
import SelectField, { SelectOption } from '@atoms/Select/Select';

export interface EventAuthorisersFilterValues {
  customerName: string;
  userAccount: string;
  telephoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
}

export interface EventAuthorisersFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: EventAuthorisersFilterValues) => void;
  initialValues?: Partial<EventAuthorisersFilterValues>;
  userAccountOptions?: SelectOption[];
}

const DEFAULT_VALUES: EventAuthorisersFilterValues = {
  customerName: '',
  userAccount: '',
  telephoneNumber: '',
  mobileNumber: '',
  emailAddress: '',
};

const DEFAULT_USER_ACCOUNT_OPTIONS: SelectOption[] = [
  { label: '[User account 1]', value: '[User account 1]' },
  { label: '[User account 2]', value: '[User account 2]' },
  { label: '[User account 3]', value: '[User account 3]' },
  { label: '[User account 4]', value: '[User account 4]' },
  { label: '[User account 5]', value: '[User account 5]' },
];

const EventAuthorisersFilterDialog: React.FC<EventAuthorisersFilterDialogProps> = ({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  userAccountOptions = DEFAULT_USER_ACCOUNT_OPTIONS,
}) => {
  const [values, setValues] = React.useState<EventAuthorisersFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [emailError, setEmailError] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
      setEmailError('');
    }
  }, [open, initialValues]);

  const handleText = (key: keyof EventAuthorisersFilterValues) =>
    (_name: string, value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

  const handleSelect = (key: keyof EventAuthorisersFilterValues) =>
    (_name: string, value: string | number) => {
      setValues((prev) => ({ ...prev, [key]: String(value) }));
    };

  const handleApply = () => {
    if (values.emailAddress) {
      const emailRegex = /^(?:[a-zA-Z0-9_'^&\-])+(?:\.(?:[a-zA-Z0-9_'^&\-])+)*@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/;
      if (!emailRegex.test(values.emailAddress)) {
        setEmailError('Enter a valid email address');
        return;
      }
    }
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" style={{ zIndex: 1400 }}>
      <Paper
        elevation={0}
        sx={{
          width: 420,
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
          right: '-10px',
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
          Filter event authorisers
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
          <Textfield
            name="customerName"
            label="Customer name"
            value={values.customerName}
            onChange={handleText('customerName')}
          />

          <SelectField
            name="userAccount"
            label="User account"
            value={values.userAccount}
            onChange={handleSelect('userAccount')}
            options={userAccountOptions}
            height={48}
          />

          <PhoneNumber
            label="Telephone number"
            defaultCountry="ZA"
            error={false}
            helperText=""
            value={values.telephoneNumber}
            onChange={(value: string) => {
              setValues((prev) => ({ ...prev, telephoneNumber: value }));
            }}
          />

          <PhoneNumber
            label="Mobile number"
            defaultCountry="ZA"
            error={false}
            helperText=""
            value={values.mobileNumber}
            onChange={(value: string) => {
              setValues((prev) => ({ ...prev, mobileNumber: value }));
            }}
          />

          <Textfield
            name="emailAddress"
            label="Email address"
            value={values.emailAddress}
            onChange={(name, value) => {
              handleText('emailAddress')(name, value);
              if (!value) {
                setEmailError('');
                return;
              }
              const emailRegex = /^(?:[a-zA-Z0-9_'^&\-])+(?:\.(?:[a-zA-Z0-9_'^&\-])+)*@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/;
              if (!emailRegex.test(value)) {
                setEmailError('Enter a valid email address');
              } else {
                setEmailError('');
              }
            }}
            error={Boolean(emailError)}
            helperText={emailError}
          />
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
};

export default EventAuthorisersFilterDialog;
