'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CreditLimits.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import ProductAndFrequencyAllocation from './ProductAndFrequencyAllocation';
import AccountGroupUtilisation from './AccountGroupUtilisation';
import AccountUtilisationDetails from './AccountUtilisationDetails';

const CreditLimitsDetail = () => {
  const t = useTranslations('creditLimits');
  const [selectedTab, setSelectedTab] = useState(0);

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/credit-limits', label: t('creditLimits') },
      { href: '/credit-limits/details', label: t('creditLimitDetails') },
    ],
    [t],
  );

  const tabList = useMemo(
    () => [t('productAndFrequencyAllocation'), t('accountGroup'), t('accountUtilisation')],
    [t],
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px">
          {t('creditLimitDetails')}
        </Heading>
      </Grid>
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="tabs">
        {tabList.map((tab, index) => {
          const tabKey = `accounts-and-balances-tab-${index}`;
          return <Tab key={tabKey} label={tab} value={index} />;
        })}
      </Tabs>
      {selectedTab === 0 && <ProductAndFrequencyAllocation />}
      {selectedTab === 1 && <AccountGroupUtilisation />}
      {selectedTab === 2 && <AccountUtilisationDetails />}
    </section>
  );
};
export default CreditLimitsDetail;
