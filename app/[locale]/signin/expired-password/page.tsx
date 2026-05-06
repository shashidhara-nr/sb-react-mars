'use client';

import ExpiredPassword from '@molecules/Signin/ExpiredPassword';
import styles from './Expiredpassword.module.scss';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <div className={styles['full-screen']}><ExpiredPassword /></div>;
}