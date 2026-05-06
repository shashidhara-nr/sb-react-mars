import * as React from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Popper,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

export interface CollectionHistoryFilterValues {
  debtorName: string;
  debtorCode: string;
}

export interface CollectionHistoryFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: CollectionHistoryFilterValues) => void;
  initialValues?: Partial<CollectionHistoryFilterValues>;
}

const DEFAULT_VALUES: CollectionHistoryFilterValues = {
  debtorName: '',
  debtorCode: '',
};

export default function CollectionHistoryFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: CollectionHistoryFilterDialogProps) {
  const testIdPrefix = 'collection-history-filter';
  const t = useTranslations('collections');
  const [values, setValues] = React.useState<CollectionHistoryFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  React.useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleText = (key: keyof CollectionHistoryFilterValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
    };

  const handleApply = () => {
    onApply(values);
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" style={{ zIndex: 1400 }} data-testid={buildTestId(testIdPrefix, 'popper')}>
      <Paper
        elevation={0}
        data-testid={buildTestId(testIdPrefix, 'dialog')}
        sx={{
          width: 400,
          p: 3,
          pt: 2,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          border: '1px solid #CED3D9',
          top: '-110px',
          position: 'absolute',
          right: '-10',
        }}
      >
        <IconButton 
          aria-label="close" 
          onClick={onClose} 
          data-testid={buildTestId(testIdPrefix, 'close-button')}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {t('filterDialogCollectionHistory')}
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
            label={t('filterLabelDebtorName')}
            value={values.debtorName}
            onChange={handleText('debtorName')}
            fullWidth
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-debtor-name')
            }}
          />

          <TextField
            label={t('filterLabelDebtorCode')}
            value={values.debtorCode}
            onChange={handleText('debtorCode')}
            fullWidth
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-debtor-code')
            }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
            style={{
              width: '82px',
              height: '48px',
              minWidth: '82px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            {t('buttonCancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            data-testid={buildTestId(testIdPrefix, 'apply-button')}
            style={{
              width: '153px',
              height: '48px',
              minWidth: '153px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            {t('buttonUpdateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
