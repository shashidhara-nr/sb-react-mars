'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Heading } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
import Image from 'next/image';
import { IcnDocumentCertificate } from 'public/icons';

const testIdPrefix = 'company-details-success';

type CompanyDetailsSuccessProps = {
  onViewDetails?: () => void;
};



const CompanyDetailsSuccess = ({
  onViewDetails,
}: CompanyDetailsSuccessProps) => {
  const router = useRouter();
  const t = useTranslations('companyDetails');

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      router.push('/company-details');
    }
  };


  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>

        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px' }}>
          {t('companyDetails')}
        </Heading>
      </Box>
      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
          title={t('success')}
          message={t('successMessage')}
          // subtext="Please note, turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo."
          primaryCTALabel={t('viewCompanyDetails')}
          primaryCTAStartIcon={<Image src={IcnDocumentCertificate} alt={t('viewCompanyDetails')} width={24} height={24} />}
          onPrimaryCTA={handleViewDetails}
          testIdPrefix={testIdPrefix}
        />
      </Box>
    </Box>
  );
};

export default CompanyDetailsSuccess;
