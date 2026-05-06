'use client';

import styles from './../signin.module.scss';
import NewRegistration from '@molecules/Signin/NewRegistration';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <div className={styles['full-screen']}><NewRegistration /></div>;
}