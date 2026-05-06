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
import styles from './AccountsAndBalancesList.module.scss';
import { Button } from 'components/lib/Forms';

export type ReportStatus =
  | 'all'
  | 'generationPending'
  | 'timedOut'
  | 'generationFailed'
  | 'downloadAvailable';

export interface FilterValues {
  reportName: string;
  reportStatus: ReportStatus;
}

export interface DownloadedReportsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  reportName: '',
  reportStatus: 'all'
};

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  all: 'all',
  generationPending: 'generationPending',
  timedOut: 'timedOut',
  generationFailed: 'generationFailed',
  downloadAvailable: 'downloadAvailable',
};

const reportStatuses: ReportStatus[] = [
  'all',
  'generationPending',
  'timedOut',
  'generationFailed',
  'downloadAvailable',
];

export default function DownloadedReportsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: DownloadedReportsFilterDialogProps) {
  const t = useTranslations('accountsAndBalances');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  // Reset when dialog opens (so repeated opens reflect latest defaults)
  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  // Handlers
  const handleText = (key: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSelect = (key: keyof FilterValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value as any }));
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
          {t('filter')} {t('reports')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('reportName')}
            value={values.reportName}
            onChange={handleText('reportName')}
            fullWidth
            size="medium"
          />
          <FormControl fullWidth>
            <InputLabel id="status-label">{t('reportStatus')}</InputLabel>
            <Select
              labelId="status-label"
              label={t('reportStatus')}
              value={values.reportStatus}
              onChange={handleSelect('reportStatus')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {reportStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(REPORT_STATUS_LABELS[s])}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box className={styles.filterDialogActions}>
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
