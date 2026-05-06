'use client';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from 'src/components/LanguageSwitcher';
import AssignedUserAndRoles from '@molecules/AssignedUserAndRoles/AssignedUserAndRoles';
import UserAccountDetails from '@molecules/UserAccountDetails/UserAccountDetails';
import styles from './CreateAUserAccountPage.module.scss';
import { Breadcrumb, Button } from 'dist/standard-bank-react';
import CloseIcon from 'public/icons/close-icon.svg';
import Image from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslations } from 'next-intl';

function CreateAUserAccountPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className={styles.pageWrapper}>
      <LanguageSwitcher />
      <Breadcrumb
        links={[
          {
            href: '/',
            label: 'Dashboard',
          },
          {
            href: '/setup-and-admin',
            label: 'Setup and Admin',
          },
          {
            href: '/user-account-hub',
            label: 'User Account Hub',
          },
        ]}
      />
      <h1 className={styles.pageTitle}>{t('createUserAccount')}</h1>

      <div className={styles.container}>
        <UserAccountDetails />
        <AssignedUserAndRoles />
      </div>

      <div className={styles.buttonContainer}>
        <Button
          startIcon={<Image src={CloseIcon} alt="Cancel" />}
          className={styles.cancelButton}
          onClick={() => router.push('/users-account')}
        >
          {t('cancel')}
        </Button>
        <Button
          buttonVariant="primary"
          startIcon={<ArrowForwardIcon />}
          className={styles.primaryButton}
          onClick={() => router.push('/manage-user-account')}
        >
          {t('reviewUserAccount')}
        </Button>
      </div>
    </div>
  );
}

export default CreateAUserAccountPage;