"use client"
import React, { useEffect, useState } from 'react';
import { Paper, TextField, MenuItem, Button, Box, IconButton, Typography, Popper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { buildTestId } from 'src/utils/testIds';

interface ErrorCodeFilterDialogProps {
    open: boolean;
    anchorEl?: HTMLElement | null;
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters?: any;
    testIdPrefix?: string;
}

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'New', label: 'New' },
    { value: 'Updated', label: 'Updated' },
    { value: 'Active', label: 'Active' },
];

const errorCodeOptions = [
    { value: '', label: 'All' },
    { value: 'g', label: 'g' },
    { value: 'i*', label: 'i*' },
];

const ErrorCodeFilterDialog: React.FC<ErrorCodeFilterDialogProps> = ({
    open,
    anchorEl,
    onClose,
    onApply,
    currentFilters,
    testIdPrefix = 'error-code-filter-dialog',
}) => {
    const [filters, setFilters] = useState({
        errorCode: '',
        errorDescription: '',
        status: '',
    });

    useEffect(() => {
        setFilters(currentFilters || {
            errorCode: '',
            errorDescription: '',
            status: '',
        });
    }, [currentFilters, open]);

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
                elevation={3}
                sx={{
                    width: 420,
                    p: 3,
                    borderRadius: '8px',
                    minHeight: 0,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#ffffff',
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 600, fontSize: '16px', color: '#222E37' }} 
                        data-testid={buildTestId(testIdPrefix, 'title')}
                    >
                        Filter error code
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        data-testid={buildTestId(testIdPrefix, 'close-button')}
                        sx={{ 
                            padding: '4px',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                    >
                        <CloseIcon sx={{ fontSize: '20px' }} />
                    </IconButton>
                </Box>
                
                <Box display="flex" flexDirection="column" gap={2.5}>
                    <TextField
                        label="Error code"
                        name="errorCode"
                        value={filters.errorCode}
                        onChange={handleChange}
                        select
                        fullWidth
                        data-testid={buildTestId(testIdPrefix, 'error-code-input')}
                        variant="outlined"
                        size="medium"
                        slotProps={{ select: { MenuProps: { sx: { zIndex: 1401 } } } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                                backgroundColor: '#ffffff',
                                '& fieldset': {
                                    borderColor: '#d0d0d0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#999999',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#0051FF',
                                },
                            },
                            '& .MuiSelect-icon': {
                                color: '#0051FF',
                            },
                        }}
                    >
                        {errorCodeOptions.map(option => (
                            <MenuItem
                                key={option.value}
                                value={option.value}
                                data-testid={buildTestId(testIdPrefix, 'error-code-option', option.value || 'all')}
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
                        variant="outlined"
                        size="medium"
                        slotProps={{ select: { MenuProps: { sx: { zIndex: 1401 } } } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                                backgroundColor: '#ffffff',
                                '& fieldset': {
                                    borderColor: '#d0d0d0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#999999',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#0051FF',
                                },
                            },
                            '& .MuiSelect-icon': {
                                color: '#0051FF',
                            },
                        }}
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
                    
                    <TextField
                        label="Error description"
                        name="errorDescription"
                        value={filters.errorDescription}
                        onChange={handleChange}
                        fullWidth
                        data-testid={buildTestId(testIdPrefix, 'error-description-input')}
                        variant="outlined"
                        size="medium"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                                backgroundColor: '#ffffff',
                                '& fieldset': {
                                    borderColor: '#d0d0d0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#999999',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#0051FF',
                                },
                            },
                        }}
                    />
                </Box>
                
                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    gap={2}
                    mt={4}
                    data-testid={buildTestId(testIdPrefix, 'actions')}
                    sx={{
                        borderTop: '1px solid #e0e0e0',
                        paddingTop: '16px'
                    }}
                >
                    <Button
                        onClick={onClose}
                        
                        sx={{ 
                            minWidth: 140,
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#0454ff',
                           
                        }}
                        data-testid={buildTestId(testIdPrefix, 'cancel-button')}
                    >
                        CANCEL
                    </Button>
                    <Button
                        onClick={handleApply}
                        variant="contained"
                        sx={{ 
                            minWidth: 160,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            fontSize: '14px',
                            backgroundColor: '#0051FF',
                            '&:hover': {
                                backgroundColor: '#0041CC',
                            }
                        }}
                        data-testid={buildTestId(testIdPrefix, 'update-button')}
                    >
                        UPDATE TABLE
                    </Button>
                </Box>
            </Paper>
        </Popper>
    );
};

export default ErrorCodeFilterDialog;
