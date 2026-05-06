'use client'

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import MoneyUp from 'public/icons/col-icon-money-up.svg';
import ListIcon from 'public/icons/col-icon-list.svg';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';
import { getTransferTypeBreadcrumbs, TRANSFER_TYPE_PAGE } from "../transferTypeHelper";
function SuccessTransferType() {
  const testIdPrefix = 'transfer-types-success';
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('transferType');

  // Read query parameters (defaults to CREATE if not specified)
  const pageType = searchParams?.get('pageType') || 'CREATE';
  const managePageHeading = searchParams?.get('managePageHeading') || '';

  // Determine breadcrumb type based on pageType
  const breadcrumbType = pageType === 'MANAGE' 
    ? TRANSFER_TYPE_PAGE.SUCCESS_MANAGE 
    : TRANSFER_TYPE_PAGE.SUCCESS;

  // Determine heading based on pageType
  const heading = pageType === 'MANAGE' 
    ? `${t('managePageHeading')} ${managePageHeading}`
    : t('createTransferTypeLabel');

  // Determine success message based on pageType
  const successMessage = pageType === 'MANAGE'
    ? t('manageSuccessMessage')
    : t('successMessage');

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }} data-testid={buildTestId(testIdPrefix, 'header-container')}>
        <Breadcrumb
          links={getTransferTypeBreadcrumbs(breadcrumbType, t)}
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading
          as="h4"
          fontSize="28px"
          style={{ marginTop: '16px', marginLeft: '10px' }}
          data-testid={buildTestId(testIdPrefix, 'heading')}
        >
          {heading}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }} data-testid={buildTestId(testIdPrefix, 'content-container')}>
        <SuccessMessage
          title={t('successTitle')}
          message={successMessage}
          primaryCTALabel={t('successPrimaryCTALabel')}
          onPrimaryCTA={() => router.push('/setup-and-admin/transfer-types/create' as any)}
          primaryCTAStartIcon={<Image src={PlusIcon} alt={t('altIconPlus')} width={24} height={24} />}
          primaryCTAStyle={{ width: '350px', height: '48px' }}
          secondaryCTAStartIcon={<Image src={MoneyUp} alt={t('altIconTransfer')} width={24} height={24} />}
          secondaryCTAStyle={{ width: '274px', height: '48px' }}
          tertiaryCTALabel={t('successTertiaryCTALabel')}
          onTertiaryCTA={() => router.push('/setup-and-admin/transfer-types' as any)}
          tertiaryCTAStartIcon={<Image src={ListIcon} alt={t('altIconList')} width={24} height={24} />}
          tertiaryCTAStyle={{ width: '300px', height: '48px' }}
          testIdPrefix={testIdPrefix}
        />
      </Box>
    </Box>
  );
}

export default SuccessTransferType;
