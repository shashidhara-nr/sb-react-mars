'use client';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './AccountsAndBalancesList.module.scss';
import { Grid } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TransactionsAndStatement from './TransactionsAndStatement';

const AccountsAndBalancesDetail = () => {
  const t = useTranslations('accountsAndBalances');

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/accounts-and-balances', label: t('accountsAndBalances') },
      { href: '/accounts-and-balances', label: t('accountDetails') },
    ],
    [t],
  );

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('accountDetails')}
        </Heading>
      </Grid>
      <TransactionsAndStatement />
    </section>
  );
};
export default AccountsAndBalancesDetail;
