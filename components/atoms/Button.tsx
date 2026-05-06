'use client';
import { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.scss';

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { iconPosition?: string }) {
  // Destructure iconPosition to prevent it from being passed to the DOM
  const { iconPosition, ...rest } = props;
  return <button {...rest} className={styles.button} />;
}
