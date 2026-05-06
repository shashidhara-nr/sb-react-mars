'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useTranslations } from 'next-intl';
import styles from './Signin.module.scss';
import dynamic from 'next/dynamic';
import { Button, TextField, Snackbar, Password } from 'dist/standard-bank-react';
import { useAuth } from 'lib/hooks/useAuth';
import { resetAuth, updateSigninForm, clearSigninForm, fetchUserList, fetchUserByKey, setSelectedCustomerKey, setExpiredPassword } from 'store/slices/authSlice';
import { validateUserIdField, validatePasswordField, getLoginErrorMessage } from '../../../lib/utils/authValidation';
import { get, post } from 'lib/api/httpClient';
import { API_ROUTES } from 'lib/utils/apiRoute';
import { startOOBAuth, completeQRLogin } from 'lib/api/authApi';
import OTPAuth from '@molecules/OTPAuth';
import { clearSessionCookies } from 'lib/utils/cookieUtils';
import { getSigninUrl, getSigninSubpathUrl } from 'lib/utils/localeUtils';
import {
  SIGNIN_ERROR_KEYS,
  CREDENTIAL_STATES,
  routeUserAfterLogin,
  handlePasswordExpiredError,
} from '@lib/utils/signinUtils';
import { useSubmitDebounce } from 'lib/hooks/useSubmitDebounce';
import {
  CredentialsResponse,
  StartOOBAuthResponse,
  SigninCredentialState,
  LoginResponse,
} from 'types/signin';

const SigninCard = dynamic(() => import('../../atoms/SigninCard/SigninCard'));
const QRCodeAuth = dynamic(() => import('../QRCodeAuth/QRCodeAuth'));
const CircularProgress = dynamic(() => import('@mui/material/CircularProgress'), { ssr: false });

function Signin() {
  const savedSigninForm = useAppSelector((state) => state.auth.signinForm);

  const [formState, setFormState] = useState({
    username: savedSigninForm?.username || '',
    password: savedSigninForm?.password || '',
    otp: '',
  });

  const [authState, setAuthState] = useState({
    loading: false,
    attemptingLogin: false,
    showRetry: false,
  });

  const [credentialState, setCredentialState] = useState<SigninCredentialState & { step: 1 | 2 | 'qr' | 'otp' }>({
    step: 1,
    showOTP: false,
    hasTokenLogin: false,
    passwordResetAllowed: false,
    strongAuth: 0 as 0 | 2,
    vascoState: '',
    deviceRegistered: false,
    hasMultipleCredentials: false,
  });

  const [authData, setAuthData] = useState({
    qrCodeData: '',
    sessionId: '',
    qrTimeout: 180,
    otpLength: 5,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'warning' | 'success' | 'info',
  });

  const debounceCheck = useSubmitDebounce(1000);
  const [submitDebounce, setSubmitDebounce] = useState(false);

  const submitTimeoutRef = useRef<NodeJS.Timeout>();
  const isQRFlowActiveRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loginUser } = useAuth();
  const t = useTranslations('signinHub');
  const tCommon = useTranslations('common');
  const authError = useAppSelector((state) => state.auth.error);
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);
  const isLoading = useAppSelector((state) => state.auth.loading);
  const userList = useAppSelector((state) => state.auth.userList);

  const showSnackbar = useCallback((message: string, severity: 'info' | 'warning' | 'success' | 'error' = 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    if (isQRFlowActiveRef.current) {
      return;
    }

    clearSessionCookies();

    const tokenRegistered = searchParams?.get('tokenRegistered');
    const shouldShowTokenSuccess = tokenRegistered === 'true';
    const passwordResetSuccess = sessionStorage.getItem('passwordResetSuccess') === 'true';
    const passwordResetFailed = sessionStorage.getItem('passwordResetFailed') === 'true';

    dispatch(resetAuth());
    dispatch(clearSigninForm());
    
    // Reset all states using grouped setters
    setFormState({ username: '', password: '', otp: '' });
    setCredentialState((prev) => ({ ...prev, step: 1 }));
    setAuthState({ loading: false, attemptingLogin: false, showRetry: false });

    if (passwordResetSuccess) {
      setSnackbar({
        open: true,
        message: t('passwordResetSuccess'),
        severity: 'success',
      });
      sessionStorage.removeItem('passwordResetSuccess');
      router.replace(getSigninUrl(pathname));
    } else if (passwordResetFailed) {
      setSnackbar({
        open: true,
        message: t('passwordResetFailed'),
        severity: 'warning',
      });
      sessionStorage.removeItem('passwordResetFailed');
      router.replace(getSigninUrl(pathname));
    } else if (shouldShowTokenSuccess) {
      setSnackbar({
        open: true,
        message: t('tokenRegistrationSuccess'),
        severity: 'success',
      });
      router.replace(getSigninUrl(pathname));
    } else {
      setSnackbar({ open: false, message: '', severity: 'error' });
    }

    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, []); // ← FIX: Empty deps - runs only once on mount

  useEffect(() => {
    if (authState.attemptingLogin && loggedIn && !isLoading && !authError && userList && userList.length > 0) {
      routeUserAfterLogin({ users: userList, router, dispatch, showSnackbar, pathname, loginSuccessMessage: t(SIGNIN_ERROR_KEYS.LOGIN_SUCCESS) });
      
      setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
    }
  }, [authState.attemptingLogin, loggedIn, isLoading, authError, userList, router, showSnackbar, dispatch, pathname]);

  useEffect(() => {
    if (authError && authState.attemptingLogin) {
      if (authError === 'PASSWORD_EXPIRED') {
          handlePasswordExpiredError({ username: formState.username, password: formState.password, router, dispatch, pathname });
        setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
      } else {
        const translatedError = authError === 'incorrectCredentials' 
          ? t('incorrectCredentials')
          : authError === 'loginFailed'
          ? t('loginFailed')
          : authError;
        
        setSnackbar({
          open: true,
          message: translatedError,
          severity: 'warning',
        });
        setAuthState((prev) => ({ ...prev, attemptingLogin: false, loading: false, showRetry: true }));
      }
    }
  }, [authError, authState.attemptingLogin, router, dispatch, formState.username, formState.password, pathname, t]);

  useEffect(() => {
    if (loggedIn && !isLoading && authState.attemptingLogin && (!userList || userList.length === 0)) {
      dispatch(fetchUserList())
        .then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            // User routing is handled by the effect above
          } else {
            showSnackbar(t(SIGNIN_ERROR_KEYS.USER_LIST_FETCH_FAILED), 'warning');
            setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
          }
        })
        .catch((err) => {
          showSnackbar(t(SIGNIN_ERROR_KEYS.USER_LIST_ERROR), 'warning');
          setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
        });
    }
  }, [loggedIn, isLoading, authState.attemptingLogin, userList, dispatch, showSnackbar, t]);

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
        const credRes: CredentialsResponse = await get(credUrl);

        if (!credRes || !credRes.credentialStates) {
          showSnackbar(t('credentialsLocked'), 'warning');
          setTimeout(() => {
            setAuthState((prev) => ({ ...prev, loading: false }));
            setSnackbar({ open: false, message: '', severity: 'error' });
            setCredentialState((prev) => ({ ...prev, step: 2 }));
          }, 3000);
          return;
        }

        const passwordCredential = credRes.credentialStates.find(
          (cred) => cred.credentialName === 'PASSWORD',
        );
        const vascoCredential = credRes.credentialStates.find((cred) => cred.credentialName === 'VASCOGO3');
        const hasVascoToken = !!vascoCredential;
        const strongAuth: 0 | 2 = (vascoCredential?.strongAuthState?.strongAuth ?? 0) as 0 | 2;
        const vascoState: string = vascoCredential?.credentialState ?? '';

        const deviceReg: boolean = vascoCredential?.strongAuthState?.deviceRegistered ?? false;
        
        // Update all credential states at once
        setCredentialState((prev) => ({
          ...prev,
          hasTokenLogin: hasVascoToken,
          strongAuth: strongAuth,
          vascoState: vascoState,
          passwordResetAllowed: credRes.passwordResetAllowed ?? false,
          deviceRegistered: deviceReg,
          showOTP: hasVascoToken && vascoState === CREDENTIAL_STATES.ACTIVE && strongAuth === 0 && !deviceReg,
          hasMultipleCredentials: credRes.credentialStates.length > 1,
        }));
        
        dispatch(updateSigninForm({ isTokenUser: hasVascoToken && vascoState === CREDENTIAL_STATES.ACTIVE && strongAuth === 0 && !deviceReg }));

        const isFirstTimePasswordSetup = passwordCredential && (passwordCredential.credentialState === CREDENTIAL_STATES.TO_BE || passwordCredential.credentialState === CREDENTIAL_STATES.FIRST_ACCESS);
        const passwordState = passwordCredential?.credentialState;

        if (!passwordCredential) {
          showSnackbar(t('credentialsLocked'), 'warning');
          
          if (credRes.passwordResetAllowed) {
            setTimeout(() => {
              setAuthState((prev) => ({ ...prev, loading: false }));
              setSnackbar({ open: false, message: '', severity: 'error' });
              setCredentialState((prev) => ({ ...prev, step: 2 }));
            }, 3000);
          } else {
            setAuthState((prev) => ({ ...prev, loading: false }));
          }
          return;
        }

        if (passwordCredential.credentialState !== CREDENTIAL_STATES.ACTIVE && !isFirstTimePasswordSetup) {
          showSnackbar(t('credentialsLocked'), 'warning');
          
          if (credRes.passwordResetAllowed) {
            setTimeout(() => {
              setAuthState((prev) => ({ ...prev, loading: false }));
              setSnackbar({ open: false, message: '', severity: 'error' });
              setCredentialState((prev) => ({ ...prev, step: 2 }));
            }, 3000);
          } else {
            setAuthState((prev) => ({ ...prev, loading: false }));
          }
          return;
        }

        if (isFirstTimePasswordSetup) {
          setAuthState((prev) => ({ ...prev, loading: false }));
          const hasToken = hasVascoToken && vascoState === CREDENTIAL_STATES.TO_BE ? 'true' : 'false';
          router.push(getSigninSubpathUrl(pathname, 'new-registration') + `?username=${trimmedUsername}&state=${passwordState}&hasToken=${hasToken}` as any);
          return;
        }

        if (hasVascoToken && strongAuth === 2 && !deviceReg) {
          setAuthState((prev) => ({ ...prev, loading: false }));
          router.push(getSigninSubpathUrl(pathname, 'setup') as any);
          return;
        }

        setCredentialState((prev) => ({ ...prev, step: 2 }));
      } catch (err: any) {
        showSnackbar(err.message || t('usernameValidationFailed'), 'warning');
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [showSnackbar, formState.username, router, dispatch, pathname],
  );

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const passwordValidation = validatePasswordField(formState.password);
      if (!passwordValidation.valid) {
        showSnackbar(passwordValidation.error ? t(passwordValidation.error) : t('passwordRequired'), 'info');
        return;
      }

      if (credentialState.hasTokenLogin && credentialState.hasMultipleCredentials && (credentialState.vascoState === CREDENTIAL_STATES.TO_BE || credentialState.vascoState === CREDENTIAL_STATES.FIRST_ACCESS) && credentialState.strongAuth === 0) {
        setAuthState((prev) => ({ ...prev, loading: false }));
        router.push(getSigninSubpathUrl(pathname, 'register-token') + `?username=${formState.username}&state=${credentialState.vascoState}` as any);
        return;
      }

      if (credentialState.hasTokenLogin && credentialState.hasMultipleCredentials && credentialState.vascoState === CREDENTIAL_STATES.RESYNC && credentialState.strongAuth === 0) {
        setAuthState((prev) => ({ ...prev, loading: false }));
        router.push(getSigninSubpathUrl(pathname, 'register-token') + `?username=${formState.username}&state=${CREDENTIAL_STATES.RESYNC}&twoOTP=true` as any);
        return;
      }

      if (debounceCheck()) return;

      setAuthState((prev) => ({ ...prev, loading: true, attemptingLogin: true, showRetry: false }));

      try {
        if (credentialState.showOTP) {
          if (!formState.otp.trim()) {
            showSnackbar(t('otpRequired'), 'info');
            setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
            return;
          }

          const response: LoginResponse = await post(
            API_ROUTES.QR_LOGIN(formState.username),
            JSON.stringify({ password: formState.password, token: formState.otp }),
            { headers: { 'Content-Type': 'application/json' } },
          );

          if (!response || !response.digitalKey) {
            throw new Error(t('qrLoginFailed'));
          }

          dispatch({ type: 'auth/restoreFromStorage', payload: { loggedIn: true, digitalKey: response.digitalKey, userList: [] } });
          setAuthState((prev) => ({ ...prev, attemptingLogin: true }));
          setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
        } else if (credentialState.hasTokenLogin && credentialState.vascoState === CREDENTIAL_STATES.BACKUP_TEMP && (credentialState.strongAuth === 2 || credentialState.strongAuth === 0)) {
          dispatch(updateSigninForm({ username: formState.username, password: formState.password }));
          setAuthData((prev) => ({ ...prev, otpLength: credentialState.strongAuth === 0 ? 6 : 5 }));
          await post(API_ROUTES.OTP_REQUEST(formState.username), {});
          setCredentialState((prev) => ({ ...prev, step: 'otp' as any }));
          setAuthState((prev) => ({ ...prev, loading: false, attemptingLogin: false }));
        } else if (credentialState.hasTokenLogin && !(credentialState.hasMultipleCredentials && (credentialState.vascoState === CREDENTIAL_STATES.TO_BE || credentialState.vascoState === CREDENTIAL_STATES.FIRST_ACCESS) && credentialState.strongAuth === 0)) {
          const oobResult = await startOOBAuth(formState.username) as any;

          const qrImage = oobResult.modeResult?.qrCode?.qrImage;
          const sessionHandle = oobResult.oobStatusHandle;
          const timeoutSeconds = oobResult.lifetimeMillis
            ? Math.floor(oobResult.lifetimeMillis / 1000)
            : 180;

          if (!oobResult.success || !qrImage) {
            throw new Error(oobResult.message || t('qrGenerationFailed'));
          }

          setAuthData((prev) => ({
            ...prev,
            sessionId: sessionHandle || '',
            qrCodeData: `data:image/png;base64,${qrImage}`,
            qrTimeout: timeoutSeconds,
          }));
          isQRFlowActiveRef.current = true;
          setCredentialState((prev) => ({ ...prev, step: 'qr' as any }));
          setAuthState((prev) => ({ ...prev, loading: false }));
        } else {
          await loginUser(formState.username, formState.password);
        }
      } catch (err: any) {
        const loginError = getLoginErrorMessage(err);
        
        if (loginError === 'PASSWORD_EXPIRED') {
          handlePasswordExpiredError({ username: formState.username, password: formState.password, router, dispatch, pathname });
          setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
          return;
        }
        
        // Always try to translate known keys
        const errorMessage = loginError === 'incorrectCredentials' 
          ? t('incorrectCredentials')
          : loginError === 'loginFailed'
          ? t('loginFailed')
          : loginError;
        
        showSnackbar(errorMessage, 'warning');
        setAuthState((prev) => ({ ...prev, attemptingLogin: false, showRetry: true }));
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [formState, submitDebounce, credentialState.hasTokenLogin, credentialState.strongAuth, credentialState.vascoState, credentialState.hasMultipleCredentials, credentialState.showOTP, loginUser, showSnackbar, dispatch, router, pathname, setSubmitDebounce, t],
  );

  const handleCancel = useCallback(() => {
    setCredentialState({
      step: 1,
      showOTP: false,
      hasTokenLogin: false,
      passwordResetAllowed: false,
      strongAuth: 0 as 0 | 2,
      vascoState: '',
      deviceRegistered: false,
      hasMultipleCredentials: false,
    });
    setFormState({ username: formState.username, password: '', otp: '' });
    setAuthState({ loading: false, attemptingLogin: false, showRetry: false });
    setSnackbar({ open: false, message: '', severity: 'error' });
  }, [formState.username]);

  const handleRetry = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthState((prev) => ({ ...prev, showRetry: false }));
      setSnackbar({ open: false, message: '', severity: 'error' });
      await handleSignIn(e);
    },
    [handleSignIn],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setFormState((prev) => ({ ...prev, username: value }));
      dispatch(updateSigninForm({ username: value }));
      if (snackbar.open) {
        setSnackbar({ open: false, message: '', severity: 'error' });
      }
    },
    [dispatch, snackbar.open],
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setFormState((prev) => ({ ...prev, password: value }));
      dispatch(updateSigninForm({ password: value }));
      setAuthState((prev) => ({ ...prev, attemptingLogin: false }));
      if (snackbar.open) {
        setSnackbar({ open: false, message: '', severity: 'error' });
      }
      dispatch({ type: 'auth/clearError' });
    },
    [dispatch, snackbar.open],
  );

  const handleOTPChange = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, otp: value }));
  }, []);

  const handleQRSuccess = useCallback(
    async (digitalKey: string, userList?: any[], approvedUsername?: string) => {
      isQRFlowActiveRef.current = false;

      try {
        const loginUsername = approvedUsername || formState.username;

        const completeResult = await completeQRLogin(loginUsername, digitalKey, formState.password);

        if (!completeResult.success) {
          if (completeResult.message === 'PASSWORD_EXPIRED') {
            handlePasswordExpiredError({ username: formState.username, password: formState.password, router, dispatch, pathname });
            return;
          }
          throw new Error(completeResult.message || t('qrLoginFailed'));
        }

        dispatch({ type: 'auth/restoreFromStorage', payload: { loggedIn: true, digitalKey, userList: [] } });
        setAuthState((prev) => ({ ...prev, attemptingLogin: true }));
      } catch (err: any) {
        showSnackbar(err.message || t('qrLoginFailed'), 'warning');
        setCredentialState((prev) => ({ ...prev, step: 1 }));
        setFormState((prev) => ({ ...prev, password: '', otp: '' }));
        setAuthData((prev) => ({ ...prev, qrCodeData: '', sessionId: '' }));
      }
    },
    [dispatch, router, showSnackbar, formState.username, formState.password, pathname],
  );

  const handleQRError = useCallback(
    (error: string) => {
      isQRFlowActiveRef.current = false;
      showSnackbar(error, 'warning');
      setCredentialState((prev) => ({ ...prev, step: 1 }));
      setFormState((prev) => ({ ...prev, password: '', otp: '' }));
      setAuthData((prev) => ({ ...prev, qrCodeData: '', sessionId: '' }));
    },
    [showSnackbar],
  );

  const handleQRCancel = useCallback(() => {
    isQRFlowActiveRef.current = false;
    setCredentialState((prev) => ({ ...prev, step: 1 }));
    setFormState((prev) => ({ ...prev, password: '', otp: '' }));
    setAuthData((prev) => ({ ...prev, qrCodeData: '', sessionId: '' }));
    showSnackbar(t(SIGNIN_ERROR_KEYS.LOGIN_CANCELLED), 'info');
  }, [showSnackbar, t]);

  const handleOTPComplete = useCallback(
    async (otp: string) => {
      try {
        setAuthState((prev) => ({ ...prev, loading: true }));

        const finalUsername = savedSigninForm?.username || formState.username;
        const finalPassword = savedSigninForm?.password || formState.password;

        const response: LoginResponse = await post(
          API_ROUTES.QR_LOGIN(finalUsername),
          JSON.stringify({ password: finalPassword, otp }),
          { headers: { 'Content-Type': 'application/json' } },
        );

        if (!response || !response.digitalKey) {
          throw new Error(t('otpLoginFailed'));
        }

        dispatch({ type: 'auth/restoreFromStorage', payload: { loggedIn: true, digitalKey: response.digitalKey, userList: [] } });
        setAuthState((prev) => ({ ...prev, attemptingLogin: true }));
      } catch (err: any) {
        const errorCodeHeader = err.response?.headers?.['nbol.login.error.code'];
        if (errorCodeHeader === 'login.error.PasswordExpired;') {
          handlePasswordExpiredError({ username: formState.username, password: formState.password, router, dispatch, pathname });
        } else {
          showSnackbar(err.message || t(SIGNIN_ERROR_KEYS.OTP_LOGIN_FAILED), 'warning');
        }
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [savedSigninForm, formState.username, formState.password, dispatch, router, showSnackbar, pathname],
  );

  const handleResendOTP = useCallback(async () => {
    try {
      const finalUsername = savedSigninForm?.username || formState.username;
      await post(API_ROUTES.OTP_REQUEST(finalUsername), {});
      showSnackbar(t(SIGNIN_ERROR_KEYS.OTP_RESEND_SUCCESS), 'success');
    } catch (err: any) {
      showSnackbar(err.message || t(SIGNIN_ERROR_KEYS.OTP_RESEND_FAILED), 'warning');
    }
  }, [savedSigninForm, formState.username, showSnackbar, t]);

  return (
    <div className={styles.container}>
      {credentialState.step === 'qr' ? (
          <QRCodeAuth
            data-testid="qrcode-auth-component"
            qrCodeData={authData.qrCodeData}
            sessionId={authData.sessionId}
            userName={formState.username}
            timeout={authData.qrTimeout}
            onSuccess={handleQRSuccess}
            onError={handleQRError}
            onCancel={handleQRCancel}
          />
      ) : (
        <>
          <SigninCard>
            {snackbar.open && (
              <div
                className={`${styles.snackbarWrapper} ${snackbar.message.length > 50 ? styles.longMessage : ''}`}
                data-testid="snackbar-container"
              >
                <Snackbar
                  snackBarMessage={snackbar.message}
                  snackbarTheme={snackbar.severity === 'error' ? 'warning' : (snackbar.severity as any)}
                  hideIcon={true}
                  buttons={[]}
                />
              </div>
            )}
            {credentialState.step === 1 ? (
              <form onSubmit={handleContinue} className={styles.form} data-testid="signin-step1-form">
                <div className={styles.formGroup}>
                  <div className={styles.textField} data-testid="username-input">
                    <TextField
                      defaultValue=""
                      label={t('usernameLabel')}
                      type="text"
                      placeholder={t('usernamePlaceholder')}
                      name="username"
                      onChange={(e) => handleInputChange((e.target as HTMLInputElement).value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  buttonVariant="primary"
                  style={{ width: '100%', height: '48px', minHeight: '48px' }}
                  data-testid="continue-button"
                >
                  {t('continueButton')}
                </Button>
              </form>
            ) : credentialState.step === 'otp' ? (
              <OTPAuth
                username={formState.username}
                setUsername={(username) => setFormState((prev) => ({ ...prev, username }))}
                onOTPComplete={handleOTPComplete}
                onResendOTP={handleResendOTP}
                onCancel={handleCancel}
                otpLength={authData.otpLength}
              />
            ) : (
              <form onSubmit={authState.showRetry ? handleRetry : handleSignIn} className={styles.form} data-testid="signin-step2-form">
                <div className={styles.formGroup}>
                  <div className={styles.textField} data-testid="username-input-step2">
                    <TextField
                      type="text"
                      value={formState.username}
                      placeholder={t('usernamePlaceholder')}
                      onChange={(e) => handleInputChange((e.target as HTMLInputElement).value)}
                      disabled={true}
                      label={t('usernameLabel')}
                      name="username"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.password} data-testid="password-input">
                    <Password
                      value={formState.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      helperText={t('helperTextRequired')}
                      label={t('passwordLabel')}
                      placeholder={t('passwordPlaceholder')}
                      type="password"
                      required={false}
                      disabled={false}
                      error={false}
                    />
                  </div>
                  {credentialState.hasTokenLogin && credentialState.passwordResetAllowed && (
                    <a href="/signin/forgot-password" className={styles.forgotPassword} data-testid="forgot-password-link">
                      {t('forgotPasswordLink')}
                    </a>
                  )}
                  {credentialState.showOTP && (
                    <div className={styles.password} style={{ marginTop: '24px' }} data-testid="token-otp-input">
                      <Password
                        value={formState.otp}
                        onChange={(e) => handleOTPChange(e.target.value)}
                        helperText={t('helperTextRequired')}
                        label={t('otpLabel')}
                        placeholder={t('otpPlaceholder')}
                        type="password"
                        required={false}
                        disabled={false}
                        error={false}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.buttonGroup}>
                  <Button
                    type="submit"
                    buttonVariant="primary"
                    style={{ width: '100%', height: '48px', minHeight: '48px' }}
                    disabled={authState.loading || (authState.attemptingLogin && !authState.showRetry) || (!!authError && !authState.showRetry) || submitDebounce}
                    data-testid="signin-button"
                  >
                    {isLoading ? (
                      <span
                        data-testid="signin-loading-spinner"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                        SIGNING IN...
                      </span>
                    ) : (
                      t('signInButton')
                    )}
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
                </div>

                <a href="/signin/register-token" className={styles.registerToken} data-testid="register-token-link">
                  {t('registerForTokenLoginButton')}
                </a>
              </form>
            )}
          </SigninCard>
          <div className={styles.disclaimer}>
              {t('disclaimerText')}
          </div>
        </>
      )}
    </div>
  );
}

export default Signin;
