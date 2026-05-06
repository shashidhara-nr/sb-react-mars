/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './SigninCard.module.scss';

interface SigninCardProps {
  children?: React.ReactNode;
  isNewRegistration?: boolean;
}

function SigninCard({ children, isNewRegistration }: SigninCardProps) {
  const t = useTranslations('signinHub');
  
  return (
    <div className={styles.card}>
      <img src="/icons/standard_bank_logo.png" alt="StandardBank Logo" className={styles.logo} />
      <h1 className={styles.signIn}>{t('signinTitle')}</h1>
      <p className={styles.subtitle + (isNewRegistration ? ' ' + styles.registrationSubtitle : '')}>
        {t('gainAccessMessage')}
      </p>
      {children}
      <a href="#" className={styles.learnMore}>
        {t('learnMoreLink')}
      </a>
      <a href="#" className={styles.disclosures}>
        {t('statutoryDisclosures')}
      </a>
    </div>
  );
}

export default SigninCard;