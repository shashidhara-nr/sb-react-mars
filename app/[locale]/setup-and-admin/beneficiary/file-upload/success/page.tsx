'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import MoneyUp from 'public/icons/col-icon-money-up.svg';
import ListIcon from 'public/icons/col-icon-list.svg';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { buildTestId } from 'src/utils/testIds';

function Page() {
  const testIdPrefix = 'beneficiary-file-upload-success';
  const router = useRouter();
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: 'Dashboard' },
            
            { href: '/setup-and-admin/beneficiary', label: 'Beneficiaries' },
            { href: '/setup-and-admin/beneficiary/create', label: 'Select a creation method' },
            {
              href: '/setup-and-admin/beneficiary/file-upload',
              label: 'File Upload',
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
          Create a beneficiary (file upload)
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
        title="Success"
        message="New beneficiaries successfully created and submitted for approval."
        infoNote="Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo."
        primaryCTALabel="CREATE ANOTHER BENEFICIARY"
        onPrimaryCTA={() => router.push('/setup-and-admin/beneficiary/create' as any)}
        primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
        primaryCTAStyle={{
          width: '292px',
          height: '48px',
        }}
        secondaryCTALabel="PAY THIS BENEFICIARY"
        onSecondaryCTA={() => console.log('Pay beneficiary')}
        secondaryCTAStartIcon={<Image src={MoneyUp} alt="List" width={24} height={24} />}
        secondaryCTAStyle={{
          width: '250px',
          height: '48px',
        }}
        tertiaryCTALabel="GO TO BENEFICIARIES HUB"
        onTertiaryCTA={() => router.push('/setup-and-admin/beneficiary' as any)}
        tertiaryCTAStartIcon={<Image src={ListIcon} alt="Payment" width={24} height={24} />}
        tertiaryCTAStyle={{
          width: '246x',
          height: '48px',
        }}
        testIdPrefix={testIdPrefix}
      />
      </Box>
    </Box>
  );
}

export default Page;
