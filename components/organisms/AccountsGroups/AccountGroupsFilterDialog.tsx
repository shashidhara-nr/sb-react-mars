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
import styles from './AccountGroups.module.scss';
import { buildTestId } from 'src/utils/testIds';

const accountGroupServiceAgreementList = [
  { label: 'serviceAgreementName1', value: '[Service Agreement name 1]' },
  { label: 'serviceAgreementName2', value: '[Service Agreement name 2]' },
  { label: 'serviceAgreementName3', value: '[Service Agreement name 3]' },
];

export interface FilterValues {
  serviceAgreement: string;
  accountGroupName: string;
  numberOfAccounts: string;
}

export interface AccountGroupsProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  serviceAgreement: '',
  accountGroupName: '',
  numberOfAccounts: '',
};

export default function AccountGroups({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
}: AccountGroupsProps) {
  const t = useTranslations('accountGroups');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  const testIdPrefix = 'manage-account-groups-filter-dialog';

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

  const handleSelect = (key: keyof FilterValues) => (e: SelectChangeEvent<any>) => {
    let value = e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleClear = () => setValues(DEFAULT_VALUES);

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      className={styles.filterDialogPopper}
    >
      <Paper elevation={0} className={styles.filterDialogContainer}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.filterCloseButton}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          variant="h6"
          className={styles.filterDialogTitle}
          data-testid={buildTestId(testIdPrefix, 'dialog-title')}
        >
          {t('filter')} {t('accountGroups')?.toLocaleLowerCase()}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="serviceAgreement-label">{t('serviceAgreement')}</InputLabel>
            <Select
              labelId="serviceAgreement-label"
              label={t('serviceAgreement')}
              value={values.serviceAgreement}
              onChange={handleSelect('serviceAgreement')}
              displayEmpty={false}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {accountGroupServiceAgreementList.map((tc) => (
                <MenuItem
                  key={tc.value}
                  value={tc.value}
                  data-testid={buildTestId(testIdPrefix, `service-agreement-item-${tc.value}`)}
                >
                  {t(tc.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('accountGroupName')}
            value={values.accountGroupName}
            onChange={handleText('accountGroupName')}
            fullWidth
            size="medium"
            data-testid={buildTestId(testIdPrefix, 'account-group-name')}
          />
          <TextField
            label={t('numberOfAccounts')}
            value={values.numberOfAccounts}
            onChange={handleText('numberOfAccounts')}
            fullWidth
            size="medium"
            data-testid={buildTestId(testIdPrefix, 'number-of-accounts')}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={onClose}
            buttonVariant="tertiary"
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            buttonVariant="primary"
            data-testid={buildTestId(testIdPrefix, 'apply-button')}
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
