import * as React from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { FormFillIcon } from 'lib/icons';
import CommonAccordion from '../../common/CommonAccordion';
import DescriptionList from '../../common/DescriptionList';
import { TransferTypeFormState } from './TransferTypeForm';
import { buildTestId } from 'src/utils/testIds';
import { useSelector } from 'react-redux';
import type { RootState } from 'store/index';
import type { Account } from '@molecules/CustomerAgreementSelector';

interface Props {
  form: TransferTypeFormState;
  reviewMode?: boolean;
  onEdit?: () => void;
  onEditSection?: (section: string) => void;
  expandIcon?: boolean;
  payerAccounts: Account[];
  paymentAccounts: Account[];
  allAccounts?: Account[]; // Optional combined pool for fallback lookup
  testIdPrefix?: string;
  actions?: React.ReactNode;
}

export default function TransferTypeDetails({
  form,
  reviewMode = false,
  onEdit,
  onEditSection,
  expandIcon = false,
  payerAccounts,
  paymentAccounts,
  allAccounts = [],
  testIdPrefix = 'transfer-type-details',
  actions
}: Props) {
  // Fetch data from Redux to map keys to names
  const { data: authorisationProfileData } = useSelector((state: RootState) => state.authorisationProfile);
  const { data: customerAgreementData } = useSelector((state: RootState) => state.customerAgreement);

  // Helper function to get account details for display
  const getAccountDetailsItems = React.useCallback(
    (accountId: string, accountType: 'payer' | 'payment') => {
      const accountsList = accountType === 'payer' ? payerAccounts : paymentAccounts;
      let account = accountsList.find((a) => a.id === accountId);
      
      // Fallback: search in combined pool if not found in specific list
      if (!account && allAccounts.length > 0) {
        account = allAccounts.find((a) => a.id === accountId);
      }
      
      const left = [
        { label: 'Account name', value: account?.name ?? '-' },
        { label: 'Branch / Sort code', value: account?.sortCode ?? '-' },
        { label: 'Currency', value: account?.currencyFull || account?.currency || '-' },
      ];
      const right = [
        { label: 'Account number', value: account?.accNumber ?? '-' },
        { label: 'BIC (SWIFT)', value: account?.bic ?? '-' },
        { label: 'Country / Region', value: account?.country ?? '-' },
      ];

      return { left, right };
    },
    [payerAccounts, paymentAccounts, allAccounts]
  );

  // Helper function to get authorization profile name from key
  const getAuthProfileName = React.useCallback((key: string) => {
    if (!key) return '-';
    const profile = authorisationProfileData?.find((p) => p.authProfileKey.toString() === key);
    return profile?.authProfileName || '-';
  }, [authorisationProfileData]);

  // Helper function to get customer agreement name from key
  const getAgreementName = React.useCallback((key: string) => {
    if (!key) return '-';
    const agreement = customerAgreementData?.find((a) => a.id === key);
    return agreement?.label || '-';
  }, [customerAgreementData]);

  const handleSectionEdit = (section: string) => {
    if (onEditSection) {
      onEditSection(section);
    } else {
      onEdit?.();
    }
  };

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'container')}>
      {/* Transfer type details section */}
      <CommonAccordion
        title={
          <Stack direction="row" alignItems="center" spacing={1} data-testid={buildTestId(testIdPrefix, 'transfer-details-title')}>
            <Image src={FormFillIcon} alt="form icon" />
            <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
              Transfer type details
            </Typography>
          </Stack>
        }
        border={false}
        disableGutters={false}
        detailsSx={{ p: 2 }}
        expandIcon={expandIcon}
        defaultExpanded={true}
        reviewMode={reviewMode}
        onEdit={() => handleSectionEdit('transferDetails')}
        actions={actions}
      >
        <Grid container spacing={2} sx={{ mt: '0.5rem' }} data-testid={buildTestId(testIdPrefix, 'transfer-details-grid')}>
          <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'transfer-type-name-container')}>
            <Typography variant="body2" color="text.secondary"  sx={{fontSize: '1.125rem', fontWeight: 400}} data-testid={buildTestId(testIdPrefix, 'transfer-type-name-label')}>
              Transfer type name
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'transfer-type-name-value')}>
              {form.transferTypeName || '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'authorisation-profile-container')}>
            <Typography variant="body2" color="text.secondary" sx={{fontSize: '1.125rem', fontWeight: 400}} data-testid={buildTestId(testIdPrefix, 'authorisation-profile-label')}>
              Authorisation profile
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5,fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'authorisation-profile-value')}>
              {getAuthProfileName(form.authorisationProfile)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'enforce-auditing-container')}>
            <Typography variant="body2" color="text.secondary"  sx={{fontSize: '1.125rem', fontWeight: 400}} data-testid={buildTestId(testIdPrefix, 'enforce-auditing-label')}>
              Enforce auditing
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5,fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'enforce-auditing-value')}>
              {form.enforceAuditing ? 'Yes' : 'No'}
            </Typography>
          </Grid>
        </Grid>
      </CommonAccordion>

      {/* Payer details section */}
      <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'from-account-section')}>
        <CommonAccordion
          title={
            <Stack direction="row" alignItems="center" spacing={1} data-testid={buildTestId(testIdPrefix, 'from-account-title')}>
              <Image src={FormFillIcon} alt="form icon" />
              <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
                From Account
              </Typography>
            </Stack>
          }
          border={false}
          disableGutters={false}
          detailsSx={{ p: 2 }}
          expandIcon={expandIcon}
          defaultExpanded={true}
          reviewMode={reviewMode}
          onEdit={() => handleSectionEdit('fromAccount')}
          actions={actions}
        >
          <Grid container spacing={2} sx={{ mt: '0.5rem' }} data-testid={buildTestId(testIdPrefix, 'from-account-grid')}>
            <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payer-agreement-container')}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.125rem', fontWeight: 400 }} data-testid={buildTestId(testIdPrefix, 'payer-agreement-label')}>
                Customer agreement
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'payer-agreement-value')}>
                {getAgreementName(form.payerCustomerAgreement)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payer-account-details-container')}>
              <Grid container spacing={2} data-testid={buildTestId(testIdPrefix, 'payer-account-details-grid')}>
                <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payer-account-left-column')}>
                  <DescriptionList items={getAccountDetailsItems(form.payerAccount, 'payer').left} spacing={1} data-testid={buildTestId(testIdPrefix, 'payer-account-left-list')} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payer-account-right-column')}>
                  <DescriptionList items={getAccountDetailsItems(form.payerAccount, 'payer').right} spacing={1} data-testid={buildTestId(testIdPrefix, 'payer-account-right-list')} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CommonAccordion>
      </Box>

      {/* Payment details section */}
      <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'to-account-section')}>
        <CommonAccordion
          title={
            <Stack direction="row" alignItems="center" spacing={1} data-testid={buildTestId(testIdPrefix, 'to-account-title')}>
              <Image src={FormFillIcon} alt="form icon" />
              <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
                To Account
              </Typography>
            </Stack>
          }
          border={false}
          disableGutters={false}
          detailsSx={{ p: 2 }}
          expandIcon={expandIcon}
          defaultExpanded={true}
          reviewMode={reviewMode}
          onEdit={() => handleSectionEdit('toAccount')}
          actions={actions}
        >
          <Grid container spacing={2} sx={{ mt: '0.5rem' }} data-testid={buildTestId(testIdPrefix, 'to-account-grid')}>
            <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payment-agreement-container')}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.125rem', fontWeight: 400 }} data-testid={buildTestId(testIdPrefix, 'payment-agreement-label')}>
                Customer agreement
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.25rem', fontWeight: 500 }} data-testid={buildTestId(testIdPrefix, 'payment-agreement-value')}>
                {getAgreementName(form.paymentCustomerAgreement)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }} data-testid={buildTestId(testIdPrefix, 'payment-account-details-container')}>
              <Grid container spacing={2} data-testid={buildTestId(testIdPrefix, 'payment-account-details-grid')}>
                <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payment-account-left-column')}>
                  <DescriptionList items={getAccountDetailsItems(form.paymentAccount, 'payment').left} spacing={1} data-testid={buildTestId(testIdPrefix, 'payment-account-left-list')} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} data-testid={buildTestId(testIdPrefix, 'payment-account-right-column')}>
                  <DescriptionList items={getAccountDetailsItems(form.paymentAccount, 'payment').right} spacing={1} data-testid={buildTestId(testIdPrefix, 'payment-account-right-list')} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CommonAccordion>
      </Box>
    </Box>
  );
}
