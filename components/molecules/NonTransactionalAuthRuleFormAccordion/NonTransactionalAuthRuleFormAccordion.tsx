'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Box, Grid, IconButton } from '@mui/material';
import { Button, Select, TextField } from 'dist/standard-bank-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import type { AppDispatch, RootState } from 'store';
import AuthorizationRuleAccordion from '@molecules/AuthorizationRuleAccordion';
import SecurityWarningDialog from 'components/common/SecurityWarningDialog';
import AddIcon from 'public/icons/icn_add.svg';
import SaveIcon from 'public/icons/save-icon.svg';
import UndoIcon from 'public/icons/icn_chevron_left_color.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import CloseIcon from 'public/icons/close-icon.svg';
import styles from './NonTransactionalAuthRuleFormAccordion.module.scss';
import {
  updateNonTransactionalRuleConstruct,
  saveNonTransactionalRule,
  deleteNonTransactionalRule,
} from 'store/slices/createAuthRuleSlice';
import NonTransactionalAuthRuleCreateLogic from 'src/utils/NonTransactionalAuthRuleCreateLogic';

const classOptions = [
  { label: 'Authorisation class 1', value: 'authorisation class 1' },
  { label: 'Authorisation class 2', value: 'authorisation class 2' },
  { label: 'Authorisation class 3', value: 'authorisation class 3' },
  { label: 'Authorisation class 4', value: 'authorisation class 4' },
  { label: 'Authorisation class 5', value: 'authorisation class 5' },
];

const keyboardTokens = ['THEN', 'AND', 'OR', '(', ')'] as const;

const CONTENT_MAX_WIDTH = 920;
const UNDO_BUTTON_WIDTH = 150;
const BLUE = '#0051FF';
const ERROR_RED = '#E31E46';

const SBTextField: any = TextField;

type Translate = (key: string, values?: Record<string, any>) => string;

function getUnclosedQuotedClass(input: string): { startQuoteIndex: number; value: string } | null {
  const text = String(input ?? '');
  const lastQuote = text.lastIndexOf('"');
  if (lastQuote < 0) return null;

  const quoteCount = (text.match(/\"/g) || []).length;
  if (quoteCount % 2 === 0) return null;

  return { startQuoteIndex: lastQuote, value: text.slice(lastQuote + 1) };
}

function isAllowedClassPrefixCaseSensitive(partial: string): boolean {
  const value = String(partial ?? '');
  if (!value) return true;
  return classOptions.some((o) => o.label.startsWith(value));
}

function normalizeClassToken(value: string) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getClassMismatchError(construct: string, t: Translate): string {
  const input = String(construct ?? '');
  if (!input.trim()) return '';

  // If the user is mid-typing a quoted class, don't show mismatch yet.
  const quoteCount = (input.match(/\"/g) || []).length;
  if (quoteCount % 2 === 1) return '';

  const allowedExact = new Set(classOptions.map((o) => o.label));
  const allowedNormalized = new Map(
    classOptions.map((o) => [normalizeClassToken(o.label), o.label] as const),
  );

  const matches = input.matchAll(/\"([^\"]*)\"/g);
  for (const match of matches) {
    const raw = match?.[1] ?? '';
    if (!raw.trim()) continue;

    if (allowedExact.has(raw)) continue;

    const normalized = normalizeClassToken(raw);
    const expected = allowedNormalized.get(normalized);
    if (expected) {
      return t('errorClassMustMatchExactly', { expected });
    }

    return t('errorUnknownAuthorisationClass', { value: raw });
  }

  return '';
}

type ConstructToken =
  | { type: 'LPAREN' | 'RPAREN' | 'THEN' | 'AND' | 'OR' }
  | { type: 'CLASS' }
  | { type: 'UNKNOWN' };

function analyzeConstruct(value: string): {
  hasUnclosedQuote: boolean;
  depth: number;
  expectingOperand: boolean;
} {
  const input = String(value ?? '').trim();
  if (!input) {
    return { hasUnclosedQuote: false, depth: 0, expectingOperand: true };
  }

  const tokens: ConstructToken[] = [];
  let hasUnclosedQuote = false;

  for (let i = 0; i < input.length; ) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'LPAREN' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN' });
      i++;
      continue;
    }
    if (ch === '"') {
      // quoted class
      let j = i + 1;
      let foundEnd = false;
      while (j < input.length) {
        if (input[j] === '"') {
          foundEnd = true;
          break;
        }
        j++;
      }
      if (!foundEnd) {
        hasUnclosedQuote = true;
        break;
      }
      tokens.push({ type: 'CLASS' });
      i = j + 1;
      continue;
    }

    const wordMatch = input.slice(i).match(/^[A-Za-z]+/);
    if (wordMatch) {
      const upper = wordMatch[0].toUpperCase();
      if (upper === 'THEN') tokens.push({ type: 'THEN' });
      else if (upper === 'AND') tokens.push({ type: 'AND' });
      else if (upper === 'OR') tokens.push({ type: 'OR' });
      else tokens.push({ type: 'UNKNOWN' });
      i += wordMatch[0].length;
      continue;
    }

    tokens.push({ type: 'UNKNOWN' });
    i++;
  }

  let depth = 0;
  let expectingOperand = true;

  for (const token of tokens) {
    if (expectingOperand) {
      if (token.type === 'CLASS') {
        expectingOperand = false;
        continue;
      }
      if (token.type === 'LPAREN') {
        depth++;
        expectingOperand = true;
        continue;
      }

      // Anything else here keeps us expecting an operand.
      if (token.type === 'RPAREN') depth = Math.max(0, depth - 1);
      continue;
    }

    // expecting operator / close / end
    if (token.type === 'THEN' || token.type === 'AND' || token.type === 'OR') {
      expectingOperand = true;
      continue;
    }
    if (token.type === 'RPAREN') {
      depth = Math.max(0, depth - 1);
      expectingOperand = false;
      continue;
    }
    // If we see an operand while expecting an operator, keep state as-is.
  }

  return { hasUnclosedQuote, depth, expectingOperand };
}

export interface NonTransactionalAuthRuleFormAccordionProps {
  ruleId: string;
  ruleNumber: number;
  showDeleteButton?: boolean;
  disableSave?: boolean;
  defaultExpanded?: boolean;
  actionPlacement?: 'footer' | 'header';
  onCancel?: () => void;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export interface NonTransactionalAuthRuleFormAccordionHandle {
  validate: () => boolean;
  saveIfValid: () => boolean;
}

function normalizeAppend(base: string, token: string) {
  const trimmed = base.trim();
  if (!trimmed) return token;
  const needsSpaceBefore = !token.startsWith(')') && !trimmed.endsWith('(');
  return `${trimmed}${needsSpaceBefore ? ' ' : ''}${token}`;
}

const NonTransactionalAuthRuleFormAccordion = forwardRef<
  NonTransactionalAuthRuleFormAccordionHandle,
  NonTransactionalAuthRuleFormAccordionProps
>(
  (
    {
      ruleId,
      ruleNumber,
      showDeleteButton = false,
      disableSave = false,
      defaultExpanded = true,
      actionPlacement = 'footer',
      onCancel,
      onSaveSuccess,
      onDeleteSuccess,
    },
    ref,
  ) => {
  const t = useTranslations('nonTransactionalHubData');
  const dispatch = useAppDispatch();
  const rule = useAppSelector((state) =>
    state.createAuthRule.nonTransactionalRules.find((r) => r.id === ruleId),
  );

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClassError, setSelectedClassError] = useState('');
  const [constructError, setConstructError] = useState('');
  const [constructTouched, setConstructTouched] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validateTimerRef = useRef<number | null>(null);

  const constructValue = rule?.authRuleConstruct || '';

  const constructState = useMemo(() => analyzeConstruct(constructValue), [constructValue]);
  const canAddOperator =
    !constructState.hasUnclosedQuote && !constructState.expectingOperand && constructValue.trim() !== '';
  const canOpenParen =
    !constructState.hasUnclosedQuote && constructState.expectingOperand && constructState.depth === 0;
  const canCloseParen =
    !constructState.hasUnclosedQuote && !constructState.expectingOperand && constructState.depth > 0;

  const hasValidationError = useMemo(() => Boolean(constructError), [constructError]);

  const validateConstructNow = useCallback(
    (next: string) => {
      const trimmed = String(next ?? '').trim();
      if (!constructTouched && trimmed.length === 0) {
        setConstructError('');
        return;
      }

      // While the user is typing inside an open quote, don't show syntax errors
      // as long as the typed value still matches a possible class label prefix.
      const unclosed = getUnclosedQuotedClass(String(next ?? ''));
      if (unclosed) {
        if (isAllowedClassPrefixCaseSensitive(unclosed.value)) {
          setConstructError('');
          return;
        }
        setConstructError(t('errorUnknownAuthorisationClass', { value: unclosed.value }));
        return;
      }

      const res = NonTransactionalAuthRuleCreateLogic.validateField('authRuleConstruct', next);
      if (res !== true) {
        setConstructError(res);
        return;
      }

      const mismatch = getClassMismatchError(next, t);
      setConstructError(mismatch);
    },
    [constructTouched, t],
  );

  const scheduleValidateConstruct = useCallback(
    (next: string) => {
      if (validateTimerRef.current) {
        window.clearTimeout(validateTimerRef.current);
      }
      validateTimerRef.current = window.setTimeout(() => {
        validateConstructNow(next);
      }, 150);
    },
    [validateConstructNow],
  );

  useEffect(() => {
    return () => {
      if (validateTimerRef.current) {
        window.clearTimeout(validateTimerRef.current);
      }
    };
  }, []);

  const updateConstruct = useCallback(
    (next: string, options?: { validateNow?: boolean }) => {
      setHistory((prev) => {
        // Avoid pushing duplicate snapshots.
        const last = prev[prev.length - 1];
        if (last === constructValue) return prev;
        return [...prev, constructValue];
      });
      dispatch(updateNonTransactionalRuleConstruct({ id: ruleId, value: next }));
      if (options?.validateNow) {
        validateConstructNow(next);
      } else {
        scheduleValidateConstruct(next);
      }
    },
    [constructValue, dispatch, ruleId, scheduleValidateConstruct, validateConstructNow],
  );

  const handleClearConstruct = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      setHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last === constructValue) return prev;
        return [...prev, constructValue];
      });
      dispatch(updateNonTransactionalRuleConstruct({ id: ruleId, value: '' }));
      setConstructError('');
      setConstructTouched(false);
    },
    [constructValue, dispatch, ruleId],
  );

  const validate = useCallback((): boolean => {
    if (!constructTouched) setConstructTouched(true);
    const res = NonTransactionalAuthRuleCreateLogic.validateField('authRuleConstruct', constructValue);
    if (res !== true) {
      setConstructError(res);
      return false;
    }

    const mismatch = getClassMismatchError(constructValue, t);
    if (mismatch) {
      setConstructError(mismatch);
      return false;
    }

    setConstructError('');
    return true;
  }, [constructTouched, constructValue, t]);

  const saveIfValid = useCallback((): boolean => {
    if (!validate()) return false;
    if (disableSave) return false;
    dispatch(saveNonTransactionalRule({ id: ruleId }));
    setHistory([]);
    setSelectedClass('');
    setSelectedClassError('');
    setConstructError('');
    setConstructTouched(false);
    return true;
  }, [disableSave, dispatch, ruleId, validate]);


  const handleDeleteRule = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteRule = useCallback(() => {
    dispatch(deleteNonTransactionalRule({ id: ruleId }));
    setShowDeleteConfirm(false);
    setHistory([]);
    setSelectedClass('');
    setSelectedClassError('');
    setConstructError('');
    setConstructTouched(false);
    onDeleteSuccess?.();
  }, [dispatch, onDeleteSuccess, ruleId]);

  useImperativeHandle(ref, () => ({ validate, saveIfValid }), [validate, saveIfValid]);

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const previousValue = prev[prev.length - 1] ?? '';
      dispatch(updateNonTransactionalRuleConstruct({ id: ruleId, value: previousValue }));
      scheduleValidateConstruct(previousValue);
      return prev.slice(0, -1);
    });
  }, [dispatch, ruleId, scheduleValidateConstruct]);

  const handleAddSelectedClass = useCallback(() => {
    const classValidation = NonTransactionalAuthRuleCreateLogic.validateField('selectedClass', selectedClass);
    if (classValidation !== true) {
      setSelectedClassError(classValidation);
      return;
    }
    setSelectedClassError('');
    const classLabel = classOptions.find((o) => o.value === selectedClass)?.label || selectedClass;
    updateConstruct(normalizeAppend(constructValue, `"${classLabel}"`));
  }, [constructValue, selectedClass, updateConstruct]);

  const headerActions = useMemo(() => {
    if (actionPlacement !== 'header') return undefined;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onCancel ? (
          <Button
            buttonVariant="tertiary"
            onClick={(e: any) => {
              e.stopPropagation();
              onCancel();
            }}
            startIcon={<Image src={CloseIcon} alt="cancel" width={24} height={24} />}
            style={{
              minWidth: '90px',
              width: 'auto',
              height: '36px',
              minHeight: '36px',
              padding: '0 16px',
            }}
          >
            CANCEL
          </Button>
        ) : null}
        <Button
          buttonVariant="tertiary"
          onClick={(e: any) => {
            e.stopPropagation();
            const ok = saveIfValid();
            if (ok) {
              onSaveSuccess?.();
            }
          }}
          startIcon={<Image src={SaveIcon} alt="save" width={24} height={24} />}
          style={{
            minWidth: '90px',
            width: 'auto',
            height: '36px',
            minHeight: '36px',
            padding: '0 16px',
          }}
          disabled={disableSave}
        >
          SAVE
        </Button>
      </Box>
    );
  }, [actionPlacement, disableSave, onCancel, onSaveSuccess, saveIfValid]);

  return (
    <>
      <AuthorizationRuleAccordion
        title={t('nonTransactionalRuleTitle', { number: ruleNumber })}
        operations={[]}
        defaultExpanded={defaultExpanded}
        showSaveButton={false}
        hasValidationError={hasValidationError}
        headerActions={headerActions}
      >
      <Box
        sx={{
          px: 3,
          pt: 4,
          pb: 3,
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
        <Grid
          container
          columnSpacing={2}
          rowSpacing={0}
          sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto' }}
        >
          <Grid size={{ xs: 12, md: 9 }} className={styles.rowGapAfter}>
            <Box>
              <Box>
                <Box sx={{ position: 'relative' }}>
                  <SBTextField
                    type="text"
                    name="authRuleConstruct"
                    label={(t('labelAuthRuleConstruct') as any) || ('Authorisation rule construct' as any)}
                    placeholder={t('placeholderAuthRuleConstruct')}
                    value={constructValue}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e: any) => {
                      const val = e?.target?.value ?? '';
                      if (!constructTouched) setConstructTouched(true);
                      updateConstruct(val);
                    }}
                    onBlur={() => {
                      if (!constructTouched) setConstructTouched(true);
                      validateConstructNow(constructValue);
                    }}
                    error={Boolean(constructError)}
                    helperText={''}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '48px',
                        backgroundColor: '#FFFFFF',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '14px',
                        paddingRight: '44px',
                        '&::placeholder': {
                          color: '#5C6C80',
                          opacity: 1,
                        },
                      },
                    }}
                  />

                  {Boolean(constructValue) && (
                    <IconButton
                      aria-label="Clear authorisation rule construct"
                      onClick={handleClearConstruct}
                      size="small"
                      sx={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        p: 0.5,
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      }}
                    >
                      <Image src={CloseIcon} alt="clear" width={18} height={18} />
                    </IconButton>
                  )}
                </Box>
              </Box>
              {constructError && (
                <Box
                  className={styles.constructError}
                  sx={{ fontSize: '12px', color: ERROR_RED, lineHeight: '16px' }}
                >
                  {constructError}
                </Box>
              )}
            </Box>
          </Grid>

          <Grid
            size={{ xs: 12, md: 3 }}
            className={styles.rowGapAfter}
            sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
          >
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={UndoIcon} alt="Undo" width={20} height={20} />}
              style={{
                height: '48px',
                minHeight: '48px',
                minWidth: `${UNDO_BUTTON_WIDTH}px`,
                width: 'auto',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${BLUE}`,
                color: BLUE,
                borderRadius: '8px',
                padding: '0 16px',
              }}
              onClick={handleUndo}
              disabled={history.length === 0}
            >
              {t('buttonUndo')}
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }} className={styles.rowGapAfter}>
            <Select
              formOptions={{ sx: { minWidth: '100%' } }}
              options={classOptions}
              selectProps={{
                label: t('labelClasses'),
                labelId: 'non-transactional-classes-label',
                onChange: (e: any) => {
                  setSelectedClass(e.target.value);
                  if (selectedClassError) setSelectedClassError('');
                },
                MenuProps: { sx: { zIndex: 1500 } },
              }}
              name="selectedClass"
              value={selectedClass}
              error={Boolean(selectedClassError)}
              helperText={selectedClassError}
              height="48px"
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 3 }}
            className={styles.rowGapAfter}
            sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
          >
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={AddIcon} alt="Add" width={24} height={24} />}
              style={{
                height: 'auto',
                minHeight: '48px',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textAlign: 'center',
                lineHeight: '16px',
                padding: '8px 12px',
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${BLUE}`,
                color: BLUE,
                borderRadius: '8px',
              }}
              onClick={handleAddSelectedClass}
              disabled={!selectedClass}
            >
              {t('buttonAddSelectedClass')}
            </Button>
          </Grid>

          <Grid size={12} className={styles.rowGapAfter} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {keyboardTokens.map((token) => {
              const isParen = token === '(' || token === ')';
              const isOperator = token === 'THEN' || token === 'AND' || token === 'OR';
              const disabled =
                token === '('
                  ? !canOpenParen
                  : token === ')'
                    ? !canCloseParen
                    : isOperator
                      ? !canAddOperator
                      : false;

              const baseStyle = isParen
                ? {
                    backgroundColor: disabled ? '#E5E7EB' : '#FFFFFF',
                    border: disabled ? '1px solid transparent' : `1px solid ${BLUE}`,
                    color: disabled ? '#9CA3AF' : BLUE,
                  }
                : isOperator
                  ? {
                      backgroundColor: '#E5E7EB',
                      border: '1px solid transparent',
                      color: disabled ? '#9CA3AF' : '#222E37',
                    }
                  : {
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${BLUE}`,
                      color: BLUE,
                    };

              return (
                <Button
                  key={token}
                  buttonVariant="tertiary"
                  style={{
                    height: '40px',
                    minHeight: '40px',
                    padding: '0 22px',
                    borderRadius: '8px',
                    ...(baseStyle as any),
                    minWidth: token.length > 1 ? '86px' : '54px',
                  }}
                  onClick={() => {
                    if (disabled) return;
                    updateConstruct(normalizeAppend(constructValue, token));
                  }}
                  disabled={disabled}
                >
                  {token}
                </Button>
              );
            })}
          </Grid>

          {(actionPlacement === 'footer' || (actionPlacement === 'header' && showDeleteButton)) && (
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
              {showDeleteButton && (
                <Box>
                  <Button
                    buttonVariant="tertiary"
                    startIcon={<Image src={DeleteIcon} alt="Delete" width={20} height={20} />}
                    style={{
                      height: 'auto',
                      minHeight: '48px',
                      width: 'auto',
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${BLUE}`,
                      color: BLUE,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      whiteSpace: 'normal',
                      lineHeight: '16px',
                      textAlign: 'center',
                    }}
                    onClick={handleDeleteRule}
                  >
                    {t('buttonDeleteRule')}
                  </Button>
                </Box>
              )}
              {actionPlacement === 'footer' && (
                <Box>
                  <Button
                    buttonVariant="tertiary"
                    startIcon={<Image src={SaveIcon} alt="Save" width={20} height={20} />}
                    style={{
                      height: 'auto',
                      minHeight: '48px',
                      width: 'auto',
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${BLUE}`,
                      color: BLUE,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      whiteSpace: 'normal',
                      lineHeight: '16px',
                      textAlign: 'center',
                    }}
                    onClick={() => {
                      const ok = saveIfValid();
                      if (ok) {
                        onSaveSuccess?.();
                      }
                    }}
                    disabled={disableSave}
                  >
                    {t('buttonSave')}
                  </Button>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Box>
      </AuthorizationRuleAccordion>

      <SecurityWarningDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onDismiss={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteRule}
        title={t('dialogRuleDeletionTitle')}
        heading={t('dialogRuleDeletionHeading')}
        subheading={t('dialogRuleDeletionSubheading')}
        dismissLabel={t('dialogRuleDeletionDismiss')}
        confirmLabel={t('dialogRuleDeletionConfirm')}
      />
    </>
  );

});


NonTransactionalAuthRuleFormAccordion.displayName = 'NonTransactionalAuthRuleFormAccordion';

export default NonTransactionalAuthRuleFormAccordion;
 