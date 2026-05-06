'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import Image from 'next/image';
import { DeleteIcon, AvatarAlert } from 'lib/icons';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { Breadcrumb } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import type { AppDispatch, RootState } from 'store';
import { fetchCustomerAgreement } from '@store/slices/setup-admin/commonSlice/customerAgreementSlice';
import { fetchPaymentTypeAccounts } from '@store/slices/setup-admin/commonSlice/agreementAccountSlice';
import { type PaymentTypeFormState, FileUploadOptions, type FileUploadOptionsState, StatementReferencingOptions, type StatementReferencingState, HostToHostOptions, type HostToHostOptionsState, UnpaidProcessingOptions, type UnpaidProcessingState, FormFooterActions } from 'components/molecules';
import PaymentTypeFormWrapper from '@molecules/PaymentTypeForm/PaymentTypeFormWrapper';
import CustomerAgreementWrapper from '@molecules/CustomerAgreement/CustomerAgreementWrapper';
import { buildTestId } from 'src/utils/testIds';
import {
  fetchPaymentTypeDetails,
  selectPaymentDetails,
  selectPaymentDetailsLoading,
  selectPaymentDetailsError,
  resetPaymentDetails,
  updatePaymentTypeThunk,
  selectUpdateLoading,
  selectUpdateError,
  fetchUnpaidProcessingOptions,
  selectUnpaidProcessingOptions,
  selectUnpaidOptionsLoading,
} from 'store/slices/paymentTypesSlice';
import { fetchStatementReferences } from 'store/slices/statementReferenceSlice';
import {
  navlinks,
  DEFAULT_FORM_STATE,
  DEFAULT_FILE_UPLOAD_STATE,
  DEFAULT_STATEMENT_REFERENCING_STATE,
  DEFAULT_HOST_TO_HOST_STATE,
  DEFAULT_UNPAID_PROCESSING_STATE,
} from '../../paymentTypesHelper';
import { transformToUpdatePaymentTypeRequest } from '../updatePaymentHelper';
import {
  mapPaymentDetailsToFormState,
  mapFileUploadOptions,
  mapStatementReferencingOptions,
  mapHostToHostOptions,
  mapUnpaidProcessingOptions,
  buildAccountsBatchFromDetails,
} from '../paymentTypeMappers';

// TypeScript interfaces
interface AccountBatchItem {
  id: string;
  accountKey: number; // Store the actual account key for easy access
  name: string;
  masked: string;
  accNumber: string;
  sortCode: string;
  bic: string;
  currency: string;
  currencyFull: string;
  currencyCode: string;
  country: string;
  countryCode: string;
  countryDisplayName?: string;
  shortnames: string[];
}

interface StatusMessage {
  ok?: boolean;
  message?: string;
}

// Style constants
const DELETE_BUTTON_STYLES = {
  color: '#0051FF',
  borderColor: '#0051FF',
  textTransform: 'none' as const,
  height: '3rem',
  minHeight: '3rem',
  '&:hover': {
    borderColor: '#0051FF',
    backgroundColor: 'rgba(0, 81, 255, 0.04)',
  },
};

export default function ManagePaymentTypePage() {
  const testIdPrefix = 'payment-types-manage';
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('paymenttypes');
  const dispatch = useAppDispatch();
  const paymentDetails = useAppSelector(selectPaymentDetails);
  const loading = useAppSelector(selectPaymentDetailsLoading);
  const error = useAppSelector(selectPaymentDetailsError);
  const updateLoading = useAppSelector(selectUpdateLoading);
  const updateError = useAppSelector(selectUpdateError);
  const { accounts: accountList } = useAppSelector((state) => state.agreementAccount);
  
  // Fetch unpaid processing options from Redux store
  const unpaidOptionsFromStore = useAppSelector(selectUnpaidProcessingOptions);
  const unpaidOptionsLoading = useAppSelector(selectUnpaidOptionsLoading);

  // Fetch statement reference options from Redux store
  const statementRefData = useAppSelector((state: RootState) => state.statementReference);
  
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
  
  // Get appropriate presets for each statement referencing type
  const statementRefPresetsMap = React.useMemo(() => ({
    creditConsolidated: getCodesForType('Credit reference', 'Consolidated'),
    debitConsolidated: getCodesForType('Debit reference', 'Consolidated'),
    debitItemised: getCodesForType('Debit reference', 'Itemized'),
  }), [statementRefData?.data?.statementReferenceTypes]);

  // Map API data to dropdown options (full objects with key and name)
  const unpaidDropdownOptions = React.useMemo(() => {
    if (unpaidOptionsFromStore && unpaidOptionsFromStore.length > 0) {
      return unpaidOptionsFromStore.map(option => ({
        unpaidOptionKey: option.unpaidOptionKey,
        unpaidOptionName: option.unpaidOptionName
      }));
    }
    return ['Populated']; // Default for backward compatibility
  }, [unpaidOptionsFromStore]);

  // Map API data to table rows
  const unpaidRowsFromApi = React.useMemo(() => {
    if (unpaidOptionsFromStore && unpaidOptionsFromStore.length > 0) {
      return unpaidOptionsFromStore.map((option) => ({
        id: option.unpaidOptionKey,
        name: option.unpaidOptionName,
        onUs: option.onUsOption as 'Itemised' | 'Consolidated',
        offUs: option.offUsOption as 'Itemised' | 'Consolidated',
      }));
    }
    return undefined;
  }, [unpaidOptionsFromStore]);
  
  const [form, setForm] = useState<PaymentTypeFormState>(DEFAULT_FORM_STATE);
  const [fileUploadOptions, setFileUploadOptions] = useState<FileUploadOptionsState>(DEFAULT_FILE_UPLOAD_STATE);
  const [statementReferencing, setStatementReferencing] = useState<StatementReferencingState>(DEFAULT_STATEMENT_REFERENCING_STATE);
  const [hostToHostOptions, setHostToHostOptions] = useState<HostToHostOptionsState>(DEFAULT_HOST_TO_HOST_STATE);
  const [unpaidProcessing, setUnpaidProcessing] = useState<UnpaidProcessingState>(DEFAULT_UNPAID_PROCESSING_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusMessage>({});
  const [isEditingAny, setIsEditingAny] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agreementId, setAgreementId] = useState<string>('');
  const [agreementName, setAgreementName] = useState<string>('');
  const [selectedAccountKeys, setSelectedAccountKeys] = useState<string[]>([]);
  const [accountsBatch, setAccountsBatch] = useState<AccountBatchItem[]>([]);
  const [isAccountsBatchInitialized, setIsAccountsBatchInitialized] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name?.trim()) {
      newErrors.name = t('validation.nameRequired');
    }
    if (!form.authorisationProfile) {
      newErrors.authorisationProfile = t('validation.authProfileRequired');
    }
    if (!agreementId) {
      newErrors.agreement = t('validation.agreementRequired');
    }
    if (accountsBatch.length === 0) {
      newErrors.accounts = t('validation.accountRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.name, form.authorisationProfile, agreementId, accountsBatch.length, t]);

  // Fetch payment type details on mount
  useEffect(() => {
    const id = params?.id;
    if (!id || typeof id !== 'string') {
      setErrorMessage(t('errors.invalidPaymentTypeId'));
      setErrorDialogOpen(true);
      setStatus({ ok: false, message: t('errors.invalidPaymentTypeId') });
      return;
    }

    const paymentTypeKey = Number.parseInt(id, 10);
    if (Number.isNaN(paymentTypeKey)) {
      setErrorMessage(t('errors.invalidPaymentTypeIdFormat'));
      setErrorDialogOpen(true);
      setStatus({ ok: false, message: t('errors.invalidPaymentTypeIdFormat') });
      return;
    }

    dispatch(fetchPaymentTypeDetails(paymentTypeKey));
    setIsAccountsBatchInitialized(false);

    return () => {
      dispatch(resetPaymentDetails());
    };
  }, [params?.id, dispatch,t]);

  useEffect(() => {
    dispatch(fetchCustomerAgreement({ service: 'ThirdPartyPayment' }));
    // Fetch unpaid processing options
    dispatch(fetchUnpaidProcessingOptions());
  }, [dispatch]);

  useEffect(() => {
    if (agreementId) {
      dispatch(fetchPaymentTypeAccounts({ agreementKey: agreementId }));
    }
  }, [agreementId, dispatch]);

  // Fetch statement reference options when agreement and account keys are selected
  useEffect(() => {
    if (agreementId && selectedAccountKeys.length > 0) {
      const accountKeys = selectedAccountKeys.join(',');
      
      dispatch(fetchStatementReferences({
        agreementKey: agreementId,
        accountKeys: accountKeys,
        instrumentClassification: 'Payment',
      }));
    }
  }, [agreementId, selectedAccountKeys, dispatch]);
 
  // Populate form when data is loaded
  useEffect(() => {
    if (!paymentDetails) return;

    // Use mapper functions to transform API data to component state
    setForm(mapPaymentDetailsToFormState(paymentDetails));
    setFileUploadOptions(mapFileUploadOptions(paymentDetails));
    setStatementReferencing(mapStatementReferencingOptions(paymentDetails));
    setHostToHostOptions(mapHostToHostOptions(paymentDetails));
    setUnpaidProcessing(mapUnpaidProcessingOptions(paymentDetails, DEFAULT_UNPAID_PROCESSING_STATE));

    // Set agreement data
    setAgreementId(paymentDetails.agreementKey ? String(paymentDetails.agreementKey) : '');
    setAgreementName(paymentDetails.agreementName || '');

    // Set selected account keys
    if (paymentDetails.accountKeys?.length > 0) {
      setSelectedAccountKeys(paymentDetails.accountKeys.map(String));
    }
  }, [paymentDetails]);

  // Update unpaid processing rows when API data loads
  useEffect(() => {
    if (unpaidRowsFromApi && unpaidRowsFromApi.length > 0) {
      setUnpaidProcessing(prev => ({
        ...prev,
        rows: unpaidRowsFromApi,
      }));
    }
  }, [unpaidRowsFromApi]);

  // Initialize accountsBatch from payment details and account list (runs only once)
  useEffect(() => {
    if (isAccountsBatchInitialized || !paymentDetails || !accountList?.length) {
      return;
    }

    const initialBatch = buildAccountsBatchFromDetails(paymentDetails, accountList);
    if (initialBatch.length > 0) {
      setAccountsBatch(initialBatch as AccountBatchItem[]);
      setIsAccountsBatchInitialized(true);
    }
  }, [paymentDetails, accountList, isAccountsBatchInitialized]);

  // Handle update errors
  useEffect(() => {
    if (updateError) {
      setErrorMessage(updateError);
      setErrorDialogOpen(true);
      setStatus({ ok: false, message: updateError });
    }
  }, [updateError]);

  const startEdit = () => setIsEditingAny(true);
  const endEdit = () => setIsEditingAny(false);
  
  // Component-level callbacks (for internal component state only)
  const handleComponentEdit = () => {
    // When a component enters edit mode, enable page-level edit mode
    setIsEditingAny(true);
  };

  const handleComponentSave = () => {
    // When a component saves, keep page-level edit mode active
    // The component manages its own internal state
  };

  const handleComponentCancel = () => {
    // When a component cancels, keep page-level edit mode active
    // unless all changes are reverted (handled by final Cancel button)
  };
  
  const handleDeleteConfirm = () => {
    setStatus({ ok: true, message: t('messages.deleteSuccess') });
    // Navigate to payment types list
    router.push(navlinks.paymentTypes as any);
  };

  const handleBatchChange = useCallback((batch: AccountBatchItem[]) => {
    setAccountsBatch(batch);
    setIsAccountsBatchInitialized(true);
    // Update selectedAccountKeys when batch changes so useEffect triggers API call
    setSelectedAccountKeys(batch.map((acc: AccountBatchItem) => String(acc.accountKey)));
    // Always trigger edit mode when accounts are changed
    setIsEditingAny(true);
  }, []);

  const handleErrorDismiss = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  const handleErrorRetry = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
    // Trigger form submission again
    handleSubmitUpdate();
  };

  const handleAgreementChange = useCallback((id: string, name?: string) => {
    setAgreementId(id);
    if (name) {
      setAgreementName(name);
    }
    // Always trigger edit mode when agreement is changed
    setIsEditingAny(true);
  }, []);

  const handleFormChange = useCallback((newForm: PaymentTypeFormState) => {
    setForm(newForm);
    // Always trigger edit mode when form data changes
    setIsEditingAny(true);
  }, []);

  const handleFileUploadOptionsChange = useCallback((newOptions: FileUploadOptionsState) => {
    setFileUploadOptions(newOptions);
    // Always trigger edit mode when options change
    setIsEditingAny(true);
  }, []);

  const handleStatementReferencingChange = useCallback((newState: StatementReferencingState) => {
    setStatementReferencing(newState);
    // Always trigger edit mode when statement referencing changes
    setIsEditingAny(true);
  }, []);

  const handleHostToHostOptionsChange = useCallback((newOptions: HostToHostOptionsState) => {
    setHostToHostOptions(newOptions);
    // Always trigger edit mode when host to host options change
    setIsEditingAny(true);
  }, []);

  const handleUnpaidProcessingChange = useCallback((newState: UnpaidProcessingState) => {
    setUnpaidProcessing(newState);
    // Always trigger edit mode when unpaid processing changes
    setIsEditingAny(true);
  }, []);

  const handleCancel = useCallback(() => {
    // Reset all form data to original values from paymentDetails
    if (paymentDetails) {
      setForm(mapPaymentDetailsToFormState(paymentDetails));
      setFileUploadOptions(mapFileUploadOptions(paymentDetails));
      setStatementReferencing(mapStatementReferencingOptions(paymentDetails));
      setHostToHostOptions(mapHostToHostOptions(paymentDetails));
      
      // Reset unpaid processing with rows from API if available
      const baseUnpaidState = mapUnpaidProcessingOptions(paymentDetails, DEFAULT_UNPAID_PROCESSING_STATE);
      setUnpaidProcessing({
        ...baseUnpaidState,
        rows: unpaidRowsFromApi || baseUnpaidState.rows,
      });
      
      // Reset agreement data
      setAgreementId(paymentDetails.agreementKey ? String(paymentDetails.agreementKey) : '');
      setAgreementName(paymentDetails.agreementName || '');
      
      // Reset selected account keys
      if (paymentDetails.accountKeys?.length > 0) {
        setSelectedAccountKeys(paymentDetails.accountKeys.map(String));
      } else {
        setSelectedAccountKeys([]);
      }
      
      // Reset accountsBatch
      if (accountList?.length) {
        const initialBatch = buildAccountsBatchFromDetails(paymentDetails, accountList);
        setAccountsBatch(initialBatch as AccountBatchItem[]);
      } else {
        setAccountsBatch([]);
      }
    }
    
    // Clear any validation errors
    setErrors({});
    
    // Exit edit mode
    setIsEditingAny(false);
  }, [paymentDetails, accountList, unpaidRowsFromApi]);

  const handleSaveDraft = useCallback(() => {
    setStatus({ ok: true, message: t('messages.draftSaved') });
    endEdit();
  }, [t]);

  const handleSubmitUpdate = useCallback(async () => {
    // Prevent multiple submissions
    if (submitting) return;

    // Validate form before submission
    if (!validateForm()) {
      setErrorMessage(t('errors.validationErrors'));
      setErrorDialogOpen(true);
      return;
    }

    setSubmitting(true);
    setStatus({});
    setErrorDialogOpen(false);
    setErrorMessage('');

    try {
      const id = params?.id;
      if (!id || typeof id !== 'string') {
        throw new Error(t('errors.paymentTypeIdMissing'));
      }

      const paymentTypeKey = Number.parseInt(id, 10);
      if (Number.isNaN(paymentTypeKey)) {
        throw new Error(t('errors.invalidPaymentTypeId'));
      }

      // Use accountsBatch if available, otherwise fall back to creating from selectedAccountKeys
      let finalAccountsBatch = accountsBatch;
      if (finalAccountsBatch.length === 0 && selectedAccountKeys.length > 0) {
        if (!accountList?.length) {
          throw new Error(t('errors.accountListUnavailable'));
        }

        // Create batch from selectedAccountKeys as fallback
        finalAccountsBatch = selectedAccountKeys
          .map((accountKeyStr) => {
            const accountKeyNum = Number.parseInt(accountKeyStr, 10);
            const accountData = accountList.find((acc) => acc.accountKey === accountKeyNum);

            if (!accountData) return null;

            return {
              id: `${accountData.accountKey}`,
              accNumber: accountData.accountNumber || '',
              name: accountData.accountName,
            };
          })
          .filter((acc) => acc !== null) as AccountBatchItem[];
      }

      // Transform form data to API request format
      const payload = transformToUpdatePaymentTypeRequest({
        form,
        fileUploadOptions,
        statementReferencing,
        hostToHostOptions,
        unpaidProcessing,
        customerAgreement: {
          agreementId,
          agreementName,
          accountsBatch: finalAccountsBatch,
        },
        currentDetails: paymentDetails,
      });

      // Dispatch the update thunk
      await dispatch(updatePaymentTypeThunk({ paymentTypeKey, payload: payload as any })).unwrap();

      // Success - navigate to success page
      setStatus({ ok: true, message: t('messages.updateSuccess') });
      router.push(`${navlinks.success}?mode=edit&name=${encodeURIComponent(form.name)}` as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.updateFailed');
      setErrorMessage(message);
      setErrorDialogOpen(true);
      setStatus({ ok: false, message });
    } finally {
      setSubmitting(false);
    }
  }, [t, validateForm, params?.id, accountsBatch, selectedAccountKeys, accountList, form, fileUploadOptions, statementReferencing, hostToHostOptions, unpaidProcessing, agreementId, agreementName, paymentDetails, dispatch, router, submitting]);

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'page')}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }} data-testid={buildTestId(testIdPrefix, 'loading')}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid={buildTestId(testIdPrefix, 'error')}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && (
      <Grid container spacing={2}>
        <Grid size={12}>
          <Breadcrumb
            links={[
              { href: navlinks.dashboard, label: t('dashboard') },
              { href: navlinks.paymentTypes, label: t('paymentTypesBreadcrumb') },
              { href: '#', label: `${t('manage')} ${form.name}` },
            ]}
            data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2, mb: 2 }} data-testid={buildTestId(testIdPrefix, 'heading')}>
            <Typography variant="h5" fontWeight={400} fontSize={28}>
              {t('manage')} {form.name}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 4 }} data-testid={buildTestId(testIdPrefix, 'payment-type-details-section')}>
            <PaymentTypeFormWrapper
              form={form}
              errors={errors}
              submitting={submitting}
              onFormChange={handleFormChange}
              status={status}
              initialMode="view"
              reviewMode
              onStartEdit={handleComponentEdit}
              onEndEdit={handleComponentSave}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'customer-agreement-section')}>
            <CustomerAgreementWrapper
              initialMode="view"
              reviewMode
              onStartEdit={handleComponentEdit}
              onEndEdit={handleComponentSave}
              initialAgreementId={agreementId}
              initialAgreementName={agreementName}
              batchAccount={selectedAccountKeys}
              onAgreementChange={handleAgreementChange}
              onBatchChange={handleBatchChange}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'file-upload-options-section')}>
            <FileUploadOptions
              value={fileUploadOptions}
              onChange={handleFileUploadOptionsChange}
              disabled={submitting}
              reviewMode
              onEdit={handleComponentEdit}
              onSave={handleComponentSave}
              onCancel={handleComponentCancel}
              expandIcon={true}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'statement-referencing-section')}>
            <StatementReferencingOptions
              mode="payment-types"
              value={statementReferencing}
              onChange={handleStatementReferencingChange}
              disabled={submitting || statementRefData?.loading}
              reviewMode
              onEdit={handleComponentEdit}
              onSave={handleComponentSave}
              onCancel={handleComponentCancel}
              expandIcon={true}
              presets={statementRefPresetsMap}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'host-to-host-options-section')}>
            <HostToHostOptions
              value={hostToHostOptions}
              onChange={handleHostToHostOptionsChange}
              disabled={submitting}
              reviewMode
              onEdit={handleComponentEdit}
              onSave={handleComponentSave}
              onCancel={handleComponentCancel}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2, border: 'none' }} data-testid={buildTestId(testIdPrefix, 'unpaid-processing-section')}>
            <UnpaidProcessingOptions
              value={unpaidProcessing}
              onChange={handleUnpaidProcessingChange}
              disabled={submitting}
              reviewMode
              onEdit={handleComponentEdit}
              onSave={handleComponentSave}
              onCancel={handleComponentCancel}
              unpaidOptions={unpaidDropdownOptions}
              loading={unpaidOptionsLoading}
            />
                  <Grid size={{ xs: 12, md: 12 }}>
                    {isEditingAny ? (
                      <Box data-testid={buildTestId(testIdPrefix, 'footer-actions')}>
                      <FormFooterActions
                        onCancel={handleCancel}
                        onSaveDraft={handleSaveDraft}
                        onReviewSubmit={handleSubmitUpdate}
                        submitting={submitting || updateLoading}
                        reviewMode={true}
                        labels={{
                          cancel: t('cancelLabel'),
                          save: t('saveToDrafts'),
                          submit: t('submitForApproval'),
                        }}
                      />
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setDeleteOpen(true)}
                          data-testid={buildTestId(testIdPrefix, 'delete-button')}
                          startIcon={<Image src={DeleteIcon} alt="delete" width={24} height={24} />}
                          sx={DELETE_BUTTON_STYLES}
                        >
                          {t('deletePaymentTypeLabel')}
                        </Button>
                      </Box>
                    )}
                  </Grid>
          </Box>
        </Grid>
      </Grid>
      )}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onPrimaryCTA={() => { setDeleteOpen(false); handleDeleteConfirm(); }}
        onSecondaryCTA={() => setDeleteOpen(false)}
        selectedCount={1}
        title={t('deleteDialogTitle')}
        name={t('deleteDialogName')}
        primaryCTALabel={t('deleteConfirm')}
        secondaryCTALabel={t('deleteCancel')}
        itemLabel={t('deleteItemLabel')}
        markedCount={undefined}
        message={t('deleteMessage')}
        exclamationIcon={null}
        testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
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
    </Box>
  );
}
