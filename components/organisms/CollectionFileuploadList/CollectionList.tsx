'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CollectionList.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TrackCollection from './TrackCollection';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import { useRouter } from 'next/navigation';


const CollectionList = () => {
  const t = useTranslations('collectionsfileupload');
  const [selectedTab, setSelectedTab] = useState(0);
  const router = useRouter();
   const testIdPrefix = 'collectionList';

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/collection-fileupload', label: t('collectionFileupload') },
    ],
    [t],
  );

  const tabList = useMemo(
    () => [
        t('track'),
        t('fileUpload'),
        t('reports'),
        t('history'),
    ],
    [t],
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <section className={styles.container} data-testid={`${testIdPrefix}-container`}>
        <BreadcrumbList links={breadcrumbLinks} data-testid={`${testIdPrefix}-container`}/>
        <Grid
            size={12}
            className={styles.headerRow}
        data-testid={`${testIdPrefix}-container`}>
            <Heading as="h4" fontSize="28px" data-testid={`${testIdPrefix}-container`}>
                {t('collectionFileupload')}
            </Heading>
            <Button
                buttonVariant="secondary"
                startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
                onClick={() => router.push('/collection-fileupload/create-collection' as any)}
              data-testid={`${testIdPrefix}-container`}
            >
                {t('createCollection')}
            </Button>
        </Grid>
        <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="tabs"
            data-testid={`${testIdPrefix}-container`}
        >
            {tabList.map((tab, index) => {
                const tabKey = `payments-tab-${index}`;
                return (
                    <Tab 
                        key={tabKey} 
                        label={tab} 
                        value={index}
                    />
                );
            })}
        </Tabs>
        {selectedTab === 0 && <TrackCollection />}
     
    </section>
  );
};
export default CollectionList;
