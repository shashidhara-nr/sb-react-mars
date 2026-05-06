import * as React from 'react';
import {
  Box,
  Paper,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Popper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

export type BopThirdPartyStatus = 'Active' | 'Awaiting Approval' | 'Needs Action';

export type EntityType = 'Individual' | 'Company';

export type CountryRegion = string;

export interface FilterValues {
  entity: EntityType | '';
  name: string;
  surname: string;
  countryRegion: CountryRegion | '';
  bopThirdPartyId: string;
  customsClientNo: string;
  status: BopThirdPartyStatus | '';
}

export interface FilterBopThirdPartiesDrawerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  /** Called on Apply with the current filter values */
  onApply: (values: FilterValues) => void;
  /** Optional defaults (e.g., values from URL params) */
  initialValues?: Partial<FilterValues>;
  /** Supply custom option sets if needed */
  entities?: EntityType[];
  countries?: CountryRegion[];
  statuses?: BopThirdPartyStatus[];
}

const DEFAULT_VALUES: FilterValues = {
  entity: '',
  name: '',
  surname: '',
  countryRegion: '',
  bopThirdPartyId: '',
  customsClientNo: '',
  status: '',
};

export default function FilterBopThirdPartiesDrawer({
  open,
  anchorEl,
  onClose,
  onApply,
  initialValues,
  entities = ['Individual', 'Company'],
  countries = ['United Kingdom', 'United States', 'Canada', 'Germany', 'France'],
  statuses = ['Active', 'Awaiting Approval', 'Needs Action'],
  ...props
}: FilterBopThirdPartiesDrawerProps & { 'data-testid'?: string }) {
  const testIdPrefix = props['data-testid'] || 'bop-third-parties-filter-drawer';
  const [values, setValues] = React.useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  // Reset when dialog opens (so repeated opens reflect latest defaults)
  React.useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT_VALUES, ...initialValues });
    }
  }, [open, initialValues]);

  // Handlers
  const handleText = (key: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSelect = (key: keyof FilterValues) => (e: SelectChangeEvent<string>) => {
    setValues((v) => ({ ...v, [key]: e.target.value as any }));
  };

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  if (!open) return null;

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" style={{ zIndex: 1400 }}>
      <Paper
        elevation={0}
        sx={{
          width: 400,
          p: 3,
          pt: 2,
          borderRadius: 2,
          minHeight: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          border: '1px solid #CED3D9',
          mt: 1,
        }}
      >
        <IconButton
          aria-label="close"
          data-testid={buildTestId(testIdPrefix, 'close-button')}
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filter BOP third parties
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          mt={1}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              height: '48px',
            },
            '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
              top: '50%',
              transform: 'translateY(-50%)',
              left: '14px',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              top: '0px',
              left: '0px',
            },
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="entity-label">Entity</InputLabel>
            <Select
              data-testid={buildTestId(testIdPrefix, 'entity-select')}
              labelId="entity-label"
              label="Entity"
              value={values.entity}
              onChange={handleSelect('entity')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {entities.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            data-testid={buildTestId(testIdPrefix, 'name-input')}
            label="Name"
            value={values.name}
            onChange={handleText('name')}
            fullWidth
            size="medium"
          />

          <TextField
            data-testid={buildTestId(testIdPrefix, 'surname-input')}
            label="Surname"
            value={values.surname}
            onChange={handleText('surname')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="country-label">Country/region</InputLabel>
            <Select
              data-testid={buildTestId(testIdPrefix, 'country-select')}
              labelId="country-label"
              label="Country/region"
              value={values.countryRegion}
              onChange={handleSelect('countryRegion')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            data-testid={buildTestId(testIdPrefix, 'bop-id-input')}
            label="BOP third-party ID"
            value={values.bopThirdPartyId}
            onChange={handleText('bopThirdPartyId')}
            fullWidth
          />

          <TextField
            data-testid={buildTestId(testIdPrefix, 'customs-input')}
            label="Customs client no."
            value={values.customsClientNo}
            onChange={handleText('customsClientNo')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              data-testid={buildTestId(testIdPrefix, 'status-select')}
              labelId="status-label"
              label="Status"
              value={values.status}
              onChange={handleSelect('status')}
              MenuProps={{
                sx: { zIndex: 1500 },
              }}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            data-testid={buildTestId(testIdPrefix, 'cancel-button')}
            onClick={onClose}
            buttonVariant="tertiary"
            style={{
              width: '82px',
              height: '48px',
              minWidth: '82px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            CANCEL
          </Button>
          <Button
            data-testid={buildTestId(testIdPrefix, 'apply-button')}
            onClick={handleApply}
            buttonVariant="primary"
            style={{
              width: '153px',
              height: '48px',
              minWidth: '153px',
              minHeight: '48px',
              borderRadius: '8px',
            }}
          >
            UPDATE TABLE
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
