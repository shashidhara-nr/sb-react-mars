'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusIcon, MoneyUp, ListIcon } from 'lib/icons';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';
import { navlinks } from '../paymentTypesHelper';

function Page() {
  const t = useTranslations('paymenttypes');
  const testIdPrefix = 'payment-types-success';
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode');
  const isEditMode = mode === 'edit';
  const paymentTypeName = searchParams?.get('name') || '';

  const message = isEditMode ? t('successEditMessage') : t('successMessage');
  const headingText = isEditMode ? `Manage ${paymentTypeName}` : t('createAPaymentType');

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: navlinks.dashboard, label: t('dashboard') },
            { href: navlinks.paymentTypes, label: t('paymentTypesBreadcrumb') },
            { href: navlinks.createPaymentType, label: isEditMode ? t('managePaymentTypeTitle') : t('createAPaymentType') }
          ]}
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading
          as="h4"
          fontSize="28px"
          style={{ marginTop: '16px', marginLeft: '10px' }}
          data-testid={buildTestId(testIdPrefix, 'heading')}
        >
          {headingText}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
        testIdPrefix={testIdPrefix}
        title={t('success')}
        message={message}
        primaryCTALabel={t('createAnotherPaymentType')}
        onPrimaryCTA={() => router.push(navlinks.createPaymentType as any)}
        primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
        primaryCTAStyle={{
          width: '350px',
          height: '48px',
        }}
        secondaryCTAStartIcon={<Image src={MoneyUp} alt="Payment" width={24} height={24} />}
        secondaryCTAStyle={{
          width: '274px',
          height: '48px',
        }}
        tertiaryCTALabel={t('goToPaymentTypesHub')}
        onTertiaryCTA={() => router.push(navlinks.paymentTypes as any)}
        tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
        tertiaryCTAStyle={{
          width: '300px',
          height: '48px',
        }}
      />
      </Box>
    </Box>
  );
}

export default Page;
