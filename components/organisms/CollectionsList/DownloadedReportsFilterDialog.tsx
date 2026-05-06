import * as React from 'react';
import { useEffect } from 'react';
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
import { useTranslations } from 'next-intl';
import styles from './CollectionsList.module.scss';
import { Button } from 'components/lib/Forms';

/* ================= TYPES ================= */

export type CollectionStatus =
  | 'needsAction'
  | 'awaitingApproval'
  | 'processing'
  | 'complete'
  | 'decline';

export interface FilterValues {
  dateCreated: string;
  status: CollectionStatus | '';
}

export interface DownloadedReportsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

/* ================= CONSTANTS ================= */

const DEFAULT_VALUES: FilterValues = {
  dateCreated: '',
  status: '',
};



/* ================= COMPONENT ================= */

export default function DownloadedReportsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: DownloadedReportsFilterDialogProps) {
  const t = useTranslations('collections');

  const STATUS_OPTIONS: { label: string; value: CollectionStatus }[] = [
    { label: t('needsAction'), value: 'needsAction' },
    { label: t('awaitingApproval'), value: 'awaitingApproval' },
    { label: t('processing'), value: 'processing' },
    { label: t('complete'), value: 'complete' },
    { label: t('decline'), value: 'decline' },
  ];
  
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  /* Reset when dialog opens */
  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  /* ================= HANDLERS ================= */

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, dateCreated: e.target.value }));
  };

  const handleStatusChange =
    (e: SelectChangeEvent<string>) => {
      setValues((v) => ({
        ...v,
        status: e.target.value as CollectionStatus,
      }));
    };

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  /* ================= RENDER ================= */

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      className={styles.filterDialogPopper}
    >
      <Paper elevation={0} className={styles.filterDialogContainer}>
        {/* Close Icon */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
        >
          <CloseIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" className={styles.filterDialogTitle}>
          {t('filterCollections')}
        </Typography>

        {/* Content */}
        <Box className={styles.filterDialogContent}>
          {/* Date Created */}
          <TextField
            label={t('dateCreated')}
            type="date"
            value={values.dateCreated}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel id="status-label">
              {t('status')}
            </InputLabel>
            <Select
              labelId="status-label"
              label={t('status')}
              value={values.status}
              onChange={handleStatusChange}
              MenuProps={{ sx: { zIndex: 1500 } }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Actions */}
        <Box className={styles.filterDialogActions}>
          <Button onClick={onClose} buttonVariant="tertiary">
            {t('cancel')}
          </Button>
          <Button onClick={handleApply} buttonVariant="primary">
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}