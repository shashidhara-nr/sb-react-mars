import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Popper,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import styles from './MyBills.module.scss';
import { buildTestId } from 'src/utils/testIds';

const testIdPrefix = 'my-bills-filter-dialog';

export interface FilterValues {
  billerId?: string;
  billerName?: string;
  country?: string;
  amount?: string;
  dueDate?: string;
  status?: string;
}

export interface MyBillsFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  billerId: '',
  billerName: '',
  country: '',
  amount: '',
  dueDate: '',
  status: ''
};

export default function MyBillsFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: MyBillsFilterDialogProps) {
  const t = useTranslations('myBills');
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

  const handleApply = () => {
    onApply(values);
  };

  return (
    <Popper data-testid={buildTestId(testIdPrefix, 'popper')}
      open={open} anchorEl={anchorEl}
      placement="bottom-end"
      className={styles.filterDialogPopper}
    >
      <Paper data-testid={buildTestId(testIdPrefix, 'container')}
        elevation={0} className={styles.filterDialogContainer}
      >
        <IconButton
          data-testid={buildTestId(testIdPrefix, 'filter-close-button')}
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
        >
          <CloseIcon />
        </IconButton>
        <Typography data-testid={buildTestId(testIdPrefix, 'title')} variant="h6" className={styles.filterDialogTitle}>
          {t('filter')} {t('myBills')?.toLocaleLowerCase()}
        </Typography>
        <Box data-testid={buildTestId(testIdPrefix, 'content')} className={styles.filterDialogContent}>
          <TextField
            data-testid={buildTestId(testIdPrefix, 'billerId')}
            label={t('billerId')}
            value={values.billerId}
            onChange={handleText('billerId')}
            fullWidth
            size="medium"
          />
          <TextField
            data-testid={buildTestId(testIdPrefix, 'billerName')}
            label={t('billerName')}
            value={values.billerName}
            onChange={handleText('billerName')}
            fullWidth
            size="medium"
          />
          <TextField
            data-testid={buildTestId(testIdPrefix, 'country')}
            label={t('country')}
            value={values.country}
            onChange={handleText('country')}
            fullWidth
            size="medium"
          />
          <TextField
            data-testid={buildTestId(testIdPrefix, 'amount')}
            label={t('amount')}
            value={values.amount}
            onChange={handleText('amount')}
            fullWidth
            size="medium"
          />

          <TextField
            data-testid={buildTestId(testIdPrefix, 'dueDate')}
            label={t('dueDate')}
            value={values.dueDate}
            onChange={handleText('dueDate')}
            fullWidth
            size="medium"
          />
          <TextField
            data-testid={buildTestId(testIdPrefix, 'status')}
            label={t('status')}
            value={values.status}
            onChange={handleText('status')}
            fullWidth
            size="medium"
          />
        </Box>
        <Box data-testid={buildTestId(testIdPrefix, 'actions')} display="flex" justifyContent="space-between" mt={4}>
          <Button
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
            onClick={onClose}
            buttonVariant="tertiary"
          >
            {t('cancel')}
          </Button>
          <Button
            data-testid={buildTestId(testIdPrefix, 'update-table-button')}
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
