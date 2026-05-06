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
import styles from './UserAccounts.module.scss';

const statusList = ['active', 'inactive', 'suspended'];
const roleList = ['admin', 'user', 'guest'];
const authClassList = ['classA', 'classB'];

export interface FilterValues {
  userAccountName: string;
  userId: string;
  authClass: string;
  status: string;
  role: string;
}

export interface UserAccountsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  userAccountName: '',
  userId: '',
  authClass: '',
  status: '',
  role: ''
};

export default function UserAccountsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: UserAccountsFilterDialogProps) {
  const t = useTranslations('userAccounts');
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
          {t('filter')} {t('userAccounts')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('userAccountName')}
            value={values.userAccountName}
            onChange={handleText('userAccountName')}
            fullWidth
          />
          <TextField
            label={t('userId')}
            value={values.userId}
            onChange={handleText('userId')}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="auth-class-label">{t('authClass')}</InputLabel>
            <Select
              labelId="auth-class-label"
              label={t('authClass')}
              value={values.authClass}
              onChange={handleSelect('authClass')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {authClassList.map((ac) => (
                <MenuItem key={ac} value={ac}>
                  {(ac)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="auth-class-label">{t('status')}</InputLabel>
            <Select
              labelId="auth-class-label"
              label={t('status')}
              value={values.status}
              onChange={handleSelect('status')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statusList.map((tc) => (
                <MenuItem key={tc} value={tc}>
                  {t(tc)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="role-label">{t('role')}</InputLabel>
            <Select
              labelId="role-label"
              label={t('role')}
              value={values.role}
              onChange={handleSelect('role')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {roleList.map((s) => (
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
