/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './RegsiterTokenCard.module.scss';

interface RegisterTokenCardProps {
  children?: React.ReactNode;
}

function RegisterTokenCard({ children }: RegisterTokenCardProps) {
  const t = useTranslations('signinHub');
  
  return (
    <div className={styles.card}>
      <img
        src="/icons/standard_bank_logo.png"
        alt="StandardBank Logo"
        className={styles.logo}
      />
      <h1 className={styles.signIn}>{t('registerTokenTitle')}</h1>
      {children}
      <a href="#" className={styles.learnMore}>{t('learnMoreLink')}</a>
      <a href="#" className={styles.disclosures}>{t('statutoryDisclosures')}</a>
    </div>
  );
}

export default RegisterTokenCard;