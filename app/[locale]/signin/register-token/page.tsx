'use client';

import RegisterToken from '@molecules/Signin/RegisterToken';
import styles from './registertoken.module.scss';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <div className={styles['full-screen']}><RegisterToken /></div>;
}
