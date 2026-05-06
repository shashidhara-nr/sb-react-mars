'use client';
 
import React from 'react';
import { useRouter } from 'next/navigation';
import { Grid } from '@mui/material';
import CreateManuallyIcon from 'public/icons/icn_form_fill_white.svg';
import FormFillIcon from 'public/icons/icn_form_fill.svg';
import UploadIcon from 'public/icons/icn_upload.svg';
import UploadIconWhite from 'public/icons/icn_upload_white.svg';
import { useTranslations } from 'next-intl';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import FormActionButtons from 'components/common/formActionButtons';
import styles from './CreateCollectionPage.module.scss';
 
type CreationMethod = 'domestic' | 'international' | 'upload';
 
export default function CreatePaymentPage() {
  const testIdPrefix = 'collectionfileupload-create-method';
  const router = useRouter();
  const t = useTranslations('collectionsfileupload');
  const [selectedMethod, setSelectedMethod] = React.useState<CreationMethod | null>(null);
 
  const handleSelect = (method: CreationMethod) => {
    setSelectedMethod(method);
  };
 
  const handleNext = () => {
    if (selectedMethod) {
      if (selectedMethod === 'upload') {
        router.push('/collection-fileupload/create-collection/file-upload' as any);
      } else {
        router.push('/collection-fileupload/create-collection/type' as any);
      }
    }
  };
 
  const handleCancel = () => {
    router.push('/collection-fileupload' as any);
  };
 
  const creationOptions: CardSelectionOption[] = [
    {
      value: 'domestic',
      label: t('titleManualImport'),
      description: t('titleManualImportDescriptions'),
      icon:FormFillIcon,
      iconSelected: CreateManuallyIcon
    },
    
    {
      value: 'upload',
      label: t('fileUploadTitle'),
      description: t('fileUploadTitledescription'),
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
                  { href: '/collection-fileupload', label: t('collectionsfileupload') },
                  { href: '/collection-fileupload/create-collection', label: t('selectCreationMethod') },
                ]}
              />
            </Grid>
 
      <Grid size={12}>
        <Heading as="h4" fontSize="28px" data-testid={`${testIdPrefix}-title`}>
          {t('collectionCreation')}
        </Heading>
        <p className={styles.subtitle} data-testid={`${testIdPrefix}-description`}>
          {t('supportingCopy')}
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
         
        />
      </Grid>
    </Grid>
  );
}
 
 