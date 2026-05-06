'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Tab,
  Tabs,
} from '@mui/material';
import styles from './TransactionList.module.scss';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import Payments from './Payments';
import Transfers from './Transfers';
import Collections from './Collections';

const FindTransactionsList = () => {
  const t = useTranslations('findTransaction');
  const [selectedTab, setSelectedTab] = useState(0);

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/', label: t('transact') },
      { href: '/findTransactions', label: t('findTransaction') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />

      <Heading as="h4" fontSize="28px">
        {t('findTransaction')}
      </Heading>

      <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
        <Tab label={t('tabPayments')} />
        <Tab label={t('tabTransfers')} />
        <Tab label={t('tabCollections')} />
      </Tabs>

      {selectedTab === 0 && <Payments />}
      {selectedTab === 1 && <Transfers />}
      {selectedTab === 2 && <Collections />}
    </section>
  );
};

export default FindTransactionsList;