'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlusIcon, MoneyUp, ListIcon } from 'lib/icons';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';

function SuccessAccountGroup() {
  const testIdPrefix = 'account-groups-success';
  const t = useTranslations('accountGroups');
  const router = useRouter();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box>
        <Breadcrumb
          links={[
            { href: '/', label: t('dashboard') },
            { href: '/account-groups', label: t('accountGroups') },
            { href: '/account-groups/create', label: t('addAccountGroup') },
          ]}
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading
          as="h4"
          fontSize="28px"
          style={{ marginTop: '16px', marginLeft: '10px' }}
          data-testid={buildTestId(testIdPrefix, 'heading')}
          aria-label="Manage account group - success confirmation"
        >
          Manage account group
        </Heading>
      </Box>

      <Box>
        <SuccessMessage
          title="Success"
          message="[Account group name] account group successfully created and submitted for approval."
          primaryCTALabel="CREATE ANOTHER ACCOUNT GROUP"
          onPrimaryCTA={() => router.push('/account-groups/create' as any)}
          primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
          primaryCTAStyle={{ height: '48px' }}
          secondaryCTAStartIcon={<Image src={MoneyUp} alt="Collection" width={24} height={24} />}
          secondaryCTAStyle={{ height: '48px' }}
          tertiaryCTALabel="GO TO ACCOUNT GROUPS"
          onTertiaryCTA={() => router.push('/account-groups' as any)}
          tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
          tertiaryCTAStyle={{ height: '48px' }}
          testIdPrefix={testIdPrefix}
        />
      </Box>
    </Box>
  );
}

export default SuccessAccountGroup;
