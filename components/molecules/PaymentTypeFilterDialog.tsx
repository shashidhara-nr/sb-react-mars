import React, { useEffect, useState } from 'react';
import { Paper, TextField, MenuItem, Button, Box, IconButton, Typography, Popper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { buildTestId } from 'src/utils/testIds';

interface PaymentTypeFilterDialogProps {
    open: boolean;
    anchorEl?: HTMLElement | null;
    onClose: () => void;
    onApply: (filters: any) => void;
    initialFilters?: any;
    testIdPrefix?: string;
}

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Awaiting Approval', label: 'Awaiting Approval' },
    { value: 'Draft', label: 'Draft' },
];

const payAlertsOptions = [
    { value: '', label: 'All' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
];

const PaymentTypeFilterDialog: React.FC<PaymentTypeFilterDialogProps> = ({
    open,
    anchorEl,
    onClose,
    onApply,
    initialFilters,
    testIdPrefix = 'payment-type-filter-dialog',
}) => {
    const [filters, setFilters] = useState({
        paymentTypeName: '',
        authorisationProfile: '',
        numberOfAccounts: '',
        payAlerts: '',
        status: '',
    });

    useEffect(() => {
        setFilters(initialFilters || {
            paymentTypeName: '',
            authorisationProfile: '',
            numberOfAccounts: '',
            payAlerts: '',
            status: '',
        });
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
            style={{ zIndex: 1400 }}
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
                    Filter payment types
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField
                        label="Payment Type Name"
                        name="paymentTypeName"
                        value={filters.paymentTypeName}
                        onChange={handleChange}
                        fullWidth
                        data-testid={buildTestId(testIdPrefix, 'payment-type-name-input')}
                    />
                    <TextField
                        label="Authorisation Profile"
                        name="authorisationProfile"
                        value={filters.authorisationProfile}
                        onChange={handleChange}
                        fullWidth
                        data-testid={buildTestId(testIdPrefix, 'authorisation-profile-input')}
                    />
                    <TextField
                        label="Number of Accounts"
                        name="numberOfAccounts"
                        value={filters.numberOfAccounts}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        data-testid={buildTestId(testIdPrefix, 'number-of-accounts-input')}
                        inputProps={{
                            min: "0",
                        }}
                    />
                    <TextField
                        label="Pay Alerts"
                        name="payAlerts"
                        value={filters.payAlerts}
                        onChange={handleChange}
                        select
                        fullWidth
                        data-testid={buildTestId(testIdPrefix, 'pay-alerts-select')}
                        slotProps={{ select: { MenuProps: { sx: { zIndex: 1401 } } } }}
                    >
                        {payAlertsOptions.map(option => (
                            <MenuItem
                                key={option.value}
                                value={option.value}
                                data-testid={buildTestId(testIdPrefix, 'pay-alerts-option', option.value || 'all')}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Status"
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        select
                        fullWidth
                        data-testid={buildTestId(testIdPrefix, 'status-select')}
                        slotProps={{ select: { MenuProps: { sx: { zIndex: 1401 } } } }}
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
                        UDPATE TABLE
                    </Button>
                </Box>
            </Paper>
        </Popper>
    );
};

export default PaymentTypeFilterDialog;
