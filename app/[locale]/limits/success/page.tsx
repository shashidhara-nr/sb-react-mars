'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusIcon, MoneyUp, ListIcon } from 'lib/icons';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';

function Page() {
  const t = useTranslations('manageLimit');
  const testIdPrefix = 'limits-success';
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode');
  const isEditMode = mode === 'edit';

  const message = isEditMode 
    ? t('successEditMessage', { defaultValue: 'Limit successfully updated and submitted for approval.' }) 
    : t('successMessage', { defaultValue: 'Limit successfully created and submitted for approval.' });

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: t('dashboard') },
            { href: '/limits', label: t('limits') },
            { href: '/limits/manage-limit?mode=create', label: t('createALimit') }
          ]}
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading
          as="h4"
          fontSize="28px"
          style={{ marginTop: '16px', marginLeft: '10px' }}
          data-testid={buildTestId(testIdPrefix, 'heading')}
        >
          {t('createALimit')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
        testIdPrefix={testIdPrefix}
        title={t('success')}
        message={message}
        primaryCTALabel={t('createAnotherLimit', { defaultValue: 'CREATE ANOTHER LIMIT' })}
        onPrimaryCTA={() => router.push('/limits/manage-limit?mode=create' as any)}
        primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
        primaryCTAStyle={{
          width: '350px',
          height: '48px',
        }}
        secondaryCTALabel={t('submit')}
        secondaryCTAStartIcon={<Image src={MoneyUp} alt="Payment" width={24} height={24} />}
        secondaryCTAStyle={{
          width: '274px',
          height: '48px',
        }}
        tertiaryCTALabel={t('goToLimits', { defaultValue: 'GO TO LIMITS' })}
        onTertiaryCTA={() => router.push('/limits' as any)}
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
