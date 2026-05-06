'use client';

import { Avatar } from '@mui/material';
import { usePathname } from 'next/navigation';
import { post } from 'lib/api/httpClient';
import { API_ROUTES } from 'lib/utils/apiRoute';
import { authStorage } from 'lib/utils/authStorage';
import styles from './SignoutButton.module.scss';
import { clearSessionCookies } from 'lib/utils/cookieUtils';
import { getSigninUrl } from 'lib/utils/localeUtils';

export default function SignoutButton() {
  const pathname = usePathname();

  const handleSignout = async () => {
    try {
      await post<any>(API_ROUTES.LOGOUT);
    } catch (err) {
    } finally {
      authStorage.clear();
      clearSessionCookies();
      
      setTimeout(() => {
        window.location.href = getSigninUrl(pathname);
      }, 500);
    }
  };

  return (
    <button
      className={styles.signoutButton}
      onClick={handleSignout}
    >
      <Avatar 
        sx={{ width: 24, height:  24, flexShrink: 0 }}
        src="/icons/icn_lock_closed.svg"
        alt="Lock Icon"
      />
      <span className={styles.buttonText}>SIGN OUT</span>
    </button>
  );
}