'use client';

import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import Image from 'next/image';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import ListIcon from 'public/icons/col-icon-list.svg';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testIdPrefix = 'debtors-manage-success';
  const translateLang = useTranslations('debtorsHubData');
  
  // Get the action type and result from URL params (with null check)
  const manageAction = searchParams?.get('action') || 'delete';
  const deleteAction = searchParams?.get('deleteAction') || 'ACT';
  const deleteStatus = searchParams?.get('deleteStatus') || '';
  const editAction = searchParams?.get('editAction') || 'ACT';
  const editStatus = searchParams?.get('editStatus') || '';
  const debtorName = searchParams?.get('debtorName') || '';
  
  // Determine the success message based on action type and status
  const [messageKey, setMessageKey] = useState('debtorSuccessfullyDeleted');
  const [infoMessage, setInfoMessage] = useState('');
  const [subtext, setSubtext] = useState('');

  useEffect(() => {
    if (manageAction === 'delete') {
      if (deleteAction === 'ACT') {
        // Direct delete without approval
        setMessageKey('debtorSuccessfullyDeleted');
        setInfoMessage('');
        setSubtext(translateLang('successNote'));
      } else if (deleteAction === 'DELETE') {
        if (deleteStatus === 'ACA') {
          // Approval required
          setMessageKey('debtorDeletedAndSubmittedForApproval');
          setInfoMessage('');
          setSubtext(translateLang('successNote'));
        } else if (deleteStatus === 'ACI') {
          // Audit required
          setMessageKey('debtorDeletePendingAudit');
          setInfoMessage(translateLang('debtorSubmittedForAudit'));
          setSubtext(translateLang('successNote'));
        } else {
          setMessageKey('debtorSuccessfullyDeleted');
          setInfoMessage('');
          setSubtext(translateLang('successNote'));
        }
      } else {
        // Fallback for unknown action
        setMessageKey('debtorSuccessfullyDeleted');
        setInfoMessage('');
        setSubtext(translateLang('successNote'));
      }
    } else if (manageAction === 'edit') {
      if (editStatus === 'ACA') {
        // Approval required
        setMessageKey('debtorSuccessfullyEditedAndSubmittedForApproval');
        setInfoMessage('');
        setSubtext('');
      } else if (editStatus === 'ACI') {
        // Audit required
        setMessageKey('debtorEditPendingAudit');
        setInfoMessage(translateLang('debtorSubmittedForAudit'));
        setSubtext('');
      } else {
        // No approval needed
        setMessageKey('debtorSuccessfullyEdited');
        setInfoMessage('');
        setSubtext('');
      }
    }
  }, [manageAction, deleteAction, deleteStatus, editAction, editStatus, translateLang]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: translateLang('breadcrumbDashboard') },
            { href: '/setup-and-admin/debtors', label: translateLang('breadcrumbDebtors') },
            { href: '/setup-and-admin/debtors/manage', label: translateLang('breadcrumbManageDebtor') },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }} data-testid={buildTestId(testIdPrefix, 'heading')}>
          {debtorName ? `${translateLang('breadcrumbManageDebtor')} ${debtorName}` : translateLang('breadcrumbManageDebtor')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <Box data-testid={buildTestId(testIdPrefix, 'success-message')}>
          <SuccessMessage
            title={translateLang('success')}
            message={translateLang(messageKey)}
            subtext={subtext}
            infoNote={infoMessage}
            primaryCTALabel={translateLang('createAnotherDebtor')}
            onPrimaryCTA={() => router.push('/setup-and-admin/debtors/create' as any)}
            primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
            primaryCTAStyle={{
              width: '262px',
              height: '48px',
            }}
            tertiaryCTALabel={translateLang('goToDebtorsHub')}
            onTertiaryCTA={() => router.push('/setup-and-admin/debtors' as any)}
            tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
            tertiaryCTAStyle={{
              width: '246px',
              height: '48px',
            }}
            testIdPrefix={testIdPrefix}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Page;
