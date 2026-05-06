'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useTranslations } from 'next-intl';
import styles from './Signin.module.scss';
import dynamic from 'next/dynamic';
import { Button, TextField, Password, Snackbar } from 'dist/standard-bank-react';
import { useAuth } from 'lib/hooks/useAuth';
import { resetAuth } from 'store/slices/authSlice';
import { validateUserIdField } from '../../../lib/utils/authValidation';
import { get } from 'lib/api/httpClient';
import { API_ROUTES } from 'lib/utils/apiRoute';
import { startOOBAuth } from 'lib/api/authApi';
import { Box, CircularProgress } from '@mui/material';
import LabelChip from '@atoms/LabelChip';
import { getSigninUrl } from 'lib/utils/localeUtils';

const SigninCard = dynamic(() => import('../../atoms/SigninCard/SigninCard'));

function NewRegistration() {
  const newRegistrationForm = useAppSelector((state) => state.auth.newRegistrationForm);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loginUser } = useAuth();
  const t = useTranslations('signinHub');
  const authError = useAppSelector((state) => state.auth.error);
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);
  const isLoading = useAppSelector((state) => state.auth.loading);

  const submitTimeoutRef = useRef<NodeJS.Timeout>();
  const [formState, setFormState] = useState({
    step: 2 as 1 | 2 | 'qr',
    innerStep: 1,
    username: newRegistrationForm?.username || '',
    password: newRegistrationForm?.password || '',
    confirmPassword: newRegistrationForm?.confirmPassword || '',
    tokenPassword: '',
    firstOTP: '',
  });

  const [authState, setAuthState] = useState({
    loading: false,
    attemptingLogin: false,
    showRetry: false,
    submitDebounce: false,
  });

  const [credentialState, setCredentialState] = useState({
    hasTokenLogin: false,
    isPasswordAndTokenSetup: false,
    isFirstTimePasswordSetup: false,
  });

  const [uiState, setUiState] = useState<{
    snackbar: {
      visible: boolean;
      message: string;
      theme: 'info' | 'warning' | 'success';
    };
  }>({
    snackbar: {
      visible: true,
      message: '',
      theme: 'info',
    },
  });

  const userCreationMessage = t('firstLoginMessage');
  const passwordSetupMessage = t('passwordSetupMessage');
  const tokenLoginMessage = t('tokenLoginMessage');

  const passwordValidation = useMemo(() => {
    if (!formState.password) {
      return {
        length: 'neutral' as const,
        uppercase: 'neutral' as const,
        lowercase: 'neutral' as const,
        number: 'neutral' as const,
        noSpaces: 'neutral' as const,
      };
    }

    return {
      length: formState.password.length >= 8 && formState.password.length <= 14 ? 'valid' as const : 'invalid' as const,
      uppercase: /[A-Z]/.test(formState.password) ? 'valid' as const : 'invalid' as const,
      lowercase: /[a-z]/.test(formState.password) ? 'valid' as const : 'invalid' as const,
      number: /[0-9]/.test(formState.password) ? 'valid' as const : 'invalid' as const,
      noSpaces: !/\s/.test(formState.password) ? 'valid' as const : 'invalid' as const,
    };
  }, [formState.password]);

  const showSnackbar = useCallback((message: string, theme: 'info' | 'warning' | 'success') => {
    setUiState((prev) => ({
      snackbar: { visible: true, message, theme },
    }));
  }, []);

  useEffect(() => {
    const tokenRegistered = searchParams?.get('tokenRegistered');
    const shouldShowTokenSuccess = tokenRegistered === 'true';
    const usernameFromUrl = searchParams?.get('username');
    const stateFromUrl = searchParams?.get('state');
    const hasTokenFromUrl = searchParams?.get('hasToken') === 'true';

    dispatch(resetAuth());
    const isPasswordAndToken = !!usernameFromUrl && hasTokenFromUrl;
    
    setFormState({
      step: 1,
      innerStep: 1,
      username: usernameFromUrl || '',
      password: '',
      tokenPassword: '',
      firstOTP: '',
      confirmPassword: newRegistrationForm?.confirmPassword || '',
    });
    
    setCredentialState({
      hasTokenLogin: false,
      isPasswordAndTokenSetup: isPasswordAndToken,
      isFirstTimePasswordSetup: !!usernameFromUrl,
    });
    
    setAuthState({
      loading: false,
      attemptingLogin: false,
      showRetry: false,
      submitDebounce: false,
    });

    const displayMessage = isPasswordAndToken 
      ? userCreationMessage 
      : (stateFromUrl === 'F' ? passwordSetupMessage : userCreationMessage);

    if (shouldShowTokenSuccess) {
      setUiState({
        snackbar: {
          visible: true,
          message: t('tokenRegistrationSuccess'),
          theme: 'success',
        },
      });
      router.replace(getSigninUrl(pathname));
    } else if (usernameFromUrl) {
      setUiState({
        snackbar: {
          visible: true,
          message: displayMessage,
          theme: 'info',
        },
      });
    }

    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, [dispatch, router, searchParams, pathname, userCreationMessage, passwordSetupMessage, newRegistrationForm?.confirmPassword]);

  useEffect(() => {
    if (authState.attemptingLogin && loggedIn && !isLoading && !authError) {
      showSnackbar(t('loginSuccess'), 'success');
      router.push('/setup-and-admin/beneficiary' as any);
      setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
    }
  }, [authState.attemptingLogin, loggedIn, isLoading, authError, router, showSnackbar]);

  useEffect(() => {
    if (authError && authState.attemptingLogin) {
      setUiState((prev) => ({
        snackbar: {
          visible: true,
          message: authError,
          theme: 'warning',
        },
      }));
      setAuthState((prev) => ({ ...prev, attemptingLogin: false, loading: false, showRetry: true }));
    }
  }, [authError, authState.attemptingLogin]);

  const handleContinue = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedUsername = formState.username.trim();

      const validation = validateUserIdField(trimmedUsername);
      if (!validation.valid) {
        showSnackbar(validation.error ? t(validation.error) : t('usernameRequired'), 'info');
        return;
      }

      setAuthState((prev) => ({ ...prev, loading: true }));
      try {
        const credUrl = API_ROUTES.CREDENTIALS(trimmedUsername);

        const credRes: any = await get(credUrl);

        if (!credRes || !credRes.credentialStates) {
          showSnackbar(t('credentialsLocked'), 'warning');
          setAuthState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const passwordCredential = credRes.credentialStates.find(
          (cred: any) => cred.credentialName === 'PASSWORD',
        );

        if (!passwordCredential || passwordCredential.credentialState !== 'A') {
          showSnackbar(t('credentialsLocked'), 'warning');
          setAuthState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const hasVascoToken =
          credRes.credentialStates?.some((cred: any) => cred.credentialName === 'VASCOGO3') ||
          false;

        const isFirstTimePassword =
          credRes.credentialStates.length === 1 &&
          passwordCredential &&
          passwordCredential.credentialState === 'T';

        setCredentialState((prev) => ({
          ...prev,
          isFirstTimePasswordSetup: isFirstTimePassword,
          hasTokenLogin: hasVascoToken,
        }));

        setFormState((prev) => ({ ...prev, step: 2 }));
      } catch (err: any) {
        showSnackbar(err.message || t('usernameValidationFailed'), 'warning');
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [showSnackbar, formState.username],
  );

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (credentialState.isPasswordAndTokenSetup && formState.innerStep === 1) {
        setFormState((prev) => ({ ...prev, innerStep: 2 }));
        setUiState((prev) => ({
          snackbar: {
            visible: true,
            message: tokenLoginMessage,
            theme: 'info',
          },
        }));
        return;
      }

      if (authState.submitDebounce) return;
      setAuthState((prev) => ({ ...prev, submitDebounce: true }));
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = setTimeout(() => setAuthState((prev) => ({ ...prev, submitDebounce: false })), 1000);

      setAuthState((prev) => ({ ...prev, loading: true, attemptingLogin: true, showRetry: false }));

      try {
        if (credentialState.hasTokenLogin && !credentialState.isFirstTimePasswordSetup) {
          const oobResult = await startOOBAuth(formState.username);

          if (!oobResult.success || !oobResult.modeResult?.qrCode?.qrImage) {
            throw new Error(oobResult.message || t('qrGenerationFailed'));
          }

          setFormState((prev) => ({ ...prev, step: 'qr' }));
          setAuthState((prev) => ({ ...prev, loading: false, attemptingLogin: false }));
        } else {
          await loginUser(formState.username, formState.password);
        }
      } catch (err: any) {
        showSnackbar(err.message || t('loginFailed'), 'warning');
        setAuthState((prev) => ({ ...prev, attemptingLogin: false, showRetry: true }));
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [formState.password, formState.username, authState.submitDebounce, credentialState.hasTokenLogin, credentialState.isFirstTimePasswordSetup, credentialState.isPasswordAndTokenSetup, formState.innerStep, loginUser, showSnackbar, tokenLoginMessage],
  );

  const handleCancel = useCallback(() => {
    setFormState({
      step: 1,
      innerStep: 1,
      username: formState.username,
      password: '',
      confirmPassword: '',
      tokenPassword: '',
      firstOTP: '',
    });
    setCredentialState({
      hasTokenLogin: false,
      isPasswordAndTokenSetup: false,
      isFirstTimePasswordSetup: false,
    });
    setAuthState({
      loading: false,
      attemptingLogin: false,
      showRetry: false,
      submitDebounce: false,
    });
    router.push(getSigninUrl(pathname));
  }, [router, pathname, formState.username]);

  const handleRetry = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthState((prev) => ({ ...prev, showRetry: false }));
      await handleSignIn(e);
    },
    [handleSignIn],
  );

  const handleFirstOTPChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, '');
    setFormState((prev) => ({ ...prev, firstOTP: sanitized }));
  }, []);

  const handleSecondOTPChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, '');
    setFormState((prev) => ({ ...prev, firstOTP: sanitized }));
  }, []);

  const handleTokenSerialNumberChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setFormState((prev) => ({ ...prev, tokenPassword: sanitized }));
  }, []);

  const handlePasswordChange = useCallback(
    (value: string) => {
      setFormState((prev) => ({ ...prev, password: value }));
      setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
      dispatch({ type: 'auth/clearError' });
    },
    [dispatch],
  );

  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setFormState((prev) => ({ ...prev, confirmPassword: value }));
      setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
      dispatch({ type: 'auth/clearError' });
    },
    [dispatch],
  );

  return (
    <div className={styles.container} data-testid="new-registration-page">
      {
        <>
          <SigninCard isNewRegistration>
            {
              <form
                onSubmit={authState.showRetry ? handleRetry : handleSignIn}
                className={styles.form}
                data-testid="newregistration-form"
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {uiState.snackbar.visible && (
                    <div className={`${styles.snackbarWrapper} ${styles.longMessage} ${styles.registrationSnackbar}`} data-testid="snackbar-static">
                      <Snackbar
                        snackBarMessage={uiState.snackbar.message}
                        snackbarTheme={uiState.snackbar.theme as any}
                        hideIcon={true}
                        buttons={[]}
                      />
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <div className={styles.registrationUsername} data-testid="username-input-step2">
                      <TextField
                        type="text"
                        value={formState.username}
                        placeholder={t('usernamePlaceholder')}
                        onChange={(e) => setFormState((prev) => ({ ...prev, username: (e.target as HTMLInputElement).value }))}
                        disabled={credentialState.isFirstTimePasswordSetup}
                        label={t('usernameLabel')}
                        name="username"
                      />
                    </div>
                  </div>

                  {credentialState.isPasswordAndTokenSetup ? (
                    formState.innerStep === 1 ? (
                      <>
                        <div className={styles.formGroup}>
                          <div className={styles.password} data-testid="password-input">
                            <Password
                              value={formState.password}
                              onChange={(e) => handlePasswordChange(e.target.value)}
                              helperText={
                                formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password
                                  ? t('passwordsMismatch')
                                  : t('helperTextRequired')
                              }
                              label={t('enterNewPasswordLabel')}
                              placeholder={t('enterNewPasswordPlaceholder')}
                              type="password"
                              required={false}
                              disabled={authState.loading}
                              error={(formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) as boolean}
                            />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <div className={styles.password} data-testid="confirm-password-input">
                            <Password
                              value={formState.confirmPassword}
                              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                              helperText={
                                formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password
                                  ? t('passwordsMismatch')
                                  : t('helperTextRequired')
                              }
                              label={t('retypeNewPasswordLabel')}
                              placeholder={t('retypeNewPasswordPlaceholder')}
                              type="password"
                              required={false}
                              disabled={authState.loading}
                              error={(formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) as boolean}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.registrationPassword} data-testid="token-serial-number-input">
                          <Password
                            value={formState.tokenPassword}
                            onChange={(e) => handleTokenSerialNumberChange(e.target.value)}
                            helperText={t('helperTextRequired')}
                            label={t('tokenSerialNumberLabel')}
                            placeholder={t('tokenSerialNumberPlaceholder')}
                            type="password"
                            required={false}
                            disabled={false}
                            error={false}
                          />
                        </div>
                        <div className={styles.password} data-testid="first-otp-input">
                          <Password
                            value={formState.firstOTP}
                            onChange={(e) => handleFirstOTPChange(e.target.value)}
                            helperText={t('helperTextRequired')}
                            label={t('otpLabel')}
                            placeholder={t('otpPlaceholder')}
                            type="password"
                            required={false}
                            disabled={false}
                            error={false}
                          />
                        </div>

                      </>
                    )
                  ) : credentialState.hasTokenLogin ? (
                    <>
                      <div className={styles.registrationPassword} data-testid="token-serial-number-input">
                        <Password
                          value={formState.tokenPassword}
                          onChange={(e) => handleTokenSerialNumberChange(e.target.value)}
                          helperText={t('helperTextRequired')}
                          label={t('tokenSerialNumberLabel')}
                          placeholder={t('tokenSerialNumberPlaceholder')}
                          type="password"
                          required={false}
                          disabled={false}
                          error={false}
                        />
                      </div>
                      <div className={styles.password} data-testid="first-otp-input">
                        <Password
                          value={formState.firstOTP}
                          onChange={(e) => handleFirstOTPChange(e.target.value)}
                          helperText={t('helperTextRequired')}
                          label={t('otpLabel')}
                          placeholder={t('otpPlaceholder')}
                          type="password"
                          required={false}
                          disabled={false}
                          error={false}
                        />
                      </div>

                    </>
                  ) : (
                    <>
                      <div className={styles.formGroup}>
                        <div className={styles.password} data-testid="password-input">
                          <Password
                            value={formState.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            helperText={
                              formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password
                                ? t('passwordsMismatch')
                                : t('helperTextRequired')
                            }
                            label={t('enterNewPasswordLabel')}
                            placeholder={t('enterNewPasswordPlaceholder')}
                            type="password"
                            required={false}
                            disabled={authState.loading}
                            error={(formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) as boolean}
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <div className={styles.password} data-testid="confirm-password-input">
                          <Password
                            value={formState.confirmPassword}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            helperText={
                              formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password
                                ? t('passwordsMismatch')
                                : t('helperTextRequired')
                            }
                            label={t('retypeNewPasswordLabel')}
                            placeholder={t('retypeNewPasswordPlaceholder')}
                            type="password"
                            required={false}
                            disabled={authState.loading}
                            error={(formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) as boolean}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!credentialState.hasTokenLogin && credentialState.isPasswordAndTokenSetup && formState.innerStep === 1 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '9px', mt: '8px' }} data-testid="newregistration-password-requirements">
                        <LabelChip label={t('passwordLength')} status={passwordValidation.length} />
                        <LabelChip label={t('passwordUppercase')} status={passwordValidation.uppercase} />
                        <LabelChip label={t('passwordLowercase')} status={passwordValidation.lowercase} />
                        <LabelChip label={t('passwordNumber')} status={passwordValidation.number} />
                        <LabelChip label={t('passwordNoSpaces')} status={passwordValidation.noSpaces} />
                        <LabelChip label={t('passwordNotRepeated')} status="neutral" />
                      </Box>
                    )}
                    {!credentialState.hasTokenLogin && !credentialState.isPasswordAndTokenSetup && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '9px', mt: '8px' }} data-testid="newregistration-password-requirements">
                        <LabelChip label={t('passwordLength')} status={passwordValidation.length} />
                        <LabelChip label={t('passwordUppercase')} status={passwordValidation.uppercase} />
                        <LabelChip label={t('passwordLowercase')} status={passwordValidation.lowercase} />
                        <LabelChip label={t('passwordNumber')} status={passwordValidation.number} />
                        <LabelChip label={t('passwordNoSpaces')} status={passwordValidation.noSpaces} />
                        <LabelChip label={t('passwordNotRepeated')} status="neutral" />
                      </Box>
                    )}
                    <Button
                      type="submit"
                      buttonVariant="primary"
                      style={{ width: '100%', height: '48px', minHeight: '48px' }}
                      disabled={
                        authState.loading ||
                        (!!authError && !authState.showRetry) ||
                        authState.submitDebounce ||
                        (credentialState.isPasswordAndTokenSetup ? (
                          formState.innerStep === 1 ? (
                            !formState.password ||
                            !formState.confirmPassword ||
                            (formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) ||
                            passwordValidation.length !== 'valid' ||
                            passwordValidation.uppercase !== 'valid' ||
                            passwordValidation.lowercase !== 'valid' ||
                            passwordValidation.number !== 'valid' ||
                            passwordValidation.noSpaces !== 'valid'
                          ) : (
                            !formState.tokenPassword ||
                            formState.tokenPassword.length !== 6 ||
                            !formState.firstOTP
                          )
                        ) : (credentialState.hasTokenLogin ? (
                          !formState.username ||
                          formState.tokenPassword.length !== 6 ||
                          !formState.firstOTP
                        ) : (
                          !formState.password ||
                          !formState.confirmPassword ||
                          (formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) ||
                          passwordValidation.length !== 'valid' ||
                          passwordValidation.uppercase !== 'valid' ||
                          passwordValidation.lowercase !== 'valid' ||
                          passwordValidation.number !== 'valid' ||
                          passwordValidation.noSpaces !== 'valid'
                        )))
                      }
                      data-testid="signin-button"
                    >
                      {authState.loading ? <CircularProgress size={24} sx={{ color: '#0062E1' }} /> : (credentialState.isPasswordAndTokenSetup ? (formState.innerStep === 1 ? t('nextButton') : t('submitButton')) : (credentialState.hasTokenLogin || credentialState.isFirstTimePasswordSetup ? t('submitButton') : t('nextButton')))}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      buttonVariant="secondary"
                      style={{ width: '100%', height: '48px', minHeight: '48px' }}
                      disabled={false}
                      data-testid="cancel-button"
                    >
                      {t('cancelButton')}
                    </Button>
                  </Box>
                </Box>
              </form>
            }
          </SigninCard>
          <div className={styles.disclaimer}>
            {t('disclaimerText')}
          </div>
        </>
      }
    </div>
  );
}

export default NewRegistration;
