'use client';

import styles from './setup.module.scss';
import SigninSetup from '@organisms/SigninSetup/SigninSetup';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <div className={styles['full-screen']}><SigninSetup /></div>;
}
