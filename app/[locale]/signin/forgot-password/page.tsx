'use client';

import styles from './forgotpassword.module.scss';
import ForgotPassword from '@molecules/Signin/ForgotPassword';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <div className={styles['full-screen']}><ForgotPassword /></div>;
}
