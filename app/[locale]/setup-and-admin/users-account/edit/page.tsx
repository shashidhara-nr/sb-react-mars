'use client';

import { useRouter } from 'next/navigation';
 
import styles from './EditUserAccountPage.module.scss';
import { Breadcrumb, Button } from 'dist/standard-bank-react';
import CloseIcon from 'public/icons/close-icon.svg';
import Image from 'next/image';
import SaveIcon from 'public/icons/save-icon.svg';
import { useTranslations } from 'next-intl';
import UserAccountDetailsUserAccount from '@molecules/UserAccountDetailsUserAccount/UserAccountDetailsUserAccount';
import AssignedUserAndRolesUserAccount from '@molecules/AssignedUserAndRolesUserAccount/AssignedUserAndRolesUserAccount';
 
function EditUserAccountPage() {
  const t = useTranslations();
  const router = useRouter();
  const breadcrumbLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/setup-and-admin', label: 'Setup and admin' },
    { href: '/users-account', label: 'User accounts hub' },
    { href: '/edit-a-user-account', label: 'Manage user account' },
  ];
 
  return (
    <div className={styles.pageWrapper}>
      <Breadcrumb links={breadcrumbLinks} />
      <h1 className={styles.pageTitle}>Manage [User account name] user account</h1>
 
      <div className={styles.container}>
        <UserAccountDetailsUserAccount />
        <AssignedUserAndRolesUserAccount />
      </div>
 
      <div className={styles.buttonContainer}>
        <Button startIcon={<Image src={CloseIcon} alt="Cancel" />} className={styles.cancelButton}>
          {t('cancel')}
        </Button>
        <div className={styles.secondaryButton}>
          <Button
            buttonVariant="secondary"
            startIcon={<Image src={SaveIcon} alt="SaveChanges" className={styles.saveIcon} />}
            onClick={() => router.push('/manage-user-account')}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
 
export default EditUserAccountPage;