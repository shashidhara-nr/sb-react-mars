'use client';

import { Box, Typography } from '@mui/material';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { RootState } from '@store/index';
import { resetVerificationRequest } from '@store/slices/createAccountVerificationRequestSlice';
import Image from 'next/image';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PlusIcon, ListIcon, AvatarAlertSuccess, IcnInfoCircle } from 'lib/icons';
import {
  getBreadcrumbsWithTranslation,
  getTranslatedSuccessMessages,
  getTranslatedSuccessButtons,
} from '../VerificationRequestHelper';

function VerificationRequestSuccessPage() {
  const t = useTranslations('accountVerificationRequest');
  const router = useRouter();
  const dispatch = useDispatch();
  const verificationRequest = useSelector(
    (state: RootState) => state.createAccountVerificationRequest.verificationRequest
  );

  const verificationRequestId = verificationRequest?.id || '[Verification Request ID]';
  const successMessages = getTranslatedSuccessMessages(t, 'create');
  const successButtons = getTranslatedSuccessButtons(t, 'create');

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationRequestId);
  };

  const handleGoToVerificationList = () => {
    router.push('/account-verification-request' as any);
  };

  const handleCreateAnother = () => {
    dispatch(resetVerificationRequest());
    router.push('/account-verification-request/create' as any);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ padding: '32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Breadcrumb links={getBreadcrumbsWithTranslation(t, 'create')} />
        <Heading as="h4" fontSize="28px" sx={{ marginTop: '24px', marginBottom: 0 }}>
          {t('singleImmediateResponse')}
        </Heading>
      </Box>

      {/* Main Content Box */}
      <Box sx={{ flex: 1, padding: '48px 32px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Center Content */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          {/* Success Card */}
          <Box sx={{ textAlign: 'center', width: '100%', maxWidth: '800px' }}>
            {/* Success Icon */}
            <Box sx={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
              <Image src={AvatarAlertSuccess} alt="Success" width={80} height={79} />
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '16px',
              }}
            >
              {successMessages.title}
            </Typography>

            {/* Main Message */}
            <Typography
              variant="body1"
              sx={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '24px',
                lineHeight: 1.6,
              }}
            >
              {successMessages.mainMessage}
            </Typography>

            {/* Verification Request ID Section */}
            <Box sx={{ marginBottom: '24px' }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: '8px',
                }}
              >
                {successMessages.verificationIdLabel}
              </Typography>
              <Typography
                sx={{
                  fontSize: '18px',
                  color: '#333',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                }}
              >
                {verificationRequestId}
              </Typography>
            </Box>

            {/* Copy Button */}
            <Box sx={{ marginBottom: '32px' }}>
              <Button
                buttonVariant="text"
                onClick={handleCopy}
                startIcon={<ContentCopyIcon sx={{ fontSize: '16px' }} />}
                sx={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {successButtons.copy}
              </Button>
            </Box>

            {/* Info Icon */}
            <Box sx={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <Image src={IcnInfoCircle} alt="Info" width={32} height={32} />
            </Box>

            {/* Info Text */}
            <Typography
              variant="body2"
              sx={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '40px',
                lineHeight: 1.6,
              }}
            >
              {successMessages.infoText}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons - At the bottom */}
        <Box sx={{ display: 'flex', gap: '16px', justifyContent: 'space-between', width: '100%', maxWidth: '100%', paddingTop: '32px' }}>
          <Button
            onClick={handleGoToVerificationList}
            buttonVariant="tertiary"
            startIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
          >
            {successButtons.goToVerificationList}
          </Button>

          <Button
            onClick={handleCreateAnother}
            buttonVariant="primary"
            startIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
          >
            {successButtons.createAnother}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default VerificationRequestSuccessPage;
