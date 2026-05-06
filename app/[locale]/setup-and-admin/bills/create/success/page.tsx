'use client';

import { Box, Typography } from '@mui/material';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useTranslations } from 'next-intl';
import { resetBiller } from '@store/slices/createBillerSlice';
import Image from 'next/image';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PlusIcon, ListIcon, AvatarAlertSuccess, IcnInfoCircle } from 'lib/icons';
import { buildTestId } from 'src/utils/testIds';
import styles from '../../bills.module.scss';
import {
  getBreadcrumbsWithTranslation,
  getTranslatedSuccessMessages,
  getTranslatedSuccessButtons,
} from '../../BillsHelper';

function BillerSuccessPage() {
  const testIdPrefix = 'bills-create-success';
  const t = useTranslations('billsHubData');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const biller = useAppSelector((state) => state.createBiller.biller);

  const billerName = biller?.billerName || '[Biller Name]';
  const billerId = biller?.billerId || '[Biller ID]';
  const successMessages = getTranslatedSuccessMessages(t, 'create');
  const successButtons = getTranslatedSuccessButtons(t, 'create');

  const handleCopy = () => {
    navigator.clipboard.writeText(billerId);
  };

  const handleGoToBillsHub = () => {
    router.push('/setup-and-admin/bills' as any);
  };

  const handleAddAnotherBiller = () => {
    dispatch(resetBiller());
    router.push('/setup-and-admin/bills/create' as any);
  };

  return (
    <Box className={styles.createSuccessContainer} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box className={styles.createSuccessBreadcrumbBox}>
        <Breadcrumb 
          links={getBreadcrumbsWithTranslation(t, 'create')} 
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading as="h4" fontSize="28px" className={styles.createSuccessHeading}
          data-testid={buildTestId(testIdPrefix, 'heading')}
        >
          {t('pageHeadingAddBiller')}
        </Heading>
      </Box>

      <Box className={styles.createSuccessContentBox}>
        <Box className={styles.createSuccessInnerFlexBox}>
          {/* Success Message Card */}
          <Box className={styles.createSuccessCard} data-testid={buildTestId(testIdPrefix, 'success-card')}>
            {/* Success Icon */}
            <Box className={styles.createSuccessIcon}>
              <Image src={AvatarAlertSuccess} alt="Success" width={80} height={79} />
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              className={styles.createSuccessTitle}
              data-testid={buildTestId(testIdPrefix, 'success-title')}
            >
              {successMessages.title}
            </Typography>

            {/* Main Message */}
            <Typography
              variant="body1"
              className={styles.createSuccessMessage}
              data-testid={buildTestId(testIdPrefix, 'success-message')}
            >
              {successMessages.mainMessage}
            </Typography>

            {/* Biller ID Section */}
            <Box className={styles.createBillerIdSection} data-testid={buildTestId(testIdPrefix, 'biller-id-section')}>
              <Typography
                className={styles.createBillerIdLabel}
              >
                {successMessages.billerIdLabel} <strong>{billerName}</strong>
              </Typography>
              <Typography
                className={styles.createBillerIdValue}
              >
                {billerId}
              </Typography>
            </Box>

            {/* Copy Button */}
            <Box className={styles.createCopyButtonBox}>
              <Button
                data-testid={buildTestId(testIdPrefix, 'button-copy')}
                aria-label="Copy biller ID"
                buttonVariant="text"
                onClick={handleCopy}
                startIcon={<ContentCopyIcon sx={{ fontSize: '16px' }} />}
                className={styles.createCopyButton}
              >
                {successButtons.copy}
              </Button>
            </Box>

           
          </Box>

          {/* Action Buttons */}
          <Box className={styles.createActionButtonsContainer}>
            <Button
              data-testid={buildTestId(testIdPrefix, 'button-go-to-hub')}
              aria-label="Go to bills hub"
              onClick={handleGoToBillsHub}
              buttonVariant="tertiary"
              startIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
              className={styles.goToBillsHubButton}
            >
              {successButtons.goToBillsHub}
            </Button>

            <Box className={styles.additionalButtonsBox}>
              <Box className={styles.addAnotherBillerWrapper}>
                <Button
                  data-testid={buildTestId(testIdPrefix, 'button-add-another')}
                  aria-label="Add another biller"
                  onClick={handleAddAnotherBiller}
                  buttonVariant="primary"
                  startIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
                  className={styles.addAnotherBillerButton}
                >
                  {successButtons.addAnotherBiller}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default BillerSuccessPage;
