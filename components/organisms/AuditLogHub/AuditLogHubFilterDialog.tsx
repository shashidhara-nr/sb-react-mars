import * as React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Popper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/lib/Forms';
import { useTranslations } from 'next-intl';
import styles from './AuditLogHub.module.scss';

export interface FilterValues {
  functionParam: string;
}

const functionParamList = [
  'all',
  'ACHReturnedTransactions',
  'AccountBalances',
  'Entity Type Account Verification Online',
  'Accounts',
  'AdhocBilling',
  'Agreements',
  'AuditLog',
  'AuthorisationClasses',
  'AuthorisationEvents',
  'AuthorisationProfiles',
  'BOPThirdParties',
  'BankAuthorisationClasses',
  'BankAuthorisationStaticRule',
  'BankBranchCodes',
  'BankDepartments',
  'BankRoles',
  'TokenOrder',
  'BankUsers',
  'BankingRelationships',
  'BankingServices',
  'Banks',
  'Bank to Bank Information',
  'Beneficiaries',
  'BillerReports',
  'Billers',
  'BillingAccounts',
  'BillingAdvice',
  'Bills',
  'BranchCodes',
  'BusinessCalendars',
  'BusinessOnlineTrainingPortal',
  'CashCentre',
  'Cash deposit',
  'Cash deposit type',
  'Central bank exemption'
]; 

export interface AuditLogHubFilterDialogProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DEFAULT_VALUES: FilterValues = {
  functionParam: '',
};

export default function AuditLogHubFilterDialog({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues
}: AuditLogHubFilterDialogProps) {
  const t = useTranslations('auditLogHub');
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues
  });

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  const handleSelect = (field: keyof FilterValues) => (event: SelectChangeEvent<string>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
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
          {t('filterAuditLogs')}
        </Typography>
        <Box className={styles.filterDialogContent}>
          <FormControl fullWidth>
            <InputLabel id="function-param-label">{t('function')}</InputLabel>
            <Select
              labelId="function-param-label"
              label={t('function')}
              value={values.functionParam}
              onChange={handleSelect('functionParam')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {functionParamList.map((s) => (
                <MenuItem key={s} value={s}>
                  {s === 'all' ? t('all') : s}
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
