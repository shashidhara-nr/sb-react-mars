'use client';

import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Button,
} from 'dist/standard-bank-react';
import EditIcon from 'public/icons/col-icon-left-pencil.svg';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import IcnSaveIcon from 'public/icons/col-icon-left-save.svg';
import CheckNormalIcon from 'public/icons/icn_check_normal.svg';
import CloseBlueIcon from 'public/icons/close_standard_blue.svg';
import { DeleteIcon } from 'lib/icons';
import { buildTestId } from 'src/utils/testIds';

export type PayAlertEntry = {
  id: string;
  alertId: string;
  alertType: string;
  titleAndName: string;
  addressOrNumber: string;
  notify: boolean;
};

export interface CreatePayAlertsFormHandle {
  validate: () => boolean;
  hasErrors: () => boolean;
}

export interface CreatePayAlertsFormProps {
  title?: string;
  titleIcon?: any;
  mode?: 'edit' | 'review';
  ShowActionBtns?: boolean;
  alerts: PayAlertEntry[];
  onChange?: (alerts: PayAlertEntry[]) => void;
  onSubmit?: (alerts: PayAlertEntry[]) => void;
  testIdPrefix?: string;
  alertTypeOptions?: Array<{ label: string; value: string }>;
  howManyToAdd?: number;
  onCountChange?: (count: number) => void;
  enableCountSelector?: boolean;
  defaultAlertsCount?: number;
}

const ALERT_TYPE_OPTIONS = [
  { label: 'Number', value: 'Number' },
  { label: 'Email', value: 'Email' },
  { label: 'SMS', value: 'SMS' },
];

const CreatePayAlertsForm = forwardRef<CreatePayAlertsFormHandle, CreatePayAlertsFormProps>(({
  title,
  titleIcon,
  mode = 'review',
  ShowActionBtns = false,
  alerts: initialAlerts = [],
  onChange,
  onSubmit,
  testIdPrefix = 'pay-alerts-form',
  alertTypeOptions = ALERT_TYPE_OPTIONS,
  howManyToAdd = 5,
  onCountChange,
  enableCountSelector = false,
  defaultAlertsCount = 5,
}, ref) => {
  const [editingActive, setEditingActive] = useState(mode === 'edit');
  const [alerts, setAlerts] = useState<PayAlertEntry[]>(initialAlerts);
  const [preEditAlerts, setPreEditAlerts] = useState<PayAlertEntry[]>([]);
  const [alertCount, setAlertCount] = useState(howManyToAdd || defaultAlertsCount);
  const [validationErrors, setValidationErrors] = useState<Record<number, { alertType?: string; titleAndName?: string; addressOrNumber?: string }>>({});

  useEffect(() => {
    setEditingActive(mode === 'edit');
  }, [mode]);

  useEffect(() => {
    if (initialAlerts.length > 0) {
      setAlerts(initialAlerts);
      // Sync alertCount with initial alerts length
      if (enableCountSelector) {
        setAlertCount(initialAlerts.length);
      }
    } else if (enableCountSelector && alerts.length === 0) {
      // Initialize with default number of alerts for create mode
      const defaultAlerts = Array.from({ length: defaultAlertsCount }, (_, i) => ({
        id: `${i + 1}`,
        alertId: `${i + 1}`,
        alertType: 'Number',
        titleAndName: '',
        addressOrNumber: '',
        notify: true,
      }));
      setAlerts(defaultAlerts);
      if (onChange) {
        onChange(defaultAlerts);
      }
    }
  }, [initialAlerts, enableCountSelector, defaultAlertsCount, onChange, alerts.length]);

  const handleAlertChange = useCallback((index: number, field: keyof PayAlertEntry, value: any) => {
    setAlerts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // If alert type changes, update the addressOrNumber placeholder if it's still default
      if (field === 'alertType') {
        const currentAddressOrNumber = updated[index].addressOrNumber;
        const placeholderPattern = /^\[\+?[X\s]+\]$|^\[email@example\.com\]$/; // Matches default placeholders
        const isDefaultPlaceholder = placeholderPattern.test(currentAddressOrNumber || '');
        
        if (isDefaultPlaceholder || !currentAddressOrNumber) {
          // Update placeholder based on new type
          if (value === 'Email') {
            updated[index].addressOrNumber = '[email@example.com]';
          } else {
            updated[index].addressOrNumber = '[+XX XXXX XXXXXX]';
          }
        }
        
        // Clear addressOrNumber validation error when type changes so user can re-validate with new type
        if (validationErrors[index]?.addressOrNumber) {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors[index]) {
              const { addressOrNumber, ...rest } = newErrors[index];
              if (Object.keys(rest).length === 0) {
                delete newErrors[index];
              } else {
                newErrors[index] = rest;
              }
            }
            return newErrors;
          });
        }
      }
      
      if (onChange) {
        onChange(updated);
      }
      return updated;
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[index]?.[field as keyof typeof validationErrors[number]]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          const fieldErrors = { ...newErrors[index] };
          delete fieldErrors[field as keyof typeof fieldErrors];
          if (Object.keys(fieldErrors).length === 0) {
            delete newErrors[index];
          } else {
            newErrors[index] = fieldErrors;
          }
        }
        return newErrors;
      });
    }
  }, [onChange, validationErrors]);

  const handleDeleteAlert = useCallback((index: number) => {
    setAlerts((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (onChange) {
        onChange(updated);
      }
      return updated;
    });
    
    // Clear validation errors and reindex them after deletion
    setValidationErrors((prev) => {
      const newErrors: Record<number, { alertType?: string; titleAndName?: string; addressOrNumber?: string }> = {};
      Object.keys(prev).forEach((key) => {
        const idx = Number(key);
        if (idx < index) {
          newErrors[idx] = prev[idx];
        } else if (idx > index) {
          newErrors[idx - 1] = prev[idx];
        }
      });
      return newErrors;
    });
  }, [onChange]);

  const handleCountChange = useCallback((count: number) => {
    setAlertCount(count);
    
    // Clear validation errors when count changes
    setValidationErrors({});
    
    // Adjust alerts array based on new count
    setAlerts((prev) => {
      const currentCount = prev.length;
      let updated = [...prev];
      
      if (count > currentCount) {
        // Add new alerts
        const newAlerts = Array.from({ length: count - currentCount }, (_, i) => ({
          id: `${currentCount + i + 1}`,
          alertId: `${currentCount + i + 1}`,
          alertType: 'Number',
          titleAndName: '[title and name]',
          addressOrNumber: '[+XX XXXX XXXXXX]',
          notify: true,
        }));
        updated = [...prev, ...newAlerts];
      } else if (count < currentCount) {
        // Remove alerts from the end
        updated = prev.slice(0, count);
      }
      
      if (onChange) {
        onChange(updated);
      }
      if (onCountChange) {
        onCountChange(count);
      }
      
      return updated;
    });
  }, [onChange, onCountChange]);

  const validateEmailFormat = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePhoneFormat = (phone: string): string | undefined => {
    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number';
    }
    const digitsOnly = phone.replaceAll(/[\s\-+()]/g, '');
    if (digitsOnly.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    return undefined;
  };

  const validateSingleField = useCallback((index: number, field: 'alertType' | 'titleAndName' | 'addressOrNumber', value: string) => {
    let error: string | undefined;

    if (field === 'alertType' && (!value || value.trim() === '')) {
      error = 'Alert type is required';
    } else if (field === 'titleAndName' && (!value || value.trim() === '' || value === '[title and name]')) {
      error = 'Title and name is required';
    } else if (field === 'addressOrNumber') {
      const currentAlert = alerts[index];
      const isEmail = currentAlert?.alertType === 'Email';
      const placeholderPattern = /^\[.+\]$/;
      
      if (!value || value.trim() === '' || placeholderPattern.test(value.trim())) {
        error = isEmail ? 'Address is required' : 'Number is required';
      } else {
        const trimmedValue = value.trim();
        error = isEmail ? validateEmailFormat(trimmedValue) : validatePhoneFormat(trimmedValue);
      }
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[index] = { ...newErrors[index], [field]: error };
      } else if (newErrors[index]) {
        const { [field]: removed, ...rest } = newErrors[index];
        if (Object.keys(rest).length === 0) {
          delete newErrors[index];
        } else {
          newErrors[index] = rest;
        }
      }
      return newErrors;
    });
  }, [alerts]);

  const validateAlerts = useCallback(() => {
    const errors: Record<number, { alertType?: string; titleAndName?: string; addressOrNumber?: string }> = {};
    let hasErrors = false;

    alerts.forEach((alert, index) => {
      const fieldErrors: { alertType?: string; titleAndName?: string; addressOrNumber?: string } = {};

      // Validate alertType
      if (!alert.alertType || alert.alertType.trim() === '') {
        fieldErrors.alertType = 'Alert type is required';
        hasErrors = true;
      }

      // Validate titleAndName
      if (!alert.titleAndName || alert.titleAndName.trim() === '' || alert.titleAndName === '[title and name]') {
        fieldErrors.titleAndName = 'Title and name is required';
        hasErrors = true;
      }

      // Validate addressOrNumber
      const isEmail = alert.alertType === 'Email';
      const placeholderPattern = /^\[.+\]$/;
      
      if (!alert.addressOrNumber || alert.addressOrNumber.trim() === '' || placeholderPattern.test(alert.addressOrNumber.trim())) {
        fieldErrors.addressOrNumber = isEmail ? 'Address is required' : 'Number is required';
        hasErrors = true;
      } else {
        const trimmedValue = alert.addressOrNumber.trim();
        const formatError = isEmail ? validateEmailFormat(trimmedValue) : validatePhoneFormat(trimmedValue);
        if (formatError) {
          fieldErrors.addressOrNumber = formatError;
          hasErrors = true;
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        errors[index] = fieldErrors;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  }, [alerts]);

  // Expose validation methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate: () => {
      return validateAlerts();
    },
    hasErrors: () => {
      return Object.keys(validationErrors).length > 0;
    },
  }), [validateAlerts, validationErrors]);

  const handleSave = useCallback(() => {
    if (!validateAlerts()) {
      return;
    }
    
    if (onChange) {
      onChange(alerts);
    }
    if (onSubmit) {
      onSubmit(alerts);
    }
    setValidationErrors({});
    setEditingActive(false);
  }, [alerts, onChange, onSubmit, validateAlerts]);

  const handleCancel = useCallback(() => {
    setAlerts(preEditAlerts);
    setValidationErrors({});
    setEditingActive(false);
  }, [preEditAlerts]);

  const handleEdit = useCallback(() => {
    setPreEditAlerts([...alerts]);
    setEditingActive(true);
  }, [alerts]);

  const header = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px'  }}>
        {titleIcon ? <Image src={titleIcon} alt={title || 'Pay Alerts'} width={28} height={28} /> : null}
        {title && (
          <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>
            {title}
          </Typography>
        )}
      </Box>
      {ShowActionBtns && (
        editingActive ? (
          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button
              buttonVariant="text"
              data-testid={buildTestId(testIdPrefix, 'cancel-edit')}
              onClick={handleCancel}
              sx={{
                color: '#0051FF',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
              startIcon={<Image src={IcnCloseIcon} alt="close" width={24} height={24} />}
              style={{
                height: '36px',
                minHeight: '36px',
                width: '110px',
                marginTop: '-10px',
              }}
            >
              CANCEL
            </Button>
            <Button
              buttonVariant="text"
              data-testid={buildTestId(testIdPrefix, 'save-edit')}
              onClick={handleSave}
              sx={{
                color: '#0051FF',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
              startIcon={<Image src={IcnSaveIcon} alt="save" width={24} height={24} />}
              style={{
                height: '36px',
                minHeight: '36px',
                width: '90px',
                marginTop: '-10px',
              }}
            >
              SAVE
            </Button>
          </Box>
        ) : (
          <Button
            buttonVariant="text"
            data-testid={buildTestId(testIdPrefix, 'enable-edit')}
            onClick={handleEdit}
            sx={{
              color: '#0051FF',
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
            style={{
              width: '85px',
              height: '36px',
              minHeight: '36px',
              marginTop: '-10px',
              fontSize: '15px',
              fontStyle: 'bold',
            }}
            startIcon={<Image src={EditIcon} alt="edit" width={24} height={24} />}
          >
            EDIT
          </Button>
        )
      )}
    </Box>
  );

  const viewModeContent = (
    <Box sx={{ padding: ShowActionBtns ? '0' : '12px' }}>
      {alerts.map((alert, index) => (
        <Box
          key={alert.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: '100px 150px 200px 200px 100px',
            gap: '24px',
            alignItems: 'start',
            padding: '24px 0',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '4px',
                fontWeight: 400,
              }}
            >
              Alert id
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#222E37', fontWeight: 600 }}>
              [{alert.alertId}]
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '4px',
                fontWeight: 400,
              }}
            >
              Alert type
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#222E37', fontWeight: 600 }}>
              {alert.alertType}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '4px',
                fontWeight: 400,
              }}
            >
              Title and name
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#222E37', fontWeight: 400 }}>
              {alert.titleAndName}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '4px',
                fontWeight: 400,
              }}
            >
              {alert.alertType === 'Email' ? 'Address' : 'Number'}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#222E37', fontWeight: 400 }}>
              {alert.addressOrNumber}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '4px',
                fontWeight: 400,
              }}
            >
              Notify
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#222E37', fontWeight: 600 }}>
              {alert.notify ? 'Yes' : 'No'}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const editModeContent = (
    <Box sx={{ padding: ShowActionBtns ? '0' : '12px' }}>
      {enableCountSelector && (
        <Box sx={{ marginBottom: '16px' }}>
          <TextField
            label="How many pay alerts to add"
            value={alertCount}
            onChange={(e) => handleCountChange(Number(e.target.value))}
            select
            size="small"
            data-testid={buildTestId(testIdPrefix, 'count-selector')}
            sx={{
              width: '300px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                minHeight: '48px',
              },
            }}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {alerts.map((alert, index) => (
        <Box
          key={alert.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'start',
          }}
        >
          <Box>
            <TextField
              label="Alert id"
              value={alert.alertId}
              size="small"
              fullWidth
              slotProps={{
                input: { readOnly: true },
              }}
              data-testid={buildTestId(testIdPrefix, `alert-id-${index}`)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  minHeight: '48px',
                  backgroundColor: '#F5F7FA',
                },
              }}
            />
          </Box>

          <Box>
            <TextField
              label="Alert type"
              value={alert.alertType}
              onChange={(e) => handleAlertChange(index, 'alertType', e.target.value)}
              onBlur={(e) => validateSingleField(index, 'alertType', e.target.value)}
              select
              size="small"
              fullWidth
              error={!!validationErrors[index]?.alertType}
              helperText={validationErrors[index]?.alertType}
              data-testid={buildTestId(testIdPrefix, `alert-type-${index}`)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  minHeight: '48px',
                  backgroundColor: '#FFFFFF',
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 0,
                  marginTop: '4px',
                },
              }}
            >
              {alertTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <TextField
              label="Title and name"
              value={alert.titleAndName}
              onChange={(e) => handleAlertChange(index, 'titleAndName', e.target.value)}
              onBlur={(e) => validateSingleField(index, 'titleAndName', e.target.value)}
              size="small"
              fullWidth
              error={!!validationErrors[index]?.titleAndName}
              helperText={validationErrors[index]?.titleAndName}
              data-testid={buildTestId(testIdPrefix, `title-name-${index}`)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  minHeight: '48px',
                  backgroundColor: '#FFFFFF',
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 0,
                  marginTop: '4px',
                },
              }}
            />
          </Box>

          <Box>
            <TextField
              label={alert.alertType === 'Email' ? 'Address' : 'Number'}
              value={alert.addressOrNumber}
              onChange={(e) => handleAlertChange(index, 'addressOrNumber', e.target.value)}
              onBlur={(e) => validateSingleField(index, 'addressOrNumber', e.target.value)}
              size="small"
              fullWidth
              error={!!validationErrors[index]?.addressOrNumber}
              helperText={validationErrors[index]?.addressOrNumber}
              data-testid={buildTestId(testIdPrefix, `address-number-${index}`)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  minHeight: '48px',
                  backgroundColor: '#FFFFFF',
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 0,
                  marginTop: '4px',
                },
              }}
            />
          </Box>

          <Box >
            <Button
              buttonVariant={alert.notify ? 'secondary' : 'primary'}
              onClick={() => handleAlertChange(index, 'notify', !alert.notify)}
              data-testid={buildTestId(testIdPrefix, `notify-${index}`)}
              startIcon={
                alert.notify ? (
                  <Image
                    
                    src={CloseBlueIcon}
                    alt="close"
                    width={20}
                    height={20}
                    style={{
                      filter: 'invert(27%) sepia(93%) saturate(4289%) hue-rotate(215deg) brightness(102%) contrast(108%)',
                    }}
                  />
                ) : (
                  <Image
                    src={CheckNormalIcon}
                    alt="checkmark"
                    width={20}
                    height={20}
                    style={{
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                )
              }
              sx={{
                fontSize: '14px',
                fontWeight: '600',
                height: '48px',
                minHeight: '48px',
                width: '110px',
                textTransform: 'none',
                borderRadius: '24px',
              }}
              style={{
                height: '48px',
                minHeight: '48px',
                width: '110px',
                borderRadius: '24px',
              }}
            >
              Notify
            </Button>
          </Box>

          <Box>
            <Button
              buttonVariant="error-tertiary"
              onClick={() => handleDeleteAlert(index)}
              color='error'
              data-testid={buildTestId(testIdPrefix, `delete-${index}`)}
              aria-label={`Delete alert ${index + 1}`}
              startIcon={<Image src={DeleteIcon} alt="delete" width={24} height={24}/>}
            >
              DELETE
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        ...(ShowActionBtns && {
          border: '1px solid #E5E7EB',
          padding: '12px',
        }),
      }}
    >
      {header}
      {ShowActionBtns && (
        <Box
          sx={{
            borderBottom: '1px solid #EEF2F7',
            margin: ShowActionBtns ? '16px -24px 24px -24px' : '0',
          }}
        />
      )}
      {editingActive ? editModeContent : viewModeContent}
    </Box>
  );
});

CreatePayAlertsForm.displayName = 'CreatePayAlertsForm';

export default CreatePayAlertsForm;
