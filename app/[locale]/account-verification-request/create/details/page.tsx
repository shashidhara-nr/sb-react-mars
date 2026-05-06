'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Grid, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText, TextareaAutosize, Dialog, DialogTitle, DialogContent, DialogActions, Box, Snackbar, Alert } from '@mui/material';
import { Breadcrumb, Button, Heading } from 'dist/standard-bank-react';
import styles from '@organisms/AccountVerificationRequest/BillingAccounts.module.scss';
import { buildTestId } from 'src/utils/testIds';
import { CheckCircleIcon } from 'lib/icons';
import Image from 'next/image';
import { updateVerificationRequest } from '@store/slices/createAccountVerificationRequestSlice';
import { RootState } from '@store/index';
import theme from 'components/lib/styles/theme';

import {
  VERIFICATION_REQUEST_FORM_FIELDS,
  COUNTRY_LIST,
} from '@organisms/AccountVerificationRequest/constant';
import {
  getRulesForField,
  VerificationRequestFormValues,
  VERIFICATION_REQUIRED_FIELDS,
} from 'src/utils/verificationCreateLogic';

export default function VerificationRequestDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations('accountVerificationRequest');
  const testIdPrefix = 'verification-request-single';

  const verificationRequest = useSelector(
    (state: RootState) => state.createAccountVerificationRequest.verificationRequest
  );

  const { control, handleSubmit, formState: { errors }, watch, trigger } = useForm<VerificationRequestFormValues>({
    defaultValues: {
      lastName: verificationRequest?.lastName || '',
      idNumber: verificationRequest?.idNumber || '',
      emailAddress: verificationRequest?.emailAddress || '',
      telephoneNumber: verificationRequest?.telephoneNumber || '',
      country: verificationRequest?.country || 'ZA',
      accountNumber: verificationRequest?.accountNumber || '',
      branchSortCode: verificationRequest?.branchSortCode || '',
      bicSwift: verificationRequest?.bicSwift || '',
      description: verificationRequest?.description || '',
    },
  });

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorRetryAction, setErrorRetryAction] = useState<(() => void) | null>(null);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const handleErrorClose = useCallback(() => {
    setErrorDialogOpen(false);
  }, []);

  const handleErrorRetry = useCallback(() => {
    if (errorRetryAction) {
      errorRetryAction();
      handleErrorClose();
    }
  }, [errorRetryAction]);

  const showError = (message: string, retryAction?: () => void) => {
    setErrorMessage(message);
    setErrorRetryAction(() => retryAction || null);
    setErrorDialogOpen(true);
  };

  const onValid = (data: VerificationRequestFormValues) => {
    try {
      dispatch(updateVerificationRequest({ field: 'formData', value: data }));
      setSuccessSnackbarOpen(true);
      setTimeout(() => {
        router.push('/account-verification-request/create/success' as any);
      }, 1500);
    } catch (error) {
      showError('Failed to save verification request. Please try again.');
    }
  };

  const onInvalid = () => {
    // Validation errors are displayed on individual fields
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSaveDrafts = async () => {
    const formData = watch();
    try {
      dispatch(updateVerificationRequest({ field: 'formData', value: formData }));
      dispatch(updateVerificationRequest({ field: 'status', value: 'draft' }));
      showError('Verification request saved to drafts successfully!');
    } catch (error) {
      showError('Failed to save to drafts. Please try again.');
    }
  };

  return (
    <>
      <Grid container spacing={4} padding={2} data-testid={buildTestId(testIdPrefix, 'page')}>
        <Grid size={12}>
          <Breadcrumb
            links={[
              { href: '/', label: t('dashboard') },
              {
                href: '/account-verification-request',
                label: t('accountVerificationRequest'),
              },
              {
                href: '/account-verification-request/create',
                label: t('verificationRequestServiceType'),
              },
              {
                href: '/account-verification-request/create/details',
                label: 'Single immediate response verification request',
              },
            ]}
          />
        </Grid>

        <Grid size={12}>
          <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>
            {t('singleImmediateResponse')}
          </Heading>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            {t('singleImmediateResponseDescription')}
          </p>
        </Grid>

        <Grid size={12}>
          <form
            onSubmit={handleSubmit(onValid, onInvalid)}
            className={styles.container}
            data-testid={buildTestId(testIdPrefix, 'form')}
          >
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#ffffff',
              }}
            >
              <Grid container spacing={3}>
                {VERIFICATION_REQUEST_FORM_FIELDS.map((field) => {
                  const fieldName = field.name as keyof VerificationRequestFormValues;
                  const fieldError = errors[fieldName];
                  const fieldNameStr = String(field.name);

                  // Handle spacer fields
                  if ((field as any).spacer) {
                    return (
                      <Grid key={field.name} size={field.gridSize || 12} />
                    );
                  }

                  const translatedLabel = t(field.label as any);

                  return (
                    <Grid key={field.name} size={field.gridSize || 12}>
                    {field.type === 'select' ? (
                      <Controller
                        name={fieldNameStr as any}
                        control={control}
                        rules={getRulesForField(fieldNameStr)}
                        render={({ field: fieldProps }) => (
                          <FormControl fullWidth error={!!fieldError}>
                            <InputLabel>{translatedLabel}</InputLabel>
                            <Select
                              {...fieldProps}
                              label={translatedLabel}
                              data-testid={buildTestId(testIdPrefix, field.name)}
                            >
                              {field.options?.map((option: any) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {fieldError && (
                              <FormHelperText>
                                {typeof fieldError.message === 'string' ? fieldError.message : ''}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    ) : field.type === 'textarea' ? (
                      <Controller
                        name={fieldNameStr as any}
                        control={control}
                        rules={getRulesForField(fieldNameStr)}
                        render={({ field: fieldProps }) => (
                          <>
                            <TextareaAutosize
                              {...fieldProps}
                              minRows={field.rows || 4}
                              placeholder={field.placeholder}
                              style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: `1px solid ${fieldError ? '#d32f2f' : '#ccc'}`,
                                fontFamily: 'inherit',
                                fontSize: '14px',
                              }}
                              data-testid={buildTestId(testIdPrefix, field.name)}
                            />
                            {fieldError && (
                              <FormHelperText error>
                                {typeof fieldError.message === 'string' ? fieldError.message : ''}
                              </FormHelperText>
                            )}
                          </>
                        )}
                      />
                    ) : (
                      <Controller
                        name={fieldNameStr as any}
                        control={control}
                        rules={getRulesForField(fieldNameStr)}
                        render={({ field: fieldProps }) => (
                          <TextField
                            {...fieldProps}
                            type={field.type}
                            label={translatedLabel}
                            placeholder={field.placeholder}
                            fullWidth
                            error={!!fieldError}
                            helperText={typeof fieldError?.message === 'string' ? fieldError.message : ''}
                            data-testid={buildTestId(testIdPrefix, field.name)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                          />
                        )}
                      />
                    )}
                  </Grid>
                );
              })}
              </Grid>
            </Box>

            <Grid container spacing={2} sx={{ padding: '24px 0 0' }}>
              <Grid size={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleCancel} buttonVariant="tertiary">
                  {t('cancel')}
                </Button>
                <Grid sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={handleSaveDrafts} buttonVariant="secondary">
                    {t('saveToDrafts')}
                  </Button>
                  <Button type="submit" buttonVariant="primary">
                    {t('next')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>

      <Dialog open={errorDialogOpen} onClose={handleErrorClose} maxWidth="sm" fullWidth>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>{errorMessage}</DialogContent>
        <DialogActions>
          {errorRetryAction && (
            <Button buttonVariant="tertiary" onClick={handleErrorClose}>
              Dismiss
            </Button>
          )}
          <Button
            buttonVariant="primary"
            onClick={errorRetryAction ? handleErrorRetry : handleErrorClose}
          >
            {errorRetryAction ? 'Try Again' : 'OK'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          icon={<Image src={CheckCircleIcon} alt="Success" width={20} height={20} />}
          severity="success"
          sx={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            fontWeight: 500,
          }}
        >
          Verification request details saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
