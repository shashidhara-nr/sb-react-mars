import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  FormControl,
  InputLabel,
  Popper,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import styles from './UserDetails.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';

const userStatusList = ['active', 'awaitingPasswordActivation', 'firstAccess', 'locked'];
const passwordStatuses = ['active', 'awaitingPasswordActivation', 'firstAccess', 'locked'];

export interface FilterValues {
  userName: string;
  userId: string;
  dob: string;
  idNumber: string;
  userStatus: string;
  passwordStatus: string;
}

export interface UserDetailsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  userName: '',
  userId: '',
  dob: '',
  idNumber: '',
  userStatus: '',
  passwordStatus: ''
};

export default function UserDetailsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: UserDetailsFilterDialogProps) {
  const t = useTranslations('userDetails');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText = (key: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSelect = (field: keyof FilterValues) => (event: SelectChangeEvent<string>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleDateChange = (date: string) => {
    setValues((prev) => ({ ...prev, date }));
  };

  const handleApply = () => {
    onApply(values);
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" className={styles.filterDialogPopper}>
      <Paper elevation={0} className={styles.filterDialogContainer}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle}>
          {t('filter')} {t('userDetails')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('userName')}
            value={values.userName}
            onChange={handleText('userName')}
            fullWidth
          />
          <TextField
            label={t('userId')}
            value={values.userId}
            onChange={handleText('userId')}
            fullWidth
          />
          <DatePickerComponent
            label={t('dob')}
            value={values.dob}
            onChange={(value: any) => {}}
            fullWidth
            actions={[
                {
                label: 'Tertiary Button',
                onClick: () => {},
                variant: 'tertiary',
                },
                {
                label: 'Tertiary Button',
                onClick: () => {},
                variant: 'tertiary',
                },
            ]} 
          />
          <TextField
            label={t('idNumber')}
            value={values.idNumber}
            onChange={handleText('idNumber')}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="user-status-label">{t('userStatus')}</InputLabel>
            <Select
              labelId="user-status-label"
              label={t('userStatus')}
              value={values.userStatus}
              onChange={handleSelect('userStatus')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {userStatusList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-label">{t('passwordStatus')}</InputLabel>
            <Select
              labelId="status-label"
              label={t('passwordStatus')}
              value={values.passwordStatus}
              onChange={handleSelect('passwordStatus')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {passwordStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
