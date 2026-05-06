'use client';

import { Box, Typography } from '@mui/material';
import { Breadcrumb, ButtonToggle, Heading, Dialog, Button } from 'dist/standard-bank-react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { useTranslations } from 'next-intl';
import { updateManagedBiller } from '@store/slices/createBillerSlice';
import Image from 'next/image';
import { DocumentIcon, IcnCardQuestion, ListIcon, IcnBellBell, IcnInfoCircleGrey, AvatarAlert } from 'lib/icons';
import { useBillers } from '@lib/hooks/useBillers';
import ManageHistoryTable from '@organisms/Bills/ManageHistoryTable';
import ManageAuditTrail from '@organisms/Bills/ManageAuditTrail';
import CreateJournyForm from 'components/common/CreateJournyForm';
import CreatePayAlertsForm from 'components/common/CreatePayAlertsForm';
import { BillerReferenceReview } from 'components/common/BillerReferenceReview';
import { BillsField } from 'src/utils/BillsField';
import { getRulesForField } from 'src/utils/BillsCreateLogic';
import { FormActionButtons } from 'components/common/formActionButtons';
import { buildTestId } from 'src/utils/testIds';
import {
  getManageBillerBreadcrumbs,
  getBreadcrumbsWithTranslation,
  getTranslatedTabs,
} from '../BillsHelper';
import styles from '../bills.module.scss';

function Page() {
  const testIdPrefix = 'bills-manage';
  const t = useTranslations('billsHubData');
  const router = useRouter();
  const searchParams = useSearchParams();
  const billerIdParam = searchParams?.get('billerId') || '';
  const [selectedTab, setSelectedTab] = useState<string>('details');
  const [mode, setMode] = useState<'edit' | 'review'>('review');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // State for pay alerts
  const [payAlerts, setPayAlerts] = useState(BillsField.MOCK_PAY_ALERTS);

  // State for dynamic reference type sections
  const [selectedReferenceChips, setSelectedReferenceChips] = useState<string[]>([]);
  const [activeReferenceSections, setActiveReferenceSections] = useState<Array<{
    typeId: string;
    typeName: string;
    value: string;
    isDynamic: boolean;
  }>>([]);
  const [isBillerDetailsEditing, setIsBillerDetailsEditing] = useState(false);
  const seededManageReferenceFallbackRef = useRef(false);

  const dispatch = useAppDispatch();
  const { getBillerById, deleteBillerById, managedBiller, error } = useBillers();
  const viewed: any = managedBiller;
  console.log({viewed})
  // React Hook Form instances - separate for each section
  const billerDetailsDefaults = useMemo(() => ({
    billerName: viewed?.billerName || '',
    billerId: viewed?.billerId || '',
    currency: viewed?.currency || 'ZAR',
    transactionLimit: viewed?.transactionLimit || '0.00',
  }), [viewed]);

  const paymentTypesDefaults = useMemo(() => ({
    paymentTypes: Array.isArray(viewed?.paymentTypes) ? viewed.paymentTypes : [],
  }), [viewed?.paymentTypes]);

  const normalizedReferenceFieldIds = useMemo(() => {
    const refs = viewed?.referenceFields;
    if (Array.isArray(refs)) {
      return refs
        .map((ref: any) => (typeof ref === 'string' ? ref : ref?.id))
        .filter(Boolean);
    }
    if (typeof refs === 'string') {
      return refs
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [viewed?.referenceFields]);

  const referenceDefaults = useMemo(() => ({
    referenceFields: normalizedReferenceFieldIds,
  }), [normalizedReferenceFieldIds]);

  const payAlertsDefaults = useMemo(() => ({
    phoneNumber: viewed?.phoneNumber || '',
    phoneUsage: viewed?.phoneUsage || [],
    phoneAlertEnabled: viewed?.phoneAlertEnabled || false,
    emailAddress: viewed?.emailAddress || '',
    emailUsage: viewed?.emailUsage || [],
    emailAlertEnabled: viewed?.emailAlertEnabled || false,
  }), [viewed]);

  const methodsBillerDetails = useForm({
    mode: 'onTouched',
    defaultValues: billerDetailsDefaults,
  });

  const methodsPaymentTypes = useForm({
    mode: 'onTouched',
    defaultValues: paymentTypesDefaults,
  });

  const methodsReference = useForm({
    mode: 'onTouched',
    defaultValues: referenceDefaults,
  });

  const methodsPayAlerts = useForm({
    mode: 'onTouched',
    defaultValues: payAlertsDefaults,
  });

  // Keep forms in sync with fetched data
  useEffect(() => {
    methodsBillerDetails.reset(billerDetailsDefaults);
  }, [methodsBillerDetails, billerDetailsDefaults]);

  useEffect(() => {
    methodsPaymentTypes.reset(paymentTypesDefaults);
  }, [methodsPaymentTypes, paymentTypesDefaults]);

  useEffect(() => {
    methodsReference.reset(referenceDefaults);
  }, [methodsReference, referenceDefaults]);

  useEffect(() => {
    const refs = viewed?.referenceFields;
    if (!Array.isArray(refs)) return;
    if (refs.length === 0) return;
    if (typeof refs[0] === 'string') return;

    const sections = refs
      .map((ref: any) => {
        const typeId = String(ref?.id || '');
        if (!typeId) return null;
        const referenceType = BillsField.REFERENCE_TYPES.find((rt) => rt.id === typeId);
        return {
          typeId,
          typeName: String(ref?.name || referenceType?.name || ''),
          value: String(ref?.value || ''),
          isDynamic: Boolean(ref?.dynamicReference),
        };
      })
      .filter(Boolean) as Array<{
      typeId: string;
      typeName: string;
      value: string;
      isDynamic: boolean;
    }>;

    setSelectedReferenceChips(sections.map((section) => section.typeId));
    setActiveReferenceSections(sections);
  }, [viewed?.referenceFields]);

  useEffect(() => {
    // When manage data only contains reference type IDs (no detailed objects), the edit chip selector
    // can still show selections, but the review/details summary stays empty unless we seed sections.
    // Initialize summary rows once from the selected IDs so details are visible by default.
    if (activeReferenceSections.length > 0) return;
    if (normalizedReferenceFieldIds.length === 0) return;

    const seededSections = normalizedReferenceFieldIds.map((typeId) => {
      const referenceType = BillsField.REFERENCE_TYPES.find((rt) => rt.id === typeId);
      return {
        typeId,
        typeName: referenceType?.name || '',
        value: '',
        // Match the existing mock/fallback pattern where Employee number defaults to dynamic.
        isDynamic: typeId === 'RT001',
      };
    });

    setSelectedReferenceChips(normalizedReferenceFieldIds);
    setActiveReferenceSections(seededSections);
  }, [normalizedReferenceFieldIds, activeReferenceSections.length]);
    const billerReferenceMock=[
      {
      typeId: 'RT001',
      typeName: 'Reference number',
      value: 'REF-2024-001',
      isDynamic: false,
    },
    {
      typeId: 'RT002',
      typeName: 'Reference number',
      value: 'REF-2024-002',
      isDynamic: true,
    },
    {
      typeId: 'RT003',
      typeName: 'Reference number',
      value: 'REF-2024-003',
      isDynamic: false,
    },
    ]
  useEffect(() => {
    const refs = viewed?.referenceFields;
    const hasReferenceData = Array.isArray(refs)
      ? refs.length > 0
      : typeof refs === 'string'
        ? refs.trim().length > 0
        : false;

    // Only seed mock-style reference rows when manage fetch failed / no data is available.
    if (hasReferenceData) return;
    if (!error) return;
    if (seededManageReferenceFallbackRef.current) return;
  
    const fallbackSections = [
      { typeId: 'RT001', isDynamic: true },  // Employee number
      { typeId: 'RT002', isDynamic: false }, // Identification number
      { typeId: 'RT004', isDynamic: false }, // Other reference type
    ].map(({ typeId, isDynamic }) => {
      const referenceType = BillsField.REFERENCE_TYPES.find((rt) => rt.id === typeId);
      return {
        typeId,
        typeName: referenceType?.name || '',
        value: '',
        isDynamic,
      };
    });

    const fallbackIds = fallbackSections.map((section) => section.typeId);
    seededManageReferenceFallbackRef.current = true;

    setSelectedReferenceChips(fallbackIds);
    setActiveReferenceSections(fallbackSections);
    methodsReference.reset({ referenceFields: fallbackIds });
    dispatch(updateManagedBiller({ field: 'referenceFields', value: fallbackIds }));
  }, [viewed?.referenceFields, error, methodsReference, dispatch]);

  useEffect(() => {
    methodsPayAlerts.reset(payAlertsDefaults);
  }, [methodsPayAlerts, payAlertsDefaults]);

  useEffect(() => {
    // Fetch biller by id on mount
    getBillerById(billerIdParam || 'BILL001')
      .then((result) => {
        console.log('Biller API fetch result:', result);
      })
      .catch((err) => console.error('Biller API fetch error:', err));
  }, [getBillerById, billerIdParam]);

  useEffect(() => {
    // Log the updated managedBiller to verify separation from create flow
    if (managedBiller) {
      console.log('Managed Biller state:', managedBiller);
    }
  }, [managedBiller]);

  // Track if user has made changes by monitoring form dirty state
  useEffect(() => {
    if (methodsBillerDetails.formState.isDirty || methodsPaymentTypes.formState.isDirty || 
        methodsReference.formState.isDirty || methodsPayAlerts.formState.isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [methodsBillerDetails.formState.isDirty, methodsPaymentTypes.formState.isDirty, 
      methodsReference.formState.isDirty, methodsPayAlerts.formState.isDirty]);

  const handleDeleteBiller = useCallback(() => {
    const id = String(viewed?.entityKey || viewed?.billerId || 'BL001');
    deleteBillerById(id)
      .then((resp) => {
        console.log('Delete result:', resp);
        setDeleteDialogOpen(false);
        router.push('/setup-and-admin/bills' as any);
      })
      .catch((err) => {
        console.error('Delete error:', err);
        setDeleteDialogOpen(false);
      });
  }, [viewed, deleteBillerById, router]);

  const handleSubmitChanges = useCallback(() => {
    console.log('Submitting changes for approval...');

    // Store status in session storage for success page
    if (viewed?.status) {
      sessionStorage.setItem('billerSubmitStatus', viewed.status);
    }
    
    router.push('/setup-and-admin/bills/manage/success' as any);
  }, [router, viewed?.status]);

  const handleChange = (name: string, value: any) => {
    // Handle form value changes
    console.log('Field changed:', name, value);
    
    // Track reference type chip selections
    if (name === 'referenceFields') {
      const chips = typeof value === 'string' ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(value) ? value : []);
      setSelectedReferenceChips(chips);
    }

    // Update Redux state
    dispatch(updateManagedBiller({ field: name, value }));
  };

  const handleAddReference = useCallback(() => {
    // Check if a chip is selected
    if (selectedReferenceChips.length === 0) {
      setActiveReferenceSections([]);
      return;
    }

    setActiveReferenceSections((prevSections) =>
      selectedReferenceChips.map((chipId) => {
        const existingSection = prevSections.find((section) => section.typeId === chipId);
        if (existingSection) return existingSection;

        const referenceType = BillsField.REFERENCE_TYPES.find((rt) => rt.id === chipId);
        return {
          typeId: chipId,
          typeName: referenceType?.name || '',
          value: '',
          isDynamic: false,
        };
      }),
    );
  }, [selectedReferenceChips]);

  const handleRemoveReferenceType = useCallback((typeId: string) => {
    // Remove the specific section
    setActiveReferenceSections(activeReferenceSections.filter(section => section.typeId !== typeId));
    
    // Remove from chip selection
    const updatedChips = selectedReferenceChips.filter(chipId => chipId !== typeId);
    setSelectedReferenceChips(updatedChips);

    // Match Add Biller behavior: sync removed chip into Redux so the RHF multi-chip UI updates.
    dispatch(updateManagedBiller({ field: 'referenceFields', value: updatedChips }));
  }, [activeReferenceSections, selectedReferenceChips, dispatch]);

  const handleReferenceFieldChange = useCallback((typeId: string, value: string) => {
    setActiveReferenceSections(activeReferenceSections.map(section =>
      section.typeId === typeId ? { ...section, value } : section
    ));
  }, [activeReferenceSections]);

  const handleDynamicReferenceToggle = useCallback((typeId: string) => {
    setActiveReferenceSections(activeReferenceSections.map(section =>
      section.typeId === typeId ? { ...section, isDynamic: !section.isDynamic } : section
    ));
  }, [activeReferenceSections]);

  // Helper to get input field config for each reference type with translations
  const getReferenceInputField = useCallback((typeId: string) => {
    return BillsField.getTranslatedReferenceInputField(t, typeId);
  }, [t]);

  // Build fields for each section
  const buildBillerDetailsFields = useCallback(
    () => BillsField.buildBillerDetailsFieldsTranslated(t, viewed, mode),
    [t, viewed, mode],
  );

  const buildPaymentTypeFields = useCallback(
    () => BillsField.buildPaymentTypeFieldsTranslated(t, viewed),
    [t, viewed],
  );

  const buildReferenceFields = useCallback(
    () =>
      BillsField.buildReferenceFieldsTranslated(
        t,
        { ...viewed, referenceFields: normalizedReferenceFieldIds },
        handleAddReference,
      ),
    [t, viewed, normalizedReferenceFieldIds, handleAddReference],
  );

  const buildPayAlertsFields = useCallback(
    () => BillsField.buildPayAlertsFieldsTranslated(t, viewed),
    [t, viewed],
  );

  return (
    <Box className={styles.manageContainer} data-testid={buildTestId(testIdPrefix, 'page')}>
      <Box className={styles.manageBreadcrumbBox}>
        <Breadcrumb 
          links={getBreadcrumbsWithTranslation(t, 'manage')} 
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
        />
        <Heading 
          as="h4" 
          fontSize="28px" 
          margin="12px"
          data-testid={buildTestId(testIdPrefix, 'heading')}
        >
          {viewed?.status === 'Needs Action' ? 'Repair Biller' : t('pageHeadingManageBiller')}
        </Heading>

        {viewed?.status !== 'Needs Action' && viewed?.status !== 'Need Action' && (
          <Box className={styles.buttonToggleWrapper}>
            <ButtonToggle
              data-testid={buildTestId(testIdPrefix, 'tab-toggle')}
              initialSelected={0}
              fullWidth={true}
              buttons={getTranslatedTabs(t).map(tab => ({
                children: tab.label,
                toggleValue: tab.value,
              }))}
              onChange={(event, newValue) => {
                if (!newValue) return;
                console.log('Selected:', newValue);
                if (typeof newValue === 'string') {
                  const lower = newValue.toLowerCase();
                  if (lower.includes('details')) return setSelectedTab('details');
                  if (lower.includes('history')) return setSelectedTab('history');
                  if (lower.includes('audit')) return setSelectedTab('audit');

                  const match = newValue.match(/(\d+)$/);
                  const idx = match ? parseInt(match[1], 10) : undefined;
                  const tabs = ['details', 'history', 'audit'];
                  if (idx !== undefined && tabs[idx]) {
                    setSelectedTab(tabs[idx]);
                  }
                }
              }}
            />
          </Box>
        )}

        {viewed?.status === 'Needs Action' && (
          <Box className={styles.needsActionInfoCard} data-testid={buildTestId(testIdPrefix, 'needs-action-card')}>
            <Box className={styles.needsActionInfoIcon}>
              <Image src={IcnInfoCircleGrey} alt="info" width={28} height={28} />
            </Box>
            <Box className={styles.needsActionInfoText}>
              <Typography className={styles.needsActionInfoBold} >
                Authoriser comments
              </Typography>
              <Typography className={styles.needsActionInfoSubtitle}>
                Example comment from authoriser detailing reason for decline.
              </Typography>
            </Box>
          </Box>
        )}

        {selectedTab === 'details' && (
          <Box data-testid={buildTestId(testIdPrefix, 'tab-details')}>
            {/* Biller details section */}
            <CreateJournyForm
              testIdPrefix={buildTestId(testIdPrefix, 'form-biller-details')}
              title={t('stepBillerDetails')}
              titleIcon={DocumentIcon as any}
              fields={buildBillerDetailsFields()}
              onChange={handleChange}
              mode={mode}
              ShowActionBtns={true}
              renderWithRHF
              formMethods={methodsBillerDetails}
              rulesProvider={(name: string, getVals: () => any) =>
                getRulesForField(name as any, getVals)
              }
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              }}
              onValidationFail={() => {}}
              syncOnChange={false}
              onEditModeChange={setIsBillerDetailsEditing}
            />
            {/* Biller reference section - Hidden when Biller Details is being edited */}
            {!isBillerDetailsEditing && (
              <BillerReferenceReview
                testIdPrefix={buildTestId(testIdPrefix, 'biller-reference')}
                title={t('stepBillerReference')}
                icon={ListIcon}
                iconAlt="Biller reference"
                activeSections={billerReferenceMock}
                t={t}
                styles={styles}
              />
            )}
            {/* Payment types section */}
            <Box className={styles.manageSectionBox}>
              <CreateJournyForm
                testIdPrefix={buildTestId(testIdPrefix, 'form-payment-type')}
                title={t('stepPaymentType')}
                titleIcon={IcnCardQuestion as any}
                fields={buildPaymentTypeFields()}
                onChange={handleChange}
                mode={mode}
                ShowActionBtns={true}
                renderWithRHF
                formMethods={methodsPaymentTypes}
                rulesProvider={(name: string, getVals: () => any) =>
                  getRulesForField(name as any, getVals)
                }
                onSubmit={(data: any) => {
                  Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                }}
                onValidationFail={() => {}}
                syncOnChange={false}
              />
            </Box>

            

            {/* Pay alerts section */}
            <Box className={styles.manageSectionBox}>
              <CreatePayAlertsForm
                testIdPrefix={buildTestId(testIdPrefix, 'form-pay-alerts')}
                title={t('stepPayAlerts')}
                titleIcon={IcnBellBell}
                mode={mode}
                ShowActionBtns={true}
                alerts={payAlerts}
                onChange={(updatedAlerts) => {
                  setPayAlerts(updatedAlerts);
                  setHasUnsavedChanges(true);
                }}
                onSubmit={(updatedAlerts) => {
                  setPayAlerts(updatedAlerts);
                  setHasUnsavedChanges(true);
                }}
                enableCountSelector={true}
                defaultAlertsCount={payAlerts.length || 5}
              />
            </Box>

            {/* Bottom action buttons */}
            {/* For Needs Action status, only show button when there are unsaved changes */}
            {((viewed?.status === 'Needs Action' || viewed?.status === 'Need Action') ? hasUnsavedChanges : true) && (
              <FormActionButtons
                testIdPrefix={buildTestId(testIdPrefix, 'form-actions')}
                cancelText=""
                showCancel={false}
                onNext={() => {
                  if ((viewed?.status === 'Needs Action' || viewed?.status === 'Need Action') || hasUnsavedChanges) {
                    // Submit the changes
                    handleSubmitChanges();
                  } else {
                    // Open delete dialog
                    setDeleteDialogOpen(true);
                  }
                }}
                nextText={(viewed?.status === 'Needs Action' || viewed?.status === 'Need Action' || hasUnsavedChanges) ? t('buttonSubmitChanges') : t('buttonDeleteBiller')}
                nextButtonVariant={(viewed?.status === 'Needs Action' || viewed?.status === 'Need Action' || hasUnsavedChanges) ? "primary" : "tertiary"}
                useDeleteIcon={!(viewed?.status === 'Needs Action' || viewed?.status === 'Need Action' || hasUnsavedChanges)}
              />
            )}
          </Box>
        )}

        {selectedTab === 'history' && (
          <Box data-testid={buildTestId(testIdPrefix, 'tab-history')}>
            <ManageHistoryTable testIdPrefix={buildTestId(testIdPrefix, 'history-table')} />
          </Box>
        )}

        {selectedTab === 'audit' && (
          <Box data-testid={buildTestId(testIdPrefix, 'tab-audit')}>
            <ManageAuditTrail testIdPrefix={buildTestId(testIdPrefix, 'audit-trail')} />
          </Box>
        )}
      </Box>

      <Dialog
        data-testid={buildTestId(testIdPrefix, 'delete-dialog')}
        name="delete-biller-dialog"
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title={t('deleteBillerDialogTitle')}
        content={
          <Box className={styles.deleteDialogContent}>
            <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
            <Box className={styles.deleteDialogText}>
              {t('deleteBillerDialogMessage')}
            </Box>
          </Box>
        }
        secondaryCTALabel={t('buttonDeleteConfirm')}
        tertiaryCTALabel={t('buttonCancel')}
        onSecondaryCTA={handleDeleteBiller}
        onTertiaryCTA={() => setDeleteDialogOpen(false)}
        maxWidth="560px"
        secondaryCTAWidth="130px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />
    </Box>
  );
}

export default Page;
