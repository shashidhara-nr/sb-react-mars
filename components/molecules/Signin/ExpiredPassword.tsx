'use client';

import styles from './ForgotPassword.module.scss';
import { Button, Password } from 'dist/standard-bank-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useCallback, useMemo } from 'react';
import LabelChip from '@atoms/LabelChip';
import ExpiredPasswordCard from '@atoms/ForgotPasswordCard/ExpiredPasswordCard';
import { Box, CircularProgress } from '@mui/material';
import { RootState, AppDispatch } from 'store';
import { clearExpiredPassword, logout, resetAuth } from 'store/slices/authSlice';
import { updateExpiredPassword } from 'lib/api/passwordApi';
import { getSigninUrl } from 'lib/utils/localeUtils';

function ExpiredPassword() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations('signinHub');
  
  const expiredPasswordPassword = useSelector((state: RootState) => state.auth.expiredPasswordPassword);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordValidation = useMemo(() => {
    if (!newPassword) {
      return {
        length: 'neutral' as const,
        uppercase: 'neutral' as const,
        lowercase: 'neutral' as const,
        number: 'neutral' as const,
        noSpaces: 'neutral' as const,
      };
    }

    return {
      length: newPassword.length >= 8 && newPassword.length <= 14 ? 'valid' as const : 'invalid' as const,
      uppercase: /[A-Z]/.test(newPassword) ? 'valid' as const : 'invalid' as const,
      lowercase: /[a-z]/.test(newPassword) ? 'valid' as const : 'invalid' as const,
      number: /[0-9]/.test(newPassword) ? 'valid' as const : 'invalid' as const,
      noSpaces: !/\s/.test(newPassword) ? 'valid' as const : 'invalid' as const,
    };
  }, [newPassword]);

  const handleCancel = () => {
    dispatch(clearExpiredPassword());
    router.push(getSigninUrl(pathname));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newPassword) {
        return;
      }

      if (!confirmPassword) {
        return;
      }

      if (newPassword !== confirmPassword) {
        return;
      }

      if (!expiredPasswordPassword) {
        router.push(getSigninUrl(pathname));
        return;
      }

      setLoading(true);
      try {
        await updateExpiredPassword({
          oldPassword: expiredPasswordPassword,
          newPassword: newPassword,
        });

        await dispatch(logout());
        
        dispatch(resetAuth());
        
        dispatch(clearExpiredPassword());
        
        setTimeout(() => {
          router.push(getSigninUrl(pathname));
        }, 2000);
      } catch (err: any) {
      } finally {
        setLoading(false);
      }
    },
    [newPassword, confirmPassword, expiredPasswordPassword, router, dispatch, pathname],
  );

  return (
    <div className={styles.container}>
      <ExpiredPasswordCard>
        <h1 className={styles.signIn} data-testid="expired-password-heading">{t('resetPasswordTitle')}</h1>
        <p className={styles.subtitle} data-testid="expired-password-subtitle">
          {t('resetPasswordSubtitle')}
        </p>
        <form className={styles.form} data-testid="expired-password-form" onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div className={styles.password} data-testid="new-password-input">
              <Password
                helperText={
                  confirmPassword && newPassword && confirmPassword !== newPassword
                    ? t('passwordsMismatch')
                    : t('passwordRequired')
                }
                label={t('enterNewPasswordLabel')}
                placeholder={t('enterNewPasswordLabel')}
                type="password"
                required={false}
                disabled={loading}
                error={(confirmPassword && newPassword && confirmPassword !== newPassword) as boolean}
                value={newPassword}
                onChange={(e: any) => setNewPassword(e.target.value)}
              />
            </div>
            <div className={styles.password} data-testid="confirm-password-input">
              <Password
                helperText={
                  confirmPassword && newPassword && confirmPassword !== newPassword
                    ? t('passwordsMismatch')
                    : t('passwordRequired')
                }
                label={t('confirmNewPasswordLabel')}
                placeholder={t('confirmNewPasswordLabel')}
                type="password"
                required={false}
                disabled={loading}
                error={(confirmPassword && newPassword && confirmPassword !== newPassword) as boolean}
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Box sx={{ flexDirection: 'column', display: 'flex', gap: '8px' }}>
            <LabelChip label={t('passwordLength')} status={passwordValidation.length} />
            <LabelChip label={t('passwordUppercase')} status={passwordValidation.uppercase} />
            <LabelChip label={t('passwordLowercase')} status={passwordValidation.lowercase} />
            <LabelChip label={t('passwordNumber')} status={passwordValidation.number} />
            <LabelChip label={t('passwordNoSpaces')} status={passwordValidation.noSpaces} />
            <LabelChip label={t('passwordNotRepeated')} status="neutral" />

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: '24px' }}
              data-testid="forgot-password-button-group"
            >
              <Button
                type="button"
                buttonVariant="tertiary"
                onClick={handleCancel}
                style={{ height: '48px', minHeight: '48px' }}
                disabled={loading}
                data-testid="forgot-password-cancel-button"
              >
                {t('cancelButton')}
              </Button>
              <Button
                type="submit"
                buttonVariant="primary"
                style={{ height: '48px', minHeight: '48px' }}
                disabled={
                  loading ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  passwordValidation.length !== 'valid' ||
                  passwordValidation.uppercase !== 'valid' ||
                  passwordValidation.lowercase !== 'valid' ||
                  passwordValidation.number !== 'valid' ||
                  passwordValidation.noSpaces !== 'valid'
                }
                data-testid="forgot-password-submit-button"
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#0062E1' }} /> : t('submitButton')}
              </Button>
            </Box>
          </Box>
        </form>
      </ExpiredPasswordCard>

      <div className={styles.disclaimer}>
        {t('statutoryDisclosures')}
      </div>
    </div>
  );
}

export default ExpiredPassword;
