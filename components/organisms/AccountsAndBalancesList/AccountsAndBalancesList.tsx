'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AccountsAndBalancesList.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import AccountsAndBalances from './AccountsAndBalances';
import FindTransaction from './FindTransaction';
import ConsolidatedBalances from './ConsolidatedBalances';
import DownloadedReports from './DownloadedReports';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';

const AccountsAndBalancesList = () => {
  const t = useTranslations('accountsAndBalances');
  const [selectedTab, setSelectedTab] = useState(0);

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/accounts-and-balances', label: t('accountsAndBalances') },
    ],
    [t],
  );

  const tabList = useMemo(
    () => [
        t('accountBalances'),
        t('findATransaction'),
        t('consolidatedBalances'),
        t('downloadedReports'),
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
                {t('accountsAndBalances')}
            </Heading>
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
        {selectedTab === 0 && <AccountsAndBalances />}
        {selectedTab === 1 && <FindTransaction />}
        {selectedTab === 2 && <ConsolidatedBalances />}
        {selectedTab === 3 && <DownloadedReports />}
    </section>
  );
};
export default AccountsAndBalancesList;
