/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './QrCodeCard.module.scss';

interface QrCodeCardProps {
  children?: React.ReactNode;
  timeRemaining?: number;
  userName?: string;
}

function QrCodeCard({ children }: QrCodeCardProps) {
  const t = useTranslations('signinHub');
  
  return (
    <>
      <img src="/icons/logo-custom.svg" alt="StandardBank Logo" className={styles.logo} data-testid="qrcode-card-logo" />
      <div className={styles.card} data-testid="qrcode-card-container">
        <h1 className={styles.signIn} data-testid="qrcode-card-heading">{t('signinTitle')}</h1>
        <p className={styles.subtitle} style={{ marginLeft: '59px', marginRight: '58px' }} data-testid="qrcode-card-subtitle">
          {t('qrSigninDescription')}
        </p>
        <p className={styles.instructionsText} style={{ marginLeft: '59px', marginRight: '58px' }} data-testid="qrcode-card-instructions">
          {t('qrSigninInstructions')}
        </p>

          {children}
      </div>
    </>
  );
}

export default QrCodeCard;
