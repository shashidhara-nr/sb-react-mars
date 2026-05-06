'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './UserDetails.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import UserPersonalDetail from './UserPersonalDetail';
import UserCredentials from './UserCredentials';
import CredentialHistory from './CredentialHistory';
import { useSearchParams } from 'next/navigation';

const ManageUser = () => {
  const t = useTranslations('userDetails');
  const [selectedTab, setSelectedTab] = useState(0);
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode');

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/user-details', label: t('userDetails') },
      {
        href: '/user-details/manage-user',
        label: mode === 'create' ? t('createUser') : t('manageUser'),
      },
    ],
    [t, mode],
  );

  const tabList = useMemo(() => [t('details'), t('credentials'), t('credentialHistory')], [t]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px">
          {mode === 'create' ? t('createUser') : t('manageUser')}
          {mode === 'create' ? '' : searchParams?.get('userId')}
        </Heading>
      </Grid>
      {mode !== 'create' && (
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="tabs">
          {tabList.map((tab, index) => {
            const tabKey = `accounts-and-balances-tab-${index}`;
            return <Tab key={tabKey} label={tab} value={index} />;
          })}
        </Tabs>
      )}
      {(selectedTab === 0 || mode === 'create') && <UserPersonalDetail mode={mode ?? ''} />}
      {selectedTab === 1 && <UserCredentials />}
      {selectedTab === 2 && <CredentialHistory />}
    </section>
  );
};
export default ManageUser;
