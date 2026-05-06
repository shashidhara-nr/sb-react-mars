import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Popper,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from 'components/lib/Forms/Button';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';
import styles from './MessageAlerts.module.scss';
import DatePickerComponent from 'components/lib/DatePicker';

export interface MessageAlertsFilterValues {
  messageId: string;
  subject: string;
  dateSentFrom: string | null;
  dateSentTo: string | null;
}

export interface MessageAlertsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: MessageAlertsFilterValues) => void;
  initialValues?: Partial<MessageAlertsFilterValues>;
}

const DEFAULT_VALUES: MessageAlertsFilterValues = {
  messageId: '',
  subject: '',
  dateSentFrom: null,
  dateSentTo: null,
};

const MessageAlertsFilterDialog = ({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: MessageAlertsFilterDialogProps) => {
  const t = useTranslations('messageAlerts');
  const testIdPrefix = 'message-alerts-filter';
  const [values, setValues] = React.useState<MessageAlertsFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
  });
  const [dateSentFromOpen, setDateSentFromOpen] = React.useState(false);
  const [dateSentToOpen, setDateSentToOpen] = React.useState(false);

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText = (key: keyof MessageAlertsFilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleDate = (key: keyof MessageAlertsFilterValues) => (value: any) => {
    setValues((v) => ({ ...v, [key]: value }));
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
          data-testid={buildTestId(testIdPrefix, 'button', 'close')}
          className={styles.filterCloseButton}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={styles.filterDialogTitle}>
          {t('filterMessageAlerts')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <TextField
            label={t('messageId')}
            value={values.messageId}
            onChange={handleText('messageId')}
            data-testid={buildTestId(testIdPrefix, 'input', 'message-id')}
            fullWidth
            size="medium"
          />
          <TextField
            label={t('subject')}
            value={values.subject}
            onChange={handleText('subject')}
            data-testid={buildTestId(testIdPrefix, 'input', 'subject')}
            fullWidth
            size="medium"
          />
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
            {t('dateSent')}
          </Typography>
          <DatePickerComponent
            label={t('dateSentFrom')}
            value={values.dateSentFrom}
            onChange={handleDate('dateSentFrom')}
            data-testid={buildTestId(testIdPrefix, 'input', 'date-sent-from')}
            fullWidth
            actions={[
              { 
                label: t('cancel'), 
                variant: 'tertiary' as const,
                onClick: () => setDateSentFromOpen(false)
              },
              { 
                label: t('ok'), 
                variant: 'primary' as const,
                onClick: () => setDateSentFromOpen(false)
              }
            ]}
          />
          <DatePickerComponent
            label={t('dateSentTo')}
            value={values.dateSentTo}
            onChange={handleDate('dateSentTo')}
            data-testid={buildTestId(testIdPrefix, 'input', 'date-sent-to')}
            fullWidth
            actions={[
              { 
                label: t('cancel'), 
                variant: 'tertiary' as const,
                onClick: () => setDateSentToOpen(false)
              },
              { 
                label: t('ok'), 
                variant: 'primary' as const,
                onClick: () => setDateSentToOpen(false)
              }
            ]}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            data-testid={buildTestId(testIdPrefix, 'button', 'cancel')}
            buttonVariant="tertiary"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            data-testid={buildTestId(testIdPrefix, 'button', 'apply')}
            buttonVariant="primary"
          >
            {t('ok')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}

export default MessageAlertsFilterDialog;
