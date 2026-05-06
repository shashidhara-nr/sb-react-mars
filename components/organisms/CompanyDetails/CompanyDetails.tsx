'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import styles from './CompanyDetails.module.scss';
import { Button, Grid } from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import JournyForm from 'components/common/JournyForm';
import { useForm } from 'react-hook-form';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import { Icon } from '@atoms/index';
import { DownloadIcon, RightArrow } from 'lib/icons';
import {
  buildCompanyAddressFields,
  buildCompanyCommunicationFields,
  buildCompanyFields,
  buildCompanyPasswordRenewalScheduleFields,
  buildCompanyPostalAddressFields,
} from 'src/utils/company';
import CompanyDetailsSuccess from 'components/organisms/CompanyDetailsSuccess/CompanyDetailsSuccess';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import DownloadCompanyDetailsDialog from 'components/molecules/DownloadCompanyDetailsDialog/DownloadCompanyDetailsDialog';
import CommonSnackbar from 'components/common/CommonSnackbar';
import Image from 'next/image';

const CompanyDetails = () => {
  const router = useRouter();
  const t = useTranslations('companyDetails');
  const companyDetails = useSelector((state: RootState) => state.companyDetails);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  const [editingCompanySection, setEditingCompanySection] = useState<number | null>(null);
  const [editingPasswordSection, setEditingPasswordSection] = useState<number | null>(null);
  const [pendingCancelForm, setPendingCancelForm] = useState<'company' | 'password' | null>(null);
  const [pendingCancelSection, setPendingCancelSection] = useState<number | null>(null);
  const [hasSavedChanges, setHasSavedChanges] = useState(false);
  const [preEditValues, setPreEditValues] = useState<any>(null);
  const [showDownloadBtn, setShowDownloadBtn] = useState(false);
  const [usesDifferentPostalAddress, setUsesDifferentPostalAddress] = useState(false);

  const companyFields = useMemo(
    () => buildCompanyFields(t, companyDetails),
    [t, companyDetails],
  );
  const addressFields = useMemo(
    () => buildCompanyAddressFields(t, companyDetails),
    [t, companyDetails],
  );
  const postalAddressFields = useMemo(
    () => buildCompanyPostalAddressFields(t, companyDetails),
    [t, companyDetails],
  );
  const communicationInformationFields = useMemo(
    () => buildCompanyCommunicationFields(t, companyDetails),
    [t, companyDetails],
  );
  const passwordRenewalScheduleFields = useMemo(
    () => buildCompanyPasswordRenewalScheduleFields(t, companyDetails),
    [t, companyDetails],
  );

  const methodsDetails = useForm({ mode: 'onTouched' });

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
    getValues,
    watch,
  } = methodsDetails;

  // Watch the checkbox value to show/hide postal address section
  const checkboxValue = watch('usesDifferentPostalAddress');
  
  useEffect(() => {
    setUsesDifferentPostalAddress(checkboxValue || false);
  }, [checkboxValue]);

  const applyOverrides = (fieldsArr: any[], overrides: Record<string, any>) =>
    fieldsArr.map((f: any) => {
      const nf = { ...f };
      if (Object.prototype.hasOwnProperty.call(overrides, f.name)) {
        nf.value = overrides[f.name];
      }
      return nf;
    });

  const companyFieldsOv = applyOverrides(companyFields, getValues());
  const addressFieldsOv = applyOverrides(addressFields, getValues());
  const postalAddressFieldsOv = applyOverrides(postalAddressFields, getValues());
  const communicationInformationFieldsOv = applyOverrides(
    communicationInformationFields,
    getValues(),
  );
  const passwordRenewalScheduleFieldsOv = applyOverrides(
    passwordRenewalScheduleFields,
    getValues(),
  );

  // Add checkbox for different postal address
  const addressFieldsWithCheckbox = [
    ...addressFieldsOv,
    {
      type: 'checkbox',
      name: 'usesDifferentPostalAddress',
      label: t('selectDifferentPostalAddress'),
    },
  ];

  const breadcrumbLinks = [
    { href: '/', label: t('dashboard') },
    { href: '/company-details', label: t('companyDetails') },
  ];

  const rulesProvider = (fieldName: string, getAllValues: () => any) => {
    return {};
  };

  const saveCompanyDetails = async (data: any) => {
    //console.log('Saving company details:', data);
    if (data.frequency && !data.frequency.includes('days')) {
      data.frequency = `${data.frequency} days`;
    }
    methodsDetails.reset(data);
    setHasSavedChanges(true);
  };

  const handleCancelClick = (sectionIndex: number): boolean => {
    setShowCancelConfirm(true);
    setPreEditValues(methodsDetails.getValues());
    setPendingCancelSection(sectionIndex);
    return false;
  };

  const handleCompanyCancelClick = (sectionIndex: number): boolean => {
    setEditingCompanySection(sectionIndex);
    setShowCancelConfirm(true);
    setPreEditValues(methodsDetails.getValues());
    setPendingCancelForm('company');
    setPendingCancelSection(sectionIndex);
    return false;
  };

  const handlePasswordCancelClick = (sectionIndex: number): boolean => {
    setEditingPasswordSection(sectionIndex);
    setShowCancelConfirm(true);
    setPreEditValues(methodsDetails.getValues());
    setPendingCancelForm('password');
    setPendingCancelSection(sectionIndex);
    return false;
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    if (preEditValues) {
      methodsDetails.reset(preEditValues);
    }
    if (pendingCancelForm === 'company') {
      setEditingCompanySection(null);
    } else if (pendingCancelForm === 'password') {
      setEditingPasswordSection(null);
    }
    setPendingCancelForm(null);
    setPendingCancelSection(null);
    setHasSavedChanges(false);
  };

  const handleRejectCancel = () => {
    setShowCancelConfirm(false);
    setPendingCancelForm(null);
    setPendingCancelSection(null);
  };

  const handleChange = () => {
    // Track form changes if needed for additional state management
  };

  const handleDownloadClick = () => {
    setShowDownloadDialog(true);
  };

  const handleDownloadDialogClose = () => {
    setShowDownloadDialog(false);
  };

  const handleDownloadConfirm = async (payload: { format: 'pdf' | 'csv' | 'txt'; sortBy: 'ascending' | 'descending' }) => {
    setDownloadLoading(true);
    try {
      //console.log('Downloading company details with payload:', payload);

      // Prepare data to download
      const data = {
        'Company Name': (companyDetails as any)?.details?.companyName || 'N/A',
        'Company ID': (companyDetails as any)?.details?.companyId || 'N/A',
        'Registration Number': (companyDetails as any)?.details?.companyRegistrationNumber || 'N/A',
        'Tax Number': (companyDetails as any)?.details?.companyTaxNumber || 'N/A',
        'Reference Currency': (companyDetails as any)?.details?.referenceCurrency || 'N/A',
        'System ID': (companyDetails as any)?.details?.systemId || 'N/A',
      };

      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (payload.format === 'pdf') {
        // Generate file content based on sort order
        const sortedEntries = Object.entries(data);
        if (payload.sortBy === 'descending') {
          sortedEntries.reverse();
        }

        const dataText = sortedEntries
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

        content = dataText;
        mimeType = 'text/plain';
        fileExtension = 'pdf';
      } else if (payload.format === 'csv') {
        // Generate CSV format
        const sortedEntries = Object.entries(data);
        if (payload.sortBy === 'descending') {
          sortedEntries.reverse();
        }

        const headers = sortedEntries.map(([key]) => key).join(',');
        const values = sortedEntries.map(([, value]) => `"${value}"`).join(',');
        content = `${headers}\n${values}`;
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
      } else {
        // Generate TXT format
        const sortedEntries = Object.entries(data);
        if (payload.sortBy === 'descending') {
          sortedEntries.reverse();
        }

        content = sortedEntries
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        mimeType = 'text/plain;charset=utf-8;';
        fileExtension = 'txt';
      }

      const dataBlob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `company-details.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      setSnackbarMessage(t('downloadSuccessful'));
      setSnackbarSeverity('success');
      setShowSnackbar(true);

      setShowDownloadDialog(false);
    } catch (error) {
      //console.error('Error downloading company details:', error);
      setSnackbarMessage(t('downloadUnsuccessful'));
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />

      {showSuccess ? (
        <CompanyDetailsSuccess onViewDetails={() => setShowSuccess(false)} />
      ) : (
        <>
          <Grid size={12} className={styles.headerRow}>
            <Heading as="h4" fontSize="28px">
              {t('companyDetails')}
            </Heading>
          </Grid>

          <JournyForm
            onChange={handleChange}
            onSubmit={saveCompanyDetails}
            mode={editingCompanySection !== null ? "edit" : "review"}
            ShowActionBtns={false}
            renderWithRHF
            formMethods={methodsDetails}
            syncOnChange={false}
            rulesProvider={rulesProvider}
            onBeforeCancel={handleCompanyCancelClick}
            sections={[
              {
                title: t('companyDetails'),
                titleIconEelement: (
                  <Icon name="notes" width="20px" height="20px" bgColor="#222E37" />
                ),
                fields: companyFieldsOv as any,
                ShowActionBtns: true,
                readOnly: true,
              },
              {
                title: t('physicalAddressDetails'),
                titleIconEelement: (
                  <Icon name="locator" width="24px" height="24px" bgColor="#222E37" />
                ),
                fields: addressFieldsWithCheckbox as any,
              },
              ...(usesDifferentPostalAddress ? [{
                title: t('postalAddressDetails'),
                titleIconEelement: (
                  <Icon name="mailBox" width="20px" height="20px" bgColor="#222E37" />
                ),
                fields: postalAddressFieldsOv as any,
              }] : []),
              {
                title: t('communicationInformation'),
                titleIconEelement: (
                  <Icon name="tower" width="24px" height="24px" bgColor="#222E37" />
                ),
                fields: communicationInformationFieldsOv as any,

              },
            ]}
          />

          <JournyForm
            onChange={handleChange}
            onSubmit={saveCompanyDetails}
            mode={editingPasswordSection !== null ? "edit" : "review"}
            ShowActionBtns={false}
            renderWithRHF
            formMethods={methodsDetails}
            syncOnChange={false}
            rulesProvider={rulesProvider}
            onBeforeCancel={handlePasswordCancelClick}
            sections={[
              {
                title: t('passwordRenewalSchedule'),
                titleIconEelement: (
                  <Icon name="passwordReset" width="23px" height="23px" bgColor="#222E37" />
                ),
                fields: passwordRenewalScheduleFieldsOv as any,
                ShowActionBtns: true,
              },
            ]}
          />

          <Grid
            size={12}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              gap: '12px',
            }}
          >
            {showDownloadBtn && hasSavedChanges && <Button
              ref={downloadButtonRef}
              variant="outlined"
              startIcon={<Image src={DownloadIcon} alt="delete" width={24} height={24} />}
              onClick={handleDownloadClick}
              sx={{
                color: '#0051FF',
                borderColor: '#0051FF',
                textTransform: 'uppercase',
                height: '3rem',
                minHeight: '3rem',
                backgroundColor: 'white',
                '&:hover': {
                  borderColor: '#0051FF',
                  backgroundColor: 'rgba(0, 81, 255, 0.04)'
                }
              }}
            >
              {t('downloadLabel')}
            </Button>}
            {hasSavedChanges && !showDownloadBtn && (
              <Button
                variant="contained"
                onClick={handleSubmit((data) => {
                  reset(data);
                  setShowSuccess(true);
                  setHasSavedChanges(false);
                  setShowDownloadBtn(true);
                })}
                startIcon={<Image src={RightArrow} alt="delete" width={24} height={24} />}
              >
                {t('submitChanges')}
              </Button>
            )}
          </Grid>

          <CancellationConfirmationDialog
            open={showCancelConfirm}
            onClose={handleRejectCancel}
            onCancel={handleConfirmCancel}
            onDismiss={handleRejectCancel}
            title={t('cancellationConfirmation')}
            heading={t('sureYouWantToCancel')}
            subheading={t('unsavedChangesWillBeLost')}
            dismissLabel={t('dismiss')}
            cancelLabel={t('yesCancel')}
          />

          <DownloadCompanyDetailsDialog
            open={showDownloadDialog}
            anchorEl={downloadButtonRef.current}
            onClose={handleDownloadDialogClose}
            onDownload={handleDownloadConfirm}
            loading={downloadLoading}
          />

          <CommonSnackbar
            open={showSnackbar}
            message={snackbarMessage}
            severity={snackbarSeverity}
            onClose={() => setShowSnackbar(false)}
            autoHideDuration={3000}
          />
        </>
      )}
    </section>
  );
};

export default CompanyDetails;