'use client';

import { Box, Typography } from '@mui/material';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { AvatarAlertSuccess, IcnInfoCircle, ListIcon } from 'lib/icons';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { buildTestId } from 'src/utils/testIds';
import styles from '../../bills.module.scss';
import {
  getBreadcrumbsWithTranslation,
  getTranslatedSuccessMessages,
  getTranslatedSuccessButtons,
} from '../../BillsHelper';

function BillerManageSuccessPage() {
  const testIdPrefix = 'bills-manage-success';
  const t = useTranslations('billsHubData');
  const router = useRouter();
  const [billerStatus, setBillerStatus] = useState<string | null>(null);

  const billerName = '[Biller Name]';
  const billerId = '[Biller ID]';
  
  const successMessages = useMemo(
    () => getTranslatedSuccessMessages(t, 'manage', billerStatus || undefined),
    [t, billerStatus]
  );
  const successButtons = getTranslatedSuccessButtons(t, 'manage');

  // Read status from session storage on mount and clear on unmount
  useEffect(() => {
    const storedStatus = sessionStorage.getItem('billerSubmitStatus');
    if (storedStatus) {
      setBillerStatus(storedStatus);
      console.log('Biller submitted with status:', storedStatus);
    }

    // Cleanup: remove session value when component unmounts (navigating away)
    return () => {
      sessionStorage.removeItem('billerSubmitStatus');
      console.log('Cleared biller submit status from session');
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(billerId);
    // Could add a toast notification here
  };

  const handleGoToBillsHub = () => {
    router.push('/setup-and-admin/bills' as any);
  };

  return (
    <Box className={styles.manageSuccessContainer} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box className={styles.breadcrumbBox}>
        <Breadcrumb 
          links={getBreadcrumbsWithTranslation(t, 'manage')} 
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading 
          as="h4" 
          fontSize="28px" 
          className={styles.heading}
          data-testid={buildTestId(testIdPrefix, 'heading')}
        >
          {billerStatus === 'Need Action' || billerStatus === 'Needs Action'
            ? t('pageHeadingRepairBiller')
            : t('pageHeadingManageBiller')}{' '}
        </Heading>
      </Box>

      <Box className={styles.contentBox}>
        <Box className={styles.innerFlexBox}>
          <Box className={styles.successCard} data-testid={buildTestId(testIdPrefix, 'success-card')}>
            {/* Success Icon */}
            <Box className={styles.successIcon}>
              <Image src={AvatarAlertSuccess} alt="Success" width={80} height={79} />
            </Box>

            {/* Success Heading */}
            <Typography
              variant="h5"
              className={styles.successHeading}
              data-testid={buildTestId(testIdPrefix, 'success-title')}
            >
              {successMessages.title}
            </Typography>

            {/* Success Message */}
            <Typography
              variant="body1"
              className={styles.successMessage}
              data-testid={buildTestId(testIdPrefix, 'success-message')}
            >
              {successMessages.mainMessage}
            </Typography>

            {/* Biller ID Section */}
            <Box className={styles.billerIdSection} data-testid={buildTestId(testIdPrefix, 'biller-id-section')}>
              <Typography
                className={styles.billerIdLabel}
              >
                {successMessages.billerIdLabel} <strong>{billerName}</strong>
              </Typography>
              <Typography
                className={styles.billerIdValue}
              >
                {billerId}
              </Typography>
            </Box>

            {/* Copy Button */}
            <Box className={styles.copyButtonBox}>
              <Button
                data-testid={buildTestId(testIdPrefix, 'button-copy')}
                aria-label="Copy biller ID"
                buttonVariant="text"
                onClick={handleCopy}
                startIcon={<ContentCopyIcon sx={{ fontSize: '18px' }} />}
                className={styles.copyButton}
              >
                {successButtons.copy}
              </Button>
            </Box>

            
          </Box>

          {/* Action Button */}
          <Box className={styles.actionButtonsContainer}>
            <Button
              data-testid={buildTestId(testIdPrefix, 'button-go-to-hub')}
              aria-label="Go to bills hub"
              onClick={handleGoToBillsHub}
              buttonVariant="tertiary"
              startIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
              className={styles.goToBillsButton}
            >
              {successButtons.goToBillsHub}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default BillerManageSuccessPage;
