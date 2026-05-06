/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ForgotPasswordCard.module.scss';
import OTPInput from './OtpInput';

interface ForgotPasswordCardProps {
  children?: React.ReactNode;
  onOTPComplete?: (otp: string) => void;
  onResendOTP?: () => void;
  onTimerExpired?: () => void;
  otpLength?: number;
  beforeOTPContent?: React.ReactNode;
}

function ForgotPasswordCard({ children, onOTPComplete, onResendOTP, onTimerExpired, otpLength, beforeOTPContent }: ForgotPasswordCardProps) {
  const t = useTranslations('signinHub');
  const [remainingTime, setRemainingTime] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (remainingTime <= 0) {
      if (onTimerExpired) {
        onTimerExpired();
      }
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, onTimerExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <img src="/icons/standard_bank_logo.png" alt="StandardBank Logo" className={styles.logo} data-testid="forgot-password-card-logo" />
      <div className={styles.card} data-testid="forgot-password-card-container">
        <h1 className={styles.signIn} data-testid="forgot-password-card-heading">{t('forgotPasswordTitle')}</h1>
        <p className={styles.subtitle} data-testid="forgot-password-card-subtitle">
          {t('otpSentCardMessage')}
        </p>
        <p className={styles.subtitle_new} data-testid="forgot-password-card-expiry">{t('otpExpiryMessage')} {formatTime(remainingTime)} mins</p>

        {beforeOTPContent}
        <div className={styles.otpSection} data-testid="forgot-password-otp-section">
          <OTPInput length={otpLength ?? 5} onComplete={onOTPComplete} onResend={onResendOTP} data-testid="forgot-password-otp-input" />
        </div>

          {children}
        <a href="#" className={styles.learnMore}>
          {t('learnMoreLink')}
        </a>
        <a href="#" className={styles.disclosures} data-testid="forgot-password-disclosures-link">
          {t('statutoryDisclosures')}
        </a>
      </div>
    </>
  );
}

export default ForgotPasswordCard;
