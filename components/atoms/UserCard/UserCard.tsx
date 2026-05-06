import React from 'react';
import styles from './UserCard.module.scss';

interface UserCardProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  headerActions?: React.ReactNode;
  headerBackgroundColor?: string;
  testId?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  title,
  icon,
  children,
  headerActions,
  headerBackgroundColor,
  testId,
}) => {
  return (
    <div className={styles.card} data-testid={testId}>
      <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: headerBackgroundColor }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.title}>{title}</span>
        </div>
        {headerActions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{headerActions}</div>}
      </div>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};

export default UserCard;
