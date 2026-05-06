'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import MoneyUp from 'public/icons/col-icon-money-up.svg';
import ListIcon from 'public/icons/col-icon-list.svg';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';


function Page() {
  const router = useRouter();
  const testIdPrefix = 'debtors-file-upload-success';
  const translateLang = useTranslations('debtorsHubData');
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: translateLang('breadcrumbDashboard') },
            { href: '/setup-and-admin/debtors', label: translateLang('breadcrumbDebtors') },
            { href: '/setup-and-admin/debtors/create', label: translateLang('breadcrumbSelectCreationMethod') },
            {
              href: '/setup-and-admin/debtors/file-upload',
              label: translateLang('fileUpload'),
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }} data-testid={buildTestId(testIdPrefix, 'heading')}>
          {translateLang('createDebtorFileUpload')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <Box data-testid={buildTestId(testIdPrefix, 'success-message')}>
        <SuccessMessage
        title={translateLang('success')}
        message={translateLang('newDebtorsCreated')}
        infoNote={translateLang('infoNote')}
        primaryCTALabel={translateLang('createAnotherDebtor')}
        onPrimaryCTA={() => router.push('/setup-and-admin/debtors/create' as any)}
        primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
        primaryCTAStyle={{
          width: '262px',
          height: '48px',
        }}
        secondaryCTALabel={translateLang('collectFromThisDebtor')}
        onSecondaryCTA={() => console.log('Collect from debtor')}
        secondaryCTAStartIcon={<Image src={MoneyUp} alt="Payment" width={24} height={24} />}
        secondaryCTAStyle={{
          width: '290px',
          height: '48px',
        }}
        tertiaryCTALabel={translateLang('goToDebtorsHub')}
        onTertiaryCTA={() => router.push('/setup-and-admin/debtors' as any)}
        tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
        tertiaryCTAStyle={{
          width: '246px',
          height: '48px',
        }}
        testIdPrefix={testIdPrefix}
      /></Box>
      </Box>
    </Box>
  );
}

export default Page;
