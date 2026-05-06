import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import styles from './signin.module.scss';

// Dynamically import Signin component to reduce initial bundle
const Signin = dynamicImport(() => import('@molecules/Signin/Signin'), {
  loading: () => <div className={styles['full-screen']}>Loading...</div>,
  ssr: true,
});

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className={styles['full-screen']}>Loading...</div>}>
      <div className={styles['full-screen']}>
        <Signin />
      </div>
    </Suspense>
  );
}
