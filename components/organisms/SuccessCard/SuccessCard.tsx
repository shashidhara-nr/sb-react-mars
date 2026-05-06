import React from 'react';
import styles from './SuccessCard.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'assets/customIcons/checkCircle';
import { ArrowRightIcon } from 'assets/customIcons/arrowRightIcon';
import { InfoIcon } from 'assets/customIcons/infoIcon';

interface SuccessCardProps {
  title?: string;
  message?: string;
  note?: string;
  ctaLink?: string;
  ctaText?: string;
  showCtaLink?: boolean;
}

const SuccessCard: React.FC<SuccessCardProps> = ({
  title = 'Success',
  message = 'submitted for approval.',
  note = '',
  ctaLink = '/user-accounts',
  ctaText = 'goToUserAccounts',
  showCtaLink = false,
}) => {
  const pathname = usePathname();
  const t = useTranslations('userDetails');

  
  return (
    <>
    <div className={styles.successCard}>
      <div className={styles.contentWrapper}>

        {/* Icon */}
        <div className={styles.statusIcon}>
          <div className={styles.iconBorder} />
          <div className={styles.iconInner}>
            <CheckCircle />
          </div>
        
        </div>

        {/* Text */}
        <div className={styles.textSection}>
          <div className={styles.headingBlock}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{message}</p>
          </div>

          <div className={styles.noteSection}>
            <div className={styles.infoIcon}>
              <InfoIcon />
            </div>
            <p className={styles.noteText}>{note}</p>
          </div>
        </div>
      </div>

      
    </div>
    {showCtaLink && (
      <Link href={ctaLink} className={styles.ctaLink}>
        <ArrowRightIcon width="20" height="20" bgColor="#0051FF" />
        <span className={styles.ctaText}>{t(ctaText)}</span>
      </Link>
    )}
    </>
  );
};

export default SuccessCard;