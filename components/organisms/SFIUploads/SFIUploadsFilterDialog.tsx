import * as React from 'react';
import { useEffect } from 'react';
import {
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  FormControl,
  InputLabel,
  Box,
  Popper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from 'components/lib/Forms/Button';
import { useTranslations } from 'next-intl';
import styles from './SFIUploads.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';
import { destinations } from '@lib/mock/mockSFIUploads';
import { buildTestId } from 'src/utils/testIds';

export interface SFIUploadFilterValues {
  uploadDateFrom: unknown;
  uploadDateTo: unknown;
  status: string;
  destination: string;
  fileName: string;
  uploadedBy: string;
}

interface SFIUploadsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (filters: SFIUploadFilterValues) => void;
  initialValues?: Partial<SFIUploadFilterValues>;
}

const DEFAULT_VALUES: SFIUploadFilterValues = {
  uploadDateFrom: null,
  uploadDateTo: null,
  status: '',
  destination: '',
  fileName: '',
  uploadedBy: '',
};

const SFIUploadsFilterDialog = ({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: SFIUploadsFilterDialogProps) => {
  const t = useTranslations('sfiUploads');
  const testIdPrefix = 'sfi-uploads-filter';
  const [values, setValues] = React.useState<SFIUploadFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [initialValues, open]);

  const handleText =
    (key: keyof SFIUploadFilterValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  const handleSelect =
    (key: keyof SFIUploadFilterValues) =>
    (e: SelectChangeEvent<string>) => {
      setValues((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  const handleDate =
    (key: keyof SFIUploadFilterValues) =>
    (value: unknown) => {
      setValues((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" className={styles.filterDialogPopper}>
      <Paper elevation={0} className={styles.filterDialogContainer}>
        <IconButton
          data-testid={buildTestId(testIdPrefix, 'button', 'close')}
          aria-label="Close filter dialog"
          onClick={onClose}
          className={styles.filterCloseButton}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle}>
          {t('filterUploads')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('uploadDate')}
          </Typography>
          <DatePickerComponent
            data-testid={buildTestId(testIdPrefix, 'input', 'upload-date-from')}
            label={t('uploadDateFrom')}
            value={values.uploadDateFrom}
            onChange={handleDate('uploadDateFrom')}
            fullWidth
            actions={[
              {
                label: t('cancel'),
                onClick: () => {},
                variant: 'tertiary',
              },
              {
                label: t('ok'),
                onClick: () => {},
                variant: 'tertiary',
              },
            ]}
          />
          <DatePickerComponent
            data-testid={buildTestId(testIdPrefix, 'input', 'upload-date-to')}
            label={t('uploadDateTo')}
            value={values.uploadDateTo}
            onChange={handleDate('uploadDateTo')}
            fullWidth
            actions={[
              {
                label: t('cancel'),
                onClick: () => {},
                variant: 'tertiary',
              },
              {
                label: t('ok'),
                onClick: () => {},
                variant: 'tertiary',
              },
            ]}
          />
          <Divider />
          <FormControl fullWidth>
            <InputLabel>{t('status')}</InputLabel>
            <Select
              data-testid={buildTestId(testIdPrefix, 'dropdown', 'status')}
              value={values.status}
              label={t('status')}
              onChange={handleSelect('status')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              <MenuItem value="Delivered">{t('statusDelivered')}</MenuItem>
              <MenuItem value="Failed">{t('statusFailed')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>{t('destination')}</InputLabel>
            <Select
              data-testid={buildTestId(testIdPrefix, 'dropdown', 'destination')}
              value={values.destination}
              label={t('destination')}
              onChange={handleSelect('destination')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              <MenuItem value="">
                <em>{t('all')}</em>
              </MenuItem>
              {destinations.map((destination) => (
                <MenuItem key={destination} value={destination}>
                  {destination}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            data-testid={buildTestId(testIdPrefix, 'input', 'file-name')}
            label={t('fileName')}
            value={values.fileName}
            onChange={handleText('fileName')}
            fullWidth
            size="medium"
          />
          <TextField
            data-testid={buildTestId(testIdPrefix, 'input', 'uploaded-by')}
            label={t('uploadedBy')}
            value={values.uploadedBy}
            onChange={handleText('uploadedBy')}
            fullWidth
            size="medium"
          />
        </Box>
        <Box className={styles.filterDialogActions}>
        <Button
          buttonVariant="tertiary"
          data-testid={buildTestId(testIdPrefix, 'button', 'cancel')}
          aria-label="Cancel filter"
          onClick={onClose}
        >
          {t('cancel')}
        </Button>
        <Button
          buttonVariant="primary"
          data-testid={buildTestId(testIdPrefix, 'button', 'update')}
          aria-label="Apply filter and update table"
          onClick={handleApply}
        >
          {t('updateTable')}
        </Button>
        </Box>
      </Paper>
    </Popper>
  );
};

export default SFIUploadsFilterDialog;
