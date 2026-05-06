'use client';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './TransactionalAuthProfiles.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import { useRouter } from 'next/navigation';
import AuthProfiles from './AuthProfiles';

const TransactionalAuthProfiles = () => {
  const t = useTranslations('transactionalAuthProfiles');
  const router = useRouter();

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/transactional-auth-profiles', label: t('transactionalAuthProfiles') },
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
            {t('transactionalAuthProfiles')}
        </Heading>
        <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
          onClick={() => router.push('/transactional-auth-profiles/create' as any)}
        >
          {t('createAuthProfile')}
        </Button>
      </Grid>
      <AuthProfiles />
    </section>
  );
};
export default TransactionalAuthProfiles;
