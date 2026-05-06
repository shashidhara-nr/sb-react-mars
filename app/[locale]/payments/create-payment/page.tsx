'use client';
 
import React from 'react';
import { useRouter } from 'next/navigation';
import { Grid } from '@mui/material';
import CreateManuallyIcon from 'public/icons/icn_form_fill_white.svg';
import FormFillIcon from 'public/icons/icn_form_fill.svg';
import ViewListIcon from 'public/icons/icn_view_list.svg';
import ViewListIconWhite from 'public/icons/icn_view_list_white.svg';
import UploadIcon from 'public/icons/icn_upload.svg';
import UploadIconWhite from 'public/icons/icn_upload_white.svg';
import { useTranslations } from 'next-intl';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import FormActionButtons from 'components/common/formActionButtons';
import styles from './CreatePaymentPage.module.scss';
 
type CreationMethod = 'domestic' | 'international' | 'upload';
 
export default function CreatePaymentPage() {
  const testIdPrefix = 'payment-create-method';
  const router = useRouter();
  const t = useTranslations('payments');
  const [selectedMethod, setSelectedMethod] = React.useState<CreationMethod | null>(null);
 
  const handleSelect = (method: CreationMethod) => {
    setSelectedMethod(method);
  };
 
  const handleNext = () => {
    if (selectedMethod) {
      if (selectedMethod === 'upload') {
        router.push('/payments/create-payment/file-upload' as any);
      } else {
        router.push('/payments/create-payment/type' as any);
      }
    }
  };
 
  const handleCancel = () => {
    router.push('/payments' as any);
  };
 
  const creationOptions: CardSelectionOption[] = [
    {
      value: 'domestic',
      label: t('createDomesticPayment'),
      description: t('createDomesticPaymentDescription'),
      icon:FormFillIcon,
      iconSelected: CreateManuallyIcon
    },
    {
      value: 'international',
      label: t('createInternationalPayment'),
      description: t('createInternationalPaymentDescription'),
      icon:ViewListIcon,
      iconSelected: ViewListIconWhite

    },
    {
      value: 'upload',
      label: t('fileUpload'),
      description: t('fileUploadDescription'),
      icon:UploadIcon,
      iconSelected: UploadIconWhite

    },
  ];
 
  return (
    <Grid
      container
      spacing={2}
      className={styles.pageContainer}
      data-testid={`${testIdPrefix}-page`}
    >
      <Grid size={12}>
        <div data-testid={`${testIdPrefix}-breadcrumb`} style={{ display: 'contents' }} />
        <Breadcrumb
          links={[
            { href: '/', label: t('dashboard') },
            { href: '/payments', label: t('payments') },
            { href: '/payments/create-payment', label: t('selectCreationMethod') },
          ]}
        />
      </Grid>
 
      <Grid size={12}>
        <Heading as="h4" fontSize="28px" data-testid={`${testIdPrefix}-title`}>
          {t('paymentCreation')}
        </Heading>
        <p className={styles.subtitle} data-testid={`${testIdPrefix}-description`}>
          {t('supportingCopyOptional')}
        </p>
      </Grid>
 
      <CardSelection
        options={creationOptions}
        selectedValue={selectedMethod}
        onSelect={(method) => handleSelect(method as CreationMethod)}
        testIdPrefix={`${testIdPrefix}-options`}
      />
 
      <Grid sx={{ width: '100%' }}>
        <FormActionButtons
          testIdPrefix={`${testIdPrefix}-actions`}
          onCancel={handleCancel}
          onNext={handleNext}
          nextText={t('next').toUpperCase()}
          disableNext={!selectedMethod}
        />
      </Grid>
    </Grid>
  );
}
 
 