"use client";

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { resetAuthRule } from '@store/slices/createAuthRuleSlice';
import { PlusIcon, ListIcon } from 'lib/icons';
import { buildTestId } from 'src/utils/testIds';
import { getCreateSuccessBreadcrumbLinks, navlinks } from '../../nonTransactionalHelper';

export default function Page() {
  const testIdPrefix = 'non-transactional-authorisation-create-success';
  const t = useTranslations('nonTransactionalHubData');
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb links={getCreateSuccessBreadcrumbLinks(t)} data-testid={buildTestId(testIdPrefix, 'breadcrumb')} />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px' }} data-testid={buildTestId(testIdPrefix, 'heading')}>
          {t('successCreateHeading')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
          title={t('successTitle')}
          message={t('successCreateMessage')}
          primaryCTALabel={t('successCreateAnother')}
          onPrimaryCTA={() => {
            dispatch(resetAuthRule());
            router.push(navlinks.createAuthRule as any);
          }}
          primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
          primaryCTAStyle={{ width: '356px', height: '48px' }}
          tertiaryCTALabel={t('successGoToHub')}
          onTertiaryCTA={() => router.push(navlinks.nonTransactional as any)}
          tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
          tertiaryCTAStyle={{ width: '480px', height: '48px' }}
          data-testid={buildTestId(testIdPrefix, 'success-message')}
        />
      </Box>
    </Box>
  );
}