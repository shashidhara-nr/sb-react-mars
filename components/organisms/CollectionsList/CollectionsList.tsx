'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CollectionsList.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { useRouter } from 'next/navigation';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import Button from 'components/lib/Forms/Button';
import Track from './Track';
import { Icon } from '@atoms/index';
import CollectionHistory from './CollectionHistory';
import CollectionReports from './CollectionReports';

const CollectionsList = () => {
  const t = useTranslations('collections');
  const [selectedTab, setSelectedTab] = useState(0);
  const router = useRouter();

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/collections', label: t('collections') },
    ],
    [t],
  );

  const tabList = useMemo(() => [
    t('tabTrack'),
    t('tabReports'),
    t('tabHistory')
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
        container
        alignItems="center"
        justifyContent="space-between"
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('collections')}
        </Heading>
        <Button
          buttonVariant="secondary"
          startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
          onClick={() => router.push('/create-collections/create' as any)}
        >
          {t('buttonCreateCollection')}
        </Button>
      </Grid>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="tabs"
        className={styles.collectionsTabs}
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
      {selectedTab === 1 && <CollectionReports />}
      {selectedTab === 2 && <CollectionHistory />}
    </section>
  );
};
export default CollectionsList;
