'use client';

import React from 'react';
import {
    Box,
    Popover,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Typography,
    IconButton,
    Select,
    MenuItem,
    SelectChangeEvent,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import { Button } from 'dist/standard-bank-react';
import styles from './DownloadCompanyDetailsDialog.module.scss';

type ExportFormat = 'pdf' | 'csv' | 'txt';
type SortBy = 'ascending' | 'descending';

export interface DownloadCompanyDetailsDialogProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onDownload: (payload: { format: ExportFormat; sortBy: SortBy }) => void;
    loading?: boolean;
    'data-testid'?: string;
}

export default function DownloadCompanyDetailsDialog({
    open,
    anchorEl,
    onClose,
    onDownload,
    loading = false,
    'data-testid': testId,
}: DownloadCompanyDetailsDialogProps) {
    const t = useTranslations('companyDetails');
    const [format, setFormat] = React.useState<ExportFormat>('pdf');
    const [sortBy, setSortBy] = React.useState<SortBy>('ascending');

    React.useEffect(() => {
        if (open) {
            // Reset to defaults when dialog opens
            setFormat('pdf');
            setSortBy('ascending');
        }
    }, [open]);

    const handleFormatChange = (e: SelectChangeEvent<ExportFormat>) => {
        setFormat(e.target.value as ExportFormat);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSortBy((e.target as HTMLInputElement).value as SortBy);
    };

    const handleDownload = () => {
        onDownload({ format, sortBy });
    };

    if (!open) return null;

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            data-testid={testId}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            PaperProps={{
                className: styles.popoverPaper,
                style: {
                    marginTop: '-8px',
                    marginRight: '0px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px',
                },
            }}
        >
            <Box className={styles.popoverContainer}>
                {/* Header */}
                <Box className={styles.headerContainer}>
                    <Typography variant="h6" className={styles.title}>
                        {t('downloadServiceAgreements')}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        size="small"
                        className={styles.closeButton}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider />

                {/* Content */}
                <Box className={styles.contentContainer}>
                    {/* Format Selection */}
                    <FormControl fullWidth className={styles.formControl}>
                        <Typography className={styles.fieldLabel}>
                            {t('selectExportFormat')}
                        </Typography>
                        <Select
                            value={format}
                            onChange={handleFormatChange}
                            displayEmpty={false}
                        >
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="txt">TXT</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Sort By Options */}
                    <FormControl fullWidth className={styles.sortByContainer}>
                        <FormLabel>{t('sortBy')}</FormLabel>
                        <RadioGroup
                            value={sortBy}
                            onChange={handleSortChange}
                        >
                            <FormControlLabel
                                value="ascending"
                                control={<Radio />}
                                label={t('ascending')}
                            />
                            <FormControlLabel
                                value="descending"
                                control={<Radio />}
                                label={t('descending')}
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>

                <Divider />

                {/* Actions */}
                <Box className={styles.actionsContainer}>
                    <Button
                        onClick={onClose}
                        buttonVariant="tertiary"
                        sx={{
                            color: '#0051FF',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                        }}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleDownload}
                        buttonVariant="primary"
                        disabled={loading}
                        sx={{
                            backgroundColor: '#0051FF',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                        }}
                    >
                        {t('download')}
                    </Button>
                </Box>
            </Box>
        </Popover>
    );
}
