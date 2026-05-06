'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, Grid, Divider } from '@mui/material';
import { Amount, TextField, Select, Button } from 'dist/standard-bank-react';
import AuthorizationRuleAccordion from '@molecules/AuthorizationRuleAccordion';
import Image from 'next/image';
import AddIcon from 'public/icons/icn_add.svg';
import ResetIcon from 'public/icons/reset-icon.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { AppDispatch, RootState } from 'store';
import {
  saveCurrentRule,
  addConditionToCurrentRule,
  updateCondition,
  resetSingleCondition,
  removeConditionFromCurrentRule,
  updateAuthRuleConstruct,
} from 'store/slices/createAuthRuleSlice';
import AuthorizationRuleCreateLogic from 'src/utils/AuthorizationRuleCreateLogic';
import { buildTestId } from 'src/utils/testIds';

// Options constants
const classOptions = [
  { label: 'Class name 1', value: 'classname1' },
  { label: 'Class name 2', value: 'classname2' },
  { label: 'Class name 3', value: 'classname3' },
  { label: 'Class name 4', value: 'classname4' },
];

const conditionOptions = [
  { label: 'And', value: 'and' },
  { label: 'Then', value: 'then' },
  { label: 'Or', value: 'or' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
];

interface AuthorizationRuleFormAccordionProps {
  ruleNumber: number;
  onSaveSuccess?: () => void;
  testIdPrefix?: string;
}

export interface AuthorizationRuleFormAccordionHandle {
  validateAllConditions: () => boolean;
}

const AuthorizationRuleFormAccordion = forwardRef<AuthorizationRuleFormAccordionHandle, AuthorizationRuleFormAccordionProps>((
  { ruleNumber, onSaveSuccess,testIdPrefix='current-rule-accordion' },
  ref
) => {
  const dispatch = useAppDispatch();
  const { currentRule } = useAppSelector((state) => state.createAuthRule);

  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});
  const [constructError, setConstructError] = useState('');
  const [resetCounter, setResetCounter] = useState(0);

  // Validate a single condition
  const validateCondition = (condition: any, index: number): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (index === 0) {
      const amountError = AuthorizationRuleCreateLogic.validateField('amount', condition.amount);
      if (amountError !== true) errors.amount = amountError;
    }

    if (index > 0) {
      if (!condition.conditionOperator || condition.conditionOperator.trim() === '') {
        errors.conditionOperator = 'Please select a condition operator';
      }
    }

    const classError = AuthorizationRuleCreateLogic.validateField('selectedClass', condition.selectedClass);
    if (classError !== true) errors.selectedClass = classError;

    const conditionError = AuthorizationRuleCreateLogic.validateField('selectedCondition', condition.selectedCondition);
    if (conditionError !== true) errors.selectedCondition = conditionError;

    const operandError = AuthorizationRuleCreateLogic.validateField('selectedOperand', condition.selectedOperand);
    if (operandError !== true) errors.selectedOperand = operandError;

    return errors;
  };

  const validateAllConditions = (): boolean => {
    const errors: Record<number, Record<string, string>> = {};
    let isValid = true;

    currentRule?.conditions?.forEach((condition, index) => {
      const conditionErrors = validateCondition(condition, index);
      if (Object.keys(conditionErrors).length > 0) {
        errors[index] = conditionErrors;
        isValid = false;
      }
    });

    setValidationErrors(errors);

    // Also validate authRuleConstruct
    if (!currentRule?.authRuleConstruct || currentRule.authRuleConstruct.trim() === '') {
      setConstructError('Authorisation rule construct cannot be empty');
      isValid = false;
    } else {
      setConstructError('');
    }

    return isValid;
  };

  // Expose validateAllConditions to parent via ref
  useImperativeHandle(ref, () => ({
    validateAllConditions,
  }));

  const handleAddConditionToRule = () => {
    if (!validateAllConditions()) {
      return;
    }
    dispatch(addConditionToCurrentRule());
    setValidationErrors({});
    setConstructError('');
  };

  const handleSaveRule = async () => {
    let isValid = true;

    const conditionsValid = validateAllConditions();
    if (!conditionsValid) {
      isValid = false;
    }

    if (!currentRule?.authRuleConstruct || currentRule.authRuleConstruct.trim() === '') {
      setConstructError('Authorisation rule construct cannot be empty');
      isValid = false;
    } else {
      setConstructError('');
    }

    if (!isValid) {
      return;
    }

    dispatch(saveCurrentRule());
    setValidationErrors({});
    setConstructError('');
    onSaveSuccess?.();
  };

  const handleResetCondition = (conditionIndex: number) => {
    dispatch(resetSingleCondition(conditionIndex));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[conditionIndex];
      return newErrors;
    });
    setResetCounter((prev) => prev + 1);
  };

  const handleRemoveCondition = (conditionIndex: number) => {
    if (conditionIndex > 0) {
      dispatch(removeConditionFromCurrentRule(conditionIndex));
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[conditionIndex];
        return newErrors;
      });
    }
  };

  // Auto-generate authRuleConstruct
  useEffect(() => {
    if (!currentRule?.conditions || !Array.isArray(currentRule.conditions) || currentRule.conditions.length === 0) return;

    const classMapping: Record<string, string> = {};
    classOptions.forEach((option) => {
      classMapping[option.value] = option.label;
    });

    const constructParts: string[] = [];

    currentRule.conditions.forEach((condition, index) => {
      if (!condition) return;

      if (index > 0 && condition.conditionOperator) {
        constructParts.push(condition.conditionOperator.toUpperCase());
      }

      const parts: string[] = [];

      if (condition.selectedClass) {
        parts.push(classMapping[condition.selectedClass] || condition.selectedClass);
      }

      if (condition.selectedCondition) {
        parts.push(condition.selectedCondition.toUpperCase());
      }

      if (condition.selectedOperand) {
        parts.push(classMapping[condition.selectedOperand] || condition.selectedOperand);
      }

      if (parts.length > 0) {
        constructParts.push(parts.join(' '));
      }
    });

    const newConstruct = constructParts.join(' ');

    if (newConstruct !== currentRule.authRuleConstruct) {
      dispatch(updateAuthRuleConstruct(newConstruct));
    }

    if (newConstruct && newConstruct.trim() !== '') {
      setConstructError('');
    }
  }, [currentRule?.conditions, currentRule?.authRuleConstruct, dispatch]);

  return (
    <AuthorizationRuleAccordion
      title={`Authorisation rule ${ruleNumber}`}
      operations={[]}
      onSave={handleSaveRule}
      hasValidationError={Object.values(validationErrors).some((errors) => Object.keys(errors).length > 0)}
    >
      <Box
        sx={{
          p: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            height: '48px',
          },
          '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
            transform: 'translate(14px, 12px) scale(1) !important',
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75) !important',
          },
        }}
      >
        <Grid container spacing={2}>
          <Grid size={6}>
            <Amount
              key={`amount-0-${resetCounter}`}
              value={currentRule?.conditions?.[0]?.amount || ''}
              currency={currentRule?.conditions?.[0]?.currency || 'USD'}
              currencyOptions={[
                { label: 'USD - US Dollar', value: 'USD' },
                { label: 'EUR - Euro', value: 'EUR' },
                { label: 'GBP - British Pounds', value: 'GBP' },
              ]}
              handleChangeCurrency={(newCurrency: string) => {
                dispatch(updateCondition({ conditionIndex: 0, field: 'currency', value: newCurrency }));
              }}
              handleChangeValue={(newValue: string) => {
                dispatch(updateCondition({ conditionIndex: 0, field: 'amount', value: newValue }));
                setValidationErrors((prev) => {
                  const newErrors = { ...prev };
                  if (newErrors[0]) delete newErrors[0].amount;
                  return newErrors;
                });
              }}
              label="Transaction limit"
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { height: '48px' } }}
              error={!!validationErrors[0]?.amount}
              helperText={validationErrors[0]?.amount || ''}
              data-testid={buildTestId(testIdPrefix, 'input-transaction-limit')}
            />
          </Grid>
          <Grid size={6}></Grid>
          <Grid size={4}>
            <Select
              formOptions={{
                sx: {
                  minWidth: '100%',
                },
              }}
              options={classOptions}
              selectProps={{
                label: 'Select a class',
                labelId: 'select-class-label',
                onChange: (e: any) => {
                  dispatch(updateCondition({ conditionIndex: 0, field: 'selectedClass', value: e.target.value }));
                  setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    if (newErrors[0]) delete newErrors[0].selectedClass;
                    return newErrors;
                  });
                },
                MenuProps: { sx: { zIndex: 1500 } },
              }}
              name="selectedClass"
              value={currentRule?.conditions?.[0]?.selectedClass || ''}
              error={!!validationErrors[0]?.selectedClass}
              helperText={validationErrors[0]?.selectedClass || ''}
              height="48px"
              data-testid={buildTestId(testIdPrefix, 'select-class-0')}
            />
          </Grid>
          <Grid size={4}>
            <Select
              formOptions={{
                sx: {
                  minWidth: '100%',
                },
              }}
              options={conditionOptions}
              selectProps={{
                label: 'Select a condition',
                labelId: 'select-condition-label',
                onChange: (e: any) => {
                  dispatch(updateCondition({ conditionIndex: 0, field: 'selectedCondition', value: e.target.value }));
                  setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    if (newErrors[0]) delete newErrors[0].selectedCondition;
                    return newErrors;
                  });
                },
                MenuProps: { sx: { zIndex: 1500 } },
              }}
              name="selectedCondition"
              value={currentRule?.conditions?.[0]?.selectedCondition || ''}
              error={!!validationErrors[0]?.selectedCondition}
              helperText={validationErrors[0]?.selectedCondition || ''}
              height="48px"
              data-testid={buildTestId(testIdPrefix, 'select-condition-0')}
            />
          </Grid>
          <Grid size={4}>
            <Select
              formOptions={{
                sx: {
                  minWidth: '100%',
                },
              }}
              options={classOptions}
              selectProps={{
                label: 'Select a class',
                labelId: 'select-class-operand-label',
                onChange: (e: any) => {
                  dispatch(updateCondition({ conditionIndex: 0, field: 'selectedOperand', value: e.target.value }));
                  setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    if (newErrors[0]) delete newErrors[0].selectedOperand;
                    return newErrors;
                  });
                },
                MenuProps: { sx: { zIndex: 1500 } },
              }}
              name="selectedOperand"
              value={currentRule?.conditions?.[0]?.selectedOperand || ''}
              error={!!validationErrors[0]?.selectedOperand}
              helperText={validationErrors[0]?.selectedOperand || ''}
              height="48px"
              data-testid={buildTestId(testIdPrefix, 'select-operand-0')}
            />
          </Grid>
          <Grid size={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={ResetIcon} alt="Reset" width={20} height={20} />}
              style={{ height: '48px', minHeight: '48px' }}
              onClick={() => handleResetCondition(0)}
              data-testid={buildTestId(testIdPrefix, 'button-reset-condition-0')}
              aria-label="Reset condition 1"
            >
              RESET CONDITION
            </Button>
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={DeleteIcon} alt="Remove" width={20} height={20} />}
              style={{ height: '48px', minHeight: '48px' }}
              onClick={() => handleRemoveCondition(0)}
              disabled={true}
              data-testid={buildTestId(testIdPrefix, 'button-remove-condition-0')}
              aria-label="Remove condition 1"
            >
              REMOVE CONDITION
            </Button>
          </Grid>
          {(currentRule?.conditions?.length || 0) === 1 && (
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
                <Button
                  buttonVariant="secondary"
                  startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
                  style={{ height: 48 }}
                  onClick={handleAddConditionToRule}
                  data-testid={buildTestId(testIdPrefix, 'button-add-condition')}
                  aria-label="Add a new condition"
                >
                  Add a condition
                </Button>
              </Box>
            </Grid>
          )}
          {(currentRule?.conditions || []).slice(1).map((condition, index) => {
            const conditionIndex = index + 1;
            const isLastCondition = conditionIndex === (currentRule?.conditions?.length || 0) - 1;
            return (
              <React.Fragment key={conditionIndex}>
                <Grid size={12} sx={{ mt: 2 }}>
                  <Divider />
                </Grid>
                <Grid size={4} sx={{ mt: 2 }}>
                  <Select
                    formOptions={{
                      sx: {
                        minWidth: '100%',
                      },
                    }}
                    options={conditionOptions}
                    selectProps={{
                      label: 'Select a condition',
                      labelId: `condition-operator-label-${conditionIndex}`,
                      onChange: (e: any) => {
                        dispatch(
                          updateCondition({
                            conditionIndex,
                            field: 'conditionOperator',
                            value: e.target.value,
                          }),
                        );
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          if (newErrors[conditionIndex]) delete newErrors[conditionIndex].conditionOperator;
                          return newErrors;
                        });
                      },
                      MenuProps: { sx: { zIndex: 1500 } },
                    }}
                    name={`conditionOperator-${conditionIndex}`}
                    value={condition.conditionOperator}
                    error={!!validationErrors[conditionIndex]?.conditionOperator}
                    helperText={validationErrors[conditionIndex]?.conditionOperator || ''}
                    height="48px"
                    data-testid={buildTestId(testIdPrefix, `select-operator-${conditionIndex}`)}
                  />
                </Grid>
                <Grid size={8}></Grid>
                <Grid size={4}>
                  <Select
                    formOptions={{
                      sx: {
                        minWidth: '100%',
                      },
                    }}
                    options={classOptions}
                    selectProps={{
                      label: 'Select a class',
                      labelId: `select-class-label-${conditionIndex}`,
                      onChange: (e: any) => {
                        dispatch(
                          updateCondition({
                            conditionIndex,
                            field: 'selectedClass',
                            value: e.target.value,
                          }),
                        );
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          if (newErrors[conditionIndex]) delete newErrors[conditionIndex].selectedClass;
                          return newErrors;
                        });
                      },
                      MenuProps: { sx: { zIndex: 1500 } },
                    }}
                    name={`selectedClass-${conditionIndex}`}
                    value={condition.selectedClass}
                    error={!!validationErrors[conditionIndex]?.selectedClass}
                    helperText={validationErrors[conditionIndex]?.selectedClass || ''}
                    height="48px"
                    data-testid={buildTestId(testIdPrefix, `select-class-${conditionIndex}`)}
                  />
                </Grid>
                <Grid size={4}>
                  <Select
                    formOptions={{
                      sx: {
                        minWidth: '100%',
                      },
                    }}
                    options={conditionOptions}
                    selectProps={{
                      label: 'Select a condition',
                      labelId: `select-condition-label-${conditionIndex}`,
                      onChange: (e: any) => {
                        dispatch(
                          updateCondition({
                            conditionIndex,
                            field: 'selectedCondition',
                            value: e.target.value,
                          }),
                        );
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          if (newErrors[conditionIndex]) delete newErrors[conditionIndex].selectedCondition;
                          return newErrors;
                        });
                      },
                      MenuProps: { sx: { zIndex: 1500 } },
                    }}
                    name={`selectedCondition-${conditionIndex}`}
                    value={condition.selectedCondition}
                    error={!!validationErrors[conditionIndex]?.selectedCondition}
                    helperText={validationErrors[conditionIndex]?.selectedCondition || ''}
                    height="48px"
                    data-testid={buildTestId(testIdPrefix, `select-condition-${conditionIndex}`)}
                  />
                </Grid>
                <Grid size={4}>
                  <Select
                    formOptions={{
                      sx: {
                        minWidth: '100%',
                      },
                    }}
                    options={classOptions}
                    selectProps={{
                      label: 'Select a class',
                      labelId: `select-operand-label-${conditionIndex}`,
                      onChange: (e: any) => {
                        dispatch(
                          updateCondition({
                            conditionIndex,
                            field: 'selectedOperand',
                            value: e.target.value,
                          }),
                        );
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          if (newErrors[conditionIndex]) delete newErrors[conditionIndex].selectedOperand;
                          return newErrors;
                        });
                      },
                      MenuProps: { sx: { zIndex: 1500 } },
                    }}
                    name={`selectedOperand-${conditionIndex}`}
                    value={condition.selectedOperand}
                    error={!!validationErrors[conditionIndex]?.selectedOperand}
                    helperText={validationErrors[conditionIndex]?.selectedOperand || ''}
                    height="48px"
                    data-testid={buildTestId(testIdPrefix, `select-operand-${conditionIndex}`)}
                  />
                </Grid>
                <Grid size={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    buttonVariant="tertiary"
                    startIcon={<Image src={ResetIcon} alt="Reset" width={20} height={20} />}
                    style={{ height: '48px', minHeight: '48px' }}
                    onClick={() => handleResetCondition(conditionIndex)}
                    data-testid={buildTestId(testIdPrefix, `button-reset-condition-${conditionIndex}`)}
                    aria-label={`Reset condition ${conditionIndex + 1}`}
                  >
                    RESET CONDITION
                  </Button>
                  <Button
                    buttonVariant="tertiary"
                    startIcon={<Image src={DeleteIcon} alt="Remove" width={20} height={20} />}
                    style={{ height: '48px', minHeight: '48px' }}
                    onClick={() => handleRemoveCondition(conditionIndex)}
                    data-testid={buildTestId(testIdPrefix, `button-remove-condition-${conditionIndex}`)}
                    aria-label={`Remove condition ${conditionIndex + 1}`}
                  >
                    REMOVE CONDITION
                  </Button>
                </Grid>
                {isLastCondition && (
                  <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Box sx={{ '&:hover img': { filter: 'brightness(0) invert(1)' } }}>
                      <Button
                        buttonVariant="secondary"
                        startIcon={<Image src={AddIcon} alt="addicon" width={24} height={24} />}
                        style={{ height: 48 }}
                        onClick={handleAddConditionToRule}
                        data-testid={buildTestId(testIdPrefix, 'button-add-condition')}
                        aria-label="Add a new condition"
                      >
                        Add a condition
                      </Button>
                    </Box>
                  </Grid>
                )}
              </React.Fragment>
            );
          })}
          <Grid size={12} sx={{ mt: 1 }}>
            <TextField
              type="text"
              name="authRuleConstruct"
              label="Authorisation rule construct"
              value={currentRule?.authRuleConstruct || ''}
              onChange={() => {}}
              error={!!constructError}
              helperText={constructError || ''}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': { height: '48px' },
                '& .MuiInputBase-input': { cursor: 'not-allowed' },
              }}
              data-testid={buildTestId(testIdPrefix, 'input-rule-construct')}
            />
          </Grid>
        </Grid>
      </Box>
    </AuthorizationRuleAccordion>
  );
});

AuthorizationRuleFormAccordion.displayName = 'AuthorizationRuleFormAccordion';

export default AuthorizationRuleFormAccordion;
