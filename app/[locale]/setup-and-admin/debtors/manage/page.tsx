/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Box, Typography, Divider, CircularProgress } from '@mui/material';
import { Breadcrumb, ButtonToggle, Heading, Dialog } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { updateManagedDebtor, updateManagedDebtorObject, setMandateDetails, resetManagedDebtor } from '@store/slices/createDebtorSlice';
import { lookupBank, resetBankLookup } from '@store/slices/createBeneficiarySlice';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  buildPersonalFieldsDebtor,
  buildAddressFieldsDebtor,
  buildBankFieldsDebtor,
  buildAccountFieldsDebtor,
  buildCollectionFieldsDebtor,
  buildMandateFieldsDebtor,
} from 'src/utils/DebtorsField';
import { getRulesForField } from 'src/utils/DebtorsCreateLogic';
import ManageHistoryTable from '@organisms/debtors/ManageHistoryTable';
import { FormActionButtons } from 'components/common/formActionButtons';
import ManageAuditTrail from '@organisms/debtors/ManageAuditTrail';
import CreateJournyForm from 'components/common/CreateJournyForm';
import IcnAccountTile from 'public/icons/icn_people_1_nametag.svg';
import IcnBranch from 'public/icons/icn_branch.svg';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';
import IcnAccountTitle from 'public/icons/icn_account_tile.svg';
import IcnViewGrid from 'public/icons/icn_view_grid.svg';
import IcnPaperStack from 'public/icons/icn_paper_stack.svg';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { useDebtors } from '../../../../../lib/hooks/useDebtors';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import { updateDebtor as updateDebtorApi } from '@lib/api/debtorApi';
import { prepareUpdatePayload } from '@lib/transformers/debtorTransformers';
import { formatTime, formatDateLong } from '@lib/utils';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslations } from 'next-intl';
import { extractErrorIssues, formatErrorMessages } from 'src/utils/errorMessageFormatter';

function Page() {
  const router = useRouter();
  const testIdPrefix = 'debtors-manage';
  const [selectedTab, setSelectedTab] = useState<string>('details');
  const [debtorDetailsMode, setDebtorDetailsMode] = useState<'edit' | 'review'>('review');
  const [bankDetailsMode, setBankDetailsMode] = useState<'edit' | 'review'>('review');
  const [mandatesMode, setMandatesMode] = useState<'edit' | 'review'>('review');
  const [collectionMode, setCollectionMode] = useState<'edit' | 'review'>('review');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditingPaymentCategory, setIsEditingPaymentCategory] = useState(false);
  const [editedPaymentType, setEditedPaymentType] = useState('');
  const [editedEntityCategory, setEditedEntityCategory] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteErrorDialogOpen, setDeleteErrorDialogOpen] = useState(false);
  const [editErrorDialogOpen, setEditErrorDialogOpen] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string>('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lookupTriggered, setLookupTriggered] = useState(false);
  const [insufficientInfo, setInsufficientInfo] = useState(false);
  const translateLang = useTranslations('debtorsHubData');
  const dispatch = useAppDispatch();
  const { deleteDebtorById, debtor, managedDebtor, countryOptions, currencyOptions, accountTypeOptions, collectionTypeOptions, collectionTypesList, fetchCountries, fetchCurrencies, fetchCollectionTypes } = useDebtors();
  const bankLookup = useAppSelector((state) => state.createBeneficiary.bankLookup);
  const viewed: any = managedDebtor;

  // Bank select options from lookup
  const bankSelectOptions = (bankLookup?.items || []).map((item: any) => {
    const sortCode = item.preferredBranchCode || item.branchSortCode || item.branchCode;
    const parts = [item.bankName, item.branchName, item.city, item.countryCode].filter(Boolean);
    const label = parts.join(' — ') + (sortCode ? ` (Sort: ${sortCode})` : '');
    const value = sortCode || item.entityKey || item.bankKey || item.bic || item.bankName || label;
    return { label, value };
  });

  useEffect(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Fetch dropdown data (countries, currencies, collection types) on mount
  useEffect(() => {
    fetchCountries();
    fetchCurrencies();
    fetchCollectionTypes();
  }, []);

  // Update collectionTypesList in Redux when fetched
  useEffect(() => {
    if (collectionTypesList && collectionTypesList.length > 0) {
      dispatch(updateManagedDebtor({ field: 'collectionTypesList', value: collectionTypesList }));
    }
  }, [collectionTypesList, dispatch]);

  const handleCancelClick = useCallback(() => {
    setCancelDialogOpen(true);
  }, []);

  const handleNext = useCallback((action: 'edit' | 'delete', response: any = {}) => {
    // Handle array response from backend
    const responseData = Array.isArray(response) ? response[0] : response;
    const actionType = responseData?.action || 'ACT';
    const statusType = responseData?.authoriseStatus || '';
    const debtorName = viewed?.counterPartyName || '';
    
    const params = new URLSearchParams({
      action: action,
      [`${action}Action`]: actionType,
      [`${action}Status`]: statusType,
      debtorName: debtorName
    });
    router.push(`/setup-and-admin/debtors/manage/success?${params.toString()}` as any);
  }, [router, viewed]);

  const handleDeleteDebtor = useCallback(async () => {
    if (!viewed?.entityKey) {
      setDeleteErrorDialogOpen(true);
      setDeleteDialogOpen(false);
      return;
    }

    if (viewed.authoriseStatus !== 'ACT') {
      setDeleteErrorDialogOpen(true);
      setDeleteDialogOpen(false);
      return;
    }

    setIsSubmitting(true);
    setDeleteDialogOpen(false);
    try {
      // Pass the full debtor object - the hook will prepare the proper payload
      const result = await deleteDebtorById(viewed);
      
      // Extract action and status from the response (backend determines if approval is needed)
      const response = result.payload || {};
      const deleteAction = response.action || 'ACT';
      const deleteStatus = response.authoriseStatus || '';
      const debtorName = viewed.counterPartyName || '';
      
      // Navigate to success page with response data
      handleNext('delete', response);
    } catch (error: any) {
      setDeleteErrorDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [viewed, deleteDebtorById, router]);

  const handleSubmitChanges = useCallback(async () => {
    if (!viewed?.entityKey) {
      setEditErrorDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = prepareUpdatePayload(viewed);
      console.log('🔧 Update payload:', { 
        action: payload.action, 
        status: viewed.authoriseStatus,
        isRepair: viewed.authoriseStatus === 'ACR' 
      });
      const response = await updateDebtorApi(payload);
      handleNext('edit', response);
    } catch (error: any) {
      // Extract error issues and try to map to error codes
      const errorIssues = extractErrorIssues(error?.response?.data || error?.data || error);
      let errorMsg = translateLang('unableUpdateDebtor');
      
      if (errorIssues && errorIssues.length > 0) {
        try {
          const formattedErrors = formatErrorMessages(errorIssues);
          if (formattedErrors && formattedErrors !== 'Something went wrong. Please try again or contact your bank representative for assistance.') {
            errorMsg = formattedErrors; // Use mapped error codes
          }
        } catch (e) {
          // Keep generic fallback on error
        }
      }
      
      setEditErrorMessage(errorMsg);
      setEditErrorDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [viewed, handleNext, translateLang]);

  const handleConfirmCancel = useCallback(() => {
    setCancelDialogOpen(false);
    router.push('/setup-and-admin/debtors' as any);
  }, [router]);

  const isVerified = viewed?.creationMethod === 'verified';

  const handleChange = (name: string, value: any) => {
    const addressKeys = new Set([
      'addressLine1',
      'addressLine2',
      'townName',
      'countrySubDivision',
      'countryCode',
    ]);
    
    // Handle mandate field changes (both regular and MOZ mandates)
    if (name.startsWith('mandate_')) {
      // Extract mandate index and field name from pattern: mandate_{index}_{fieldName}
      const parts = name.split('_');
      const index = parseInt(parts[1], 10);
      const fieldName = parts.slice(2).join('_'); // Handle fields like 'beginDate', 'invoiceBeginDate', etc.
      
      // Get both regular and MOZ mandates
      const regularMandates = viewed?.mandateDetails || [];
      const mozMandates = viewed?.mozMandateDetails || [];
      const allMandates = [...regularMandates, ...mozMandates];
      
      if (index >= 0 && index < allMandates.length) {
        const mandate = allMandates[index];
        const isMozMandate = 'mandateID' in mandate || 'invoiceBeginDate' in mandate;
        
        if (isMozMandate) {
          // Handle MOZ mandate update
          const mozIndex = index - regularMandates.length;
          if (mozIndex >= 0 && mozIndex < mozMandates.length) {
            const updatedMozMandates = [...mozMandates];
            // Map field names correctly: 'id' -> 'mandateID' for MOZ mandates
            const actualFieldName = fieldName === 'id' ? 'mandateID' : fieldName;
            updatedMozMandates[mozIndex] = {
              ...updatedMozMandates[mozIndex],
              [actualFieldName]: value,
            };
            // Update mozMandateDetails in Redux
            dispatch(updateManagedDebtor({ field: 'mozMandateDetails', value: updatedMozMandates }));
            // Mark as having unsaved changes
            setHasUnsavedChanges(true);
            console.log('📋 MOZ Mandate field updated:', { mozIndex, fieldName: actualFieldName, value });
          }
        } else {
          // Handle regular mandate update
          if (index < regularMandates.length) {
            const updatedMandates = [...regularMandates];
            // Map field names correctly: 'id' -> 'mandateId' for regular mandates
            const actualFieldName = fieldName === 'id' ? 'mandateId' : fieldName;
            updatedMandates[index] = {
              ...updatedMandates[index],
              [actualFieldName]: value,
            };
            dispatch(setMandateDetails({ mandates: updatedMandates, isManaged: true }));
            // Mark as having unsaved changes
            setHasUnsavedChanges(true);
            console.log('📋 Regular Mandate field updated:', { index, fieldName: actualFieldName, value });
          }
        }
      }
      return;
    }
    
    if (addressKeys.has(name)) {
      dispatch(updateManagedDebtorObject({ path: ['counterPartyAddress', name], value }));
    } else {
      dispatch(updateManagedDebtor({ field: name, value }));
      
      // Log collection type changes
      if (name === 'collections') {
        console.log('📋 Collection types updated:', value);
      }
      
      // When currency is changed, also update transactionLimitCurrency
      if (name === 'currency') {
        dispatch(updateManagedDebtor({ field: 'transactionLimitCurrency', value }));
        console.log('💱 Currency changed:', value, '→ also updating transactionLimitCurrency');
      }
      
      // When bank country code is changed, also update the bankBranchAddress path
      if (name === 'bankCountryCode') {
        dispatch(updateManagedDebtorObject({ path: ['bankBranchAddress', 'countryCode'], value }));
      }
      
      // When town is changed, also update the bankBranchAddress path
      if (name === 'town') {
        dispatch(updateManagedDebtorObject({ path: ['bankBranchAddress', 'townName'], value }));
      }
    }
  };

  // RHF default values for validation-enabled forms
  const detailsDefaultValues = {
    counterPartyName: viewed?.counterPartyName || '',
    referenceIDX: viewed?.referenceIDX || '',
    counterPartyReference: viewed?.counterPartyReference || '',
    addressLine1: viewed?.counterPartyAddress?.addressLine1 || '',
    addressLine2: viewed?.counterPartyAddress?.addressLine2 || '',
    countryCode: viewed?.counterPartyAddress?.countryCode || '',
  } as const;

  const bankDefaultValues = {
    financialInstitutionName: viewed?.financialInstitutionName || '',
    branchName: viewed?.bankBranchName || viewed?.branchName || '',
    bic: viewed?.internationalBankBicCode || viewed?.bic || '',
    branchSortCode: viewed?.branchSortCode || '',
    town: viewed?.bankBranchAddress?.townName || viewed?.town || '',
    bankCountryCode: viewed?.bankBranchAddress?.countryCode || viewed?.bankCountryCode || '',
    accountNumber: viewed?.accountNumber || '',
    iban: viewed?.iban || '',
    currency: viewed?.accountCurrency || viewed?.currency || '',
    transactionLimit: String(viewed?.transactionLimit ?? ''),
    transactionLimitCurrency: viewed?.transactionLimitCurrency || viewed?.accountCurrency || 'ZAR',
    accountType: viewed?.accountType || '',
    collections: (() => {
      const raw = viewed?.collectionProfiles;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
      return [] as string[];
    })(),
  } as const;

  const methodsDetails = useForm({ mode: 'all', reValidateMode: 'onChange', defaultValues: detailsDefaultValues });
  const methodsBank = useForm({ mode: 'all', reValidateMode: 'onChange', defaultValues: bankDefaultValues });
  
  // Reset form values when viewed debtor changes
  useEffect(() => {
    if (viewed) {
      methodsBank.reset({
        financialInstitutionName: viewed?.financialInstitutionName || '',
        branchName: viewed?.bankBranchName || viewed?.branchName || '',
        bic: viewed?.internationalBankBicCode || viewed?.bic || '',
        branchSortCode: viewed?.branchSortCode || '',
        town: viewed?.bankBranchAddress?.townName || viewed?.town || '',
        bankCountryCode: viewed?.bankBranchAddress?.countryCode || viewed?.bankCountryCode || '',
        accountNumber: viewed?.accountNumber || '',
        iban: viewed?.iban || '',
        currency: viewed?.accountCurrency || viewed?.currency || '',
        transactionLimit: String(viewed?.transactionLimit ?? ''),
        transactionLimitCurrency: viewed?.transactionLimitCurrency || viewed?.accountCurrency || 'ZAR',
        accountType: viewed?.accountType || '',
        collections: (() => {
          const raw = viewed?.collectionProfiles;
          if (Array.isArray(raw)) return raw;
          if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
          return [] as string[];
        })(),
      });
      
      methodsDetails.reset({
        counterPartyName: viewed?.counterPartyName || '',
        referenceIDX: viewed?.referenceIDX || '',
        counterPartyReference: viewed?.counterPartyReference || '',
        addressLine1: viewed?.counterPartyAddress?.addressLine1 || '',
        addressLine2: viewed?.counterPartyAddress?.addressLine2 || '',
        countryCode: viewed?.counterPartyAddress?.countryCode || '',
      });
    } else {
      // Reset forms to empty values when viewed is null/undefined (after page reload)
      methodsBank.reset({
        financialInstitutionName: '',
        branchName: '',
        bic: '',
        branchSortCode: '',
        town: '',
        bankCountryCode: '',
        accountNumber: '',
        iban: '',
        currency: '',
        transactionLimit: '',
        transactionLimitCurrency: 'ZAR',
        accountType: '',
        collections: [],
      });
      
      methodsDetails.reset({
        counterPartyName: '',
        referenceIDX: '',
        counterPartyReference: '',
        addressLine1: '',
        addressLine2: '',
        countryCode: '',
      });
    }
  }, [viewed?.entityKey, methodsBank, methodsDetails, viewed]);
  
  // Watch accountNumber and iban fields to trigger cross-validation
  useEffect(() => {
    const subscription = methodsBank.watch((value, { name }) => {
      if (name === 'accountNumber' || name === 'iban') {
        // Trigger validation on both fields when either changes
        const otherField = name === 'accountNumber' ? 'iban' : 'accountNumber';
        methodsBank.trigger(otherField);
      }
    });
    return () => subscription.unsubscribe();
  }, [methodsBank]);
  
  // Track if user has made changes by monitoring form dirty state
  useEffect(() => {
    if (methodsDetails.formState.isDirty || methodsBank.formState.isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [methodsDetails.formState.isDirty, methodsBank.formState.isDirty]);
  
  // Auto-save and close other sections when opening a new section for editing
  const handleSectionEditToggle = useCallback((section: 'debtorDetails' | 'bankDetails' | 'mandates' | 'collection', isEditing: boolean) => {
    if (isEditing) {
      // Save and close OTHER sections (not the one being opened)
      if (debtorDetailsMode === 'edit' && section !== 'debtorDetails') {
        methodsDetails.handleSubmit((data: any) => {
          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
        })();
        setDebtorDetailsMode('review');
      }
      if (bankDetailsMode === 'edit' && section !== 'bankDetails') {
        methodsBank.handleSubmit((data: any) => {
          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
        })();
        setBankDetailsMode('review');
      }
      if (mandatesMode === 'edit' && section !== 'mandates') {
        setMandatesMode('review');
      }
      if (collectionMode === 'edit' && section !== 'collection') {
        methodsBank.handleSubmit((data: any) => {
          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
        })();
        setCollectionMode('review');
      }
      
      // Set the clicked section to edit mode
      if (section === 'debtorDetails') {
        setDebtorDetailsMode('edit');
      } else if (section === 'bankDetails') {
        setBankDetailsMode('edit');
      } else if (section === 'mandates') {
        setMandatesMode('edit');
      } else if (section === 'collection') {
        setCollectionMode('edit');
      }
    } else {
      // When closing (Save/Cancel), set section back to review
      if (section === 'debtorDetails') {
        setDebtorDetailsMode('review');
      } else if (section === 'bankDetails') {
        setBankDetailsMode('review');
      } else if (section === 'mandates') {
        setMandatesMode('review');
      } else if (section === 'collection') {
        setCollectionMode('review');
      }
    }
  }, [debtorDetailsMode, bankDetailsMode, mandatesMode, collectionMode, methodsDetails, methodsBank, handleChange]);
  
  const buildPersonalFields = useCallback(
    () => buildPersonalFieldsDebtor(viewed, translateLang),
    [viewed?.counterPartyName, viewed?.referenceIDX, viewed?.counterPartyReference],
  );

  const buildAddressFields = useCallback(
    () => buildAddressFieldsDebtor(viewed, translateLang, countryOptions),
    [viewed?.counterPartyAddress, countryOptions],
  );

  const handleLookupBank = useCallback(() => {
    const vals = methodsBank.getValues() as any;
    const params = {
      bankName: vals.financialInstitutionName || '',
      bic: vals.bic || '',
      branchName: vals.branchName || '',
      city: vals.town || '',
      countryCode: vals.bankCountryCode || '',
    };
    // Require at least bank name and country/region for lookup
    if (!params.bankName || !params.countryCode) {
      setLookupTriggered(true);
      setInsufficientInfo(true);
      // Clear any previous results so InfoBlock message is accurate
      dispatch(resetBankLookup());
      
      // Set field-level validation errors
      if (!params.bankName) {
        methodsBank.setError('financialInstitutionName', {
          type: 'required',
          message: translateLang('bankNameRequired')
        });
      } else {
        methodsBank.clearErrors('financialInstitutionName');
      }
      
      if (!params.countryCode) {
        methodsBank.setError('bankCountryCode', {
          type: 'required',
          message: translateLang('bankCountryRequired')
        });
      } else {
        methodsBank.clearErrors('bankCountryCode');
      }
      return;
    }
    setLookupTriggered(true);
    setInsufficientInfo(false);
    methodsBank.clearErrors('financialInstitutionName');
    methodsBank.clearErrors('bankCountryCode');
    dispatch(lookupBank(params));
  }, [dispatch, methodsBank]);

  const handleResetBankLookup = useCallback(() => {
    dispatch(resetBankLookup());
    setLookupTriggered(false);
    setInsufficientInfo(false);
    // Clear validation errors when resetting
    methodsBank.clearErrors('financialInstitutionName');
    methodsBank.clearErrors('bankCountryCode');
  }, [dispatch, methodsBank]);

  const buildBankFields = useCallback(
    () => buildBankFieldsDebtor(viewed, translateLang, bankSelectOptions, false, countryOptions),
    [
      viewed?.financialInstitutionName,
      viewed?.bankBranchName,
      viewed?.internationalBankBicCode,
      viewed?.branchSortCode,
      viewed?.bankBranchAddress?.townName,
      viewed?.bankBranchAddress?.countryCode,
      viewed?.bankCountryCode,
      translateLang,
      bankSelectOptions,
      countryOptions,
    ],
  );

  const buildAccountFields = useCallback(
    () => buildAccountFieldsDebtor(viewed, translateLang, currencyOptions, accountTypeOptions),
    [
      viewed?.accountNumber,
      viewed?.iban,
      viewed?.currency,
      viewed?.accountCurrency,
      viewed?.transactionLimit,
      viewed?.transactionLimitCurrency,
      viewed?.accountType,
      translateLang,
      currencyOptions,
      accountTypeOptions,
    ],
  );

  const buildCollectionFields = useCallback(
    () => buildCollectionFieldsDebtor(viewed, translateLang, collectionTypeOptions),
    [viewed?.collectionProfiles, viewed?.linkedCollectionProfiles, viewed?.collections, collectionTypeOptions, translateLang],
  );

  const buildMandateFields = useMemo(
    () => buildMandateFieldsDebtor(viewed, translateLang),
    [viewed?.mandateDetails, viewed?.mozMandateDetails, viewed?.entityKey, translateLang],
  );

  // Helper function to map status codes to display values (same as debtor list page)
  const getStatusDisplay = (code: string) => {
    const statusMap: Record<string, string> = {
      ACT: translateLang('active'),
      ACA: translateLang('awaitingApproval'),
      ACR: translateLang('needsAction'),
      ACI: translateLang('awaitingCustomerAudit'),
      PCA: translateLang('processing'),
      ABA: 'Awaiting Bank Authorisation',
      ABI: 'Awaiting Bank Audit',
      ABR: 'Awaiting Bank Repair',
      PBA: 'Partially Bank Authorised',
    };
    return statusMap[code] || code || 'Unknown';
  };

  const formData = {
    firstName: viewed?.counterPartyName || '',
    lastName: viewed?.surname || '',
    beneficiaryCode: viewed?.referenceIDX || '',
    beneficiaryReference: viewed?.counterPartyReference || '',
    postalCode: viewed?.counterPartyAddress?.postalCode || '',
    addressLine1: viewed?.counterPartyAddress?.addressLine1 || '',
    addressLine2: viewed?.counterPartyAddress?.addressLine2 || '',
    city: viewed?.counterPartyAddress?.townName || '',
    province: viewed?.counterPartyAddress?.countrySubDivision || '',
    country: viewed?.counterPartyAddress?.countryCode || '',
  };

  const bankData = {
    bankName: viewed?.financialInstitutionName || '',
    branchName: viewed?.branchName || '',
    bic: viewed?.bic || '',
    accountNumber: viewed?.accountNumber || '',
    branchCode: viewed?.branchSortCode || '',
    bankAccountVerificationStatus: '',
    accountName: '',
    iban: viewed?.iban || '',
    accountType: viewed?.accountType || '',
    paymentType: '',
  };

  // Note: Removed deprecated paymentCategoryData usage

  // Removed payment category edit handlers as they belong to create flow

  // Keep RHF forms in sync when managedDebtor data loads/changes
  useEffect(() => {
    const detailsDefaults = {
      counterPartyName: managedDebtor?.counterPartyName || '',
      referenceIDX: managedDebtor?.referenceIDX || '',
      counterPartyReference: managedDebtor?.counterPartyReference || '',
      addressLine1: managedDebtor?.counterPartyAddress?.addressLine1 || '',
      addressLine2: managedDebtor?.counterPartyAddress?.addressLine2 || '',
      countryCode: managedDebtor?.counterPartyAddress?.countryCode || '',
    } as const;

    const bankDefaults = {
      financialInstitutionName: managedDebtor?.financialInstitutionName || '',
      branchName: managedDebtor?.bankBranchName || (managedDebtor as any)?.branchName || '',
      bic: managedDebtor?.internationalBankBicCode || managedDebtor?.bic || '',
      branchSortCode: managedDebtor?.branchSortCode || '',
      town: managedDebtor?.bankBranchAddress?.townName || (managedDebtor as any)?.town || '',
      bankCountryCode: (managedDebtor as any)?.bankCountryCode || '',
      accountNumber: managedDebtor?.accountNumber || '',
      iban: managedDebtor?.iban || '',
      currency: (managedDebtor as any)?.accountCurrency || (managedDebtor as any)?.currency || '',
      transactionLimit: String((managedDebtor as any)?.transactionLimit ?? ''),
      transactionLimitCurrency: (managedDebtor as any)?.transactionLimitCurrency || (managedDebtor as any)?.accountCurrency || 'USD',
      accountType: managedDebtor?.accountType || '',
      collections: (() => {
        // Prefer collections field if it exists (user has edited it), otherwise use collectionProfiles
        const collectionsField = (managedDebtor as any)?.collections;
        if (Array.isArray(collectionsField) && collectionsField.length > 0) {
          return collectionsField;
        }
        const raw = (managedDebtor as any)?.collectionProfiles;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
        return [] as string[];
      })(),
    } as const;

    methodsDetails.reset(detailsDefaults);
    methodsBank.reset(bankDefaults);
  }, [managedDebtor, methodsDetails, methodsBank]);
 
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          data-testid={buildTestId(testIdPrefix, 'breadcrumb')}
          links={[
            { href: '/', label: translateLang('breadcrumbDashboard') },
            { href: '/setup-and-admin/debtors', label: translateLang('breadcrumbDebtors') },
            { href: '/setup-and-admin/debtors/manage', label: translateLang('breadcrumbManageDebtor') },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
          {viewed?.counterPartyName 
            ? `${translateLang('breadcrumbManageDebtor')} ${viewed.counterPartyName}` 
            : translateLang('breadcrumbManageDebtor')}
        </Heading>

        <Box sx={{ mt: 3, mb: 3, width: '280px' }} data-testid={buildTestId(testIdPrefix, 'tabs')}>
          <ButtonToggle
            initialSelected={selectedTab === 'details' ? 0 : selectedTab === 'history' ? 1 : 2}
            fullWidth={true}
            buttons={[
              {
                children: <span data-testid={buildTestId(testIdPrefix, 'tab', 'details')}>{translateLang('details')}</span>,
                toggleValue: 'details',
                // dataTestId: buildTestId(testIdPrefix, 'tab', 'details'),
              },
              {
                children: <span data-testid={buildTestId(testIdPrefix, 'tab', 'history')}>{translateLang('history')}</span>,
                toggleValue: 'history',
                // dataTestId: buildTestId(testIdPrefix, 'tab', 'history'),
              },
              {
                children: <span data-testid={buildTestId(testIdPrefix, 'tab', 'audit')}>{translateLang('auditTrail')}</span>,
                toggleValue: 'audit',
                // dataTestId: buildTestId(testIdPrefix, 'tab', 'audit'),
              },
            ]}
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

        {selectedTab === 'details' && (
          <Box data-testid={buildTestId(testIdPrefix, 'details-tab-content')}>
            {/* Repair Note - Display when debtor is in repair status (ACR) */}
            {viewed?.authoriseStatus === 'ACR' && (
              <Box
                sx={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E0E5EB',
                  borderLeft: '4px solid #6B7280',
                  borderRadius: '4px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <InfoOutlinedIcon sx={{ color: '#6B7280', fontSize: '20px' }} />
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#333333',
                      lineHeight: '20px',
                    }}
                  >
                    {translateLang('authoriserComments')}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#6B7280',
                    lineHeight: '20px',
                    marginLeft: '28px',
                  }}
                >
                  {translateLang('noteFrom')} {viewed.declineUserName} {translateLang('at')} {formatTime(viewed.declineTimestamp)} {translateLang('on')} {formatDateLong(viewed.declineTimestamp)}: {viewed.declineReason}
                </Typography>
              </Box>
            )}

            <CreateJournyForm
              onChange={() => {}}
              mode="review"
              ShowActionBtns={false}
              renderWithRHF={false}
              sections={[
                {
                  title: translateLang('processingInformation'),
                  titleIcon: IcnViewGrid as any,
                  fields: [
                    {
                      label: translateLang('submissionMechanism'),
                      name: 'submissionMechanism',
                      type: 'text',
                      value: viewed?.originatingChannel || '-',
                      disabled: true,
                    },
                    {
                      label: translateLang('status'),
                      name: 'status',
                      type: 'text',
                      value: getStatusDisplay(viewed?.authoriseStatus || ''),
                      disabled: true,
                    },
                  ],
                  ShowActionBtns: false,
                },
              ]}
            />
            <Box sx={{ marginTop: '16px' }}>
            <CreateJournyForm
              onChange={handleChange}
              mode={debtorDetailsMode}
              ShowActionBtns={viewed?.authoriseStatus === 'ACT' || viewed?.authoriseStatus === 'ACR'}
              renderWithRHF
              formMethods={methodsDetails}
              rulesProvider={(name: string, getVals: () => any) =>
                getRulesForField(name as any, getVals)
              }
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                setDebtorDetailsMode('review');
              }}
              onValidationFail={() => {}}
              onEditModeChange={(isEditing) => {
                handleSectionEditToggle('debtorDetails', isEditing);
              }}
              syncOnChange={false}
              sections={[
                {
                  title: translateLang('debtorDetails'),
                  titleIcon: IcnAccountTile as any,
                  fields: buildPersonalFields(),
                  ShowActionBtns: viewed?.authoriseStatus === 'ACT' || viewed?.authoriseStatus === 'ACR',
                },
                {
                  title: translateLang('addressDetails'),
                  titleIcon: IcnAccountTile as any,
                  fields: buildAddressFields(),
                  ShowActionBtns: false,
                },
              ]}
            />
            </Box>

            <Box sx={{ marginTop: '16px' }}>
              <CreateJournyForm
                onChange={handleChange}
                mode={bankDetailsMode}
                ShowActionBtns={viewed?.authoriseStatus === 'ACT' || viewed?.authoriseStatus === 'ACR'}
                renderWithRHF
                formMethods={methodsBank}
                rulesProvider={(name: string, getVals: () => any) =>
                  getRulesForField(name as any, getVals)
                }
                onSubmit={(data: any) => {
                  Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                  setBankDetailsMode('review');
                }}
                onValidationFail={() => {}}
                onEditModeChange={(isEditing) => {
                  handleSectionEditToggle('bankDetails', isEditing);
                }}
                syncOnChange={false}
                onLookup={() => handleLookupBank()}
                onReset={() => handleResetBankLookup()}
                showInfoBlock={lookupTriggered}
                infoBlockResultsFound={(bankLookup?.items?.length ?? 0) > 0}
                infoBlockTitle={
                  insufficientInfo
                    ? translateLang('moreInfoNeeded')
                    : (bankLookup?.items?.length ?? 0) === 0
                      ? translateLang('noBankResults')
                      : undefined
                }
                infoBlockDescription={
                  insufficientInfo
                    ? translateLang('enterBankNameCountry')
                    : (bankLookup?.items?.length ?? 0) === 0
                      ? translateLang('refineSearch')
                      : undefined
                }
                infoMessage={translateLang('lookupInstruction')}
                sections={[
                  {
                    title: translateLang('bankDetails'),
                    titleIcon: IcnBranch as any,
                    fields: buildBankFields(),
                    ShowActionBtns: viewed?.authoriseStatus === 'ACT' || viewed?.authoriseStatus === 'ACR',
                  },
                  {
                    title: translateLang('accountDetails'),
                    titleIcon: IcnAccountTitle as any,
                    fields: buildAccountFields(),
                    ShowActionBtns: false,
                  },
                ]}
              />
            </Box>

            {/* Mandates Section - ABOVE Collection Type, using CreateJournyForm like other sections */}
            {((viewed?.mandateDetails && viewed.mandateDetails.length > 0) || 
              (viewed?.mozMandateDetails && viewed.mozMandateDetails.length > 0)) && (
              <Box sx={{ marginTop: '16px' }}>
                <CreateJournyForm
                  key={`mandates-${viewed?.entityKey}-${viewed?.mandateDetails?.length || 0}-${viewed?.mozMandateDetails?.length || 0}`}
                  title={translateLang('mandates')}
                  titleIcon={IcnPaperStack as any}
                  fields={buildMandateFields}
                  onChange={handleChange}
                  mode={mandatesMode}
                  ShowActionBtns={viewed?.authoriseStatus === 'ACT' || viewed?.authoriseStatus === 'ACR'}
                  renderWithRHF={false}
                  syncOnChange={true}
                  sections={[]}
                  onSubmit={() => {
                    console.log('✅ Mandate changes saved');
                    setMandatesMode('review');
                    return true;
                  }}
                  onEditModeChange={(isEditing) => {
                    handleSectionEditToggle('mandates', isEditing);
                  }}
                />
              </Box>
            )}

            <Box sx={{ marginTop: '16px' }}>
              <CreateJournyForm
                title={translateLang('collectionType')}
                titleIcon={IcnCardQuestion as any}
                fields={buildCollectionFields()}
                onChange={handleChange}
                mode={collectionMode}
                ShowActionBtns={viewed?.authoriseStatus === 'ACT' || viewed?.authoriseStatus === 'ACR'}
                renderWithRHF
                formMethods={methodsBank}
                rulesProvider={(name: string, getVals: () => any) =>
                  getRulesForField(name as any, getVals)
                }
                onSubmit={(data: any) => {
                  Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                  setCollectionMode('review');
                }}
                onValidationFail={() => {}}
                onEditModeChange={(isEditing) => {
                  handleSectionEditToggle('collection', isEditing);
                }}
                syncOnChange={false}
              />
            </Box>

            {(debtorDetailsMode === 'review' && bankDetailsMode === 'review' && mandatesMode === 'review' && collectionMode === 'review') && (
              viewed?.authoriseStatus === 'ACT' || 
              (viewed?.authoriseStatus === 'ACR' && hasUnsavedChanges)
            ) ? (
              <FormActionButtons
                testIdPrefix={buildTestId(testIdPrefix, 'actions')}
                showCancel={hasUnsavedChanges}
                cancelText='CANCEL'
                onCancel={handleCancelClick}
                onNext={() => {
                  if (hasUnsavedChanges) {
                    handleSubmitChanges();
                  } else {
                    setDeleteDialogOpen(true);
                  }
                }}
                nextText={hasUnsavedChanges ? translateLang('submitChanges') : translateLang('deleteDebtor')}
                nextButtonVariant={hasUnsavedChanges ? "primary" : "tertiary"}
                useDeleteIcon={!hasUnsavedChanges}
                disabled={isSubmitting}
              />
            ) : null}
          </Box>
        )}
        {selectedTab === 'history' && (
          <Box data-testid={buildTestId(testIdPrefix, 'history-tab-content')}>
            <ManageHistoryTable />
          </Box>
        )}
        {selectedTab === 'audit' && (
          <Box data-testid={buildTestId(testIdPrefix, 'audit-tab-content')}>
            <ManageAuditTrail />
          </Box>
        )}
      </Box>

      <CancellationConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onDismiss={() => setCancelDialogOpen(false)}
        onCancel={handleConfirmCancel}
        heading={translateLang('areYouSureCancel')}
        subheading={translateLang('unsavedChangesLost')}
        dismissLabel={translateLang('dismiss')}
        cancelLabel={translateLang('yesCancel')}
        testIdPrefix={buildTestId(testIdPrefix, 'cancel-confirmation-dialog')}
      />

      <div data-testid={buildTestId(testIdPrefix, 'delete-dialog')}>
      <Dialog
        name="delete-debtor-dialog"
        title={translateLang('deleteDebtor')}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        content={
          <Box
            sx={{
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
            <Box sx={{ fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>
              {translateLang('areYouSureDeleteDebtor')}
            </Box>
          </Box>
        }
        secondaryCTALabel={translateLang('yesDelete')}
        tertiaryCTALabel={translateLang('cancel')}
        onSecondaryCTA={handleDeleteDebtor}
        onTertiaryCTA={() => setDeleteDialogOpen(false)}
        maxWidth="560px"
        secondaryCTAWidth="135px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
        loading={isSubmitting}
      />
      </div>

      <DeleteConfirmationDialog
        open={deleteErrorDialogOpen}
        onClose={() => setDeleteErrorDialogOpen(false)}
        onPrimaryCTA={handleDeleteDebtor}
        onSecondaryCTA={() => setDeleteErrorDialogOpen(false)}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title={translateLang('systemError')}
        message={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
              {translateLang('somethingWentWrong')}
            </div>
            <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '8px' }}>
              {translateLang('unableDeleteDebtor')}
            </div>
            <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
              {translateLang('contactBankRepresentative')}
            </div>
          </div>
        }
        primaryCTALabel={translateLang('tryAgain')}
        secondaryCTALabel={translateLang('cancel')}
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'delete-error-dialog')}
      />

      <DeleteConfirmationDialog
        open={editErrorDialogOpen}
        onClose={() => setEditErrorDialogOpen(false)}
        onPrimaryCTA={handleSubmitChanges}
        onSecondaryCTA={() => setEditErrorDialogOpen(false)}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        primaryCTALoading={isSubmitting}
        title={translateLang('systemError')}
        message={
          <div style={{ textAlign: 'center' }}>
            {editErrorMessage === translateLang('unableUpdateDebtor') ? (
              <>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                  {translateLang('somethingWentWrong')}
                </div>
                <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                  {translateLang('contactBankRepresentative')}
                </div>
              </>
            ) : (
              <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
                {editErrorMessage}
              </div>
            )}
          </div>
        }
        primaryCTALabel={translateLang('tryAgain')}
        secondaryCTALabel={translateLang('cancel')}
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'edit-error-dialog')}
      />
    </Box>
  );
}

export default Page;