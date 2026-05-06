import React from 'react';
import styles from './Card.module.scss';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, title, icon, ...rest }) => {
  return (
    <div className={styles.card}>
      {(icon || title) && (
        <div className={styles.cardHeader}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {title && <span className={styles.title}>{title}</span>}
        </div>
      )}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};

export default Card;
