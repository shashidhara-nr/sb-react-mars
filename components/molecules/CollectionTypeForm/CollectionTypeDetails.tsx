import * as React from 'react';
import { Stack, Typography, Box, Button } from '@mui/material';
import { FormFillIcon } from 'lib/icons';
import Image from 'next/image';
import DescriptionList from '../../common/DescriptionList';
import { CollectionTypeFormState } from './CollectionTypeForm';
import CommonAccordion from '../../common/CommonAccordion';
import { useTranslations } from 'next-intl';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { fetchAuthorisationProfiles } from '@store/slices/setup-admin/commonSlice/authorisationProfileSlice';
import type { RootState, AppDispatch } from 'store/index';

interface Props {
  form: CollectionTypeFormState;
  onEdit?: (form?: CollectionTypeFormState) => void;
  onSave?: (form: CollectionTypeFormState) => void;
  onCancel?: () => void;
  reviewMode?: boolean;
  variant?: 'collection' | 'transfer';
  expandIcon?: React.ReactNode | boolean;
  actions?: React.ReactNode;
}
const CollectionTypeDetails: React.FC<Props> = ({ form, onEdit, onSave, onCancel, reviewMode = false, variant = 'collection', expandIcon = false,actions }) => {
const dispatch = useAppDispatch();
const translateLang = useTranslations('collectionTypesHubData');
const { data: authorisationProfileData } = useAppSelector((state) => state.authorisationProfile);
const [isEditing, setIsEditing] = React.useState(false);

React.useEffect(() => {
  dispatch(fetchAuthorisationProfiles());
}, [dispatch]);

React.useEffect(() => {
  if (!reviewMode) {
    setIsEditing(false);
  }
}, [reviewMode]);

const getAuthProfileName = React.useCallback((key: string | null) => {
  if (!key) return '-';
  const profile = authorisationProfileData?.find((p) => p.authProfileKey.toString() === key);
  return profile?.authProfileName || '-';
}, [authorisationProfileData]);

function boolToText(val: boolean) {
  return val ? translateLang('yes') : translateLang('no');
}

  const isTransfer = variant === 'transfer';

  const getEnforcedAuditingText = () => {
    if (!form.enforceAuditing) return translateLang('no');
    if (form.auditReportType === 'full') return translateLang('yesFullAuditReport');
    if (form.auditReportType === 'partial') return translateLang('yesPartialAuditReport');
    return translateLang('yes');
  };

  const left = [
    { label: isTransfer ? translateLang('transferTypeName') : translateLang('collectionTypeName'), value: form.name ?? '-' },
    { label: translateLang('adHocLimit'), value: typeof form.adHocLimit !== 'undefined' && form.adHocLimit ? form.adHocLimit : '-' },
    { label: translateLang('allowAdHocDebtors'), value: boolToText(Boolean(form.allowAdHoc)) },
    { label: translateLang('hostToHostDefault'), value: boolToText(Boolean(form.hostToHostDefault)) },
  ];

  const right = [
    { label: translateLang('authorizationProfile'), value: getAuthProfileName(form.authorisationProfile) },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.(form);
  };

  const handleCancel = () => {
    onCancel?.();
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave?.(form);
    setIsEditing(false);
  };

  return (
    <CommonAccordion
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image src={FormFillIcon} alt="form icon" width={24} height={24} />
          <Typography variant="subtitle1" fontWeight={400} sx={{ fontSize: '1.25rem' }}>
            {isTransfer ? 'Transfer type details' : translateLang('collectionTypeDetails')}
          </Typography>
        </Stack>
      }
      reviewMode={reviewMode}
      isEditing={isEditing}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onSave={handleSave}
      border={false}
      disableGutters={false}
      detailsSx={{ p: 2 }}
      expandIcon={expandIcon}
      actions={actions}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 2 }}>
        <Box sx={{ gridColumn: 'span 6' }}>
          <DescriptionList items={left} spacing={2} />
        </Box>
        <Box sx={{ gridColumn: 'span 6' }}>
          <DescriptionList items={right} spacing={2} />
          {/* Add spacing to align with Ad-hoc limit */}
          <Box sx={{ height: '56px' }} /> 
          {/* Enforced auditing aligned with Allow ad-hoc debtors */}
          <Stack spacing={0.75}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '1.125rem', fontWeight: 400 }}
            >
              {translateLang('enforcedAuditing')}
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
              {getEnforcedAuditingText()}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </CommonAccordion>
  );
}
export default CollectionTypeDetails;