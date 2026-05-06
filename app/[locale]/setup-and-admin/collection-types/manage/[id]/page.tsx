'use client';

import * as React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { Box, Typography, Grid, CircularProgress, Button, Stack, Snackbar, Alert } from '@mui/material';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Image from 'next/image';
import IconBin from 'public/icons/icn_bin.svg';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { Breadcrumb } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import {
  CollectionTypeFormWrapper,
  type CollectionTypeFormState,
  collectionTypeSchema,
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
import CustomerAgreementWrapper from '@molecules/CustomerAgreement/CustomerAgreementWrapper';
import { hostToHostOptionsSchema } from '@molecules/HostToHostOptions/HostToHostOptions';
import { statementReferencingSchema } from '@molecules/StatementReferencingOptions/StatementReferencingOptions';
import { RootState } from '@store/index';
import {
  loadCollectionType,
  updateForm,
  updateFileUploadOptions,
  updateStatementReferencing,
  updateHostToHostOptions,
  updateCollectionModel,
  updateCollectionType,
} from '@store/slices/manageCollectionTypeSlice';
import { deleteCollectionTypes } from '@store/slices/collectionTypesSlice';
import { buildTestId } from 'src/utils/testIds';
import { fetchStatementReferences } from '@store/slices/statementReferenceSlice';
import { fetchCollectionTypeAccounts } from '@store/slices/setup-admin/commonSlice/agreementAccountSlice';
import { mapStatementReferencingOptions } from '../../collectionTypeMappers';
import { getManageBreadcrumbLinks, navlinks, getDeleteDialogContent } from '../../collectionTypesHelper';
import { useManageCollectionType } from '@lib/hooks/useManageCollectionType';
import { AvatarAlert, CheckCircleIcon } from 'lib/icons';
import { prepareCollectionTypePayload } from '@lib/transformers/collectionTypesTransformers';

export default function ManageCollectionType() {
  const testIdPrefix = 'collection-types-manage';
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const translateLang = useTranslations('collectionTypesHubData');
  const dispatch = useAppDispatch();
  
  const collectionTypeId = params?.id as string;
  const collectionTypeName = searchParams?.get('name') || '';
  
  const { data: collectionTypeData, loading: dataLoading, error: dataError } = useManageCollectionType(collectionTypeId);
  
  // Get data from Redux
  const persisted = useAppSelector((state) => state.manageCollectionType);
  const { accounts: accountList } = useAppSelector((state) => state.agreementAccount);
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
  
  const [form, setForm] = React.useState<CollectionTypeFormState>(collectionTypeData?.form || persisted.form);
  const [fileUploadOptions, setFileUploadOptions] = React.useState<FileUploadOptionsState>(collectionTypeData?.fileUploadOptions || persisted.fileUploadOptions);
  const [statementReferencing, setStatementReferencing] = React.useState<StatementReferencingState>(collectionTypeData?.statementReferencing || persisted.statementReferencing);
  const [hostToHostOptions, setHostToHostOptions] = React.useState<HostToHostOptionsState>(collectionTypeData?.hostToHostOptions || persisted.hostToHostOptions);
  const [collectionModel, setCollectionModel] = React.useState<CollectionModelState>(collectionTypeData?.collectionModel || persisted.collectionModel);

  // Store original values for cancel functionality
  const [originalForm, setOriginalForm] = React.useState<CollectionTypeFormState>(collectionTypeData?.form || persisted.form);
  const [originalFileUploadOptions, setOriginalFileUploadOptions] = React.useState<FileUploadOptionsState>(collectionTypeData?.fileUploadOptions || persisted.fileUploadOptions);
  const [originalStatementReferencing, setOriginalStatementReferencing] = React.useState<StatementReferencingState>(collectionTypeData?.statementReferencing || persisted.statementReferencing);
  const [originalHostToHostOptions, setOriginalHostToHostOptions] = React.useState<HostToHostOptionsState>(collectionTypeData?.hostToHostOptions || persisted.hostToHostOptions);
  const [originalCollectionModel, setOriginalCollectionModel] = React.useState<CollectionModelState>(collectionTypeData?.collectionModel || persisted.collectionModel);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<string | null>(null);
  const [hostToHostHasError, setHostToHostHasError] = React.useState(false);
  const [statementRefHasError, setStatementRefHasError] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [dialogContent, setDialogContent] = React.useState<{ title: string; primary: string; secondary: string; itemLabel: string; itemLabel2: string } | null>(null);

  React.useEffect(() => {
    if (collectionTypeData) {
      setForm(collectionTypeData.form);
      setFileUploadOptions(collectionTypeData.fileUploadOptions);
      setStatementReferencing(collectionTypeData.statementReferencing);
      setHostToHostOptions(collectionTypeData.hostToHostOptions);
      setCollectionModel(collectionTypeData.collectionModel);
      
      setOriginalForm(collectionTypeData.form);
      setOriginalFileUploadOptions(collectionTypeData.fileUploadOptions);
      setOriginalStatementReferencing(collectionTypeData.statementReferencing);
      setOriginalHostToHostOptions(collectionTypeData.hostToHostOptions);
      setOriginalCollectionModel(collectionTypeData.collectionModel);
      
      dispatch(loadCollectionType({
        form: collectionTypeData.form,
        fileUploadOptions: collectionTypeData.fileUploadOptions,
        statementReferencing: collectionTypeData.statementReferencing,
        hostToHostOptions: collectionTypeData.hostToHostOptions,
        collectionModel: collectionTypeData.collectionModel,
        customerAgreement: collectionTypeData.customerAgreement,
      }));
    }
  }, [collectionTypeData, dispatch]);

  React.useEffect(() => {
    if (dataError) {
      console.error('Data loading error:', dataError);
    }
  }, [dataError]);
 

  const handleFormChange = (newForm: CollectionTypeFormState) => {
    setForm(newForm);
  };

  const handleEditSection = (section: string) => {
    setEditingSection(section);
  };

  const handleSavePaymentType = async (data: CollectionTypeFormState) => {
    setSubmitting(true);

    setOriginalForm(data);
    dispatch(updateForm(data));
    setEditingSection(null);
    setHasUnsavedChanges(true);
    setSubmitting(false);
  };

  const handleCancelPaymentType = () => {
    setForm(originalForm);
    setEditingSection(null);
    setErrors({});
  };

  const handleSaveFileUpload = async () => {
    setSubmitting(true);

    setOriginalFileUploadOptions(fileUploadOptions);
    dispatch(updateFileUploadOptions(fileUploadOptions));
    setEditingSection(null);
    setHasUnsavedChanges(true);
    setSubmitting(false);
  };

  const handleCancelFileUpload = () => {
    setFileUploadOptions(originalFileUploadOptions);
    setEditingSection(null);
  };

  const handleSaveStatementReferencing = async () => {
    const statementResult = statementReferencingSchema.safeParse(statementReferencing);
    if (!statementResult.success) {
      setStatementRefHasError(true);
      return;
    }

    setSubmitting(true);
    setStatementRefHasError(false);

    setOriginalStatementReferencing(statementReferencing);
    dispatch(updateStatementReferencing(statementReferencing));
    setEditingSection(null);
    setHasUnsavedChanges(true);
    setSubmitting(false);
  };

  const handleCancelStatementReferencing = () => {
    setStatementReferencing(originalStatementReferencing);
    setEditingSection(null);
    setStatementRefHasError(false);
  };

  const handleSaveHostToHost = async () => {
    const hostResult = hostToHostOptionsSchema.safeParse(hostToHostOptions);
    if (!hostResult.success) {
      setHostToHostHasError(true);
      return;
    }

    setSubmitting(true);
    setHostToHostHasError(false);

    setOriginalHostToHostOptions(hostToHostOptions);
    dispatch(updateHostToHostOptions(hostToHostOptions));
    setEditingSection(null);
    setHasUnsavedChanges(true);
    setSubmitting(false);
  };

  const handleCancelHostToHost = () => {
    setHostToHostOptions(originalHostToHostOptions);
    setEditingSection(null);
    setHostToHostHasError(false);
  };

  const handleSaveCollectionModel = async () => {
    setSubmitting(true);

    setOriginalCollectionModel(collectionModel);
    dispatch(updateCollectionModel(collectionModel));
    setEditingSection(null);
    setHasUnsavedChanges(true);
    setSubmitting(false);
  };

  const handleCancelCollectionModel = () => {
    setCollectionModel(originalCollectionModel);
    setEditingSection(null);
  };

  const handleDeleteCollectionType = () => {
    const content = getDeleteDialogContent('delete_manage', translateLang);
    setDialogContent(content);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    
    try {
      setSubmitting(true);
      
      const nameToUse = collectionTypeData?.form?.name || collectionTypeName || '';
      
      await dispatch(deleteCollectionTypes([{
        collectionTypeKey: collectionTypeId,
        collectionTypeName: nameToUse,
      }])).unwrap();
      
      setSnackbarMessage(translateLang('collectionTypeDeletedSuccessfully'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      setTimeout(() => {
        router.push(navlinks.setupAndAdmin);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete collection type';
      console.error('Delete error:', error);
      const content = getDeleteDialogContent('delete_error', translateLang);
      setDialogContent(content);
      setDeleteDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleSubmitForApproval = async () => {
    try {
      setSubmitting(true);
      
      const collectionTypeKeyValue = collectionTypeData?.collectionTypeKey 
        ? collectionTypeData.collectionTypeKey 
        : (collectionTypeId ? Number(collectionTypeId) : undefined);
      
      const payload = prepareCollectionTypePayload({
        form: persisted.form,
        fileUploadOptions: persisted.fileUploadOptions,
        statementReferencing: persisted.statementReferencing,
        hostToHostOptions: persisted.hostToHostOptions,
        collectionModel: persisted.collectionModel,
        customerAgreementId: persisted.customerAgreement.agreementId,
        selectedAccountId: persisted.customerAgreement.selectedAccountId,
        agreementName: persisted.customerAgreement.agreementName,
        collectionTypeKey: collectionTypeKeyValue,
        action: 'UPDATE',
      });
      
      await dispatch(updateCollectionType(payload) as any).unwrap();
      
      setSnackbarMessage(translateLang('collectionTypeUpdatedSuccessfully'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      setTimeout(() => {
        router.push(navlinks.successCollectionType);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update collection type';
      console.error('Submit error:', error);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelChanges = () => {
    setHasUnsavedChanges(false);
    router.push(navlinks.setupAndAdmin);
  };

  React.useEffect(() => {
    if (persisted.customerAgreement?.agreementId && persisted.customerAgreement?.selectedAccountId) {
      dispatch(fetchStatementReferences({
        agreementKey: persisted.customerAgreement.agreementId,
        accountKeys: persisted.customerAgreement.selectedAccountId,
        instrumentClassification: 'Collection',
      }));
    }
  }, [persisted.customerAgreement?.agreementId, persisted.customerAgreement?.selectedAccountId, dispatch]);

  const breadcrumbLinks = getManageBreadcrumbLinks(translateLang);

  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'page')}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Breadcrumb links={breadcrumbLinks} data-testid={buildTestId(testIdPrefix, 'breadcrumbs')} />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2, mb: 2 }} data-testid={buildTestId(testIdPrefix, 'heading')}>
            <Typography variant="h5" fontWeight={400} fontSize={28}>
              { translateLang('manageCollectionType') }
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
              status={{}}
              initialMode="view"
              reviewMode={editingSection !== 'collectionType'}
              onSave={handleSavePaymentType}
              onCancel={handleCancelPaymentType}
              onStartEdit={() => handleEditSection('collectionType')}
              onValidSubmit={handleSavePaymentType}              
            />
             
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'customer-agreement-section')}>
            <CustomerAgreementWrapper 
              key={`customer-agreement-${collectionTypeData?.customerAgreement.agreementId || persisted.customerAgreement.agreementId}`}
              initialMode="edit" 
              reviewMode={editingSection !== 'customerAgreement'} 
              showAssociatedAccounts={false} 
              useBranchCountry={true}
              showAccountDetailsInReview={true}
              onStartEdit={() => handleEditSection('customerAgreement')}
              initialAgreementId={collectionTypeData?.customerAgreement.agreementId || persisted.customerAgreement.agreementId}
              initialAgreementName={collectionTypeData?.customerAgreement.agreementName || persisted.customerAgreement.agreementName}
              initialSelectedAccountId={collectionTypeData?.customerAgreement.selectedAccountId || persisted.customerAgreement.selectedAccountId}
            />
          </Box>
        </Grid>

       <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ mt: 2 }} data-testid={buildTestId(testIdPrefix, 'file-upload-options-section')}>
            <FileUploadOptions
              value={fileUploadOptions}
              onChange={setFileUploadOptions}
              disabled={submitting}
              reviewMode={editingSection !== 'fileUpload'}
              onEdit={() => handleEditSection('fileUpload')}
              onSave={handleSaveFileUpload}
              onCancel={handleCancelFileUpload}
              
               hidePostingOptions={true}
              hideAllowEditing={false}
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
              reviewMode
              onEdit={() => handleEditSection('statementReferencing')}
              onSave={handleSaveStatementReferencing}
              onCancel={handleCancelStatementReferencing}
              hasError={statementRefHasError}
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
              reviewMode={editingSection !== 'hostToHost'}
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
          <Box sx={{ mt: 2, mb: 4 }} data-testid={buildTestId(testIdPrefix, 'collection-model-section')}>
            <CollectionModelOptions
              value={collectionModel}
              onChange={setCollectionModel}
              disabled={submitting}
              reviewMode={editingSection !== 'collectionModel'}
              onEdit={() => handleEditSection('collectionModel')}
              onSave={handleSaveCollectionModel}
              onCancel={handleCancelCollectionModel}
            />
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: hasUnsavedChanges ? 'space-between' : 'flex-end', gap: 2 }}
          data-testid={buildTestId(testIdPrefix, 'footer-actions')}>
            {!hasUnsavedChanges ? (
              <Button
                variant="text"
                onClick={handleDeleteCollectionType}
                disabled={submitting}
                startIcon={<Image src={IconBin} alt="delete" width={24} height={24} />}
                sx={{
                  color: '#0051FF',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  height: '48px',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                data-testid={buildTestId(testIdPrefix, 'delete-button')}
                aria-label="Delete this collection type"
              >
                {translateLang('deleteCollectionType')}
              </Button>
            ) : (
              <>
                <Button
                  color="primary"
                  variant="text"
                  startIcon={<BlockOutlinedIcon />}
                  onClick={handleCancelChanges}
                  disabled={submitting}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    height: '48px'
                  }}
                  data-testid={buildTestId(testIdPrefix, 'cancel-button')}
                  aria-label="Cancel changes and go back to collection types"
                >
                  {translateLang('cancel')}
                </Button>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReceiptLongOutlinedIcon />}
                  onClick={handleSubmitForApproval}
                  disabled={submitting}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: 1.25,
                    px: 2.25,
                    height: '48px'
                  }}
                  data-testid={buildTestId(testIdPrefix, 'submit-button')}
                  aria-label="Submit collection type for approval"
                >
                  {translateLang('submitCollectionTypeForApprovalButton')}
                </Button>
              </>
            )}
          </Box>
        </Grid>  
      </Grid>
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onPrimaryCTA={handleDeleteConfirm}
        onSecondaryCTA={handleCloseDeleteDialog}
        selectedCount={1}
        exclamationIcon={AvatarAlert}
        itemLabel={dialogContent?.itemLabel}
        itemLabel2={dialogContent?.itemLabel2}
        markedCount={1}
        testIdPrefix={buildTestId(testIdPrefix, 'delete-dialog')}
        title={dialogContent?.title}
        primaryCTALabel={dialogContent?.primary}
        secondaryCTALabel={dialogContent?.secondary}
      />
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
        data-testid={buildTestId(testIdPrefix, 'snackbar')}
      >
        <Alert
          icon={
            <Image src={CheckCircleIcon} alt={snackbarSeverity} width={20} height={20} />
          }
          severity={snackbarSeverity}
          sx={{ 
            backgroundColor: snackbarSeverity === 'success' ? '#008545' : '#D32F2F', 
            color: '#FFFFFF', 
            fontWeight: 400, 
            fontSize: 16, 
            alignItems: 'center', 
            borderRadius: 2 
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
