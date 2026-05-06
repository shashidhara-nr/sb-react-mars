'use client';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './UnpaidOptionList.module.scss';
import { Grid } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import { useRouter } from 'next/navigation';
import UnpaidOption from './UnpaidOption';

const UnpaidOptionList = () => {
  const t = useTranslations('unpaid');
  const router = useRouter();

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/unpaid', label: t('unpaidOptions') },
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
                {t('unpaidOptions')}
            </Heading>
            <Button
                buttonVariant="secondary"
                startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
                onClick={() => router.push('/unpaid/create-unpaid' as any)}
            >
                {t('createUnpaidOption')}
            </Button>
        </Grid>
        <UnpaidOption />
    </section>
  );
};
export default UnpaidOptionList;
