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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import { Button } from 'components/lib/Forms';
import { buildTestId } from 'src/utils/testIds';
import styles from './DownloadBankingAccountsDialog.module.scss';

type SortBy = 'ascending' | 'descending';

export interface DownloadBankingAccountsDialogProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onDownload: (payload: { format: 'pdf'; sortBy: SortBy }) => void;
    loading?: boolean;
    'data-testid'?: string;
}

export default function DownloadBankingAccountsDialog({
    open,
    anchorEl,
    onClose,
    onDownload,
    loading = false,
    'data-testid': testId,
}: DownloadBankingAccountsDialogProps) {
    const testIdPrefix = 'download-banking-accounts';
    const t = useTranslations('bankingAccounts');
    const [sortBy, setSortBy] = React.useState<SortBy>('ascending');

    React.useEffect(() => {
        if (open) {
            // Reset sort to default when dialog opens
            setSortBy('ascending');
        }
    }, [open]);

    const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSortBy((e.target as HTMLInputElement).value as SortBy);
    };

    const handleDownload = () => {
        onDownload({ format: 'pdf', sortBy });
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
                    {/* Select export format (read-only - PDF only) */}
                    <FormControl fullWidth>
                        <Typography className={styles.fieldLabel}>
                            {t('selectExportFormat')}
                        </Typography>
                        <Box className={styles.readOnlyField} data-testid={buildTestId(testIdPrefix, 'format-value')}>
                            {t('portableDocumentFormatPdf')}
                        </Box>
                    </FormControl>

                    {/* Sort by */}
                    <FormControl component="fieldset">
                        <FormLabel
                            component="legend"
                            className={styles.sortByLabel}
                            data-testid={buildTestId(testIdPrefix, 'sort-label')}
                        >
                            {t('sortBy')}
                        </FormLabel>
                        <RadioGroup
                            value={sortBy}
                            onChange={handleSortChange}
                            data-testid={buildTestId(testIdPrefix, 'radio-group-sort')}
                        >
                            <FormControlLabel
                                value="ascending"
                                control={
                                    <Radio
                                        disabled={loading}
                                        data-testid={buildTestId(testIdPrefix, 'radio-ascending')}
                                    />
                                }
                                label={t('ascending')}
                                className={styles.formControlLabel}
                            />
                            <FormControlLabel
                                value="descending"
                                control={
                                    <Radio
                                        disabled={loading}
                                        data-testid={buildTestId(testIdPrefix, 'radio-descending')}
                                    />
                                }
                                label={t('descending')}
                                className={styles.formControlLabel}
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>

                {/* Actions */}
                <Box className={styles.filterDialogActions}>
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        buttonVariant="tertiary"
                        data-testid={buildTestId(testIdPrefix, 'cancel-button')}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={loading}
                        buttonVariant="primary"
                        data-testid={buildTestId(testIdPrefix, 'download-button')}
                    >
                        {loading ? t('downloading') : t('download')}
                    </Button>
                </Box>
            </Box>
        </Popover>
    );
}
