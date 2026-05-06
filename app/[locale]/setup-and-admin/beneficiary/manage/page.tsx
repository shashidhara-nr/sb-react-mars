'use client';
 
import { Box, CircularProgress } from '@mui/material';
import { Breadcrumb, ButtonToggle, Heading, Dialog, Button } from 'dist/standard-bank-react';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import BankSelectionDrawer, {
  type BankSelectionDetails,
} from '@organisms/Beneficiary/BankSelectionDrawer';
import { updateBeneficiary, updateBeneficiaryObject, resetBeneficiary, setManageAction, lookupBank, resetBankLookup, lookupCompany, resetCompanyLookup } from '@store/slices/createBeneficiarySlice';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { getRulesForField } from 'src/utils/BeneficiariesCreateLogic';
import ManageHistoryTable from '@organisms/Beneficiary/ManageHistoryTable';
import ManageAuditTrail from '@organisms/Beneficiary/ManageAuditTrail';
import PayAlertsSection from '@organisms/Beneficiary/PayAlertsSection';
import { CreateJournyForm } from 'components/common';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { updateBeneficiary as updateBeneficiaryApi, deleteBeneficiaries } from '@lib/api/beneficiaryApi';
import { prepareUpdatePayload, prepareDeletePayload } from '@lib/transformers/beneficiaryTransformers';
import FormActionButtons from 'components/common/formActionButtons';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import Image from 'next/image';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import IcnAccountTile from 'public/icons/icn_bene_details.svg';
import IcnBranch from 'public/icons/icn_branch.svg';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';
import IcnAccountTitle from 'public/icons/icn_account_tile.svg';
import GridIcon from 'public/icons/icn_view_grid.svg';
import InfoCircleIcon from 'public/icons/icn_info_circle.svg';
import * as domesticBase from 'src/utils/domesticBase';
import * as domesticFxInternational from 'src/utils/domesticFxInterNational';
import * as CompanyUtils from 'src/utils/company';
import { getStatusDisplayText } from 'src/utils/statusUtils';
import { useBeneficiaries } from '@lib/hooks/useBeneficiaries';
import { buildTestId } from 'src/utils/testIds';
import {
  buildAlertDetailsListTO,
  normalizePayAlertRows,
  type PayAlertErrors,
  type PayAlertRow,
  validatePayAlertRows,
} from 'src/utils/beneficiaryPayAlerts';
import { formatTime, formatDateLong } from '@lib/utils';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { extractErrorIssues, formatErrorMessages } from 'src/utils/errorMessageFormatter';

type BankDrawerKind = 'intermediary' | 'correspondent';
 
function Page() {
  const testIdPrefix = 'beneficiary-manage';
  const t = useTranslations('beneficiarieshub');
  const { currencyOptions, paymentTypeOptions, countryOptions, accountTypeOptions } = useBeneficiaries();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const beneficiary = useAppSelector((state) => state.createBeneficiary.beneficiary);
  const bankLookup = useAppSelector((state) => state.createBeneficiary.bankLookup);
  const companyLookup = useAppSelector((state) => state.createBeneficiary.companyLookup);

  const [selectedTab, setSelectedTab] = useState<string>('details');
  const [mode, setMode] = useState<'edit' | 'review'>('review');
  const [paymentCategoryMode, setPaymentCategoryMode] = useState<'edit' | 'review'>('review');
  const [bankDetailsMode, setBankDetailsMode] = useState<'edit' | 'review'>('review');
  const [beneficiaryDetailsMode, setBeneficiaryDetailsMode] = useState<'edit' | 'review'>('review');
  const [paymentTypeMode, setPaymentTypeMode] = useState<'edit' | 'review'>('review');
  const [isBeneficiaryDetailsEditing, setIsBeneficiaryDetailsEditing] = useState(false);
  const [isBankDetailsEditing, setIsBankDetailsEditing] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteErrorDialogOpen, setDeleteErrorDialogOpen] = useState(false);
  const [editErrorDialogOpen, setEditErrorDialogOpen] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string>('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lookupTriggered, setLookupTriggered] = useState(false);
  const [insufficientInfo, setInsufficientInfo] = useState(false);
  const [bankLookupLoading, setBankLookupLoading] = useState(false);
  const [companyLookupTriggered, setCompanyLookupTriggered] = useState(false);
  const [companyLookupLoading, setCompanyLookupLoading] = useState(false);
  const [activeBankDrawer, setActiveBankDrawer] = useState<BankDrawerKind | null>(null);
  const [intermediaryBankSelection, setIntermediaryBankSelection] = useState<BankSelectionDetails | null>(
    () =>
      beneficiary?.intermediaryBankName
        ? {
            bankName: beneficiary.intermediaryBankName,
            countryCode: '',
            countryRegion: '',
            bic: beneficiary.intermediaryBankBicCode || '',
            city: beneficiary.intermediaryBankTownName || '',
            branchName: '',
          }
        : null,
  );
  const [correspondingBankSelection, setCorrespondingBankSelection] = useState<BankSelectionDetails | null>(
    () =>
      beneficiary?.correspondingBankName
        ? {
            bankName: beneficiary.correspondingBankName,
            countryCode: '',
            countryRegion: '',
            bic: beneficiary.correspondingBankBicCode || '',
            city: beneficiary.correspondingBankTownName || '',
            branchName: '',
          }
        : null,
  );

  const handleCancelClick = useCallback(() => {
    setCancelDialogOpen(true);
  }, []);

  const handleNext = useCallback(() => {
    dispatch(setManageAction('edit'));
    router.push('/setup-and-admin/beneficiary/manage/success?action=edit' as any);
  }, [router, dispatch]);

  const handleDeleteBeneficiary = useCallback(async () => {
    if (!beneficiary?.entityKey) {
      setDeleteErrorDialogOpen(true);
      setDeleteDialogOpen(false);
      return;
    }

    if (beneficiary.authoriseStatus !== 'ACT') {
      setDeleteErrorDialogOpen(true);
      setDeleteDialogOpen(false);
      return;
    }

    setIsSubmitting(true);
    setDeleteDialogOpen(false);
    try {
      const deletePayload = prepareDeletePayload(beneficiary);
      await deleteBeneficiaries([deletePayload]);
      dispatch(setManageAction('delete'));
      router.push('/setup-and-admin/beneficiary/manage/success?action=delete' as any);
    } catch (error: any) {
      setDeleteErrorDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [beneficiary, dispatch, router]);

  const detailsDefaultValues = {
    counterPartyName: beneficiary?.counterPartyName || '',
    firstName: (beneficiary as any)?.firstName || '',
    lastName: (beneficiary as any)?.lastName || '',
    surname: beneficiary?.surname || '',
    referenceIDX: beneficiary?.referenceIDX || '',
    counterPartyReference: beneficiary?.counterPartyReference || '',
    billerID: (beneficiary as any)?.billerID || '',
    beneficiaryType: (beneficiary as any)?.beneficiaryType || '',
    entityCategory: (beneficiary as any)?.entityCategory || '',
    addressLine1: beneficiary?.counterPartyAddress?.addressLine1 || '',
    addressLine2: beneficiary?.counterPartyAddress?.addressLine2 || '',
    townName: beneficiary?.counterPartyAddress?.townName || '',
    countrySubDivision: beneficiary?.counterPartyAddress?.countrySubDivision || '',
    countryCode: beneficiary?.counterPartyAddress?.countryCode || '',
    phoneNumber: (beneficiary as any)?.phoneNumber || '',
    email: (beneficiary as any)?.email || '',
    selectedCompany: (beneficiary as any)?.selectedCompany || '',
    cdiNumber: (beneficiary as any)?.cdiNumber || '',
    currency: (beneficiary as any)?.currency || '',
    financialInstitutionName: beneficiary?.financialInstitutionName || '',
    branchSortCode: beneficiary?.branchSortCode || '',
    bic: beneficiary?.bic || beneficiary?.internationalBankBicCode || '',
    bankCountryCode: (beneficiary as any)?.bankCountryCode || '',
    accountNumber: beneficiary?.accountNumber || '',
    accountType: beneficiary?.accountType || '',
  } as const;

  const bankDefaultValues = {
    financialInstitutionName: beneficiary?.financialInstitutionName || '',
    bankBranchName: beneficiary?.bankBranchName || '',
    bic: beneficiary?.internationalBankBicCode || beneficiary?.bic || '',
    branchSortCode: beneficiary?.branchSortCode || '',
    bankCountryCode: beneficiary?.bankBranchAddress?.countryCode || (beneficiary as any)?.bankCountryCode || '',
    bankBranchTownName: beneficiary?.bankBranchAddress?.townName || '',
    accountNumber: beneficiary?.accountNumber || '',
    iban: beneficiary?.iban || '',
    accountType: beneficiary?.accountType || '',
    accountCurrency: beneficiary?.accountCurrency || '',
    transactionLimit: String((beneficiary as any)?.transactionLimit ?? ''),
    transactionLimitCurrency: (beneficiary as any)?.transactionLimitCurrency || 'USD',
    beneficiaryType: (beneficiary as any)?.beneficiaryType || '',
    entityCategory: (beneficiary as any)?.entityCategory || '',
    selectedBank: (beneficiary as any)?.selectedBank || '',
    branchName: (beneficiary as any)?.branchName || beneficiary?.bankBranchName || '',
    town: (beneficiary as any)?.town || beneficiary?.bankBranchAddress?.townName || '',
  } as const;

  const paymentDefaultValues = {
    transactionLimit: String((beneficiary as any)?.transactionLimit ?? ''),
    transactionLimitCurrency: (beneficiary as any)?.transactionLimitCurrency || 'USD',
    paymentType: (beneficiary?.linkedPaymentProfiles || []).map((profile: any) => profile.customerPaymentProfileName),
    beneficiaryType: (beneficiary as any)?.beneficiaryType || '',
    entityCategory: (beneficiary as any)?.entityCategory || '',
  } as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const methodsBank = useForm({ mode: 'onTouched', defaultValues: bankDefaultValues });
  const methodsPayment = useForm({ mode: 'onTouched', defaultValues: paymentDefaultValues });
  const bankBicValue = methodsBank.watch('bic');
  const bankSortCodeValue = methodsBank.watch('branchSortCode');
  const [payAlertErrors, setPayAlertErrors] = useState<PayAlertErrors>({});
  const payAlertCountHint =
    beneficiary?.alertDetailsListTO?.rowCount ?? beneficiary?.alertDetailsListTO?.pageSize;
  const initialPayAlertsRef = useRef<PayAlertRow[]>(
    normalizePayAlertRows(beneficiary?.alertDetailsListTO?.alertDetailsList, payAlertCountHint),
  );
  const payAlertRows = normalizePayAlertRows(
    beneficiary?.alertDetailsListTO?.alertDetailsList,
    payAlertCountHint,
  );
  const payAlertsDirty = useMemo(
    () => JSON.stringify(payAlertRows) !== JSON.stringify(initialPayAlertsRef.current),
    [payAlertRows],
  );

  const persistPayAlertRows = useCallback(
    (rows: PayAlertRow[]) => {
      dispatch(
        updateBeneficiaryObject({
          path: ['alertDetailsListTO'],
          value: buildAlertDetailsListTO(rows, beneficiary?.alertDetailsListTO),
        }),
      );
      dispatch(updateBeneficiary({ field: 'payAlert', value: rows.length > 0 ? 'Y' : 'N' }));
    },
    [dispatch, beneficiary?.alertDetailsListTO],
  );

  const validatePayAlerts = useCallback(() => {
    const detailsValues = methodsDetails.getValues() as any;
    const validation = validatePayAlertRows(payAlertRows, {
      beneficiaryPhone: detailsValues?.phoneNumber || beneficiary?.phoneNumber,
      beneficiaryEmail: detailsValues?.email || beneficiary?.email,
    });
    setPayAlertErrors(validation.errors);
    return validation.isValid;
  }, [methodsDetails, payAlertRows, beneficiary?.phoneNumber, beneficiary?.email]);

  const handlePayAlertRowsChange = useCallback(
    (rows: PayAlertRow[]) => {
      persistPayAlertRows(rows);
      if (Object.keys(payAlertErrors).length > 0) {
        const detailsValues = methodsDetails.getValues() as any;
        const validation = validatePayAlertRows(rows, {
          beneficiaryPhone: detailsValues?.phoneNumber || beneficiary?.phoneNumber,
          beneficiaryEmail: detailsValues?.email || beneficiary?.email,
        });
        setPayAlertErrors(validation.errors);
      }
    },
    [persistPayAlertRows, payAlertErrors, methodsDetails, beneficiary?.phoneNumber, beneficiary?.email],
  );

  useEffect(() => {
    if (bankLookupLoading) {
      setBankLookupLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankLookup]);

  useEffect(() => {
    if (companyLookupLoading) {
      setCompanyLookupLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyLookup]);

  const bankSelectOptions = useMemo(() => {
    const options = [
      { label: 'Select a bank...', value: '' },
      ...(bankLookup?.items || []).map((item: any) => {
        const sortCode = item.branchSortCode || item.branchCode || item.preferredBranchCode;
        const parts = [item.bankName, sortCode, item.branchName, item.city, item.countryCode].filter(Boolean);
        const label = parts.join(', ');
        const value = sortCode || item.bankKey || item.bic || item.bankName || label;
        return { label, value };
      })
    ];
    return options;
  }, [bankLookup?.items]);

  const companySelectOptions = useMemo(() => [
    { label: 'Select a company...', value: '' },
    ...(companyLookup?.items || []).map((item: any) => {
      const parts = [
        item.billerName,
        item.cdiNumber ? `CDI: ${item.cdiNumber}` : null,
        item.billerCity,
        item.billerCountryCode,
      ].filter(Boolean);
      const label = parts.join(' — ');
      const value = item.cdiNumber || item.entityKey || item.billerId || label;
      return { label, value };
    })
  ], [companyLookup?.items]);

  const companyPersonalFields = useMemo(() => {
    const isCompanySelected = Boolean((beneficiary as any)?.selectedCompany);
    const rawFields = CompanyUtils.buildPersonalFields(beneficiary, beneficiary, currencyOptions, countryOptions);
    return rawFields.map((f: any) => {
      if (f.name === 'selectedCompany') {
        return { ...f, type: 'select', lookupBtn: true, fullWidth: true, options: companySelectOptions };
      }
      if (isCompanySelected && ['counterPartyName', 'billerID', 'countryCode'].includes(f.name)) {
        return { ...f, disabled: true };
      }
      if (f.name === 'referenceIDX') {
        return { ...f, disabled: true };
      }
      return f;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiary, currencyOptions, countryOptions, companySelectOptions]);

  const mapCountrySelectFields = useCallback(
    (fields: any[]) =>
      fields.map((field: any) => {
        if (['passportCountry', 'countryCode', 'bankCountryCode'].includes(field.name)) {
          return {
            ...field,
            type: 'select',
            lookupBtn: false,
            options: countryOptions.length > 0 ? countryOptions : field.options,
          };
        }
        return field;
      }),
    [countryOptions],
  );

  const isCompany = beneficiary.beneficiaryType === 'Company';
  const isDomesticBase = beneficiary.beneficiaryType === 'Domestic Base';
  const isDomesticFX = beneficiary.beneficiaryType === 'Domestic FX and/or International';
  
  const isIntermediaryMandatory =
    isDomesticFX &&
    String(bankBicValue ?? '').trim().length === 0 &&
    String(bankSortCodeValue ?? '').trim().length === 0;
  const hasIntermediarySelection = Boolean(
    intermediaryBankSelection?.bankName || beneficiary?.intermediaryBankName,
  );

  const validateIntermediarySelectionRequired = useCallback(() => {
    if (!isIntermediaryMandatory) return true;
    if (hasIntermediarySelection) return true;

    setEditErrorDialogOpen(true);
    return false;
  }, [isIntermediaryMandatory, hasIntermediarySelection]);

  const handleBankDrawerSubmit = useCallback(
    (selection: BankSelectionDetails) => {
      if (activeBankDrawer === 'intermediary') {
        setIntermediaryBankSelection(selection);
        dispatch(updateBeneficiary({ field: 'intermediaryBankName', value: selection.bankName }));
        dispatch(updateBeneficiary({ field: 'intermediaryBankBicCode', value: selection.bic }));
        dispatch(updateBeneficiary({ field: 'intermediaryBankTownName', value: selection.city }));
      }

      if (activeBankDrawer === 'correspondent') {
        setCorrespondingBankSelection(selection);
        dispatch(updateBeneficiary({ field: 'correspondingBankName', value: selection.bankName }));
        dispatch(updateBeneficiary({ field: 'correspondingBankBicCode', value: selection.bic }));
        dispatch(updateBeneficiary({ field: 'correspondingBankTownName', value: selection.city }));
      }

      setActiveBankDrawer(null);
    },
    [activeBankDrawer, dispatch],
  );
  const handleSubmitChanges = useCallback(async () => {
    if (!beneficiary?.entityKey) {
      setEditErrorDialogOpen(true);
      return;
    }

    const payAlertsValid = validatePayAlerts();
    if (!payAlertsValid) {
      return;
    }

    // Validate intermediary bank requirement for Domestic FX
    if (!validateIntermediarySelectionRequired()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = prepareUpdatePayload(beneficiary);
      await updateBeneficiaryApi(payload);
      handleNext();
    } catch (error: any) {
      // Extract error issues and try to map to error codes
      const errorIssues = extractErrorIssues(error?.response?.data || error?.data || error);
      let errorMsg = 'We are unable to edit the beneficiary.';
      
      if (errorIssues && errorIssues.length > 0) {
        try {
          const formattedErrors = formatErrorMessages(errorIssues);
          if (formattedErrors && formattedErrors !== 'Something went wrong') {
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
  }, [beneficiary, dispatch, handleNext, validatePayAlerts, validateIntermediarySelectionRequired]);

  // Initialize hasUnsavedChanges to false on mount and clear lookup fields
  useEffect(() => {
    setHasUnsavedChanges(false);
    // Clear temporary lookup fields when page is opened
    dispatch(updateBeneficiary({ field: 'selectedBank', value: '' }));
    dispatch(updateBeneficiary({ field: 'selectedCompany', value: '' }));
    methodsBank.setValue('selectedBank', '', { shouldDirty: false, shouldValidate: false });
    methodsDetails.setValue('selectedCompany', '', { shouldDirty: false, shouldValidate: false });
    
    // Cleanup on unmount
    return () => {
      dispatch(updateBeneficiary({ field: 'selectedBank', value: '' }));
      dispatch(updateBeneficiary({ field: 'selectedCompany', value: '' }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmCancel = useCallback(() => {
    dispatch(resetBeneficiary());
    setCancelDialogOpen(false);
    router.push('/setup-and-admin/beneficiary' as any);
  }, [dispatch, router]);

  useEffect(() => {
    const beneficiaryType = beneficiary?.beneficiaryType;
    const entityCategory = (beneficiary as any)?.entityCategory;
    
    methodsDetails.clearErrors();
    methodsBank.clearErrors();
    methodsPayment.clearErrors();
    
    Object.keys(methodsDetails.formState.touchedFields).forEach(field => {
      methodsDetails.resetField(field as any, {  keepError: false, keepTouched: false });
    });
    Object.keys(methodsBank.formState.touchedFields).forEach(field => {
      methodsBank.resetField(field as any, {   keepError: false, keepTouched: false });
    });
    Object.keys(methodsPayment.formState.touchedFields).forEach(field => {
      methodsPayment.resetField(field as any, {   keepError: false, keepTouched: false });
    });
    
    methodsDetails.setValue('beneficiaryType', beneficiaryType || '', { shouldValidate: false, shouldTouch: false, shouldDirty: false });
    methodsDetails.setValue('entityCategory', entityCategory || '', { shouldValidate: false, shouldTouch: false, shouldDirty: false });
    methodsBank.setValue('beneficiaryType', beneficiaryType || '', { shouldValidate: false, shouldTouch: false, shouldDirty: false });
    methodsBank.setValue('entityCategory', entityCategory || '', { shouldValidate: false, shouldTouch: false, shouldDirty: false });
    methodsPayment.setValue('beneficiaryType', beneficiaryType || '', { shouldValidate: false, shouldTouch: false, shouldDirty: false });
    methodsPayment.setValue('entityCategory', entityCategory || '', { shouldValidate: false, shouldTouch: false, shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiary?.beneficiaryType, (beneficiary as any)?.entityCategory]);

  useEffect(() => {
    const subscription = methodsBank.watch((value, { name }) => {
      if (name === 'accountNumber' || name === 'iban') {
        const otherField = name === 'accountNumber' ? 'iban' : 'accountNumber';
        methodsBank.trigger(otherField);
      }
    });
    return () => subscription.unsubscribe();
  }, [methodsBank]);

  useEffect(() => {
    const hasChanges =
      methodsDetails.formState.isDirty ||
      methodsBank.formState.isDirty ||
      methodsPayment.formState.isDirty ||
      payAlertsDirty;
    setHasUnsavedChanges(hasChanges);
  }, [
    methodsDetails.formState.isDirty,
    methodsBank.formState.isDirty,
    methodsPayment.formState.isDirty,
    payAlertsDirty,
  ]);

  // Cleanup effect: When beneficiary entityKey changes (switching beneficiaries),
  // ensure we reset to the actual beneficiary data and clear any temporary lookup state
  const previousEntityKeyRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    const currentEntityKey = beneficiary?.entityKey;
    const previousEntityKey = previousEntityKeyRef.current;
    
    // If entityKey changed (new beneficiary loaded)
    if (previousEntityKey && currentEntityKey && previousEntityKey !== currentEntityKey) {
      // Clear temporary lookup-related state
      setCompanyLookupTriggered(false);
      setLookupTriggered(false);
      dispatch(resetCompanyLookup());
      dispatch(resetBankLookup());
    }
    
    previousEntityKeyRef.current = currentEntityKey;
  }, [beneficiary?.entityKey, beneficiary?.counterPartyName, dispatch]);

  useEffect(() => {
    const beneficiaryType = (beneficiary as any)?.beneficiaryType || '';
    const isCompanyType = beneficiaryType === 'Company';
    
    // For Company type: use all fields including company lookup fields
    // For other types: exclude company-specific lookup fields to prevent cross-contamination
    const detailsDefaults = {
      counterPartyName: beneficiary?.counterPartyName || '',
      firstName: (beneficiary as any)?.firstName || '',
      lastName: (beneficiary as any)?.lastName || '',
      surname: beneficiary?.surname || '',
      referenceIDX: beneficiary?.referenceIDX || '',
      counterPartyReference: beneficiary?.counterPartyReference || '',
      billerID: isCompanyType ? ((beneficiary as any)?.billerID || '') : '',
      beneficiaryType,
      entityCategory: (beneficiary as any)?.entityCategory || '',
      addressLine1: beneficiary?.counterPartyAddress?.addressLine1 || '',
      addressLine2: beneficiary?.counterPartyAddress?.addressLine2 || '',
      townName: beneficiary?.counterPartyAddress?.townName || '',
      countrySubDivision: beneficiary?.counterPartyAddress?.countrySubDivision || '',
      countryCode: beneficiary?.counterPartyAddress?.countryCode || '',
      phoneNumber: (beneficiary as any)?.phoneNumber || '',
      email: (beneficiary as any)?.email || '',
      selectedCompany: isCompanyType ? ((beneficiary as any)?.selectedCompany || '') : '',
      cdiNumber: isCompanyType ? ((beneficiary as any)?.cdiNumber || '') : '',
      currency: isCompanyType ? ((beneficiary as any)?.currency || '') : '',
      financialInstitutionName: beneficiary?.financialInstitutionName || '',
      branchSortCode: beneficiary?.branchSortCode || '',
      bic: beneficiary?.bic || beneficiary?.internationalBankBicCode || '',
      bankCountryCode: beneficiary?.bankBranchAddress?.countryCode || (beneficiary as any)?.bankCountryCode || '',
      accountNumber: beneficiary?.accountNumber || '',
      accountType: beneficiary?.accountType || '',
    } as const;

    const bankDefaults = {
      financialInstitutionName: beneficiary?.financialInstitutionName || '',
      bankBranchName: beneficiary?.bankBranchName || '',
      bic: beneficiary?.internationalBankBicCode || beneficiary?.bic || '',
      branchSortCode: beneficiary?.branchSortCode || '',
      bankCountryCode: beneficiary?.bankBranchAddress?.countryCode || (beneficiary as any)?.bankCountryCode || '',
      bankBranchTownName: beneficiary?.bankBranchAddress?.townName || '',
      accountNumber: beneficiary?.accountNumber || '',
      iban: beneficiary?.iban || '',
      accountType: beneficiary?.accountType || '',
      accountCurrency: beneficiary?.accountCurrency || '',
      transactionLimit: String((beneficiary as any)?.transactionLimit ?? ''),
      transactionLimitCurrency: (beneficiary as any)?.transactionLimitCurrency || 'USD',
      beneficiaryType: (beneficiary as any)?.beneficiaryType || '',
      entityCategory: (beneficiary as any)?.entityCategory || '',
      selectedBank: (beneficiary as any)?.selectedBank || '',
      branchName: (beneficiary as any)?.branchName || '',
      town: (beneficiary as any)?.town || '',
    } as const;

    const paymentDefaults = {
      transactionLimit: String((beneficiary as any)?.transactionLimit ?? ''),
      transactionLimitCurrency: (beneficiary as any)?.transactionLimitCurrency || 'USD',
      paymentType: (beneficiary?.linkedPaymentProfiles || []).map((profile: any) => profile.customerPaymentProfileName),
      beneficiaryType: (beneficiary as any)?.beneficiaryType || '',
      entityCategory: (beneficiary as any)?.entityCategory || '',
    } as const;

    if (mode === 'review') {
      methodsDetails.reset(detailsDefaults);
      methodsBank.reset(bankDefaults);
      methodsPayment.reset(paymentDefaults);
      initialPayAlertsRef.current = normalizePayAlertRows(
        beneficiary?.alertDetailsListTO?.alertDetailsList,
        payAlertCountHint,
      );
      setPayAlertErrors({});
      setHasUnsavedChanges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, beneficiary?.entityKey, payAlertCountHint]);
 
  const handleChange = useCallback((name: string, value: any) => {
    const addressKeys = new Set([
      'addressLine1',
      'addressLine2',
      'townName',
      'countrySubDivision',
      'countryCode',
    ]);
    
    if (name === 'selectedCompany') {
      const v = String(value ?? '');
      
      // Update Redux state
      dispatch(updateBeneficiary({ field: 'selectedCompany', value: v }));
      
      if (!v) {
        return;
      }
      
      const items = (companyLookup?.items || []) as any[];
      
      const found = items.find((item: any) => {
        const match = (
          (item.cdiNumber && String(item.cdiNumber) === v) ||
          (item.entityKey && String(item.entityKey) === v) ||
          (item.billerId && String(item.billerId) === v)
        );
        return match;
      });
      
      if (found) {
        const updates: Record<string, any> = {
          counterPartyName: found.billerName || '',
          billerID: String(found.billerId || ''),
          cdiNumber: found.cdiNumber || '',
          currency: found.billerCurrency || '',
          financialInstitutionName: found.billerBankName || '',
          branchSortCode: found.billerBranchSortCode || '',
          bic: found.billerBankBic || found.billerBic || '',
          bankCountryCode: found.billerBankCountry || '',
          accountNumber: found.billerAccNumber || '',
          accountType: found.billerAccountType || '',
        };
        
        if (found.billerCountryCode) {
          methodsDetails.setValue('countryCode', found.billerCountryCode, { shouldDirty: true, shouldValidate: false });
          dispatch(updateBeneficiaryObject({ path: ['counterPartyAddress', 'countryCode'], value: found.billerCountryCode }));
        }
        
        // Performance optimization: disable validation during bulk update
        Object.entries(updates).forEach(([k, val]) => {
          dispatch(updateBeneficiary({ field: k, value: val }));
          methodsDetails.setValue(k as any, val, { shouldDirty: true, shouldValidate: false });
        });
        
        // Also update nested bank address fields
        if (found.billerBankCountry) {
          dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'countryCode'], value: found.billerBankCountry }));
        }
      }
      return;
    }
    
    // When a bank is selected from lookup dropdown, populate related fields
    if (name === 'selectedBank') {
      const v = String(value ?? '');
      
      if (!v) {
        return;
      }
      
      const items = (bankLookup?.items || []) as any[];
      const found = items.find((item: any) => {
        const sc = item.branchSortCode || item.branchCode || item.preferredBranchCode;
        return (
          (sc && String(sc) === v) ||
          (item.bankKey && String(item.bankKey) === v) ||
          (item.bic && String(item.bic) === v) ||
          (item.bankName && String(item.bankName) === v)
        );
      });
      if (found) {
        const updates: Record<string, any> = {
          financialInstitutionName: found.bankName || '',
          bankBranchName: found.branchName || '',
          bic: found.bic || '',
          branchSortCode: found.branchSortCode || found.branchCode || found.preferredBranchCode || '',
          bankCountryCode: found.countryCode || '',
        };
        
        // Performance optimization: disable validation during bulk update
        Object.entries(updates).forEach(([k, val]) => {
          methodsBank.setValue(k as any, val, { shouldDirty: true, shouldValidate: false });
          dispatch(updateBeneficiary({ field: k, value: val }));
        });
        
        if (found.city) {
          methodsBank.setValue('bankBranchTownName', found.city, { shouldDirty: true, shouldValidate: false });
          dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'townName'], value: found.city }));
        }
        
        if (found.countryCode) {
          dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'countryCode'], value: found.countryCode }));
        }
        
        dispatch(updateBeneficiary({ field: 'selectedBank', value: v }));
      }
      return;
    }
    
    if (addressKeys.has(name)) {
      dispatch(updateBeneficiaryObject({ path: ['counterPartyAddress', name], value }));
    } else if (name === 'bankBranchTownName') {
      dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'townName'], value }));
    } else if (name === 'bankCountryCode') {
      dispatch(updateBeneficiary({ field: 'bankCountryCode', value }));
      dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'countryCode'], value }));
      methodsBank.clearErrors('bankCountryCode');
    } else if (name === 'paymentType') {
      const linkedProfiles = Array.isArray(value)
        ? value.map((paymentTypeName: string) => ({
            customerPaymentProfileName: paymentTypeName,
          }))
        : [];
      dispatch(updateBeneficiary({ field: name, value }));
      dispatch(updateBeneficiary({ field: 'linkedPaymentProfiles', value: linkedProfiles }));
    } else {
      if (name === 'financialInstitutionName') {
        methodsBank.clearErrors('financialInstitutionName');
      }
      if (name === 'bankCountryCode') {
        methodsBank.clearErrors('bankCountryCode');
      }
      
      dispatch(updateBeneficiary({ field: name, value }));
      
      // Handle bank selection from lookup dropdown
      if (name === 'selectedBank') {
        const v = String(value ?? '');
        const items = (bankLookup?.items || []) as any[];
        const found = items.find((item: any) => {
          const sc = item.branchSortCode || item.branchCode || item.preferredBranchCode;
          return (
            (sc && String(sc) === v) ||
            (item.bankKey && String(item.bankKey) === v) ||
            (item.bic && String(item.bic) === v) ||
            (item.bankName && String(item.bankName) === v)
          );
        });
        if (found) {
          const updates: Record<string, any> = {
            financialInstitutionName: found.bankName || '',
            bankBranchName: found.branchName || '',
            bic: found.bic || '',
            branchSortCode: found.branchSortCode || found.branchCode || found.preferredBranchCode || '',
            bankBranchTownName: found.city || '',
            bankCountryCode: found.countryCode || '',
          };
          Object.entries(updates).forEach(([k, val]) => {
            dispatch(updateBeneficiary({ field: k, value: val }));
            methodsBank.setValue(k as any, val, { shouldDirty: true, shouldValidate: true });
          });
          
          // Also update nested bank address fields
          if (found.countryCode) {
            dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'countryCode'], value: found.countryCode }));
          }
        }
      }
    }
  }, [dispatch, companyLookup?.items, bankLookup?.items, methodsDetails, methodsBank]);

  const handleBankDetailsEditModeChange = useCallback((isEditing: boolean) => {
    setIsBankDetailsEditing(isEditing);
  }, []);

  const handleBeneficiaryDetailsEditModeChange = useCallback((isEditing: boolean) => {
    setIsBeneficiaryDetailsEditing(isEditing);
  }, []);
 
  const buildPaymentCategoryFields = (mode: 'edit' | 'review' = 'review') => {
    if (mode === 'edit') {
      return [
        {
          name: 'beneficiaryType',
          label: 'Payment category',
          value: beneficiary.beneficiaryType || '',
          type: 'select' as const,
          lookupBtn: false,
          options: [
            { label: 'Domestic Base', value: 'Domestic Base' },
            { label: 'Domestic FX and/or International', value: 'Domestic FX and/or International' },
            { label: 'Company', value: 'Company' },
          ],
        },
      ];
    }

    return [
      {
        name: 'beneficiaryType',
        label: 'Payment category',
        value: beneficiary.beneficiaryType || '',
        type: 'select' as const,
        lookupBtn: false,
        disabled: false, // ✅ Ensure field is editable in edit mode
        options: [
          { label: 'Domestic Base', value: 'Domestic Base' },
          { label: 'Domestic FX and/or International', value: 'Domestic FX and/or International' },
          { label: 'Company', value: 'Company' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        value: getStatusDisplayText(beneficiary?.authoriseStatus || ''),
        type: 'text' as const,
        disabled: true,
      },
    ];
  };

  
  const buildEntityCategoryFields = () => {
    return [
      {
        name: 'entityCategory',
        label: 'Entity category',
        value: beneficiary.entityCategory || '',
        type: 'select' as const,
        lookupBtn: false,
        disabled: false, // ✅ Ensure field is editable in edit mode
        options: [
          { label: 'Individual', value: 'Individual' },
          { label: 'Entity', value: 'Entity' },
          { label: 'Not applicable', value: 'Not applicable' },
        ],
        rightBlank: true,
      },
    ];
  };
 
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
            { href: '/', label: 'Dashboard' },
            { href: '/setup-and-admin/beneficiary', label: 'Beneficiaries' },
            {
              href: '/setup-and-admin/beneficiary/manage',
              label: 'Manage beneficiary',
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
          Manage {beneficiary?.counterPartyName || 'Beneficiary'}
        </Heading>
 
        <Box
          sx={{ mt: 3, mb: 3, width: '280px'}}
          data-testid={buildTestId(testIdPrefix, 'details-toggle')}
        >
          <ButtonToggle
            initialSelected={0}
            fullWidth={true}
            buttons={[
              {
                children: 'Details',
                toggleValue: 'details',
              },
              {
                children: 'History',
                toggleValue: 'history',
              },
              {
                children: 'Audit trail',
                toggleValue: 'audit',
              },
            ]}
            onChange={(event, newValue) => {
              if (newValue) setSelectedTab(newValue);
            }}
          />
        </Box>
 
        {selectedTab === 'details' && (
          <Box data-testid={buildTestId(testIdPrefix, 'details-tab-content')}>
            {isCompany ? (
              <Box data-testid={buildTestId(testIdPrefix, 'company-flow')}>
                {/* Repair Note - Display when beneficiary is in repair status (ACR) */}
                {beneficiary?.authoriseStatus === 'ACR' && beneficiary?.declineUserName && beneficiary?.declineTimestamp && beneficiary?.declineReason && (
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
                        {t('authoriserComments')}
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
                      {t('noteFrom')} {beneficiary.declineUserName} {t('at')} {formatTime(beneficiary.declineTimestamp)} {t('on')} {formatDateLong(beneficiary.declineTimestamp)}: {beneficiary.declineReason}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ marginBottom: '16px' }}>
                  <CreateJournyForm
                    testIdPrefix={buildTestId(testIdPrefix, 'form')}
                    title="Payment category"
                    titleIcon={GridIcon as any}
                    fields={buildPaymentCategoryFields(paymentCategoryMode) as any}
                    onChange={handleChange}
                    mode={paymentCategoryMode}
                    ShowActionBtns={beneficiary?.authoriseStatus === 'ACT'}
                    renderWithRHF
                    formMethods={methodsDetails}
                    rulesProvider={(name: string, getVals: () => any) =>
                      getRulesForField(name as any, getVals)
                    }
                    onSubmit={(data: any) => {
                      Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                    }}
                    onValidationFail={() => {}}
                    syncOnChange={true}
                  />
                </Box>
                <CreateJournyForm
                    testIdPrefix={buildTestId(testIdPrefix, 'form')}
                  onChange={handleChange}
                  mode={beneficiaryDetailsMode}
                  ShowActionBtns={beneficiary?.authoriseStatus === 'ACT'}
                  onEditModeChange={handleBeneficiaryDetailsEditModeChange}
                  renderWithRHF
                  formMethods={methodsDetails}
                  rulesProvider={(name: string, getVals: () => any) =>
                    getRulesForField(name as any, getVals)
                  }
                  onSubmit={(data: any) => {
                    Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                  }}
                  onValidationFail={() => {}}
                  syncOnChange={true}
                  onLookup={() => {
                    const vals = methodsDetails.getValues() as any;
                    
                    // Clear any existing errors first
                    methodsDetails.clearErrors('countryCode');
                    methodsDetails.clearErrors('counterPartyName');
                    methodsDetails.clearErrors('billerID');
                    
                    let hasErrors = false;
                    
                    // Validation 1: Country is always mandatory
                    if (!vals.countryCode) {
                      methodsDetails.setError('countryCode', {
                        type: 'manual',
                        message: 'Country is required.'
                      });
                      hasErrors = true;
                    }
                    
                    // Validation 2: At least one of Company Name OR Biller ID is required
                    if (!vals.counterPartyName && !vals.billerID) {
                      methodsDetails.setError('counterPartyName', {
                        type: 'manual',
                        message: 'Enter Company Name or Biller ID.'
                      });
                      methodsDetails.setError('billerID', {
                        type: 'manual',
                        message: 'Enter Company Name or Biller ID.'
                      });
                      hasErrors = true;
                    }
                    
                    // If validation fails, don't proceed with lookup
                    if (hasErrors) {
                      return;
                    }
                    
                    // Build params - cdiName is mandatory (even if empty when searching by biller ID only)
                    const params: any = {
                      cdiName: vals.counterPartyName || '',
                      cdiCountryCode: vals.countryCode,
                    };
                    
                    // Add cdiNumber if biller ID is provided
                    if (vals.billerID) {
                      params.cdiNumber = vals.billerID;
                    }
                    
                    setCompanyLookupTriggered(true);
                    setCompanyLookupLoading(true);
                    dispatch(lookupCompany(params));
                  }}
                  onReset={() => {
                    const fieldsToClear = [
                      'counterPartyName', 'billerID', 'cdiNumber', 'currency'
                    ];
                    
                    fieldsToClear.forEach(field => {
                      methodsDetails.setValue(field as any, '', { shouldDirty: false, shouldValidate: false });
                      dispatch(updateBeneficiary({ field, value: '' }));
                    });
                    
                    methodsDetails.setValue('countryCode', '', { shouldDirty: false, shouldValidate: false });
                    dispatch(updateBeneficiaryObject({ path: ['counterPartyAddress', 'countryCode'], value: '' }));
                    
                    methodsDetails.setValue('selectedCompany', '', { shouldDirty: false, shouldValidate: false });
                    dispatch(updateBeneficiary({ field: 'selectedCompany', value: '' }));
                  }}
                  showInfoBlock={companyLookupTriggered && !companyLookupLoading && !(beneficiary as any).selectedCompany}
                  infoBlockResultsFound={(companyLookup?.items?.length ?? 0) > 0}
                  infoBlockTitle={
                    (companyLookup?.items?.length ?? 0) === 0 && companyLookupTriggered
                      ? 'No company results'
                      : undefined
                  }
                  infoBlockDescription={
                    (companyLookup?.items?.length ?? 0) === 0 && companyLookupTriggered
                      ? 'Please refine your search: company name, biller ID, or country.'
                      : undefined
                  }
                  infoBlockEntityType="company"
                  lookupLoading={companyLookupLoading}
                  sections={[
                    {
                      title: 'Beneficiary details',
                      titleIcon: IcnAccountTile as any,
                      fields: companyPersonalFields as any,
                      ShowActionBtns: beneficiary?.authoriseStatus === 'ACT',
                    },
                    {
                      fields: [],
                      ShowActionBtns: false,
                      customContent: (
                        <PayAlertsSection
                          rows={payAlertRows}
                          onRowsChange={handlePayAlertRowsChange}
                          errors={payAlertErrors}
                          mode={isBeneficiaryDetailsEditing ? 'edit' : 'review'}
                          onClearErrors={() => setPayAlertErrors({})}
                          testIdPrefix={buildTestId(testIdPrefix, 'pay-alerts')}
                        />
                      ),
                      customContentPadding: '0',
                    },
                  ]}
                />
                <Box sx={{ marginTop: '16px' }}>
                  <CreateJournyForm
                    testIdPrefix={buildTestId(testIdPrefix, 'form')}
                    title="Payment type"
                    titleIcon={IcnCardQuestion as any}
                    fields={CompanyUtils.buildCollectionFields(beneficiary) as any}
                    onChange={handleChange}
                    mode={paymentTypeMode}
                    ShowActionBtns={beneficiary?.authoriseStatus === 'ACT'}
                    renderWithRHF
                    formMethods={methodsPayment}
                    rulesProvider={(name: string, getVals: () => any) =>
                      getRulesForField(name as any, getVals)
                    }
                    onSubmit={(data: any) => {
                      Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                    }}
                    onValidationFail={() => {}}
                    syncOnChange={true}
                  />
                </Box>
                {mode === 'review' && beneficiary?.authoriseStatus === 'ACT' ? (
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
                    nextText={hasUnsavedChanges ? "Submit Changes" : "Delete Beneficiary"}
                    nextButtonVariant={hasUnsavedChanges ? "primary" : "tertiary"}
                    useDeleteIcon={!hasUnsavedChanges}
                    disabled={isSubmitting}
                  />
                ) : null}
              </Box>
            ) : (
              <Box data-testid={buildTestId(testIdPrefix, 'domestic-flow')}>
              {(() => {
                let personalFields: any[], addressFields: any[];
                let buildBank: any, buildAccount: any, buildCollection: any;
                if (isDomesticBase) {
                  personalFields = domesticBase.buildPersonalFields(beneficiary).map((field: any) => 
                    field.name === 'referenceIDX' ? { ...field, disabled: true } : field
                  );
                  addressFields = mapCountrySelectFields(domesticBase.buildAddressFields(beneficiary, countryOptions));
                  buildBank = (ben: any) => domesticBase.buildBankFields(ben, countryOptions);
                  buildAccount = (ben: any) => domesticBase.buildAccountFields(ben, currencyOptions, accountTypeOptions);
                  buildCollection = (ben: any) => domesticBase.buildCollectionFields(ben, paymentTypeOptions);
                } else {
                  const entityCategory = beneficiary.entityCategory;
                  if (entityCategory === 'Individual') {
                    personalFields = domesticFxInternational.buildIndividualPersonalFields(beneficiary).map((field: any) => 
                      field.name === 'referenceIDX' ? { ...field, disabled: true } : field
                    );
                    addressFields = mapCountrySelectFields(domesticFxInternational.buildIndividualAddressFields(beneficiary, countryOptions));
                    buildBank = (ben: any) => domesticFxInternational.buildIndividualBankFields(ben, countryOptions);
                    buildAccount = (ben: any) => domesticFxInternational.buildIndividualAccountFields(ben, currencyOptions, accountTypeOptions);
                    buildCollection = (ben: any) => domesticFxInternational.buildIndividualCollectionFields(ben, paymentTypeOptions);
                  } else if (entityCategory === 'Entity') {
                    personalFields = domesticFxInternational.buildEntityPersonalFields(beneficiary).map((field: any) => 
                      field.name === 'referenceIDX' ? { ...field, disabled: true } : field
                    );
                    addressFields = mapCountrySelectFields(domesticFxInternational.buildEntityAddressFields(beneficiary, countryOptions));
                    buildBank = (ben: any) => domesticFxInternational.buildEntityBankFields(ben, countryOptions);
                    buildAccount = (ben: any) => domesticFxInternational.buildEntityAccountFields(ben, currencyOptions, accountTypeOptions);
                    buildCollection = (ben: any) => domesticFxInternational.buildEntityCollectionFields(ben, paymentTypeOptions);
                  } else {
                    personalFields = domesticFxInternational.buildNotApplicablePersonalFields(beneficiary).map((field: any) => 
                      field.name === 'referenceIDX' ? { ...field, disabled: true } : field
                    );
                    addressFields = mapCountrySelectFields(domesticFxInternational.buildNotApplicableAddressFields(beneficiary, countryOptions));
                    buildBank = (ben: any) => domesticFxInternational.buildNotApplicableBankFields(ben, countryOptions);
                    buildAccount = (ben: any) => domesticFxInternational.buildNotApplicableAccountFields(ben, currencyOptions, accountTypeOptions);
                    buildCollection = (ben: any) => domesticFxInternational.buildNotApplicableCollectionFields(ben, paymentTypeOptions);
                  }
                }
                const bankFieldsAll = buildBank(beneficiary);
                const bankFieldsReview = mapCountrySelectFields(bankFieldsAll)
                  .filter((f: any) => !isBankDetailsEditing && f.name === 'selectedBank' ? false : true)
                  .map((f: any) => {
                    if (f.name === 'selectedBank') {
                      return { ...f, type: 'select', lookupBtn: true, fullWidth: true, options: bankSelectOptions };
                    }
                    return f;
                  });
                
                // Apply form value overrides to both bank and account fields
                const bankValues = methodsBank.getValues();
                const applyOverrides = (fieldsArr: any[], overrides: Record<string, any>) =>
                  fieldsArr.map((f: any) => {
                    const nf: any = { ...f };
                    if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name)) {
                      nf.value = overrides[f.name];
                    }
                    return nf;
                  });
                const bankFieldsOv = applyOverrides(bankFieldsReview as any[], bankValues as any);
                const accountFieldsOv = applyOverrides(buildAccount(beneficiary) as any[], bankValues as any);
                
                return (
                  <Box>
                    {beneficiary?.authoriseStatus === 'ACR' && beneficiary?.declineUserName && beneficiary?.declineTimestamp && beneficiary?.declineReason && (
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
                            {t('authoriserComments')}
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
                          {t('noteFrom')} {beneficiary.declineUserName} {t('at')} {formatTime(beneficiary.declineTimestamp)} {t('on')} {formatDateLong(beneficiary.declineTimestamp)}: {beneficiary.declineReason}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ marginBottom: '16px' }}>
                      <CreateJournyForm
                    testIdPrefix={buildTestId(testIdPrefix, 'form')}
                        onChange={handleChange}
                        mode={paymentCategoryMode}
                        ShowActionBtns={beneficiary?.authoriseStatus === 'ACT'}
                        renderWithRHF
                        formMethods={methodsDetails}
                        rulesProvider={(name: string, getVals: () => any) =>
                          getRulesForField(name as any, getVals)
                        }
                        onSubmit={(data: any) => {
                          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                        }}
                        onValidationFail={() => {}}
                        syncOnChange={true}
                        sections={[
                          {
                            title: 'Payment category',
                            titleIcon: GridIcon as any,
                            fields: buildPaymentCategoryFields(paymentCategoryMode) as any,
                            ShowActionBtns: beneficiary?.authoriseStatus === 'ACT',
                          },
                          ...(isDomesticFX ? [{
                            title: 'Entity category',
                            titleIcon: GridIcon as any,
                            fields: buildEntityCategoryFields() as any,
                            ShowActionBtns: false,
                          }] : []),
                        ]}
                      />
                    </Box>
                    <CreateJournyForm
                    testIdPrefix={buildTestId(testIdPrefix, 'form')}
                      onChange={handleChange}
                      mode={beneficiaryDetailsMode}
                      ShowActionBtns={beneficiary?.authoriseStatus === 'ACT'}
                      onEditModeChange={handleBeneficiaryDetailsEditModeChange}
                      renderWithRHF
                      formMethods={methodsDetails}
                      rulesProvider={(name: string, getVals: () => any) =>
                        getRulesForField(name as any, getVals)
                      }
                      onSubmit={(data: any) => {
                        Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                      }}
                      onValidationFail={() => {}}
                      syncOnChange={false}
                      hideSectionBottomBorder
                      hideSectionTopBorder
                    sections={[
                        {
                          title: 'Beneficiary details',
                          titleIcon: IcnAccountTile as any,
                          fields: personalFields as any,
                          ShowActionBtns: beneficiary?.authoriseStatus === 'ACT',
                        },
                        {
                          title: 'Address details',
                          titleIcon: IcnAccountTile as any,
                          fields: addressFields as any,
                          ShowActionBtns: false,
                        },
                    {
                      fields: [],
                      ShowActionBtns: false,
                      customContent: (
                        <PayAlertsSection
                          rows={payAlertRows}
                          onRowsChange={handlePayAlertRowsChange}
                          errors={payAlertErrors}
                          mode={isBeneficiaryDetailsEditing ? 'edit' : 'review'}
                          onClearErrors={() => setPayAlertErrors({})}
                          testIdPrefix={buildTestId(testIdPrefix, 'pay-alerts')}
                        />
                      ),
                      customContentPadding: '0',
                    },
                      ]}
                    />
                    <Box sx={{ marginTop: '16px' }}>
                        <CreateJournyForm
                          testIdPrefix={buildTestId(testIdPrefix, 'form')}
                          onChange={handleChange}
                          mode={bankDetailsMode}
                          ShowActionBtns={beneficiary?.authoriseStatus === 'ACT'}
                          onEditModeChange={handleBankDetailsEditModeChange}
                          renderWithRHF
                          formMethods={methodsBank}
                        rulesProvider={(name: string, getVals: () => any) =>
                          getRulesForField(name as any, getVals)
                        }
                        onSubmit={(data: any) => {
                          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                        }}
                        onValidationFail={() => {}}
                        syncOnChange={true}
                        hideSectionBottomBorder
                        hideSectionTopBorder
                        onLookup={() => {
                          const vals = methodsBank.getValues() as any;
                          const branchNameValue = vals.branchName || vals.bankBranchName || '';
                          const cityValue = vals.town || vals.bankBranchTownName || '';
                          const params = {
                            bankName: vals.financialInstitutionName || '',
                            bic: vals.bic || '',
                            branchName: branchNameValue,
                            city: cityValue,
                            countryCode: vals.bankCountryCode || '',
                          };
                          // Require at least bank name and country/region for lookup
                          if (!params.bankName || !params.countryCode) {
                            setLookupTriggered(true);
                            setInsufficientInfo(true);
                            dispatch(resetBankLookup());
                            
                            // Set field-level validation errors
                            if (!params.bankName) {
                              methodsBank.setError('financialInstitutionName', {
                                type: 'required',
                                message: 'Bank name is required'
                              });
                            } else {
                              methodsBank.clearErrors('financialInstitutionName');
                            }
                            
                            if (!params.countryCode) {
                              methodsBank.setError('bankCountryCode', {
                                type: 'required',
                                message: 'Country/Region is required'
                              });
                            } else {
                              methodsBank.clearErrors('bankCountryCode');
                            }
                          } else {
                            setLookupTriggered(true);
                            setInsufficientInfo(false);
                            setBankLookupLoading(true);
                            methodsBank.clearErrors('financialInstitutionName');
                            methodsBank.clearErrors('bankCountryCode');
                            dispatch(lookupBank(params));
                          }
                        }}
                        lookupLoading={bankLookupLoading}
                        onReset={() => {
                          const fieldsToReset = [
                            'financialInstitutionName',
                            'bankBranchName',
                            'bic',
                            'branchSortCode',
                            'bankCountryCode'
                          ];
                          
                          fieldsToReset.forEach((field) => {
                            methodsBank.setValue(field as any, '', { shouldDirty: true, shouldValidate: false });
                            dispatch(updateBeneficiary({ field, value: '' }));
                          });
                          
                          methodsBank.setValue('bankBranchTownName', '', { shouldDirty: true, shouldValidate: false });
                          dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'townName'], value: '' }));
                          
                          methodsBank.setValue('selectedBank', '', { shouldDirty: true, shouldValidate: false });
                          dispatch(updateBeneficiary({ field: 'selectedBank', value: '' }));
                          
                          setLookupTriggered(false);
                          setInsufficientInfo(false);
                          dispatch(resetBankLookup());
                          
                          // Clear all validation errors
                          methodsBank.clearErrors('financialInstitutionName');
                          methodsBank.clearErrors('bankCountryCode');
                        }}
                        showInfoBlock={lookupTriggered && !bankLookupLoading && !(beneficiary as any).selectedBank}
                        infoBlockResultsFound={(bankLookup?.items?.length ?? 0) > 0}
                        infoBlockTitle={
                          insufficientInfo
                            ? 'More information is needed to perform the lookup'
                            : (bankLookup?.items?.length ?? 0) > 0
                              ? 'Results found'
                              : 'No bank results'
                        }
                        infoBlockDescription={
                          insufficientInfo
                            ? 'Enter the bank name and country/region, then try again'
                            : (bankLookup?.items?.length ?? 0) > 0
                              ? 'Select a bank from the list'
                              : 'Please refine your search: bank name, BIC/SWIFT, branch, city, or country.'
                        }
                        infoMessage={"Complete one or more of the mandatory fields, click LOOKUP to locate and select a specific domestic or international bank branch and populate all fields OR manually enter all the mandatory bank details."}
                        sections={[
                          {
                            title: 'Bank details',
                            titleIcon: IcnBranch as any,
                            fields: bankFieldsOv as any,
                            ShowActionBtns: beneficiary?.authoriseStatus === 'ACT',
                            customContent: isDomesticFX && isBankDetailsEditing ? (
                              <>
                                {isIntermediaryMandatory ? (
                                  <Box
                                    sx={{
                                      borderTop: '1px solid #E0E5EB',
                                      pt: '14px',
                                      pb: '14px',
                                      mb: '12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                    }}
                                  >
                                    <Image src={InfoCircleIcon} alt="Mandatory information" width={24} height={24} />
                                    <Typography sx={{ color: '#222E37', fontSize: '16px', lineHeight: '24px' }}>
                                      {'If both "BIC (SWIFT)" and "Sort code" are unavailable, then intermediary bank details are mandatory.'}
                                    </Typography>
                                  </Box>
                                ) : null}

                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                    gap: '16px',
                                  }}
                                >
                                  <Button
                                    buttonVariant="secondary"
                                    onClick={() => setActiveBankDrawer('intermediary')}
                                    style={{ height: '58px', minHeight: '58px', width: '100%' }}
                                    data-testid={buildTestId(testIdPrefix, 'intermediary-bank-details')}
                                  >
                                    INTERMEDIARY BANK DETAILS
                                  </Button>
                                  <Button
                                    buttonVariant="secondary"
                                    onClick={() => setActiveBankDrawer('correspondent')}
                                    style={{ height: '58px', minHeight: '58px', width: '100%' }}
                                    data-testid={buildTestId(testIdPrefix, 'corresponding-bank-details')}
                                  >
                                    {"RECEIVER'S CORRESPONDENT (CLEARING BANK) DETAILS"}
                                  </Button>
                                </Box>
                              </>
                            ) : undefined,
                            customContentPadding: '0 12px 16px',
                          },
                          {
                            title: 'Account details',
                            titleIcon: IcnAccountTitle as any,
                            fields: accountFieldsOv as any,
                            ShowActionBtns: false,
                          },
                        ]}
                      />
                    </Box>
                    <Box sx={{ marginTop: '16px' }}>
                      <CreateJournyForm
                    testIdPrefix={buildTestId(testIdPrefix, 'form')}
                        title="Payment type"
                        titleIcon={IcnCardQuestion as any}
                        fields={buildCollection(beneficiary, paymentTypeOptions) as any}
                        onChange={handleChange}
                        mode={paymentTypeMode}
                        ShowActionBtns={beneficiary?.authoriseStatus === 'ACT'}
                        renderWithRHF
                        formMethods={methodsPayment}
                        rulesProvider={(name: string, getVals: () => any) =>
                          getRulesForField(name as any, getVals)
                        }
                        onSubmit={(data: any) => {
                          Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                        }}
                        onValidationFail={() => {}}
                        syncOnChange={true}
                      />
                    </Box>
                    {mode === 'review' && beneficiary?.authoriseStatus === 'ACT' ? (
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
                        nextText={hasUnsavedChanges && isSubmitting ? "SUBMITTING..." : (hasUnsavedChanges ? "Submit Changes" : "Delete Beneficiary")}
                        nextButtonVariant={hasUnsavedChanges ? "primary" : "tertiary"}
                        useDeleteIcon={!hasUnsavedChanges}
                        disabled={isSubmitting}
                        nextStartIcon={hasUnsavedChanges && isSubmitting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : undefined}
                      />
                    ) : null}
                  </Box>
                );
              })()}
              </Box>
            )}
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
        heading="Are you sure you want to cancel?"
        subheading="Unsaved changes to the beneficiary information will be lost"
        dismissLabel="DISMISS"
        cancelLabel="YES, CANCEL"
        testIdPrefix={buildTestId(testIdPrefix, 'cancel-confirmation-dialog')}
      />

      <div data-testid={buildTestId(testIdPrefix, 'delete-dialog')}>
      <Dialog
        name="delete-beneficiary-dialog"
        title="Delete Beneficiary"
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        content={(
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
              Are you sure you want to delete this beneficiary?
            </Box>
          </Box>
        )}
        secondaryCTALabel="YES, DELETE"
        tertiaryCTALabel="CANCEL"
        onSecondaryCTA={handleDeleteBeneficiary}
        onTertiaryCTA={() => setDeleteDialogOpen(false)}
        maxWidth="560px"
        secondaryCTAWidth="135px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />
      </div>

      <DeleteConfirmationDialog
        open={deleteErrorDialogOpen}
        onClose={() => setDeleteErrorDialogOpen(false)}
        onPrimaryCTA={handleDeleteBeneficiary}
        onSecondaryCTA={() => setDeleteErrorDialogOpen(false)}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title="System error"
        message={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
              Something went wrong
            </div>
            <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '8px' }}>
              We are unable to delete the beneficiary.
            </div>
            <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
              Please try again or contact your bank representative for assistance.
            </div>
          </div>
        }
        primaryCTALabel="Try again"
        secondaryCTALabel="Dismiss"
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
        title="System error"
        message={
          !hasIntermediarySelection && isIntermediaryMandatory ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                Intermediary bank details required
              </div>
              <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                If both &quot;BIC (SWIFT)&quot; and &quot;Sort code&quot; are unavailable, then intermediary bank details are mandatory.
              </div>
            </div>
          ) : !editErrorMessage || editErrorMessage === 'We are unable to edit the beneficiary.' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                Something went wrong
              </div>
              <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '16px' }}>
                {editErrorMessage || 'We are unable to edit the beneficiary.'}
              </div>
              <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                Please try again or contact your bank representative for assistance.
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
              {editErrorMessage}
            </div>
          )
        }
        primaryCTALabel="Try again"
        secondaryCTALabel="Dismiss"
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'edit-error-dialog')}
      />

      <BankSelectionDrawer
        open={Boolean(activeBankDrawer)}
        title={
          activeBankDrawer === 'intermediary'
            ? 'Intermediary Bank Details'
            : activeBankDrawer === 'correspondent'
              ? "Receiver's Correspondent (Clearing Bank) Details"
              : ''
        }
        onClose={() => setActiveBankDrawer(null)}
        onSubmit={handleBankDrawerSubmit}
        initialSelection={
          activeBankDrawer === 'intermediary'
            ? intermediaryBankSelection
            : activeBankDrawer === 'correspondent'
              ? correspondingBankSelection
              : null
        }
        testIdPrefix={buildTestId(testIdPrefix, 'bank-selection-drawer')}
      />
    </Box>
  );
}
 
export default Page;
