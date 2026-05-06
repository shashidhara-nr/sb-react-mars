'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusIcon, ListIcon } from 'lib/icons';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';

function Page() {
  const t = useTranslations('billingAccounts');
  const testIdPrefix = 'billing-accounts-success';
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode');
  const isEditMode = mode === 'edit';
  const accountName = searchParams?.get('name') || '';

  const message = isEditMode 
    ? t('billingAccountSuccessfullyEdited') || 'Billing account successfully edited.' 
    : t('billingAccountSuccessfullyCreated') || 'Billing account successfully created.';
  
  const headingText = isEditMode 
    ? `Manage ${accountName}` 
    : t('addBillingAccount') || 'Add a billing account';

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: t('dashboard') },
            { href: '/billing-accounts', label: t('billingAccounts') },
            { href: isEditMode ? '/billing-accounts/manage' : '/billing-accounts/create', label: isEditMode ? t('manageBillingAccount') : t('addBillingAccount') }
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
          title={t('success') || 'Success'}
          message={message}
          tertiaryCTALabel={t('goToBillingAccountsList') || 'Go to Billing Accounts List'}
          onTertiaryCTA={() => router.push('/billing-accounts' as any)}
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
