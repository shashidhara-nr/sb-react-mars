'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { resetAuthRule } from 'store/slices/createAuthRuleSlice';
import { ListIcon, PlusIcon } from 'lib/icons';
import { buildTestId } from 'src/utils/testIds';
import { getManageSuccessBreadcrumbLinks, navlinks } from '../../nonTransactionalHelper';

function Page() {
  const testIdPrefix = 'non-transactional-authorisation-manage-success';
  const t = useTranslations('nonTransactionalHubData');
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb links={getManageSuccessBreadcrumbLinks(t)} data-testid={buildTestId(testIdPrefix, 'breadcrumb')} />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }} data-testid={buildTestId(testIdPrefix, 'heading')}>
          {t('successManageHeading')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
          title={t('successTitle')}
          message={t('successManageMessage')}
          tertiaryCTALabel={t('successGoToHub')}
          onTertiaryCTA={() => router.push(navlinks.nonTransactional as any)}
          primaryCTALabel={t('successCreateAnother')}
          onPrimaryCTA={() => {
            dispatch(resetAuthRule());
            router.push(navlinks.createAuthRule as any);
          }}
          primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
          primaryCTAStyle={{ width: 'auto', maxWidth: '100%', height: '48px' }}
          tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
          tertiaryCTAStyle={{
            width: 'auto',
            maxWidth: '100%',
            height: '48px',
          }}
          testIdPrefix={buildTestId(testIdPrefix, 'success-message')}
        />
      </Box>
    </Box>
  );
}

export default Page;
 