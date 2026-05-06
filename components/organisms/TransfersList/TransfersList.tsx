'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './TransferList.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import { useRouter } from 'next/navigation';
import Track from './Track';
import Reports from './Reports';
import AuditTrail from './AuditTrail';


const TransfersList = () => {
  const t = useTranslations('transfers');
  const [selectedTab, setSelectedTab] = useState(0);
  const router = useRouter();

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/transfers', label: t('transfers') },
    ],
    [t],
  );

  const tabList = useMemo(
    () => [
        t('track'),
        t('reports'),
        t('auditTrail'),
    ],
    [t],
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('transfers')}
        </Heading>
        <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
          onClick={() => router.push('/transfers/create' as any)}
        >
          {t('createATransfer')}
        </Button>
      </Grid>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="tabs"
      >
        {tabList.map((tab, index) => {
          const tabKey = `accounts-and-balances-tab-${index}`;
          return (
            <Tab 
                key={tabKey} 
                label={tab} 
                value={index}
            />
          );
        })}
      </Tabs>
      {selectedTab === 0 && <Track />}
      {selectedTab === 1 && <Reports />}
      {selectedTab === 2 && <AuditTrail />}
    </section>
  );
};
export default TransfersList;
