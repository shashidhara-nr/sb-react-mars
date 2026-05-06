import { useState, useEffect, type ReactNode } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { PaymentTypeFormState } from './PaymentTypeForm';
import IconFromFill from 'public/icons/icn_form_fill.svg';
import DescriptionList, { type DescriptionItem } from '../../common/DescriptionList';
import CommonAccordion from 'components/common/CommonAccordion';

interface PaymentTypeDetailsProps {
  readonly form: PaymentTypeFormState;
  readonly onEdit?: (form?: PaymentTypeFormState) => void;
  readonly reviewMode?: boolean;
  readonly onSave?: (form: PaymentTypeFormState) => void;
  readonly onCancel?: () => void;
  readonly defaultExpanded?: boolean;
  readonly expandIcon?: ReactNode;
  readonly actions?: React.ReactNode;
}

export default function PaymentTypeDetails({
  form,
  onEdit,
  onCancel,
  reviewMode = false,
  onSave,
  defaultExpanded = true,
  expandIcon = true,
  actions
}: PaymentTypeDetailsProps) {
  const t = useTranslations('paymenttypes');
  const [isEditing, setIsEditing] = useState(false);

  const authProfileDisplay = form.authorisationProfileName ?? form.authorisationProfile ?? '-';

  useEffect(() => {
    if (!reviewMode) {
      setIsEditing(false);
    }
  }, [reviewMode]);

  const getBooleanLabel = (value: boolean): string => (value ? t('yesLabel') : t('noLabel'));

  const getAdHocLimitValue = (): ReactNode => {
    if (form.adHocLimit === undefined) {
      return '-';
    }
    if (form.currency && form.adHocLimit) {
      return `${form.currency} ${form.adHocLimit}`;
    }
    return form.adHocLimit;
  };

  const left: DescriptionItem[] = [
    { label: t('paymentTypeName'), value: form.name ?? '-' },
    { label: t('allowAdHocBeneficiary'), value: getBooleanLabel(Boolean(form.allowAdHoc)) },
    { label: t('adHocLimit'), value: getAdHocLimitValue() },
    { label: t('payAlertsAllowed'), value: getBooleanLabel(Boolean(form.payAlertsAllowed)) },
    { label: t('hostToHostDefault'), value: getBooleanLabel(Boolean(form.hostToHostDefault)) },
  ];

  const rightTop: DescriptionItem[] = [
    { label: t('authorisationProfile'), value: <strong>{authProfileDisplay}</strong> },
  ];

  const rightBottom: DescriptionItem[] = [
    { label: t('hideBeneficiaryDetails'), value: getBooleanLabel(Boolean(form.hideBeneficiaryDetails)) },
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
      defaultExpanded={defaultExpanded}
      expandIcon={expandIcon}
      icon={<Image src={IconFromFill} alt="form details" width={28} height={28} />}
      title={
        <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
          {t('paymentTypeDetails')}
        </Typography>
      }
      reviewMode={reviewMode}
      isEditing={isEditing}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onSave={handleSave}
      sx={{
        borderRadius: '0.75rem',
        overflow: 'hidden',
        '&.MuiAccordion-root': {
          borderRadius: '0.75rem',
        }
      }}
      actions={actions}
    >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 2 }} px={2} py={2}>
          <Box sx={{ gridColumn: 'span 6' }}>
            <DescriptionList items={left} />
          </Box>
          <Box sx={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column' }}>
            <Box>
              <DescriptionList items={rightTop} />
            </Box>
            <Box sx={{ mt: 'auto' }}>
              <DescriptionList items={rightBottom} spacing={2} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                <Stack spacing={0.75}>
                  <Typography
                    variant="body2"
                    color="text.neutral"
                    sx={{ fontSize: '1rem', fontWeight: 400 }}
                  >
                    {t('enforceAuditing')}
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {getBooleanLabel(Boolean(form.enforceAuditing))}
                  </Typography>
                </Stack>
                <Stack spacing={0.75}>
                  <Typography
                    variant="body2"
                    color="text.neutral"
                    sx={{ fontSize: '1rem', fontWeight: 400 }}
                  >
                    {t('auditReportType')}
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {form.auditReportType ?? '[Full / Partial]'}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
     </CommonAccordion>
  );
}
