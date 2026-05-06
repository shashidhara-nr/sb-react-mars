'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import Image from 'next/image';
import { Button, Select } from 'dist/standard-bank-react';
import SettingsIcon from 'public/icons/icn_settings_outline.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import saveIcon from 'public/icons/save-icon.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import WarningIcon from 'public/icons/icn_warning_outline.svg';

export interface Operation {
  label: string;
  value: string;
}

export interface AuthorizationRuleAccordionProps {
  title: string;
  operations: string[];
  defaultExpanded?: boolean;
  onSave?: (formValues: Record<string, { rule: string; enforceAudit: boolean }>) => void;
  onRemove?: () => void;
  showSaveButton?: boolean;
  showRemoveButton?: boolean;
  removeLabel?: string;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
  initialValues?: Record<string, { rule: string; enforceAudit: boolean }>;
  hasValidationError?: boolean;
  errorMessage?: string;
}

const AuthorizationRuleAccordion: React.FC<AuthorizationRuleAccordionProps> = ({
  title,
  operations,
  defaultExpanded = false,
  onSave,
  onRemove,
  showSaveButton = true,
  showRemoveButton = false,
  removeLabel = 'REMOVE',
  headerActions,
  children,
  initialValues,
  hasValidationError = false,
  errorMessage = 'ERROR: COMPLETE AUTHORISATION RULE BEFORE SAVING OR ADDING ANOTHER RULE',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [formValues, setFormValues] = useState<
    Record<string, { rule: string; enforceAudit: boolean }>
  >(() => {
    if (initialValues) {
      return initialValues;
    }
    const initial: Record<string, { rule: string; enforceAudit: boolean }> = {};
    operations.forEach((op) => {
      initial[op] = { rule: '', enforceAudit: false };
    });
    return initial;
  });

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  // Sync with initialValues when they change (e.g., after reset)
  useEffect(() => {
    if (initialValues) {
      setFormValues(initialValues);
    } else {
      const initial: Record<string, { rule: string; enforceAudit: boolean }> = {};
      operations.forEach((op) => {
        initial[op] = { rule: '', enforceAudit: false };
      });
      setFormValues(initial);
    }
  }, [initialValues, operations]);

  const handleRuleChange = (operation: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [operation]: { ...prev[operation], rule: value },
    }));
  };

  const handleCheckboxChange = (operation: string, checked: boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [operation]: { ...prev[operation], enforceAudit: checked },
    }));
  };

  const handleSave = () => {
    onSave?.(formValues);
  };

  const handleRemove = () => {
    onRemove?.();
  };

  // Split operations into two columns
  const midPoint = Math.ceil(operations.length / 2);
  const leftColumnOps = operations.slice(0, midPoint);
  const rightColumnOps = operations.slice(midPoint);

  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionChange}
      sx={{
        border: '1px solid #E0E0E0',
        borderRadius: '12px !important',
        boxShadow: 'none',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={expanded ? <ExpandMoreIcon /> : null}
        sx={{
          minHeight: '48px !important',
          height: '48px',
          px: 2,
          py: 0,
          '&.Mui-expanded': {
            minHeight: '48px',
            height: '48px',
          },
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            my: 0,
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            my: 0,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            order: 3,
            color: '#0051FF',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Image src={SettingsIcon} alt="settings" width={24} height={24} />
          <Typography sx={{ fontWeight: 400, fontSize: '18px' }}>{title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasValidationError && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Image src={WarningIcon} alt="warning" width={24} height={24} />
              <Typography
                sx={{
                  color: '#E31E46',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {errorMessage}
              </Typography>
            </Box>
          )}
          {headerActions ? (
            headerActions
          ) : (
            <>
              {showRemoveButton && expanded &&  (
                <Button
                  buttonVariant="tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  startIcon={<Image src={DeleteIcon} alt="Delete" width={24} height={24} />}
                  style={{
                    minWidth: '90px',
                    width: 'auto',
                    height: '36px',
                    minHeight: '36px',
                    padding: '0 16px',
                  }}
                >
                  {removeLabel}
                </Button>
              )}
              {showSaveButton && (
                <Button
                  buttonVariant="tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  style={{
                    minWidth: '90px',
                    width: 'auto',
                    height: '36px',
                    minHeight: '36px',
                    padding: '0 16px',
                  }}
                  startIcon={<Image src={saveIcon} alt="saveicon" width={24} height={24} />}
                >
                  SAVE
                </Button>
              )}
            </>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Divider />
        {children ? (
          <Box sx={{ pt: '13px'}}>{children}</Box>
        ) : (
          <Box sx={{ pt: '13px', px: 2, pb: 2 }}>
            <Grid container spacing={2}>
            {/* Left Column */}
            <Grid size={6}>
              {leftColumnOps.map((operation) => (
                <Box key={operation} sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 3, fontSize: '14px', fontWeight: 400 }}>
                    {operation}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: '600px',
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
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
                      <Select
                        formOptions={{
                          sx: {
                            width: '100%',
                          },
                        }}
                        options={[
                          { label: 'Rule 1', value: 'rule1' },
                          { label: 'Rule 2', value: 'rule2' },
                          { label: 'Rule 3', value: 'rule3' },
                        ]}
                        selectProps={{
                          label: 'Authorisation rule',
                          labelId: `left-${operation}-label`,
                          onChange: (e: any) => handleRuleChange(operation, e.target.value),
                        }}
                        name={`left-${operation}`}
                        value={formValues[operation]?.rule || ''}
                        error={false}
                        helperText=""
                        height="48px"
                      />
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formValues[operation]?.enforceAudit || false}
                          onChange={(e) => handleCheckboxChange(operation, e.target.checked)}
                          size="small"
                        />
                      }
                      label="Enforce audit"
                      sx={{
                        m: 0,
                        whiteSpace: 'nowrap',
                        '& .MuiFormControlLabel-label': {
                          fontSize: '14px',
                        },
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Grid>

            {/* Right Column */}
            <Grid size={6}>
              {rightColumnOps.map((operation) => (
                <Box key={operation} sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 3, fontSize: '14px', fontWeight: 400 }}>
                    {operation}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: '600px',
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
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
                      <Select
                        formOptions={{
                          sx: {
                            width: '100%',
                          },
                        }}
                        options={[
                          { label: 'Rule 1', value: 'rule1' },
                          { label: 'Rule 2', value: 'rule2' },
                          { label: 'Rule 3', value: 'rule3' },
                        ]}
                        selectProps={{
                          label: 'Authorisation rule',
                          labelId: `right-${operation}-label`,
                          onChange: (e: any) => handleRuleChange(operation, e.target.value),
                        }}
                        name={`right-${operation}`}
                        value={formValues[operation]?.rule || ''}
                        error={false}
                        helperText=""
                        height="48px"
                      />
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formValues[operation]?.enforceAudit || false}
                          onChange={(e) => handleCheckboxChange(operation, e.target.checked)}
                          size="small"
                        />
                      }
                      label="Enforce audit"
                      sx={{
                        m: 0,
                        whiteSpace: 'nowrap',
                        '& .MuiFormControlLabel-label': {
                          fontSize: '14px',
                        },
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default AuthorizationRuleAccordion;
