import React, { useEffect, useMemo, useState } from 'react';
import { Paper, TextField, MenuItem, Button, Box, IconButton, Typography, Popper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { buildTestId } from 'src/utils/testIds';
import { TransferTypeFilters, TRANSFER_TYPE_STATUS_CODES } from 'types/redux/transferTypes';

interface Props {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (filters: any) => void;
  initialFilters?: any;
  customerAgreementOptions?: string[];
  testIdPrefix?: string;
}

const statusOptions = [
  { value: TRANSFER_TYPE_STATUS_CODES.ACTIVE, label: 'Active' },
  { value: TRANSFER_TYPE_STATUS_CODES.AWAITING_APPROVAL, label: 'Awaiting Approval' },
  { value: TRANSFER_TYPE_STATUS_CODES.DRAFT, label: 'Draft' },
];

const defaultFilterValues: Required<Pick<
  TransferTypeFilters,
  'transferTypeName' | 'authorisationProfile' | 'numberOfAccounts' | 'customerAgreement' | 'status'
>> = {
  transferTypeName: '',
  authorisationProfile: '',
  numberOfAccounts: '',
  customerAgreement: '',
  status: '',
};

const TransferTypeFilterDialog: React.FC<Props> = ({
  open,
  anchorEl,
  onClose,
  onApply,
  initialFilters,
  customerAgreementOptions,
  testIdPrefix = 'transfer-type-filter-dialog',
}) => {
  const [filters, setFilters] = useState<TransferTypeFilters>(defaultFilterValues);

  const customerAgreementSelectOptions = useMemo(() => {
    const uniqueSorted = Array.isArray(customerAgreementOptions)
      ? Array.from(
          new Set(
            customerAgreementOptions
              .map((v) => (v ?? '').toString().trim())
              .filter((v) => v.length > 0)
          )
        ).sort((a, b) => a.localeCompare(b))
      : [];

    return [...uniqueSorted.map((v) => ({ value: v, label: v }))];
  }, [customerAgreementOptions]);

  useEffect(() => {
    setFilters({ ...defaultFilterValues, ...(initialFilters ?? {}) });
  }, [initialFilters, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    onApply(filters);
  };

  if (!open) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      data-testid={buildTestId(testIdPrefix, 'popper')}
      // Keep the filter panel below MUI modals so Select menus (zIndex=modal)
      // render above the panel instead of underneath it.
      sx={{ zIndex: (theme) => theme.zIndex.modal - 1 }}
    >
      <Paper
        data-testid={buildTestId(testIdPrefix, 'panel')}
        elevation={8}
        sx={{
          width: 380,
          p: 3,
          pt: 2,
          borderRadius: 2,
          minHeight: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
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
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} data-testid={buildTestId(testIdPrefix, 'title')}>
          Filter transfer types
        </Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Transfer type name"
            name="transferTypeName"
            value={filters.transferTypeName}
            onChange={handleChange}
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'transfer-type-name-input')}
          />
          <TextField
            label="Authorisation profile"
            name="authorisationProfile"
            value={filters.authorisationProfile}
            onChange={handleChange}
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'authorisation-profile-input')}
          />
          <TextField
            label="Number of accounts"
            name="numberOfAccounts"
            value={filters.numberOfAccounts ?? ''}
            onChange={handleChange}
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'number-of-accounts-select')}
            type="number"
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField
            label="Customer agreement"
            name="customerAgreement"
            value={filters.customerAgreement ?? ''}
            onChange={handleChange}
            select
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'customer-agreement-input')}
          >
            {customerAgreementSelectOptions.map((option) => (
              <MenuItem
                key={option.value || 'all'}
                value={option.value}
                data-testid={buildTestId(testIdPrefix, 'customer-agreement-option', option.value || 'all')}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Status"
            name="status"
            value={filters.status ?? ''}
            onChange={handleChange}
            select
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'status-select')}
          >
            {statusOptions.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
                data-testid={buildTestId(testIdPrefix, 'status-option', option.value || 'all')}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4} data-testid={buildTestId(testIdPrefix, 'actions')}>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{ minWidth: 120 }}
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{ minWidth: 140 }}
            data-testid={buildTestId(testIdPrefix, 'update-button')}
          >
            UPDATE TABLE
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
};

export default TransferTypeFilterDialog;
