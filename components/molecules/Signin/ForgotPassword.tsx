'use client';

import styles from './ForgotPassword.module.scss';
import { Button, Password } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import ForgotPasswordCard from '@atoms/ForgotPasswordCard/ForgotPasswordCard';
import QRCodeAuth from '@molecules/QRCodeAuth/QRCodeAuth';
import { useRouter, usePathname } from 'next/navigation';
import LabelChip from '@atoms/LabelChip';
import { Box, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { API_ROUTES } from 'lib/utils/apiRoute';
import { post } from 'lib/api/httpClient';
import { startOOBAuth } from 'lib/api/authApi';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { useEffect, useRef, useMemo } from 'react';
import { getSigninUrl } from 'lib/utils/localeUtils';

function ForgotPassword() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('signinHub');
  
  const [formState, setFormState] = useState({
    password: '',
    confirmPassword: '',
    otp: '',
    tokenOtp: '',
  });

  const [qrState, setQrState] = useState({
    showQRCode: false,
    qrCodeData: '',
    sessionId: '',
    qrTimeout: 180 as number,
  });

  const [uiState, setUiState] = useState({
    loading: false,
    error: '',
  });

  const hasCalledOTPRef = useRef(false);

  const reduxSigninForm = useSelector((state: RootState) => state.auth.signinForm);
  const username = reduxSigninForm?.username || '';
  const isTokenUser = reduxSigninForm?.isTokenUser ?? false;

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
      length:
        formState.password.length >= 8 && formState.password.length <= 14 ? ('valid' as const) : ('invalid' as const),
      uppercase: /[A-Z]/.test(formState.password) ? ('valid' as const) : ('invalid' as const),
      lowercase: /[a-z]/.test(formState.password) ? ('valid' as const) : ('invalid' as const),
      number: /[0-9]/.test(formState.password) ? ('valid' as const) : ('invalid' as const),
      noSpaces: !/\s/.test(formState.password) ? ('valid' as const) : ('invalid' as const),
    };
  }, [formState.password]);

  useEffect(() => {
    if (username && !hasCalledOTPRef.current) {
      hasCalledOTPRef.current = true;
      setUiState((prev) => ({ ...prev, loading: true }));
      post(API_ROUTES.OTP_REQUEST(username), {})
        .catch(() => {})
        .finally(() => setUiState((prev) => ({ ...prev, loading: false })));
    }
  }, [username]);

  const handleResendOTP = () => {
    if (!username) return;
    post(API_ROUTES.OTP_REQUEST(username), {}).catch(() => {});
  };

  const handleTimerExpired = () => {
    router.push(getSigninUrl(pathname));
  };

  const handleCancel = () => {
    if (qrState.showQRCode) {
      setQrState((prev) => ({
        ...prev,
        showQRCode: false,
        qrCodeData: '',
        sessionId: '',
      }));
    } else {
      router.push(getSigninUrl(pathname));
    }
  };

  const handleTokenOtpChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setFormState((prev) => ({ ...prev, tokenOtp: sanitized }));
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, error: '' }));

    if (!formState.password || !formState.confirmPassword) {
      setUiState((prev) => ({ ...prev, error: t('confirmPasswordRequired') }));
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setUiState((prev) => ({ ...prev, error: t('passwordsDoNotMatch') }));
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, loading: true }));
      const oobResult = await startOOBAuth(username);

      const qrImage = oobResult.modeResult?.qrCode?.qrImage;
      const sessionHandle = oobResult.oobStatusHandle;
      const timeoutSeconds = oobResult.lifetimeMillis
        ? Math.floor(oobResult.lifetimeMillis / 1000)
        : 180;

      if (!oobResult.success || !qrImage) {
        throw new Error(oobResult.message || t('qrGenerationFailed'));
      }

      setQrState((prev) => ({
        ...prev,
        sessionId: sessionHandle || '',
        qrCodeData: `data:image/png;base64,${qrImage}`,
        qrTimeout: timeoutSeconds,
        showQRCode: true,
      }));
    } catch {
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleQRSuccess = async (digitalKey: string) => {
    try {
      const payload = {
        username,
        otp: formState.otp,
        newPassword: formState.password,
        confirmPassword: formState.confirmPassword,
        jwt: digitalKey,
        ...(isTokenUser ? { token: formState.tokenOtp } : {}),
      };

      await post(API_ROUTES.PASSWORD_RESET, payload);

      sessionStorage.setItem('passwordResetSuccess', 'true');
      setTimeout(() => {
        window.location.href = getSigninUrl(pathname);
      }, 100);
    } catch (err: any) {
      sessionStorage.setItem('passwordResetFailed', 'true');
      setTimeout(() => {
        window.location.href = getSigninUrl(pathname);
      }, 100);
    }
  };

  const handleQRError = (qrError: string) => {
    setQrState((prev) => ({ ...prev, showQRCode: false }));
    setUiState((prev) => ({ ...prev, error: qrError }));
  };
  
  if (qrState.showQRCode) {
    return (
      <div className={styles.container}>
        <QRCodeAuth
          qrCodeData={qrState.qrCodeData}
          sessionId={qrState.sessionId}
          userName={username}
          timeout={qrState.qrTimeout}
          onSuccess={handleQRSuccess}
          onError={handleQRError}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ForgotPasswordCard
        onOTPComplete={(otpValue) => setFormState((prev) => ({ ...prev, otp: otpValue }))}
        onResendOTP={handleResendOTP}
        onTimerExpired={handleTimerExpired}
        otpLength={isTokenUser ? 6 : 5}
        beforeOTPContent={
          isTokenUser ? (
            <div
              className={styles.password}
              style={{ width: '100%', marginBottom: '24px' }}
              data-testid="token-otp-input"
            >
              <Password
                value={formState.tokenOtp}
                onChange={(e) => handleTokenOtpChange((e.target as HTMLInputElement).value)}
                helperText={t('helperTextRequired')}
                label={t('tokenOtpLabel')}
                placeholder={t('tokenOtpPlaceholder')}
                type="password"
                required={false}
                disabled={false}
                error={false}
              />
            </div>
          ) : undefined
        }
      >
        <form
          className={styles.form}
          onSubmit={handlePasswordReset}
          data-testid="forgot-password-form"
          style={{ marginTop: '24px' }}
        >
          <div className={styles.formGroup}>
            <div className={styles.password} data-testid="new-password-input">
              <Password
                value={formState.password}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, password: (e.target as HTMLInputElement).value }));
                  setUiState((prev) => ({ ...prev, error: '' }));
                }}
                helperText={
                  formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password
                    ? t('passwordsMismatch')
                    : t('helperTextRequired')
                }
                label={t('enterNewPasswordLabel')}
                placeholder={t('enterNewPasswordLabel')}
                type="password"
                disabled={false}
                error={(formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) as boolean}
                required={false}
              />
            </div>
            <div className={styles.password} data-testid="confirm-password-input">
              <Password
                value={formState.confirmPassword}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, confirmPassword: (e.target as HTMLInputElement).value }));
                  setUiState((prev) => ({ ...prev, error: '' }));
                }}
                helperText={
                  formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password
                    ? t('passwordsMismatch')
                    : t('helperTextRequired')
                }
                label={t('confirmNewPasswordLabel')}
                placeholder={t('confirmNewPasswordPlaceholder')}
                type="password"
                disabled={false}
                error={(formState.confirmPassword && formState.password && formState.confirmPassword !== formState.password) as boolean}
                required={false}
              />
            </div>
            {uiState.error && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>{uiState.error}</p>}
          </div>

          <Box
            sx={{ flexDirection: 'column', display: 'flex', gap: '8px' }}
            data-testid="forgot-password-requirements"
          >
            <LabelChip
              label={t('passwordLength')}
              status={passwordValidation.length}
            />
            <LabelChip
              label={t('passwordUppercase')}
              status={passwordValidation.uppercase}
            />
            <LabelChip
              label={t('passwordLowercase')}
              status={passwordValidation.lowercase}
            />
            <LabelChip 
              label={t('passwordNumber')}
              status={passwordValidation.number}
            />
            <LabelChip label={t('passwordNoSpaces')} status={passwordValidation.noSpaces} />
            <LabelChip label={t('passwordNotRepeated')} status="neutral" />
          </Box>

          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
            data-testid="forgot-password-button-group"
          >
            <Button
              type="button"
              buttonVariant="tertiary"
              onClick={handleCancel}
              style={{ height: '48px', minHeight: '48px' }}
              data-testid="forgot-password-cancel-button"
              disabled={uiState.loading}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              buttonVariant="primary"
              style={{ height: '48px', minHeight: '48px' }}
              disabled={
                uiState.loading ||
                !formState.otp ||
                !formState.password ||
                !formState.confirmPassword ||
                formState.password !== formState.confirmPassword ||
                (isTokenUser && (!formState.tokenOtp || formState.tokenOtp.length < 6)) ||
                passwordValidation.length !== 'valid' ||
                passwordValidation.uppercase !== 'valid' ||
                passwordValidation.lowercase !== 'valid' ||
                passwordValidation.number !== 'valid' ||
                passwordValidation.noSpaces !== 'valid'
              }
              data-testid="forgot-password-submit-button"
            >
              {uiState.loading ? <CircularProgress size={24} sx={{ color: '#0062E1' }} /> : 'SUBMIT'}
            </Button>
          </Box>
        </form>
      </ForgotPasswordCard>

      <div className={styles.disclaimer}>
        {t('disclaimerText')}
      </div>
    </div>
  );
}

export default ForgotPassword;
