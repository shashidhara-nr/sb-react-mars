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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import { Button } from 'components/lib/Forms';
import styles from './DownloadServiceAgreementsDialog.module.scss';

type ExportFormat = 'pdf' | 'csv' | 'txt';
type SortBy = 'ascending' | 'descending';

export interface DownloadServiceAgreementsDialogProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onDownload: (payload: { format: ExportFormat; sortBy: SortBy }) => void;
    loading?: boolean;
    'data-testid'?: string;
}

export default function DownloadServiceAgreementsDialog({
    open,
    anchorEl,
    onClose,
    onDownload,
    loading = false,
    'data-testid': testId,
}: DownloadServiceAgreementsDialogProps) {
    const t = useTranslations('serviceAgreements');
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
                horizontal: 'left',
            }}
            PaperProps={{
                className: styles.filterDialogContainer,
                style: {
                    marginTop: '12px',
                    marginLeft: '-40px',
                },
            }}
        >
            <Box>
                <Box className={styles.headerContainer}>
                    <Typography variant="h6" className={styles.filterDialogTitle}>
                        {t('downloadDialogTitle')}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        className={styles.filterCloseButton}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box className={styles.filterDialogContent}>
                    {/* Format Selection */}
                    <FormControl fullWidth>
                        <Typography className={styles.fieldLabel}>
                            {t('selectExportFormat')}
                        </Typography>
                        <Select
                            value={format}
                            onChange={handleFormatChange}
                            displayEmpty={false}
                        >
                            <MenuItem value="pdf">{t('portableDocument')}</MenuItem>
                            <MenuItem value="csv">{t('commaDelimited')}</MenuItem>
                            <MenuItem value="txt">{t('fixedLength')}</MenuItem>
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
                <Box className={styles.actionContainer}>
                    <Button
                        onClick={onClose}
                        buttonVariant="tertiary"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleDownload}
                        buttonVariant="primary"
                        disabled={loading}
                    >
                        {t('download')}
                    </Button>
                </Box>
            </Box>
        </Popover>
    );
}
