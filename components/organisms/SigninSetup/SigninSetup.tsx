import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from 'dist/standard-bank-react';
import styles from './SigninSetup.module.scss';


function SigninSetup() {
  const router = useRouter();
  const t = useTranslations('signinHub');

  const handleBackButtonClick = useCallback(() => {
    router.push('/signin');
  }, [router]);

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerLeftContent}>
          <button
            className={styles.backButton}
            onClick={handleBackButtonClick}
            data-testid="signin-setup-back-button"
          >
            <ArrowBackIcon className={styles.backIcon} />
            <span className={styles.backText}>{t('backButton')}</span>
          </button>
        </div>
        <div className={styles.headerCenter}>
          <Image src="/icons/logo-custom.svg" alt="Logo" height={64} width={40} priority />
        </div>
      </header>
      <div className={styles.content}>
        <div className={styles.downloadSection}>
          <h2 className={styles.downloadTitle}>{t('downloadAppTitle')}</h2>
          <div className={styles.appStoreButtons}>
            <div className={styles.appButton}>
              <Image src="/icons/playstore.svg" alt="Google Play" height={40} width={139} priority />
            </div>
            <div className={styles.appButton}>
              <Image src="/icons/appstore.svg" alt="App Store" height={40} width={120} priority />
            </div>
            <div className={styles.appButton}>
              <Image src="/icons/appgallery.svg" alt="App Gallery" height={40} width={133} priority />
            </div>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.visitTitle}>{t('visitAppStore')}</h3>
            <p className={styles.infoText}>
              {t('downloadLatestVersion')} and register
              an authenticator on the mobile app to keep your profiles secure.
            </p>
            <p className={styles.infoText}>
              Every time you sign into Business Online via the desktop app, you will need to scan a
              unique code using the Business Online mobile app. A login request will be sent to your
              mobile device to confirm that you are signing in, you will then be required to accept or
              decline this login request with the Business Online mobile app by using the app code you
              created, your face or fingerprint.
            </p>
            <div className={styles.buttonContainer}>
              <Button
                buttonVariant="primary"
                onClick={handleBackButtonClick}
                data-testid="signin-setup-done-button"
                style={{ width: '448px', height: '48px' }}
              >
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SigninSetup;
