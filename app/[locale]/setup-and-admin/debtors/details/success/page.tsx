"use client";

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import ListIcon from 'public/icons/col-icon-list.svg';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@lib/hooks/useAppDispatch';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { resetDebtor } from '@store/slices/createDebtorSlice';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';


export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtors-details-success';
  const debtor = useAppSelector((state) => state.createBeneficiary.beneficiary);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: translateLang('breadcrumbDashboard') },
            { href: '/setup-and-admin/debtors', label: translateLang('breadcrumbDebtors') },
            { href: '/setup-and-admin/debtors/details', label: translateLang('createADebtor') },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px' }} data-testid={buildTestId(testIdPrefix, 'heading')}>
          {debtor.creationMethod === 'manual' 
            ? translateLang('createDebtorManual')
            : debtor.creationMethod === 'verified'
            ? translateLang('createDebtorVerified')
            : debtor.creationMethod === 'upload'
            ? translateLang('createDebtorUpload')
            : translateLang('createADebtor')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <Box data-testid={buildTestId(testIdPrefix, 'success-message')}>
        <SuccessMessage
          title={translateLang('success')}
          message={translateLang('debtorCreatedSuccess')}
          subtext={translateLang('successNote')}
          primaryCTALabel={translateLang('createAnotherDebtor')}
          onPrimaryCTA={() => {
            dispatch(resetDebtor());
            router.push('/setup-and-admin/debtors/create' as any);
          }}
          primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
          primaryCTAStyle={{ width: '292px', height: '48px' }}
          tertiaryCTALabel={translateLang('goToDebtorsHub')}
          onTertiaryCTA={() => {
            dispatch(resetDebtor());
            router.push('/setup-and-admin/debtors' as any);
          }}
          tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
          tertiaryCTAStyle={{ width: '246px', height: '48px' }}
          testIdPrefix={testIdPrefix}
        />
        </Box>
      </Box>
    </Box>
  );
}
