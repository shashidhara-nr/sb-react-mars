'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import ListIcon from 'public/icons/col-icon-list.svg';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { buildTestId } from 'src/utils/testIds';

function Page() {
  const testIdPrefix = 'beneficiary-manage-success';
  const router = useRouter();
  const searchParams = useSearchParams();
  const beneficiary = useSelector((state: RootState) => state.createBeneficiary.beneficiary);
  const manageActionFromRedux = useSelector((state: RootState) => state.createBeneficiary.manageAction);
  
  // Prefer URL parameter over Redux to avoid race conditions
  const actionFromUrl = searchParams?.get('action');
  const manageAction = actionFromUrl || manageActionFromRedux;

  // counterPartyName may be a plain string (API response) or an object (mapped list row)
  const beneficiaryName =
    typeof beneficiary?.counterPartyName === 'string'
      ? beneficiary.counterPartyName
      : (beneficiary?.counterPartyName as any)?.name || 'Beneficiary';

  const successMessage =
    manageAction === 'delete'
      ? 'Beneficiary deleted and submitted for approval.'
      : 'Beneficiary successfully edited and submitted for approval.';

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
            {
              href: '/setup-and-admin/beneficiary/manage',
              label: 'Manage beneficiary',
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
          Manage {beneficiaryName}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <SuccessMessage
        title="Success"
        message={successMessage}
        infoNote="Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo."
        tertiaryCTALabel="GO TO BENEFICIARIES HUB"
        onTertiaryCTA={() => router.push('/setup-and-admin/beneficiary' as any)}
        tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
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
