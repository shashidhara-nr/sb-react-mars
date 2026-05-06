'use client';
 
import { useState } from 'react';
import { Box, Popover, IconButton, TextField as MuiTextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Select, Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
 
interface PaymentFilterProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApplyFilter: (filters: FilterValues) => void;
  testIdPrefix?: string;
}
 
export interface FilterValues {
  beneficiaryName: string;
  beneficiaryCode: string;
  accountNumber: string;
  validation: string;
  verificationStatus: string;
  cdiNumber: string;
  iban: string;
  bankName: string;
}
 
const PaymentFilter = ({
  open,
  anchorEl,
  onClose,
  onApplyFilter,
  testIdPrefix = 'payment-file-upload-filter',
}: PaymentFilterProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    beneficiaryName: '',
    beneficiaryCode: '',
    accountNumber: '',
    validation: '',
    verificationStatus: '',
    cdiNumber: '',
    iban: '',
    bankName: '',
  });
 
  const handleChange = (field: keyof FilterValues, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };
 
  const handleCancel = () => {
    setFilters({
      beneficiaryName: '',
      beneficiaryCode: '',
      accountNumber: '',
      validation: '',
      verificationStatus: '',
      cdiNumber: '',
      iban: '',
      bankName: '',
    });
    onClose();
  };
 
  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };
 
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      data-testid={buildTestId(testIdPrefix, 'popover')}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: '400px',
          height: '616px',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <Box sx={{ fontSize: '18px', fontWeight: 600, color: '#24292f' }}>Filter payments</Box>
        <IconButton
          onClick={onClose}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
          sx={{ padding: '4px', '&:hover': { backgroundColor: '#f6f8fa' } }}
        >
          <CloseIcon sx={{ fontSize: '20px' }} />
        </IconButton>
      </Box>
 
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px',
          paddingTop: '8px',
          marginRight: '-8px',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
        }}
      >
        <Box
          data-testid={buildTestId(testIdPrefix, 'beneficiary-name-field')}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <MuiTextField
            label="Payment name"
            value={filters.beneficiaryName}
            onChange={(e) => handleChange('beneficiaryName', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'beneficiary-name-input')}
          />
        </Box>
 
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <MuiTextField
            label="Payment code"
            value={filters.beneficiaryCode}
            onChange={(e) => handleChange('beneficiaryCode', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'beneficiary-code-input')}
          />
        </Box>
 
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <MuiTextField
            label="Payment account number"
            value={filters.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'account-number-input')}
          />
        </Box>
 
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <Box data-testid={buildTestId(testIdPrefix, 'validation-select')}>
            <Select
              formOptions={{ sx: { minWidth: '100%' } }}
              options={[
                { label: 'Populated', value: 'populated' },
                { label: 'Valid', value: 'valid' },
                { label: 'Invalid', value: 'invalid' },
              ]}
              selectProps={{
                label: 'Payment validation',
                labelId: 'validation-select',
                onChange: (e: any) => handleChange('validation', e.target.value),
              }}
              name="validation"
              value={filters.validation}
              error={false}
              helperText=""
              height="48px"
            />
          </Box>
        </Box>
 
        <Box
          data-testid={buildTestId(testIdPrefix, 'verification-status-select')}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <Select
            formOptions={{ sx: { minWidth: '100%' } }}
            options={[
              { label: 'Populated', value: 'populated' },
              { label: 'No account verification', value: 'no-verification' },
              { label: 'Account verified', value: 'verified' },
              { label: 'Account not verified', value: 'not-verified' },
              { label: 'Account partially verified', value: 'partially-verified' },
            ]}
            selectProps={{
              label: 'Verification status',
              labelId: 'verification-status-select',
              onChange: (e: any) => handleChange('verificationStatus', e.target.value),
            }}
            name="verificationStatus"
            value={filters.verificationStatus}
            error={false}
            helperText=""
            height="48px"
          />
        </Box>
 
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <MuiTextField
            label="CDI number"
            value={filters.cdiNumber}
            onChange={(e) => handleChange('cdiNumber', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'cdi-number-input')}
          />
        </Box>
 
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <MuiTextField
            label="IBAN"
            value={filters.iban}
            onChange={(e) => handleChange('iban', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'iban-input')}
          />
        </Box>
 
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': { top: '0px', left: '0px' },
          }}
        >
          <MuiTextField
            label="Bank name"
            value={filters.bankName}
            onChange={(e) => handleChange('bankName', e.target.value)}
            fullWidth
            variant="outlined"
            data-testid={buildTestId(testIdPrefix, 'bank-name-input')}
          />
        </Box>
      </Box>
 
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '16px',
          paddingLeft: '12px',
          paddingRight: '12px',
          marginTop: '16px',
          marginLeft: '-24px',
          marginRight: '-24px',
          borderTop: '1px solid #e1e4e8',
          flexShrink: 0,
        }}
      >
        <Button
          buttonVariant="text"
          onClick={handleCancel}
          data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          style={{ height: '48px', minHeight: '48px', width: '82px' }}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleApply}
          data-testid={buildTestId(testIdPrefix, 'apply-button')}
          style={{ height: '48px', minHeight: '48px', width: '153px' }}
        >
          UPDATE TABLE
        </Button>
      </Box>
    </Popover>
  );
};
 
export default PaymentFilter;