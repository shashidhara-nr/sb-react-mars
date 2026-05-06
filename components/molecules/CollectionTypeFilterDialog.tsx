import React, { useEffect, useMemo, useState } from 'react';
import { Paper, TextField, MenuItem, Button, Box, IconButton, Typography, Popper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { buildTestId } from 'src/utils/testIds';
import { COLLECTION_TYPE_STATUS_CODES } from 'types/redux/collectionTypes';
import { useTranslations } from 'next-intl';

interface Props {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onApply: (filters: any) => void;
  initialFilters?: any;
  testIdPrefix?: string;
  authorisationProfileOptions?: { label: string; value: string }[];
}

const CollectionTypeFilterDialog: React.FC<Props> = ({
  open,
  anchorEl,
  onClose,
  onApply,
  initialFilters,
  testIdPrefix = 'collection-type-filter-dialog',
  authorisationProfileOptions = [],
}) => {
  const t = useTranslations('collectionTypesHubData');

  const statusOptions = useMemo(() => [
    { value: COLLECTION_TYPE_STATUS_CODES.ACTIVE, label: t('ACT') },
    { value: COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL, label: t('APP') },
    { value: COLLECTION_TYPE_STATUS_CODES.DRAFT, label: t('DRAFT') },
  ], [t]);
  const [filters, setFilters] = useState({
    collectionTypeName: '',
    authorisationProfile: '',
    numberOfCount: '',
    status: '',
  });

  useEffect(() => {
    setFilters(initialFilters || {
      collectionTypeName: '',
      authorisationProfile: '',
      numberOfCount: '',
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
          aria-label={t('filterDialogClose')}
          onClick={onClose}
          data-testid={buildTestId(testIdPrefix, 'close-button')}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} data-testid={buildTestId(testIdPrefix, 'title')}>
          {t('filterDialogTitle')}
        </Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label={t('filterCollectionTypeName')}
            name="collectionTypeName"
            value={filters.collectionTypeName}
            onChange={handleChange}
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'collection-type-name-input')}
          />
          <TextField
            label={t('filterAuthorisationProfile')}
            name="authorisationProfile"
            value={filters.authorisationProfile}
            onChange={handleChange}
            select
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'authorisation-profile-select')}
            SelectProps={{
              MenuProps: {
                sx: {
                  zIndex: 1700,
                  '& .MuiPaper-root': {
                    zIndex: 1700,
                  },
                },
              },
            }}
          >
            <MenuItem value="" data-testid={buildTestId(testIdPrefix, 'authorisation-profile-option-all')}>
              <em>None</em>
            </MenuItem>
            {authorisationProfileOptions.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
                data-testid={buildTestId(testIdPrefix, 'authorisation-profile-option', option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('filterNumberOfAccounts')}
            name="numberOfCount"
            type="number"
            value={filters.numberOfCount}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 0 }}
            data-testid={buildTestId(testIdPrefix, 'number-of-accounts-input')}
          />
          <TextField
            label={t('filterStatus')}
            name="status"
            value={filters.status}
            onChange={handleChange}
            select
            fullWidth
            data-testid={buildTestId(testIdPrefix, 'status-select')}
             SelectProps={{
                            MenuProps: {
                                sx: {
                                    zIndex: 1700,
                                    '& .MuiPaper-root': {
                                        zIndex: 1700,
                                    },
                                },
                            },
                        }}
          >
            <MenuItem value="" data-testid={buildTestId(testIdPrefix, 'status-option-all')}>
              <em>All</em>
            </MenuItem>
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
            {t('cancel')}
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{ minWidth: 140 }}
            data-testid={buildTestId(testIdPrefix, 'update-button')}
          >
            {t('updateTable')}
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
};

export default CollectionTypeFilterDialog;
