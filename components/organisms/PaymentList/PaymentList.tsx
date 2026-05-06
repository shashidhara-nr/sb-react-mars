'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './PaymentList.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import TrackPayment from './TrackPayment';
import { Button } from 'components/lib/Forms';
import { Icon } from '@atoms/index';
import { useRouter } from 'next/navigation';
import RecurringPayment from './RecurringPayment';
import ReportsPayment from './ReportsPayment';
import HistoryPayment from './HistoryPayment';

const PaymentList = () => {
    const t = useTranslations('payments');
    const [selectedTab, setSelectedTab] = useState(0);
    const router = useRouter();

    // Memoize breadcrumb links
    const breadcrumbLinks = useMemo(
        () => [
            { href: '/', label: t('dashboard') },
            { href: '/payments', label: t('payments') },
        ],
        [t],
    );

    const tabList = useMemo(
        () => [
            t('track'),
            t('recurringPayments'),
            t('reports'),
            t('history'),
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
                    {t('payments')}
                </Heading>
                <Button
                    buttonVariant="secondary"
                    startIcon={<Icon name="add" width="24" height="24" bgColor='#0051FF' />}
                    onClick={() => router.push('/payments/create' as any)}
                >
                    {t('createPayment')}
                </Button>
            </Grid>
            <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="tabs"
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
            {selectedTab === 0 && <TrackPayment />}
            {selectedTab === 1 && <RecurringPayment />}
            {selectedTab === 2 && <ReportsPayment />}
            {selectedTab === 3 && <HistoryPayment />}
        </section>
    );
};
export default PaymentList;
