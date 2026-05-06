'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './RegisterToken.module.scss';
import { Button, TextField, Snackbar, Password } from 'dist/standard-bank-react';
import RegisterTokenCard from '@atoms/RegsiterTokenCard/RegsiterTokenCard';
import { CREDENTIAL_STATES } from '@lib/utils/signinUtils';
import { getSigninUrl } from 'lib/utils/localeUtils';

function RegisterToken() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('signinHub');
  
  const [tokenSerialNumber, setTokenSerialNumber] = useState('');
  const [firstOTP, setFirstOTP] = useState('');
  const [secondOTP, setSecondOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    theme: 'info' | 'warning' | 'success';
  }>({ visible: false, message: '', theme: 'info' });
  
  const stateFromUrl = searchParams?.get('state');
  const twoOTPFromUrl = searchParams?.get('twoOTP') === 'true';

  useEffect(() => {
    setTokenSerialNumber('');
    setFirstOTP('');
    setSecondOTP('');
    let displayMessage = t('registerTokenTitle');
    
    if (twoOTPFromUrl && stateFromUrl === CREDENTIAL_STATES.RESYNC) {
      displayMessage = t('waitOneMinute');
    } else if (stateFromUrl === CREDENTIAL_STATES.FIRST_ACCESS) {
      displayMessage = t('registerTokenDescription');
    }
    
    setSnackbar({
      visible: true,
      message: displayMessage,
      theme: 'info',
    });
  }, [stateFromUrl, twoOTPFromUrl, t]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push(getSigninUrl(pathname, { tokenRegistered: 'true' }));
    }, 1000);
  };

  const handleCancel = () => {
    setTokenSerialNumber('');
    setFirstOTP('');
    setSecondOTP('');
    setSnackbar({ visible: false, message: '', theme: 'info' });
    setLoading(false);
    router.push(getSigninUrl(pathname));
  };

  const handleTokenSerialNumberChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setTokenSerialNumber(sanitized);
  };

  const handleFirstOTPChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '');
    setFirstOTP(sanitized);
  };

  const handleSecondOTPChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '');
    setSecondOTP(sanitized);
  };

  return (
    <div className={styles.container}>
      <RegisterTokenCard>
        {snackbar.visible && (
          <div className={`${styles.snackbarWrapper} ${styles.longMessage} ${styles.registrationSnackbar}`} data-testid="register-token-snackbar">
            <Snackbar
              snackBarMessage={snackbar.message}
              snackbarTheme={snackbar.theme as any}
              hideIcon={true}
              buttons={[]}
            />
          </div>
        )}
        <form onSubmit={handleRegister} className={styles.form} data-testid="register-token-form">
          <div className={styles.formGroup}>
            {!twoOTPFromUrl && (
              <div className={styles.textField} data-testid="token-serial-number-input">
                <TextField
                  value={tokenSerialNumber}
                  label={t('enterTokenSerialNumberLabel')}
                  type="text"
                  placeholder={t('enterTokenSerialNumberPlaceholder')}
                  name="tokenserialnumber"
                  onChange={(e: any) => handleTokenSerialNumberChange(e.target.value)}
                />
              </div>
            )}
            {twoOTPFromUrl ? (
              <>
                <div className={styles.password} data-testid="first-otp-input">
                  <Password
                    value={firstOTP}
                    onChange={(e: any) => handleFirstOTPChange(e.target.value)}
                    helperText={t('helperTextRequired')}
                    label={t('otpFirstLabel')}
                    placeholder={t('otpFirstPlaceholder')}
                    type="password"
                    required={false}
                    disabled={false}
                    error={false}
                  />
                </div>
                <div className={styles.password} data-testid="second-otp-input">
                  <Password
                    value={secondOTP}
                    onChange={(e: any) => handleSecondOTPChange(e.target.value)}
                    helperText={t('helperTextRequired')}
                    label={t('otpSecondLabel')}
                    placeholder={t('otpSecondPlaceholder')}
                    type="password"
                    required={false}
                    disabled={false}
                    error={false}
                  />
                </div>
              </>
            ) : (
              <div className={styles.password} data-testid="token-password-input">
                <Password
                  helperText={t('helperTextRequired')}
                  label={t('tokenPasswordLabel')}
                  placeholder={t('tokenPasswordPlaceholder')}
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
              disabled={loading || (twoOTPFromUrl ? (!firstOTP || !secondOTP) : !tokenSerialNumber)}
              data-testid="register-token-button"
            >
              {loading ? t('registeringButton') : t('registerButton')}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              buttonVariant="secondary"
              style={{ width: '100%', height: '48px', minHeight: '48px' }}
              disabled={loading}
              data-testid="cancel-button"
            >
              {t('cancelButton')}
            </Button>
          </div>
        </form>
      </RegisterTokenCard>
      <div className={styles.disclaimer}>
        {t('disclaimerText')}
      </div>
    </div>
  );
}

export default RegisterToken;