'use client'

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlusIcon, MoneyUp, ListIcon } from 'lib/icons';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';
import { getSuccessBreadcrumbLinks, navlinks } from '../collectionTypesHelper';

function SuccessCollectionType() {
  const testIdPrefix = 'collection-types-success';
  const router = useRouter();
  const translateLang = useTranslations('collectionTypesHubData');

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={getSuccessBreadcrumbLinks(translateLang)}
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading
          as="h4"
          fontSize="28px"
          style={{ marginTop: '16px', marginLeft: '10px' }}
          data-testid={buildTestId(testIdPrefix, 'heading')}
          aria-label="Manage collection type - success confirmation"
        >
          {translateLang('manageCollectionType')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
  title={translateLang('success')}
  message={translateLang('collectionTypeSuccessMessage')}
  infoNote={translateLang('collectionTypeSuccessInfoNote')}
  primaryCTALabel={translateLang('createAnotherCollectionType')}
  onPrimaryCTA={() => router.push(navlinks.createCollectionType as any)}
  primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
  primaryCTAStyle={{ width: '350px', height: '48px' }}
  secondaryCTAStartIcon={<Image src={MoneyUp} alt="Collection" width={24} height={24} />}
  secondaryCTAStyle={{ width: '274px', height: '48px' }}
  tertiaryCTALabel={translateLang('goToCollectionTypesHub')}
  onTertiaryCTA={() => router.push(navlinks.setupAndAdmin as any)}
  tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
  tertiaryCTAStyle={{ width: '300px', height: '48px' }}
  testIdPrefix={testIdPrefix}
/>
      </Box>
    </Box>
  );
}

export default SuccessCollectionType;
