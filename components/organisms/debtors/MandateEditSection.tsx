import { useState } from 'react';
import { Box, Typography, Button as MuiButton, IconButton, TextField as MuiTextField } from '@mui/material';
import { Button, TextField, Select, DatePicker } from 'dist/standard-bank-react';
import { MandateDetails } from '../../../types/mandate';
import { useDispatch } from 'react-redux';
import { addMandate, removeMandate, updateMandate } from '@store/slices/createDebtorSlice';
import { validateMandate, getValidationErrors } from '@lib/utils/mandateValidator';
import Image from 'next/image';
import CalendarIcon from 'public/icons/icn_calendar.svg';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';

interface MandateEditSectionProps {
  mandates: MandateDetails[];
  accountCurrency?: string;
  isManaged?: boolean;
  countryCode?: string; // Added for country-based field display
  onChange?: (mandates: MandateDetails[]) => void;
}

const MandateEditSection: React.FC<MandateEditSectionProps> = ({
  mandates,
  accountCurrency,
  isManaged = false,
  countryCode,
  onChange,
}) => {
  const dispatch = useDispatch();
  const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtor-mandate-edit';
  const [validationErrors, setValidationErrors] = useState<Map<number, any[]>>(new Map());
  
  // Determine if country is Mozambique (show limited fields)
  const isMozambique = countryCode?.toUpperCase() === 'MZ';

  const handleAddMandate = () => {
    dispatch(addMandate({ isManaged }));
  };

  const handleRemoveMandate = (index: number) => {
    dispatch(removeMandate({ index, isManaged }));
    // Remove validation errors for this mandate
    const newErrors = new Map(validationErrors);
    newErrors.delete(index);
    setValidationErrors(newErrors);
  };

  const handleMandateChange = (index: number, field: string, value: any) => {
    const updatedMandate: Partial<MandateDetails> = { [field]: value };
    
    // If mandate type changes, clear amount fields
    if (field === 'mandateType') {
      if (value === 'Fixed') {
        updatedMandate.minAmount = null;
        updatedMandate.maxAmount = null;
      } else if (value === 'Variable') {
        updatedMandate.fixedAmount = null;
      }
    }

    dispatch(updateMandate({ index, mandate: updatedMandate, isManaged }));

    // Validate the updated mandate
    const currentMandate = mandates[index];
    const validationCode = validateMandate(
      { ...currentMandate, ...updatedMandate },
      accountCurrency
    );
    const errors = getValidationErrors(validationCode);
    
    if (errors.length > 0) {
      const newErrors = new Map(validationErrors);
      newErrors.set(index, errors);
      setValidationErrors(newErrors);
    } else {
      const newErrors = new Map(validationErrors);
      newErrors.delete(index);
      setValidationErrors(newErrors);
    }
  };

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'container')}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '24px 20px',
          borderBottom: '1px solid #E5E5E5',
          backgroundColor: '#FFFFFF',
        }} 
        data-testid={buildTestId(testIdPrefix, 'header')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
            <Image src={CalendarIcon} alt="mandates" width={24} height={24} style={{ filter: 'invert(27%) sepia(8%) saturate(916%) hue-rotate(169deg) brightness(94%) contrast(87%)' }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '18px', 
              lineHeight: '24px',
              color: '#222E37',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {translateLang('mandates')}
          </Typography>
        </Box>
        <Button onClick={handleAddMandate} buttonVariant="secondary" data-testid={buildTestId(testIdPrefix, 'add-mandate-button')}>
          {translateLang('addMandate')}
        </Button>
      </Box>

      <Box sx={{ padding: '24px 20px', backgroundColor: '#FFFFFF' }}>
        {mandates.length === 0 && (
          <Box sx={{ p: '20px', border: '1px solid #E5E5E5', borderRadius: '12px', backgroundColor: '#FAFBFC' }} data-testid={buildTestId(testIdPrefix, 'empty-state')}>
            <Typography sx={{ fontSize: '14px', color: '#5A6772', fontFamily: 'Inter, sans-serif' }}>
              {translateLang('noMandatesAdded')}
            </Typography>
          </Box>
        )}

      {mandates.map((mandate, index) => {
        const errors = validationErrors.get(index) || [];
        const hasError = errors.length > 0;

        return (
          <Box
            key={index}
            sx={{
              mb: index < mandates.length - 1 ? 3 : 0,
              p: '20px',
              border: hasError ? '2px solid #D32F2F' : '1px solid #E5E5E5',
              borderRadius: '12px',
              backgroundColor: '#FAFBFC',
              position: 'relative',
            }}
            data-testid={buildTestId(testIdPrefix, 'mandate-card', index)}
          >
            <IconButton
              onClick={() => handleRemoveMandate(index)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#666',
              }}
              data-testid={buildTestId(testIdPrefix, 'remove-mandate-button', index)}
            >
              <CloseIcon />
            </IconButton>

            {hasError && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: '#FFEBEE',
                  border: '1px solid #D32F2F',
                  borderRadius: '4px',
                }}
                data-testid={buildTestId(testIdPrefix, 'validation-errors', index)}
              >
                {errors.map((error, errorIdx) => (
                  <Typography key={errorIdx} sx={{ fontSize: '13px', color: '#D32F2F' }}>
                    • {error}
                  </Typography>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {/* Mandate ID - Always shown */}
              <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                <MuiTextField
                  label={translateLang('mandateId')}
                  value={mandate.mandateId || ''}
                  onChange={(e: any) => handleMandateChange(index, 'mandateId', e.target.value)}
                  error={hasError}
                  required
                  fullWidth
                  size="small"
                />
              </Box>

              {/* Mozambique (MZ) - Only show 4 fields */}
              {isMozambique ? (
                <>
                  {/* Invoice Begin Date */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <DatePicker
                      label={translateLang('invoiceBeginDate')}
                      value={mandate.beginDate}
                      onChange={(date: unknown) =>
                        handleMandateChange(index, 'beginDate', date)
                      }
                    />
                  </Box>

                  {/* Invoice End Date */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <DatePicker
                      label={translateLang('invoiceEndDate')}
                      value={mandate.endDate}
                      onChange={(date: unknown) =>
                        handleMandateChange(index, 'endDate', date)
                      }
                    />
                  </Box>

                  {/* Observation (full width) */}
                  <Box sx={{ flex: '1 1 100%' }}>
                    <MuiTextField
                      label={translateLang('observation')}
                      value={mandate.referenceDescription || ''}
                      onChange={(e: any) =>
                        handleMandateChange(index, 'referenceDescription', e.target.value)
                      }
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                    />
                  </Box>
                </>
              ) : (
                <>
                  {/* Other Countries - Show all fields */}
                  {/* Mandate Type */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <Select
                      value={mandate.mandateType || ''}
                      name="mandateType"
                      options={[
                        { value: 'Fixed', label: translateLang('fixed') },
                        { value: 'Variable', label: translateLang('variable') },
                      ]}
                      error={hasError}
                      selectProps={{
                        label: translateLang('mandateType'),
                        onChange: (e: any) => handleMandateChange(index, 'mandateType', e.target.value)
                      }}
                    />
                  </Box>

                  {/* Begin Date */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <DatePicker
                      label={translateLang('beginDate')}
                      value={mandate.beginDate}
                      onChange={(date: unknown) =>
                        handleMandateChange(index, 'beginDate', date)
                      }
                    />
                  </Box>

                  {/* End Date */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <DatePicker
                      label={translateLang('endDate')}
                      value={mandate.endDate}
                      onChange={(date: unknown) =>
                        handleMandateChange(index, 'endDate', date)
                      }
                    />
                  </Box>

                  {/* Collection Frequency */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <Select
                      value={mandate.frequency || ''}
                      name="frequency"
                      options={[
                        { value: 'Daily', label: translateLang('daily') },
                        { value: 'Weekly', label: translateLang('weekly') },
                        { value: 'Monthly', label: translateLang('monthly') },
                        { value: 'Quarterly', label: translateLang('quarterly') },
                        { value: 'Annually', label: translateLang('annually') },
                      ]}
                      error={hasError}
                      selectProps={{
                        label: translateLang('collectionFrequency'),
                        onChange: (e: any) => handleMandateChange(index, 'frequency', e.target.value)
                      }}
                    />
                  </Box>

                  {/* Debit Day */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <MuiTextField
                      label={translateLang('debitDayOfMonth')}
                      type="number"
                      value={mandate.debitDay?.toString() || '1'}
                      onChange={(e: any) =>
                        handleMandateChange(index, 'debitDay', parseInt(e.target.value) || 1)
                      }
                      error={hasError}
                      required
                      fullWidth
                      size="small"
                      inputProps={{ min: 1, max: 31 }}
                    />
                  </Box>

                  {/* Currency */}
                  <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                    <MuiTextField
                      label={translateLang('currency')}
                      value={mandate.currency || accountCurrency || ''}
                      onChange={(e: any) => handleMandateChange(index, 'currency', e.target.value)}
                      error={hasError}
                      required
                      fullWidth
                      size="small"
                    />
                  </Box>

                  {/* Fixed Amount (only for Fixed type) */}
                  {mandate.mandateType === 'Fixed' && (
                    <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                      <MuiTextField
                        label={translateLang('fixedAmount')}
                        type="number"
                        value={mandate.fixedAmount?.toString() || ''}
                        onChange={(e: any) =>
                          handleMandateChange(index, 'fixedAmount', parseFloat(e.target.value) || 0)
                        }
                        error={hasError}
                        required
                        fullWidth
                        size="small"
                        inputProps={{ min: 0, step: '0.01' }}
                      />
                    </Box>
                  )}

                  {/* Min/Max Amounts (only for Variable type) */}
                  {mandate.mandateType === 'Variable' && (
                    <>
                      <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                        <MuiTextField
                          label={translateLang('minimumAmount')}
                          type="number"
                          value={mandate.minAmount?.toString() || ''}
                          onChange={(e: any) =>
                            handleMandateChange(index, 'minAmount', parseFloat(e.target.value) || 0)
                          }
                          error={hasError}
                          required
                          fullWidth
                          size="small"
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
                        <MuiTextField
                          label={translateLang('maximumAmount')}
                          type="number"
                          value={mandate.maxAmount?.toString() || ''}
                          onChange={(e: any) =>
                            handleMandateChange(index, 'maxAmount', parseFloat(e.target.value) || 0)
                          }
                          error={hasError}
                          required
                          fullWidth
                          size="small"
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </Box>
                    </>
                  )}

                  {/* Reference Description */}
                  <Box sx={{ flex: '1 1 100%' }}>
                    <MuiTextField
                      label={translateLang('referenceDescription')}
                      value={mandate.referenceDescription || ''}
                      onChange={(e: any) =>
                        handleMandateChange(index, 'referenceDescription', e.target.value)
                      }
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                    />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        );
      })}
      </Box>
    </Box>
  );
};

export default MandateEditSection;
