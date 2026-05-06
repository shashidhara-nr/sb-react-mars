'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Joyride } from 'react-joyride';
import styles from './HelpCentre.module.scss';
import { Grid, Tab, Tabs, Button } from '@mui/material';
import BusinessTraining from './BusinessTraining';
import OperationalGuide from './OperationalGuide';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { CustomTooltip } from 'components/lib/Tour';
import { buildTestId } from 'src/utils/testIds';
import { helpCentreTourSteps } from './helpCentreTour';

const HelpCentreList = () => {
  const t = useTranslations('helpCentre');
  const testIdPrefix = 'help-centre';
  const [selectedTab, setSelectedTab] = useState(0);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    console.log('runTour state changed:', runTour);
    if (runTour) {
      console.log('About to start tour with steps:', helpCentreTourSteps);
    }
  }, [runTour]);

  const handleJoyrideCallback = (data: any) => {
    console.log('=== JOYRIDE CALLBACK FIRED ===');
    const { status, step, index, size, action, type } = data;
    console.log('Full callback data:', data);
    console.log('Status:', status, 'Action:', action);
    if (status === 'finished' || status === 'skipped') {
      setRunTour(false);
    }
  };

  // Memoize breadcrumb links
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/help-centre', label: t('helpCentre') },
    ],
    [t],
  );

  const tabList = useMemo(
    () => [
      t('businessOnlineTraining'),
      t('operationalGuide'),
    ],
    [t],
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <section className={styles.container}>
      <>
        <Joyride
          steps={helpCentreTourSteps}
          run={runTour}
          continuous
          // @ts-ignore - callback is valid in react-joyride
          callback={handleJoyrideCallback}
          tooltipComponent={CustomTooltip}
          scrollToFirstStep
          showSkipButton={false}
          floaterProps={{
            disableAnimation: false,
          }}
        />
      </>
      
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid
        size={12}
        className={styles.headerRow}
      >
        <Heading as="h4" fontSize="28px">
          {t('helpCentre')}
        </Heading>
        <Button 
          onClick={() => {
            console.log('Take a tour clicked');
            setRunTour(false);
            setTimeout(() => {
              setRunTour(true);
            }, 100);
          }}
          data-testid={buildTestId(testIdPrefix, 'button', 'take-tour')}
          variant="contained"
          sx={{
            ml: 'auto',
            backgroundColor: '#0062e1',
            color: '#ffffff',
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#0052c1',
            },
          }}
        >
          {t('takeTour')}
        </Button>
      </Grid>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="tabs"
        data-testid={buildTestId(testIdPrefix, 'tabs')}
        data-tour="help-centre-tabs"
      >
        {tabList.map((tab, index) => {
          const tabKey = `help-centre-tab-${index}`;
          return (
            <Tab 
              key={tabKey} 
              label={tab} 
              value={index}
              data-testid={buildTestId(testIdPrefix, 'tab', index.toString())}
            />
          );
        })}
      </Tabs>
      {selectedTab === 0 && <BusinessTraining />}
      {selectedTab === 1 && <OperationalGuide />}
    </section>
  );
};

export default HelpCentreList;
