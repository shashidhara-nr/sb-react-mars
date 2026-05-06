'use client';
import { ReactNode } from 'react';
import styles from './Card.module.scss';

export default function Card({ children }: { children: ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}
