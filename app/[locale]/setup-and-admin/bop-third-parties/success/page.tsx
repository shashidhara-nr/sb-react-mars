'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { PlusIcon, ListIcon } from '@lib/icons';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';
import { bopThirdPartiesUrl } from '../bopThirdPartyHelper';
import { useDispatch } from 'react-redux';
import { resetBopThirdParty } from '@store/slices/bopThirdPartySlice';
import { useCallback } from 'react';

function BopThirdPartySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('bopThirdParties');
  const testIdPrefix = 'bop-third-parties-success';
  const dispatch = useDispatch();
  
  const action = searchParams?.get('action') || 'create';
  const type = searchParams?.get('type') || 'individual';
  const thirdPartyName = searchParams?.get('name') || 'BOP third party';
  
  const isCreate = action === 'create';
  const isManage = action === 'manage';
  const isEntity = type === 'entity' || type === 'company';
  const isCompany = type === 'company';
  
  const getTitle = () => {
    if (isCreate) {
      if (isCompany) return t('createCompanyHeading');
      if (isEntity) return t('createEntityHeading');
      return t('createIndividualHeading');
    }
    if (isManage) {
      if (isCompany) return t('manageCompanyHeading');
      if (isEntity) return t('manageEntityHeading');
      return t('manageIndividualHeading');
    }
    return t('pageTitle');
  };
  
  const getMessage = () => {
    if (isCreate) return t('createSuccessMessage');
    if (isManage) return t('editSuccessMessage');
    return t('processSuccessMessage');
  };

  const handleCreateAnother = useCallback(() => {
    dispatch(resetBopThirdParty());
    router.push(bopThirdPartiesUrl.create as any);
  }, [dispatch, router]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          data-testid={buildTestId(testIdPrefix, 'breadcrumb')}
          links={[
            { href: bopThirdPartiesUrl.dashboard, label: t('dashboard') },
            { href: bopThirdPartiesUrl.home, label: t('pageTitle') },
            {
              href: `${bopThirdPartiesUrl.home}/${action}`,
              label: getTitle(),
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
          {getTitle()}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
          data-testid={buildTestId(testIdPrefix, 'success-message')}
          title={t('successTitle')}
          message={getMessage()}
          primaryCTALabel={t('createAnotherButton')}
          onPrimaryCTA={handleCreateAnother}
          primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
          primaryCTAStyle={{
            width: '350px',
            height: '48px',
          }}
          tertiaryCTALabel={t('goToListButton')}
          onTertiaryCTA={() => router.push(bopThirdPartiesUrl.home as any)}
          tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
          tertiaryCTAStyle={{
            width: 'fit-content',
            height: '48px',
          }}
        />
      </Box>
    </Box>
  );
}

export default BopThirdPartySuccessPage;
