'use client';

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
import styles from './BillingAccounts.module.scss';

const statusList = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Pending', value: 'Pending' },
];

const submissionMechanismList = [
  { label: 'Online', value: 'Online' },
  { label: 'Manual', value: 'Manual' },
  { label: 'API', value: 'API' },
];

export interface VerificationBatchFilterValues {
  accountNumber: string;
  idNumber: string;
  lastName: string;
  status: string;
  submissionMechanism: string;
}

export interface VerificationRequestBatchFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: VerificationBatchFilterValues) => void;
  initialValues?: Partial<VerificationBatchFilterValues>;
}

const DEFAULT_VALUES: VerificationBatchFilterValues = {
  accountNumber: '',
  idNumber: '',
  lastName: '',
  status: '',
  submissionMechanism: '',
};

export default function VerificationRequestBatchFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: VerificationRequestBatchFilterDialogProps) {
  const t = useTranslations('accountVerificationRequest');
  const [values, setValues] = React.useState<VerificationBatchFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText = (key: keyof VerificationBatchFilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSelect = (key: keyof VerificationBatchFilterValues) => (e: SelectChangeEvent<any>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleClear = () => setValues(DEFAULT_VALUES);

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

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
          Filter verification requests
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label="Account number"
            value={values.accountNumber}
            onChange={handleText('accountNumber')}
            fullWidth
            size="medium"
          />
          <TextField
            label="ID number"
            value={values.idNumber}
            onChange={handleText('idNumber')}
            fullWidth
            size="medium"
          />
          <TextField
            label="Last name / company name"
            value={values.lastName}
            onChange={handleText('lastName')}
            fullWidth
            size="medium"
          />
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={values.status}
              onChange={handleSelect('status')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statusList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="submission-mechanism-label">Submission mechanism</InputLabel>
            <Select
              labelId="submission-mechanism-label"
              label="Submission mechanism"
              value={values.submissionMechanism}
              onChange={handleSelect('submissionMechanism')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {submissionMechanismList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
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
