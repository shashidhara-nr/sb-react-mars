'use client';

import * as React from 'react';
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Control, Controller, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { StatementReferencingState } from './StatementReferencingOptions';

type SectionType = 'creditItemised' | 'creditConsolidated' | 'debitItemised' | 'debitConsolidated';

interface StatementReferenceSectionProps {
  control: Control<StatementReferencingState>;
  errors: FieldErrors<StatementReferencingState>;
  sectionKey: SectionType;
  label: string;
  disabled?: boolean;
  sectionDisabled?: boolean; // Disables the entire section including checkbox
  presets: string[];
  maxLength?: number;
  watch: UseFormWatch<StatementReferencingState>;
  setValue: UseFormSetValue<StatementReferencingState>;
}

const SectionLabel: React.FC<React.PropsWithChildren<{ required?: boolean; error?: boolean }>> = ({ 
  children, 
  required, 
  error 
}) => (
  <FormLabel
    sx={{
      color: 'text.primary',
      fontWeight: 600,
      mb: 1.5,
      '&.Mui-focused': { color: 'text.primary' }
    }}
    required={required}
    error={error}
  >
    {children}
  </FormLabel>
);

export const StatementReferenceSection: React.FC<StatementReferenceSectionProps> = ({
  control,
  errors,
  sectionKey,
  label='',
  disabled = false,
  sectionDisabled = false,
  presets,
  maxLength = 34,
  watch,
  setValue,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const addTag = (tag: string, refs: string[]) => {
    const trimmed = tag.trim();
    if (!trimmed) return refs;
    if (trimmed.length > maxLength) return refs;
    if (refs.includes(trimmed)) return refs;
    return [...refs, trimmed];
  };

  const removeTag = (tag: string, refs: string[]) => {
    setValue(`${sectionKey}.references`, refs.filter((t) => t !== tag), { shouldValidate: true });
  };

  const handlePresetSelect = (preset: string, refs: string[]) => {
    const next = addTag(preset, refs);
    setValue(`${sectionKey}.references`, next, { shouldValidate: true });
    setAnchorEl(null);
  };

  const sectionErrors = errors[sectionKey] as any;

  return (
    <Box px={2} py={1.5}>
      <Controller
        name={`${sectionKey}.selected`}
        control={control}
        render={({ field: selectedField }) => (
          <FormControlLabel
            control={
              <Checkbox 
                checked={Boolean(selectedField.value)} 
                onChange={(e) => selectedField.onChange(e.target.checked)}
                disabled={disabled || sectionDisabled} 
              />
            }
            label={label}
            sx={{
              ...(sectionDisabled && {
                opacity: 0.5,
                cursor: 'not-allowed',
              })
            }}
          />
        )}
      />
    
      <Grid container spacing={2} sx={{ mt: 1, ml: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={`${sectionKey}.references`}
              control={control}
              render={({ field }) => {
                const currentRefs = field.value || [];
                return (
                <FormControl
                  fullWidth
                  disabled={disabled || sectionDisabled}
                  error={!!sectionErrors?.references}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      onClick={(e) => !disabled && setAnchorEl(e.currentTarget)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        alignItems: 'center',
                        minHeight: 64,
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: 1,
                        padding: '14px',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'rgba(0, 0, 0, 0.87)',
                        },
                        ...((disabled || sectionDisabled) && {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)',
                          cursor: 'default',
                        }),
                      }}
                    >
                      {currentRefs.length === 0 && (
                        <Box sx={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.875rem' }}>
                          Statement references
                        </Box>
                      )}
                      {currentRefs.map((tag: string) => (
                        <Chip
                          key={tag}
                          color="primary"
                          variant="filled"
                          size="small"
                          label={tag}
                          onDelete={(disabled || sectionDisabled) ? undefined : () => removeTag(tag, currentRefs)}
                          sx={{
                            height: 24,
                            fontSize: '0.8125rem'
                          }}
                        />
                      ))}
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton
                        size="small"
                        disabled={disabled || sectionDisabled}
                        sx={{ color: 'primary.main', ml: 1 }}
                      >
                        <ArrowDropDownIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    {presets.map((item) => (
                      <MenuItem
                        key={item}
                        onClick={() => handlePresetSelect(item, currentRefs)}
                        disabled={disabled || sectionDisabled}
                      >
                        {item}
                      </MenuItem>
                    ))}
                  </Menu>
                  {!!sectionErrors?.references && (
                    <FormHelperText>{sectionErrors.references.message as string}</FormHelperText>
                  )}
                </FormControl>
              );
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'flex-start', pt: 1 }}>
            <Controller
              name={`${sectionKey}.editableReference`}
              control={control}
              render={({ field: editableField }) => (
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={Boolean(editableField.value)} 
                      onChange={(e) => editableField.onChange(e.target.checked)}
                      disabled={disabled || sectionDisabled} 
                    />
                  }
                  label="Editable statement reference"
                  sx={{
                    ...(sectionDisabled && {
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    })
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
    </Box>
  );
};
