'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { Box, Typography, Grid } from '@mui/material';
import { Breadcrumb } from 'dist/standard-bank-react';
import CancelConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { AvatarAlert } from 'lib/icons';
import { useTranslations } from 'next-intl';
import {
  CollectionTypeFormWrapper,
  type CollectionTypeFormState,
  FileUploadOptions,
  type FileUploadOptionsState,
  StatementReferencingOptions,
  type StatementReferencingState,
  HostToHostOptions,
  type HostToHostOptionsState,
  FormFooterActions,
  CollectionModelOptions,
  type CollectionModelState,
} from 'components/molecules';
import CollectionTypeLogic from 'utils/collectionTypeLogic'; // Import the new logic and schema
import CustomerAgreementWrapper from '@molecules/CustomerAgreement/CustomerAgreementWrapper';
// Use collection type schema instead of payment type
import { hostToHostOptionsSchema } from '@molecules/HostToHostOptions/HostToHostOptions';
import { statementReferencingSchema } from '@molecules/StatementReferencingOptions/StatementReferencingOptions';
import { collectionModelSchema } from '@molecules/CollectionModelOptions/CollectionModelOptions';
import { RootState, AppDispatch } from '@store/index';
import {
  saveForm as saveCollectionForm,
  saveFileUploadOptions,
  saveStatementReferencing,
  saveHostToHostOptions,
  saveCollectionModel,
  saveCustomerAgreement,
  resetCreateCollectionType,
  createCollectionType,
} from '@store/slices/createCollectionTypeSlice';
import { fetchCollectionTypes } from '@store/slices/collectionTypesSlice';
import { fetchCollectionTypeAccounts } from '@store/slices/setup-admin/commonSlice/agreementAccountSlice';
import { buildTestId } from 'src/utils/testIds';
import { fetchCustomerAgreement } from '@store/slices/setup-admin/commonSlice/customerAgreementSlice';
import { fetchStatementReferences } from '@store/slices/statementReferenceSlice';
import { getCreateBreadcrumbLinks, navlinks } from '../collectionTypesHelper';
import { prepareCollectionTypePayload } from '@lib/transformers/collectionTypesTransformers';

export default function CreateCollectionTypePage() {
  const testIdPrefix = 'collection-types-create';
  const router = useRouter();
  const translateLang = useTranslations('collectionTypesHubData');
  const dispatch = useAppDispatch();
  const persisted = useAppSelector((state) => state.createCollectionType);
  const { accounts: accountList } = useAppSelector((state) => state.agreementAccount);
  const { data: agreementList } = useAppSelector((state) => state.customerAgreement);

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
    creditItemised: getCodesForType('Credit reference', 'Itemized'),
  }), [statementRefData?.data?.statementReferenceTypes]);

  const [form, setForm] = React.useState<CollectionTypeFormState>({
    name: '',
    authorisationProfile: null,
    allowAdHoc: false,
    hostToHostDefault: false,
    currency: 'ZAR',
    adHocLimit: '',
    enforceAuditing: false,
    auditReportType: undefined,
  });
  const [fileUploadOptions, setFileUploadOptions] = React.useState<FileUploadOptionsState>({
    errorRejection: 'rejectBatch',
    cutoffBreach: 'rejectBatch',
    posting: 'consolidated',
    allowEditingAfterUpload: false,
  });
  const [statementReferencing, setStatementReferencing] = React.useState<StatementReferencingState>({
    creditItemised: {
      selected: false,
      references: [],
      editableReference: false,
    },
    creditConsolidated: {
      selected: false,
      references: [],
      editableReference: false,
    },
    debitItemised: {
      selected: true,
      references: [],
      editableReference: false,
    },
    debitConsolidated: {
      selected: false,
      references: [],
      editableReference: false
    }
  });
  const [hostToHostOptions, setHostToHostOptions] = React.useState<HostToHostOptionsState>({
    batchErrorRejection: 'rejectBatch',
    cutoffBreach: 'rejectBatch',
    allowEditingAfterUpload: false,
    defaultFundingOption: 'Populated',
  });
  const [collectionModel, setCollectionModel] = React.useState<CollectionModelState>({
    countryOrRegion: '',
    fixedDateValue: false,
    upfrontValue: false,
    valueOfSuccess: false,
    defaultSource: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [reviewMode, setReviewMode] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<{ ok?: boolean; message?: string }>({});
  const [hostToHostHasError, setHostToHostHasError] = React.useState(false);
  const [statementRefHasError, setStatementRefHasError] = React.useState(false);
  const [collectionModelHasError, setCollectionModelHasError] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [createSuccess, setCreateSuccess] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const [customerAgreementId, setCustomerAgreementId] = React.useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>('');
  const [agreementError, setAgreementError] = React.useState<string | null>(null);
  const [accountError, setAccountError] = React.useState<string | null>(null);

  React.useEffect(() => {
    dispatch(resetCreateCollectionType());
  }, [dispatch]);
  React.useEffect(() => {
        dispatch(fetchCustomerAgreement({ service: 'InterAccountTransfer' }));
  }, [dispatch]);
  
  React.useEffect(() => {
    if (createSuccess) {
      dispatch(fetchCollectionTypes());
      router.push(navlinks.successCollectionType as any);
    }
  }, [createSuccess, router, dispatch]);

  React.useEffect(() => {
    if (createError) {
      setErrorMessage(createError);
      setErrorDialogOpen(true);
      setStatus({ ok: false, message: createError });
      setSubmitting(false);
    }
  }, [createError]);
  
  React.useEffect(() => {
    if (customerAgreementId && selectedAccountId) {
      dispatch(fetchStatementReferences({
        agreementKey: customerAgreementId,
        accountKeys: selectedAccountId,
        instrumentClassification: 'Collection',
      }));
    }
  }, [customerAgreementId, selectedAccountId, dispatch]);
  
  const selectedAccount = React.useMemo(() => {
    if (!selectedAccountId || !accountList || accountList.length === 0) return null;
    return accountList.find(acc => acc.accountKey.toString() === selectedAccountId) || null;
  }, [selectedAccountId, accountList]);

  const handleFormChange = (newForm: CollectionTypeFormState) => {
    setForm(newForm);
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    setCancelDialogOpen(false);
    window.history.back();
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
  };

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
    void handleSubmitCollectionType(form);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setStatus({});

    try {
      const payload = {
        collectionTypeName: form.name.trim(),
        authorisationProfile: form.authorisationProfile,
        allowAdHocBeneficiary: form.allowAdHoc,
        hostToHostDefault: form.hostToHostDefault,
        currency: form.currency,
        adHocLimit: form.adHocLimit ? Number(form.adHocLimit.replace(/,/g, '')) : null,
        fileUploadOptions: fileUploadOptions,
        statementReferencingOptions: statementReferencing,
        hostToHostOptions: hostToHostOptions,
        collectionModel: collectionModel,
        status: 'draft',
      };

      const res = await fetch('/api/collection-types/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.text()) || translateLang('failedToSaveDraft'));

      setStatus({ ok: true, message: translateLang('draftSavedSuccessfully') });
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message ?? translateLang('failedToSaveDraft') });
    } finally {
      setSaving(false);
    }
  };

  // Section-level save handlers (commit to Redux)
  const handleSavePaymentType = (data: CollectionTypeFormState) => {
    dispatch(saveCollectionForm(data));
  };

  const handleCancelPaymentType = () => {
    setForm(persisted.form);
    setErrors({});
  };

  const handleSaveFileUpload = () => {
    dispatch(saveFileUploadOptions(fileUploadOptions));
  };

  const handleCancelFileUpload = () => {
    setFileUploadOptions(persisted.fileUploadOptions);
  };

  const handleSaveStatementReferencing = () => {
    dispatch(saveStatementReferencing(statementReferencing));
  };

  const handleCancelStatementReferencing = () => {
    setStatementReferencing(persisted.statementReferencing);
  };

  const handleSaveHostToHost = () => {
    dispatch(saveHostToHostOptions(hostToHostOptions));
  };

  const handleCancelHostToHost = () => {
    setHostToHostOptions(persisted.hostToHostOptions);
  };

  const handleSaveCollectionModel = () => {
    dispatch(saveCollectionModel(collectionModel));
  };

  const handleCancelCollectionModel = () => {
    setCollectionModel(persisted.collectionModel);
  };

  const handleCollectionModelChange = (model: CollectionModelState) => {
    setCollectionModel(model);
    if (collectionModelHasError && model.defaultSource) {
      setCollectionModelHasError(false);
    }
  };

  const handleAgreementChange = (agreementId: string) => {
    setCustomerAgreementId(agreementId);
    if (agreementError) setAgreementError(null);
    
    if (agreementId) {
      dispatch(fetchCollectionTypeAccounts({ agreementKey: agreementId }));
    }
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    if (accountError) setAccountError(null);
  };

  const handleReviewSubmit = () => {
    console.log('handleReviewSubmit called, reviewMode:', reviewMode);
    console.log('Form data:', { form, statementReferencing, hostToHostOptions });
    
    // Run centralized validation for all sections before progressing
    const valid = validateAllSections();
    console.log('Validation result:', valid);
    
    if (!valid) {
      console.log('Validation failed, stopping submission');
      return;
    }

    if (!reviewMode) {
      // First click: persist current data into Redux and enable review mode
      console.log('Entering review mode');
      dispatch(saveCollectionForm(form));
      dispatch(saveFileUploadOptions(fileUploadOptions));
      dispatch(saveStatementReferencing(statementReferencing));
      dispatch(saveHostToHostOptions(hostToHostOptions));
      dispatch(saveCollectionModel(collectionModel));
      dispatch(saveCustomerAgreement({ customerAgreementId, selectedAccountId }));
      setReviewMode(true);
    } else {
      // Second click: submit current form data directly and redirect to success
      console.log('Submitting form');
      handleSubmitCollectionType(form);
    }
  };

  const handleEditSection = (section: string) => {
    // Handle edit action for specific section
    console.log(`Edit section: ${section}`);
  };

  const validateAllSections = () => {
    let isValid = true;

    // reset section error flags
    setHostToHostHasError(false);
    setStatementRefHasError(false);
    setCollectionModelHasError(false);
    setAgreementError(null);
    setAccountError(null);

    // Ensure statement referencing has proper structure
    const normalizedStatementReferencing = {
      creditItemised: {
        selected: statementReferencing.creditItemised?.selected ?? false,
        references: statementReferencing.creditItemised?.references ?? [],
        editableReference: statementReferencing.creditItemised?.editableReference ?? false,
      },
      creditConsolidated: {
        selected: statementReferencing.creditConsolidated?.selected ?? false,
        references: statementReferencing.creditConsolidated?.references ?? [],
        editableReference: statementReferencing.creditConsolidated?.editableReference ?? false,
      },
      debitItemised: {
        selected: statementReferencing.debitItemised?.selected ?? false,
        references: statementReferencing.debitItemised?.references ?? [],
        editableReference: statementReferencing.debitItemised?.editableReference ?? false,
      },
    };

    // Validate collection type details using new logic
    console.log('Form data before validation:', form);
    const result = CollectionTypeLogic.collectionTypeZodSchema.safeParse(form);
    if (!result.success) {
      isValid = false;
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue: { path: any[]; message: string; }) => {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      console.log('Collection Type validation failed:', result.error.issues);
    } else {
      setErrors({});
    }

    // Validate host-to-host options
    const hostResult = hostToHostOptionsSchema.safeParse(hostToHostOptions);
    if (!hostResult.success) {
      isValid = false;
      setHostToHostHasError(true);
      console.log('Host to Host validation failed:', hostResult.error.issues);
    }

    // Validate statement referencing options with normalized data
    const statementResult = statementReferencingSchema.safeParse(normalizedStatementReferencing);
    if (!statementResult.success) {
      isValid = false;
      setStatementRefHasError(true);
      console.log('Statement Referencing validation failed:', statementResult.error.issues);
    }

    const collectionModelResult = collectionModelSchema.safeParse(collectionModel);
    if (!collectionModelResult.success) {
      isValid = false;
      setCollectionModelHasError(true);
    }

    // Validate customer agreement
    if (!customerAgreementId) {
      isValid = false;
      setAgreementError(translateLang('pleaseSelectCustomerAgreement'));
    }
    if (!selectedAccountId) {
      isValid = false;
      setAccountError(translateLang('pleaseSelectAnAccount'));
    }

    return isValid;
  };

  async function handleSubmitCollectionType(data: CollectionTypeFormState) {
    setSubmitting(true);
    setStatus({});
    setCreateError(null);
    setErrorDialogOpen(false);
    setErrorMessage('');

    try {
      const selectedAgreement = agreementList.find(a => a.id === customerAgreementId);
      const agreementName = selectedAgreement?.label || '';

      const payload = prepareCollectionTypePayload({
        form: data,
        fileUploadOptions,
        statementReferencing,
        hostToHostOptions,
        collectionModel,
        customerAgreementId,
        selectedAccountId,
        agreementName,
        action: 'CREATE',
      });


      await dispatch(createCollectionType(payload) as any).unwrap();
      setCreateSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : translateLang('somethingWentWrong');
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
            links={getCreateBreadcrumbLinks(translateLang)}
            data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2, mb: 2 }} data-testid={buildTestId(testIdPrefix, 'heading')}>
            <Typography variant="h5" fontWeight={400} fontSize={28}>
              {translateLang('titleCreate')}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 4 }} data-testid={buildTestId(testIdPrefix, 'collection-type-details-section')}>
            <CollectionTypeFormWrapper
              form={form}
              errors={errors}
              submitting={submitting}
              onFormChange={handleFormChange}
              status={status}
              initialMode="create"
              reviewMode={reviewMode}
              onSave={handleSavePaymentType}
              onCancel={handleCancelPaymentType}
              onValidSubmit={handleSubmitCollectionType}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'customer-agreement-section')}>
            <CustomerAgreementWrapper 
              initialMode="create" 
              reviewMode={reviewMode} 
              showAssociatedAccounts={false} 
              useBranchCountry={true}
              initialAgreementId={customerAgreementId}
              initialSelectedAccountId={selectedAccountId}
              onAgreementChange={handleAgreementChange}
              onAccountChange={handleAccountChange}
              agreementError={agreementError}
              accountError={accountError}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'file-upload-options-section')}>
            <FileUploadOptions
              value={fileUploadOptions}
              onChange={setFileUploadOptions}
              disabled={submitting}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('fileUpload')}
              onSave={handleSaveFileUpload}
              onCancel={handleCancelFileUpload}
              hidePostingOptions={true}
              hideAllowEditing={false}
              expandIcon={false}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'statement-referencing-section')}>
            <StatementReferencingOptions
              mode="collection-types"
              value={statementReferencing}
              onChange={setStatementReferencing}
              disabled={submitting}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('statementReferencing')}
              onSave={handleSaveStatementReferencing}
              onCancel={handleCancelStatementReferencing}
              hasError={statementRefHasError}
              expandIcon={false}
              presets={statementRefPresetsMap}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'host-to-host-options-section')}>
            <HostToHostOptions
              value={hostToHostOptions}
              onChange={setHostToHostOptions}
              disabled={submitting}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('hostToHost')}
              onSave={handleSaveHostToHost}
              onCancel={handleCancelHostToHost}
              hasError={hostToHostHasError}
              hideAllowEditingAfterUpload={false}
              hideDefaultFundingOption={true}
              expandIcon={false}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2, border: 'none' }} data-testid={buildTestId(testIdPrefix, 'collection-model-section')}>
            <CollectionModelOptions
              value={collectionModel}
              onChange={handleCollectionModelChange}
              disabled={submitting}
              reviewMode={reviewMode}
              onEdit={() => handleEditSection('collectionModel')}
              onSave={handleSaveCollectionModel}
              onCancel={handleCancelCollectionModel}
              selectedAccount={selectedAccount as any}
              hasError={collectionModelHasError}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
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
                cancel: translateLang('cancel'),
                save: translateLang('saveToDrafts'),
                submit: reviewMode ? translateLang('submitCollectionTypeForApproval') : translateLang('reviewAndSubmit'),
              }}
            />
          </Box>
          <CancelConfirmationDialog
            open={cancelDialogOpen}
            onClose={handleCancelClose}
            onDismiss={handleCancelClose}
            onCancel={handleCancelConfirm}
            onSaveToDrafts={handleSaveDraft}
            title={translateLang('cancellationConfirmation')}
            heading={translateLang('areYouSureYouWantToCancel')}
            subheading={translateLang('anyUnsavedDataWillBeLost')}
            dismissLabel={translateLang('dismiss')}
            saveLabel={translateLang('saveToDrafts')}
            cancelLabel={translateLang('cancel')}
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
            itemLabel2={errorMessage || translateLang('somethingWentWrong')}
            itemLabel3={translateLang('pleaseCheckAndTryAgain')}
            markedCount={undefined}
            showUndoWarning={true}
            title={translateLang('errorOccurred')}
            name={translateLang('somethingWentWrong')}
            messageFontWeight={700}
            primaryCTALabel={translateLang('retry')}
            secondaryCTALabel={translateLang('dismiss')}
            secondaryCTAWidth="auto"
            tertiaryCTAWidth="auto"
            testIdPrefix={buildTestId(testIdPrefix, 'error-dialog')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
