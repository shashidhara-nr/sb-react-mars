
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import {
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { Breadcrumb } from 'dist/standard-bank-react';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { AvatarAlert } from 'lib/icons';
import { useTranslations } from 'next-intl';
import { type PaymentTypeFormState, FileUploadOptions, type FileUploadOptionsState, StatementReferencingOptions, type StatementReferencingState, HostToHostOptions, type HostToHostOptionsState, UnpaidProcessingOptions, type UnpaidProcessingState, FormFooterActions } from 'components/molecules';
import PaymentTypeFormWrapper from '@molecules/PaymentTypeForm/PaymentTypeFormWrapper';
import CustomerAgreementWrapper from '@molecules/CustomerAgreement/CustomerAgreementWrapper';
import { paymentTypeSchema } from '@molecules/PaymentTypeForm/PaymentTypeForm';
import { hostToHostOptionsSchema } from '@molecules/HostToHostOptions/HostToHostOptions';
import { statementReferencingSchema } from '@molecules/StatementReferencingOptions/StatementReferencingOptions';
import { AppDispatch } from '@store/index';
import {
  saveForm as savePaymentTypeForm,
  saveFileUploadOptions,
  saveStatementReferencing,
  saveHostToHostOptions,
  saveUnpaidProcessing,
  resetCreatePaymentType,
  createPaymentType,
} from '@store/slices/createPaymentTypeSlice';
import { fetchPaymentTypeAccounts } from '@store/slices/setup-admin/commonSlice/agreementAccountSlice';
import { buildTestId } from 'src/utils/testIds';
import { navlinks } from '../paymentTypesHelper';
import { fetchCustomerAgreement } from '@store/slices/setup-admin/commonSlice/customerAgreementSlice';
import { 
  fetchUnpaidProcessingOptions, 
  selectUnpaidProcessingOptions,
  selectUnpaidOptionsLoading 
} from '@store/slices/paymentTypesSlice';
import { fetchStatementReferences } from '@store/slices/statementReferenceSlice';
import { transformToPaymentTypeRequest } from './createPaymentHelper';

// Initial default values for form state
const INITIAL_FORM: PaymentTypeFormState = {
  name: '',
  authorisationProfile: null,
  allowAdHoc: true,
  currency: 'ZAR',
  adHocLimit: '',
  payAlertsAllowed: false,
  hostToHostDefault: false,
};

const INITIAL_FILE_UPLOAD: FileUploadOptionsState = {
  errorRejection: 'rejectBatch',
  cutoffBreach: 'rejectBatch',
  posting: 'consolidated',
  allowEditingAfterUpload: false,
};

const INITIAL_STATEMENT_REFERENCING: StatementReferencingState = {
  creditItemised: {
    selected: false,
    references: [],
    editableReference: false,
  },
  debitItemised: {
    selected: false,
    references: [],
    editableReference: false,
  },
  debitConsolidated: {
    selected: false,
    references: [],
    editableReference: false,
  },
  creditConsolidated: {
    selected: true,
    references: [],
    editableReference: false,
  },
};

const INITIAL_HOST_TO_HOST: HostToHostOptionsState = {
  batchErrorRejection: 'rejectBatch',
  cutoffBreach: 'rejectBatch',
  allowEditingAfterUpload: false,
  defaultFundingOption: 'Populated',
};

const INITIAL_UNPAID_PROCESSING: UnpaidProcessingState = {
  unpaidOptionName: 'Populated',
  rows: [],
};

export default function CreatePaymentTypePage() {
  const testIdPrefix = 'payment-types-create';
  const router = useRouter();
  const t = useTranslations('paymenttypes');
  const dispatch = useAppDispatch();

  // Initialize with default values since we reset on mount
  const [form, setForm] = React.useState<PaymentTypeFormState>(INITIAL_FORM);
  const [fileUploadOptions, setFileUploadOptions] = React.useState<FileUploadOptionsState>(INITIAL_FILE_UPLOAD);
  const [statementReferencing, setStatementReferencing] = React.useState<StatementReferencingState>(INITIAL_STATEMENT_REFERENCING);
  const [hostToHostOptions, setHostToHostOptions] = React.useState<HostToHostOptionsState>(INITIAL_HOST_TO_HOST);
  const [unpaidProcessing, setUnpaidProcessing] = React.useState<UnpaidProcessingState>(INITIAL_UNPAID_PROCESSING);
  const [customerAgreement, setCustomerAgreement] = React.useState<{ agreementId: string; agreementName: string; accountId: string; accountsBatch: any[] }>({ agreementId: '', agreementName: '', accountId: '', accountsBatch: [] });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [createSuccess, setCreateSuccess] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [agreementError, setAgreementError] = React.useState<string | null>(null);
  const [reviewMode, setReviewMode] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<{ ok?: boolean; message?: string }>({});
  const [hostToHostHasError, setHostToHostHasError] = React.useState(false);
  const [statementRefHasError, setStatementRefHasError] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  // Fetch unpaid processing options from Redux store
  const unpaidOptionsFromStore = useAppSelector(selectUnpaidProcessingOptions);
  const unpaidOptionsLoading = useAppSelector(selectUnpaidOptionsLoading);
  
  // Fetch statement reference options from Redux store
  const statementRefData = useAppSelector((state) => state.statementReference);
  
  // Helper function to get codes for a specific statement referencing type
  const getCodesForType = (statementRefType: string, postingOption: string) => {
    if (!statementRefData?.data?.statementReferenceTypes) return [];
    
    const matchingType = statementRefData.data.statementReferenceTypes.find(
      (type: any) => 
        type.statementReferenceType === statementRefType && 
        type.postingOption === postingOption
    );
    
    return matchingType?.allowedCodes?.map((code: any) => code.code) || [];
  };
  
  // Get appropriate presets based on each statement referencing type
  const statementRefPresetsMap = React.useMemo(() => ({
    creditConsolidated: getCodesForType('Credit reference', 'Consolidated'),
    debitConsolidated: getCodesForType('Debit reference', 'Consolidated'),
    debitItemised: getCodesForType('Debit reference', 'Itemized'),
  }), [statementRefData?.data?.statementReferenceTypes]);
  
console.log('Statement Reference Presets Map:', statementRefPresetsMap);
  // Map API data to dropdown options (extract names)
  const unpaidDropdownOptions = React.useMemo(() => {
    if (unpaidOptionsFromStore && unpaidOptionsFromStore.length > 0) {
      // Return full objects with key and name
      return unpaidOptionsFromStore.map(option => ({
        unpaidOptionKey: option.unpaidOptionKey,
        unpaidOptionName: option.unpaidOptionName
      }));
    }
    // Default to 'Populated' as string for backward compatibility
    return ['Populated'];
  }, [unpaidOptionsFromStore]);

  // Map API data to table rows
  const unpaidRowsFromApi = React.useMemo(() => {
    if (unpaidOptionsFromStore && unpaidOptionsFromStore.length > 0) {
      return unpaidOptionsFromStore.map((option, index) => ({
        id: option.unpaidOptionKey,
        name: option.unpaidOptionName,
        onUs: option.onUsOption as 'Itemised' | 'Consolidated',
        offUs: option.offUsOption as 'Itemised' | 'Consolidated',
      }));
    }
    return undefined;
  }, [unpaidOptionsFromStore]);

   // Clear persisted data on page load/refresh
   React.useEffect(() => {
      dispatch(resetCreatePaymentType());
    }, [dispatch]);

   React.useEffect(() => {
      dispatch(fetchCustomerAgreement({ service: 'ThirdPartyPayment' }));
      // Fetch unpaid processing options
      dispatch(fetchUnpaidProcessingOptions());
    }, [dispatch]);

  // Update unpaidProcessing state when API data is loaded
  React.useEffect(() => {
    if (unpaidRowsFromApi && unpaidRowsFromApi.length > 0 && unpaidOptionsFromStore && unpaidOptionsFromStore.length > 0) {
      setUnpaidProcessing(prev => ({
        // If previous value is 'Populated' (string), use the first option's key; otherwise keep the key
        unpaidOptionName: prev.unpaidOptionName === 'Populated' ? unpaidOptionsFromStore[0].unpaidOptionKey : prev.unpaidOptionName,
        rows: unpaidRowsFromApi,
      }));
    }
  }, [unpaidRowsFromApi, unpaidOptionsFromStore]);

  // Fetch statement reference options when agreement and account are selected
  React.useEffect(() => {
    if (customerAgreement.agreementId && customerAgreement.accountId && customerAgreement.accountsBatch.length > 0) {
      const accountKeys = customerAgreement.accountsBatch
        .map((acc: any) => acc.accountKey || acc.id)
        .join(',');
      
      dispatch(fetchStatementReferences({
        agreementKey: customerAgreement.agreementId,
        accountKeys: accountKeys,
        instrumentClassification: 'Payment',
      }));
    }
  }, [customerAgreement.agreementId, customerAgreement.accountId, customerAgreement.accountsBatch, dispatch]);

  // Handle successful creation - redirect to success page
  React.useEffect(() => {
    if (createSuccess) {
      router.push(`${navlinks.success}?mode=create` as any);
    }
  }, [createSuccess, router]);

  // Update status based on create error
  React.useEffect(() => {
    if (createError) {
      setErrorMessage(createError);
      setErrorDialogOpen(true);
      setStatus({ ok: false, message: createError });
      setSubmitting(false);
    }
  }, [createError]);

  const handleErrorDismiss = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
    setCreateError(null);
  };

  const handleErrorRetry = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
    setCreateError(null);
    // Trigger form submission again
    void handleSubmitPaymentType(form);
  };

  const handleFormChange = (newForm: PaymentTypeFormState) => {
    setForm(newForm);
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    setCancelDialogOpen(false);
    router.push('/setup-and-admin/payment-types?cancelled=true');
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
  };
  const onAgreementChange = (agreementId: string, agreementName?: string) => {
     if (agreementId) {
          dispatch(fetchPaymentTypeAccounts({ agreementKey: agreementId }));
          setCustomerAgreement(prev => ({ ...prev, agreementId, agreementName: agreementName || '' }));
    }
     setAgreementError(null);
  }

  const onAccountChange = (accountId: string) => {
    setCustomerAgreement(prev => ({ ...prev, accountId }));
  }

  const onBatchChange = (batch: any[]) => {
    setCustomerAgreement(prev => ({ ...prev, accountsBatch: batch }));
  }
  const handleSaveDraft = async () => {
    setSaving(true);
    setStatus({});

    try {
      const payload = {
        paymentTypeName: form.name.trim(),
        authorisationProfile: form.authorisationProfile,
        allowAdHocBeneficiary: form.allowAdHoc,
        adHocLimit: form.adHocLimit ? Number(form.adHocLimit.replaceAll(',', '')) : null,
        currency: form.currency,
        payAlertsAllowed: form.payAlertsAllowed,
        hostToHostDefault: form.hostToHostDefault,
        fileUploadOptions: fileUploadOptions,
        statementReferencingOptions: statementReferencing,
        hostToHostOptions: hostToHostOptions,
        unpaidProcessingOptions: unpaidProcessing,
        status: 'draft',
      };

      const res = await fetch('/api/payment-types/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.text()) || t('errors.saveDraftFailed'));

      setStatus({ ok: true, message: t('messages.draftSaved') });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.saveDraftFailed');
      setErrorMessage(message);
      setErrorDialogOpen(true);
      setStatus({ ok: false, message });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentType = (data: PaymentTypeFormState) => {
    dispatch(savePaymentTypeForm(data));
  };

  const handleCancelPaymentType = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSaveFileUpload = () => {
    dispatch(saveFileUploadOptions(fileUploadOptions));
  };

  const handleCancelFileUpload = () => {
    setFileUploadOptions(INITIAL_FILE_UPLOAD);
  };

  const handleSaveStatementReferencing = () => {
    dispatch(saveStatementReferencing(statementReferencing));
  };

  const handleCancelStatementReferencing = () => {
    setStatementReferencing(INITIAL_STATEMENT_REFERENCING);
  };

  const handleSaveHostToHost = () => {
    dispatch(saveHostToHostOptions(hostToHostOptions));
  };

  const handleCancelHostToHost = () => {
    setHostToHostOptions(INITIAL_HOST_TO_HOST);
  };

  const handleSaveUnpaidProcessing = () => {
    dispatch(saveUnpaidProcessing(unpaidProcessing));
  };

  const handleCancelUnpaidProcessing = () => {
    setUnpaidProcessing(INITIAL_UNPAID_PROCESSING);
  };

  const handleReviewSubmit = () => {

    const valid = validateAllSections();
    if (!valid) return;

    if (reviewMode) {
      void handleSubmitPaymentType(form);
    } else {
      dispatch(savePaymentTypeForm(form));
      dispatch(saveFileUploadOptions(fileUploadOptions));
      dispatch(saveStatementReferencing(statementReferencing));
      dispatch(saveHostToHostOptions(hostToHostOptions));
      dispatch(saveUnpaidProcessing(unpaidProcessing));
      setReviewMode(true);
    }
  };

  const handleEditSection = (section: string) => {
    // Handle edit section logic if needed
  };

  const validateAllSections = () => {
    let isValid = true;

    setHostToHostHasError(false);
    setStatementRefHasError(false);
    setAgreementError(null);

    const paymentResult = paymentTypeSchema.safeParse(form);
    if (paymentResult.success) {
      setErrors({});
    } else {
      isValid = false;
      const fieldErrors: Record<string, string> = {};
      paymentResult.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
    }

    const hostResult = hostToHostOptionsSchema.safeParse(hostToHostOptions);
    if (!hostResult.success) {
      isValid = false;
      setHostToHostHasError(true);
    }

    const statementResult = statementReferencingSchema.safeParse(statementReferencing);
    if (!statementResult.success) {
      isValid = false;
      setStatementRefHasError(true);
    }
    if (!customerAgreement.agreementId) {
      setAgreementError('Required');
      isValid = false;
    }
    if (isValid) {
      setStatus({});
    } else {
      setStatus({ ok: false, message: '' });
    }

    return isValid;
  };

  async function handleSubmitPaymentType(data: PaymentTypeFormState) {
    setSubmitting(true);
    setStatus({});
    setCreateError(null);
    setErrorDialogOpen(false);
    setErrorMessage('');

    // Transform form data to API request format
    const formattedData = transformToPaymentTypeRequest({
      form: data,
      fileUploadOptions,
      statementReferencing,
      hostToHostOptions,
      unpaidProcessing,
      customerAgreement
    });

   

    try {
      // Dispatch the createPaymentType thunk
      await dispatch(createPaymentType(formattedData as any)).unwrap();
      setCreateSuccess(true);
      // Success navigation is handled by the useEffect hook above
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.createFailed');
      setCreateError(message);
      setErrorMessage(message);
      setErrorDialogOpen(true);
      setStatus({ ok: false, message });
      setSubmitting(false);
    }
  }
  return (
    <Box data-testid={buildTestId(testIdPrefix, 'page')}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Breadcrumb
            links={[
              { href: navlinks.dashboard, label: t('dashboard') },
              { href: navlinks.paymentTypes, label: t('paymentTypesBreadcrumb') },
              { href: navlinks.createPaymentType, label: t('createAPaymentType') },

            ]}
            data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
          />
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box sx={{ mt: 2, mb:2 }} data-testid={buildTestId(testIdPrefix, 'heading')}>
            <Typography variant="h5" fontWeight={400} fontSize={28}>
              {t('createAPaymentType')}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box sx={{ mt: 4 }} data-testid={buildTestId(testIdPrefix, 'payment-type-details-section')}>
            <PaymentTypeFormWrapper
              form={form}
              errors={errors}
              submitting={submitting}
              onFormChange={handleFormChange}
              status={status}
              initialMode="create"
              reviewMode={reviewMode}
              onSave={handleSavePaymentType}
              onCancel={handleCancelPaymentType}
            />
          </Box>
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box sx={{ mt: 1 }} data-testid={buildTestId(testIdPrefix, 'customer-agreement-section')}>
            <CustomerAgreementWrapper
              initialMode="create"
              reviewMode={reviewMode}
              onAgreementChange={onAgreementChange}
              onAccountChange={onAccountChange}
              onBatchChange={onBatchChange}
              agreementError={agreementError}
            />
          </Box>
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box sx={{ mt: 1 }} data-testid={buildTestId(testIdPrefix, 'file-upload-options-section')}>
            <FileUploadOptions
              value={fileUploadOptions}
              onChange={setFileUploadOptions}
              disabled={submitting}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('fileUpload')}
              onSave={handleSaveFileUpload}
              onCancel={handleCancelFileUpload}
               expandIcon={true}
            />
          </Box>
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box sx={{ mt: 1 }} data-testid={buildTestId(testIdPrefix, 'statement-referencing-section')}>
            <StatementReferencingOptions
              mode="payment-types"
              value={statementReferencing}
              onChange={setStatementReferencing}
              disabled={submitting || statementRefData?.loading}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('statementReferencing')}
              onSave={handleSaveStatementReferencing}
              onCancel={handleCancelStatementReferencing}
              hasError={statementRefHasError}
              expandIcon={true}
              presets={statementRefPresetsMap}
            />
          </Box>
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box sx={{ mt: 1 }} data-testid={buildTestId(testIdPrefix, 'host-to-host-options-section')}>
            <HostToHostOptions
              value={hostToHostOptions}
              onChange={setHostToHostOptions}
              disabled={submitting}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('hostToHost')}
              onSave={handleSaveHostToHost}
              onCancel={handleCancelHostToHost}
              hasError={hostToHostHasError}
            />
          </Box>
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box sx={{ mt: 1, border: 'none' }} data-testid={buildTestId(testIdPrefix, 'unpaid-processing-section')}>
            <UnpaidProcessingOptions
              value={unpaidProcessing}
              onChange={setUnpaidProcessing}
              disabled={submitting}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('unpaidProcessing')}
              onSave={handleSaveUnpaidProcessing}
              onCancel={handleCancelUnpaidProcessing}
              unpaidOptions={unpaidDropdownOptions}
              loading={unpaidOptionsLoading}
            />
          </Box>
        </Grid>
        <Grid size={{xs:12, md:12}}>
          <Box data-testid={buildTestId(testIdPrefix, 'footer-actions')}>
          <FormFooterActions
            onCancel={handleCancel}
            onSaveDraft={handleSaveDraft}
            onReviewSubmit={handleReviewSubmit}
            disabled={false}
            saving={saving}
            submitting={submitting}
            reviewMode={reviewMode}
            labels={{
              cancel: t('cancelLabel'),
              save: t('saveToDrafts'),
              submit: reviewMode ? t('submitPaymentTypeForApproval') : t('reviewAndSubmit'),
            }}
          />
          </Box>
          <CancellationConfirmationDialog
            open={cancelDialogOpen}
            onClose={handleCancelClose}
            onDismiss={handleCancelClose}
            onCancel={handleCancelConfirm}
            onSaveToDrafts={handleSaveDraft}
            title={t('cancellationConfirmation')}
            heading={t('areYouSureCancel')}
            subheading={t('unsavedDataLost')}
            dismissLabel={t('dismiss')}
            saveLabel={t('saveToDrafts')}
            cancelLabel={t('cancelLabel')}
            busy={submitting || saving}
            testIdPrefix={buildTestId(testIdPrefix, 'cancel-confirmation-dialog')}
          />
          <DeleteConfirmationDialog
            open={errorDialogOpen}
            onClose={handleErrorDismiss}
            onPrimaryCTA={handleErrorRetry}
            onSecondaryCTA={handleErrorDismiss}
            selectedCount={0}
            exclamationIcon={AvatarAlert}
            itemLabel=""
            itemLabel2={errorMessage || t('errors.unableToProcessRequest')}
            itemLabel3={t('errors.tryAgainOrContact')}
            markedCount={undefined}
            showUndoWarning={true}
            title={t('errors.systemError')}
            name={t('errors.somethingWentWrong')}
            messageFontWeight={700}
            primaryCTALabel={t('errors.tryAgain')}
            secondaryCTALabel={t('errors.dismiss')}
            secondaryCTAWidth="auto"
            tertiaryCTAWidth="auto"
            testIdPrefix={buildTestId(testIdPrefix, 'system-error-dialog')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
