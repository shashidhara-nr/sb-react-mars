'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Tabs, Tab } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import styles from './TransactionDetails.module.scss';
import AuditTrailTab from './AuditTrailTab';
import TransactionDetailsTab from './TransactionDetailsTab';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import theme from 'components/lib/styles/theme';
import { useSearchParams } from 'next/navigation';

const TransactionDetails = () => {
  const t = useTranslations('findTransaction');
  const [selectedTab, setSelectedTab] = useState(0);
  const searchParams = useSearchParams();
  const transactionType = searchParams?.get('transactionType');
  let transactionLabel = t('paymentDetails');
  if (transactionType === 'collection') {
    transactionLabel = t('collectionDetails');
  } else if (transactionType === 'transfer') {
    transactionLabel = t('transferDetails');
  }

  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/transact', label: t('transact') },
      { href: '/find-transactions', label: t('findATransaction') },
      { href: '/payment-detail', label: t('viewDetails') },
    ],
    [t],
  );

  const tabList = useMemo(
    () => [
      transactionLabel,
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
      <Box className={styles.headerRow}>
        <Heading as="h4" fontSize="28px">
          {transactionLabel}
        </Heading>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="payment-details-tabs"
        className={styles.paymentTabs}
      >
        {tabList.map((tab, index) => (
          <Tab
            key={`payment-details-tab-${index}`}
            label={tab}
            value={index}
          />
        ))}
      </Tabs>

      {selectedTab === 0 && <TransactionDetailsTab />}
      {selectedTab === 1 && <AuditTrailTab />}
      <Button
        buttonVariant="tertiary"
        className={styles.backButton}
        onClick={() => window.history.back()}
        startIcon={<Icon name="arrow" width="24" height="24" bgColor={theme.palette.secondary.main} />}
      >
        {t('backToList')}
      </Button>
    </section>
  );
};

export default TransactionDetails;