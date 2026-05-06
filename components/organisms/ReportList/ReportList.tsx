'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ReportList.module.scss';
import { Grid, Tab, Tabs } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import ReturnedOrRedirected from './ReturnedOrRedirected';
import ConsolidatedUnpaid from './ConsolidatedUnpaid';
import DormantBeneficieries from './DormantBeneficieries';
import { buildTestId } from 'src/utils/testIds';

const testIdPrefix = 'report-list';

const ReportList = () => {
    const t = useTranslations('reports');
    const [selectedTab, setSelectedTab] = useState(0);

    // Memoize breadcrumb links
    const breadcrumbLinks = useMemo(
        () => [
            { href: '/', label: t('dashboard') },
            { href: '/reports', label: t('reports') },
        ],
        [t],
    );

    const tabList = useMemo(
        () => [
            t('returnedOrRedirected'),
            t('consolidatedUnpaid'),
            t('dormantBeneficiaries')
        ],
        [t],
    );

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <section data-testid={buildTestId(testIdPrefix, 'container')} className={styles.container}>
            <BreadcrumbList data-testid={buildTestId(testIdPrefix, 'breadcrumb')} links={breadcrumbLinks} />
            <Grid
                data-testid={buildTestId(testIdPrefix, 'header')}
                size={12}
                className={styles.headerRow}
            >
                <Heading data-testid={buildTestId(testIdPrefix, 'heading')} as="h4" fontSize="28px">
                    {t('reports')}
                </Heading>
            </Grid>
            <Tabs
                data-testid={buildTestId(testIdPrefix, 'tabs')}
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="tabs"
            >
                {tabList.map((tab, index) => {
                    const tabKey = `reports-tab-${index}`;
                    return (
                        <Tab
                            key={tabKey}
                            data-testid={buildTestId(testIdPrefix, `tab-${index}`)}
                            label={tab}
                            value={index}
                        />
                    );
                })}
            </Tabs>

            <div data-testid={buildTestId(testIdPrefix, 'tab-content')}>
                {selectedTab === 0 && (
                    <div data-testid={buildTestId(testIdPrefix, 'returned-tab')}>
                        <ReturnedOrRedirected />
                    </div>
                )}
                {selectedTab === 1 && (
                    <div data-testid={buildTestId(testIdPrefix, 'consolidated-tab')}>
                        <ConsolidatedUnpaid />
                    </div>
                )}
                {selectedTab === 2 && (
                    <div data-testid={buildTestId(testIdPrefix, 'dormant-tab')}>
                        <DormantBeneficieries />
                    </div>
                )}
            </div>

        </section>
    );
};
export default ReportList;
