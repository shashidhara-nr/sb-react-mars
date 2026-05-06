/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './ForgotPasswordCard.module.scss';

interface ExpiredPasswordCard {
  children?: React.ReactNode;
}

function ExpiredPasswordCard({ children }: ExpiredPasswordCard) {
  const t = useTranslations('signinHub');
  
  return (
    <>
      <img
        src="/icons/standard_bank_logo.png"
        alt="StandardBank Logo"
        className={styles.logo}
        data-testid="forgot-password-card-logo"
      />
      <div className={styles.card} data-testid="forgot-password-card-container">
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

export default ExpiredPasswordCard;