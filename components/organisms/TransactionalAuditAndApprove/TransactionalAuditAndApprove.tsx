'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './TransactionalAuditAndApprove.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import Audit from './Audit';
import Approve from './Approve';

const TransactionalAuditAndApprove = () => {
  const t = useTranslations('transactionalAuditAndApprove');
  const [selectedTab, setSelectedTab] = useState(0);

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/transactional-audit-and-approve', label: t('transactionalAuditAndApprove') },
    ],
    [t],
  );

  const tabList = useMemo(
    () => [
        t('audit'),
        t('approve')
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
                {t('transactionalAuditAndApprove')}
            </Heading>
        </Grid>
        <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="tabs"
        >
            {tabList.map((tab, index) => {
                const tabKey = `transactional-audit-and-approve-tab-${index}`;
                return (
                    <Tab 
                        key={tabKey} 
                        label={tab} 
                        value={index}
                    />
                );
            })}
        </Tabs>
        {selectedTab === 0 && <Audit />}
        {selectedTab === 1 && <Approve />}
    </section>
  );
};
export default TransactionalAuditAndApprove;
