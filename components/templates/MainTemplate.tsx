import { ReactNode } from 'react';
import styles from './MainTemplate.module.scss';

export default function MainTemplate({ children }: { children: ReactNode }) {
  return <div className={styles.mainTemplate}>{children}</div>;
}
