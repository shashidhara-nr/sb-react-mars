'use client';

import { useRouter } from 'next/navigation';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, StepContent, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useBeneficiaries } from '@lib/hooks/useBeneficiaries';
import VerifiedAccount from '@organisms/Beneficiary/domestic/VerifiedAccount';
import EntityCategory from '@organisms/Beneficiary/domestic/EntityCategory';
import PayAlertsSection from '@organisms/Beneficiary/PayAlertsSection';
import BankSelectionDrawer, {
  type BankSelectionDetails,
} from '@organisms/Beneficiary/BankSelectionDrawer';
import IcnAccountTile from 'public/icons/icn_people_1_nametag.svg';
import BellIcon from 'public/icons/icn_bell_bell.svg';
import IcnBranch from 'public/icons/icn_branch.svg';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';
import IcnAccountTitle from 'public/icons/icn_people_1_nametag.svg';
import GridIcon from 'public/icons/icn_view_grid.svg';
import InfoCircleIcon from 'public/icons/icn_info_circle.svg';
import { CreateJournyForm, RHFProvider } from 'components/common';
import { Dialog } from 'dist/standard-bank-react';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import * as domesticBase from 'src/utils/domesticBase';
import * as CompanyUtils from 'src/utils/company';
import { updateBeneficiary, updateBeneficiaryObject } from '@store/slices/createBeneficiarySlice';
import FormActionButtons from 'components/common/formActionButtons';
import * as domesticFxInternational from 'src/utils/domesticFxInterNational';
import { getRulesForField as getBeneficiaryRulesForField } from 'src/utils/BeneficiariesCreateLogic';
import { lookupBank, resetBankLookup, lookupCompany, resetCompanyLookup } from '@store/slices/createBeneficiarySlice';
import { buildTestId } from 'src/utils/testIds';
import {
  buildAlertDetailsListTO,
  normalizePayAlertRows,
  type PayAlertErrors,
  type PayAlertRow,
  validatePayAlertRows,
} from 'src/utils/beneficiaryPayAlerts';
import { mapBackendErrors, type BackendErrorResponse } from 'src/utils/errorMappingLogic';
import {
  formatErrorMessages,
  extractErrorIssues,
  isDuplicateBeneficiaryError as checkDuplicateBeneficiary,
} from 'src/utils/errorMessageFormatter';

type BankDrawerKind = 'intermediary' | 'correspondent';

export default function BeneficiaryDetailsPage() {
  const testIdPrefix = 'beneficiary-details';
  const router = useRouter();
  const { createBeneficiary, countryOptions, paymentTypeOptions, currencyOptions, accountTypeOptions } = useBeneficiaries();
  const dispatch = useAppDispatch();

  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);
  const [lookupTriggered, setLookupTriggered] = useState(false);
  const [insufficientInfo, setInsufficientInfo] = useState(false);
  const [bankLookupLoading, setBankLookupLoading] = useState(false);
  const [companyLookupTriggered, setCompanyLookupTriggered] = useState(false);
  const [companyLookupLoading, setCompanyLookupLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState<string>('');
  const [errorDialogContent, setErrorDialogContent] = useState<string>('');
  const [duplicateBeneficiaryDialogOpen, setDuplicateBeneficiaryDialogOpen] = useState(false);
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [beneficiaryDetailsEditMode, setBeneficiaryDetailsEditMode] = useState(false);
  const [bankDetailsEditMode, setBankDetailsEditMode] = useState(false);
  const [paymentTypeEditMode, setPaymentTypeEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const beneficiary = useAppSelector((state) => state.createBeneficiary.beneficiary);
  const bankLookup = useAppSelector((state) => state.createBeneficiary.bankLookup);
  const companyLookup = useAppSelector((state) => state.createBeneficiary.companyLookup);
  const paymentProfiles = useAppSelector((state) => state.createBeneficiary.paymentProfiles);

  const isDuplicateBeneficiaryError = useCallback((issues: any[]) => {
    return checkDuplicateBeneficiary(issues);
  }, []);

  const formatErrorMessagesDisplay = useCallback((issues: any[]): string => {
    return formatErrorMessages(issues);
  }, []);

  const handleCreateBeneficiaryResult = useCallback((result: any) => {
    setSubmitting(false);
    if (result.type.endsWith('/fulfilled')) {
      setErrorDialogOpen(false);
      router.push('/setup-and-admin/beneficiary/details/success' as any);
      return;
    }
    
    // For rejected actions, the payload contains the error response
    const errorResponse = result.payload as any;
    const errorIssues = extractErrorIssues(errorResponse);
    
    if (isDuplicateBeneficiaryError(errorIssues)) {
      setErrorDialogOpen(false);
      setDuplicateBeneficiaryDialogOpen(true);
    } else {
      const formattedErrors = formatErrorMessagesDisplay(errorIssues);
      setErrorDialogMessage('Please correct the following errors');
      setErrorDialogContent(formattedErrors);
      setErrorDialogOpen(true);
    }
  }, [router, isDuplicateBeneficiaryError, formatErrorMessagesDisplay]);

  const handleCreateBeneficiaryError = useCallback((error: any) => {
    setSubmitting(false);
    const errorIssues = extractErrorIssues(error?.response?.data || error?.data || error);
    
    if (isDuplicateBeneficiaryError(errorIssues)) {
      setErrorDialogOpen(false);
      setDuplicateBeneficiaryDialogOpen(true);
    } else {
      const formattedErrors = formatErrorMessagesDisplay(errorIssues);
      setErrorDialogMessage('Please correct the following errors');
      setErrorDialogContent(formattedErrors);
      setErrorDialogOpen(true);
    }
  }, [isDuplicateBeneficiaryError, formatErrorMessagesDisplay]);

  const submitBeneficiary = useCallback(async () => {
    try {
      setSubmitting(true);
      const result = await createBeneficiary();
      handleCreateBeneficiaryResult(result);
    } catch (error: any) {
      handleCreateBeneficiaryError(error);
    }
  }, [createBeneficiary, handleCreateBeneficiaryResult, handleCreateBeneficiaryError]);
  
  const domesticPersonalFields = useMemo(() => domesticBase.buildPersonalFields(beneficiary), [beneficiary]);
  const domesticAddressFields = useMemo(() => {
    return domesticBase.buildAddressFields(beneficiary, countryOptions);
  }, [beneficiary, countryOptions]);
  const companyPersonalFieldsRaw = useMemo(
    () => CompanyUtils.buildPersonalFields(beneficiary, beneficiary, currencyOptions, countryOptions),
    [beneficiary, currencyOptions, countryOptions]
  );

  const detailsDefaultValues = {
    counterPartyName: beneficiary.counterPartyName || '',
    firstName: (beneficiary as any)?.firstName || '',
    lastName: (beneficiary as any)?.lastName || '',
    referenceIDX: beneficiary.referenceIDX || '',
    counterPartyReference: beneficiary.counterPartyReference || '',
    gender: (beneficiary as any)?.gender || '',
    identificationType: (beneficiary as any)?.identificationType || '',
    identificationNumber:
      (beneficiary as any)?.identificationNumber || (beneficiary as any)?.idPassportNumber || '',
    passportCountry: (beneficiary as any)?.passportCountry || '',
    billerID: (beneficiary as any)?.billerID || '',
    beneficiaryType: beneficiary?.beneficiaryType || '',
    entityCategory: (beneficiary as any)?.entityCategory || '',
    addressLine1: beneficiary.counterPartyAddress?.addressLine1 || '',
    addressLine2: beneficiary.counterPartyAddress?.addressLine2 || '',
    countryCode: beneficiary.counterPartyAddress?.countryCode || '',
    phoneNumber: (beneficiary as any).phoneNumber || '',
    email: (beneficiary as any).email || '',
    selectedCompany: (beneficiary as any)?.selectedCompany || '',
    cdiNumber: (beneficiary as any)?.cdiNumber || (beneficiary as any).cdinumber || '',
    cin: (beneficiary as any)?.cin || '',
    currency: (beneficiary as any)?.currency || '',
    financialInstitutionName: beneficiary.financialInstitutionName || '',
    branchSortCode: beneficiary.branchSortCode || '',
    bic: beneficiary.bic || beneficiary.internationalBankBicCode || '',
    bankCountryCode: beneficiary.bankCountryCode || '',
    accountNumber: beneficiary.accountNumber || '',
    accountType: beneficiary.accountType || '',
  } as const;

  const bankDefaultValues = {
    financialInstitutionName: beneficiary.financialInstitutionName || '',
    branchName: (beneficiary as any).bankBranchName || (beneficiary as any).branchName || '',
    bic: beneficiary.bic || beneficiary.internationalBankBicCode || '',
    branchSortCode: beneficiary.branchSortCode || '',
    addressLine1: beneficiary.counterPartyAddress?.addressLine1 || '',
    addressLine2: beneficiary.counterPartyAddress?.addressLine2 || '',
    town: (beneficiary as any).town || beneficiary?.bankBranchAddress?.townName || '',
    bankCountryCode: beneficiary.bankCountryCode || '',
    selectedBank: (beneficiary as any).selectedBank || '',
    accountNumber: beneficiary.accountNumber || '',
    iban: beneficiary.iban || '',
    currency: (beneficiary as any).currency || '',
    transactionLimit: String((beneficiary as any)?.transactionLimit ?? ''),
    transactionLimitCurrency: (beneficiary as any)?.transactionLimitCurrency || 'USD',
    accountType: beneficiary.accountType || '',
    paymentType: (beneficiary?.linkedPaymentProfiles || []).map((profile: any) => profile.customerPaymentProfileName),
    beneficiaryType: beneficiary?.beneficiaryType || '',
    entityCategory: (beneficiary as any)?.entityCategory || '',
  } as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const methodsBank = useForm({ mode: 'onTouched', defaultValues: bankDefaultValues });
  const bankBicValue = methodsBank.watch('bic');
  const bankSortCodeValue = methodsBank.watch('branchSortCode');
  const [payAlertErrors, setPayAlertErrors] = useState<PayAlertErrors>({});
  const hasInitializedPayAlerts = useRef(false);
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
  const payAlertRows = normalizePayAlertRows(
    beneficiary?.alertDetailsListTO?.alertDetailsList,
    beneficiary?.alertDetailsListTO?.rowCount ?? beneficiary?.alertDetailsListTO?.pageSize,
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
  }, [methodsDetails, payAlertRows, beneficiary?.email, beneficiary?.phoneNumber]);

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
    if (hasInitializedPayAlerts.current) return;
    hasInitializedPayAlerts.current = true;
    persistPayAlertRows(payAlertRows);
  }, [persistPayAlertRows, payAlertRows]);

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

  const selectedIdentificationType = methodsDetails.watch('identificationType');
  const hasTouchedIdentificationType = Boolean(
    (methodsDetails.formState?.touchedFields as any)?.identificationType,
  );
  const isExistingBeneficiary = Number((beneficiary as any)?.entityKey || 0) > 0;

  useEffect(() => {
    const beneficiaryType = beneficiary?.beneficiaryType;
    const entityCategory = (beneficiary as any)?.entityCategory;
    methodsDetails.setValue('beneficiaryType', beneficiaryType || '');
    methodsDetails.setValue('entityCategory', entityCategory || '');
    methodsBank.setValue('beneficiaryType', beneficiaryType || '');
    methodsBank.setValue('entityCategory', entityCategory || '');
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

  const bankSelectOptions = useMemo(() => [
    { label: 'Select a bank...', value: '' },
    ...(bankLookup?.items || []).map((item: any) => {
      const sortCode = item.branchSortCode || item.branchCode || item.preferredBranchCode;
      const parts = [item.bankName, sortCode, item.branchName, item.city, item.countryCode].filter(Boolean);
      const label = parts.join(', ');
      const value = sortCode || item.bankKey || item.bic || item.bankName || label;
      return { label, value };
    })
  ], [bankLookup?.items]);

  const companySelectOptions = useMemo(() => [
    { label: 'Select a company...', value: '' },
    ...(companyLookup?.items || []).map((item: any) => {
      const parts = [
        item.billerName,
        item.cdiNumber ? `CDI: ${item.cdiNumber}` : null,
        item.billerCity,
        item.billerCountryCode,
      ].filter(Boolean);
      const label = parts.join(', ');
      const value = item.cdiNumber || item.entityKey || item.billerId || label;
      return { label, value };
    })
  ], [companyLookup?.items]);

  const companyPersonalFields = useMemo(() => {
    const isCompanySelected = Boolean((beneficiary as any)?.selectedCompany);
    return companyPersonalFieldsRaw.map((f: any) => {
      if (f.name === 'selectedCompany') {
        return { ...f, options: companySelectOptions };
      }
      if (isCompanySelected && ['counterPartyName', 'billerID', 'countryCode'].includes(f.name)) {
        return { ...f, disabled: true };
      }
      return f;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyPersonalFieldsRaw, companySelectOptions, (beneficiary as any)?.selectedCompany]);

  const getDetailsFormValuesForRules = useCallback(() => ({
    beneficiaryName: methodsDetails.getValues().counterPartyName || '',
    gender: (methodsDetails.getValues() as any).gender || '',
    identificationType: (methodsDetails.getValues() as any).identificationType || '',
    identificationNumber: (methodsDetails.getValues() as any).identificationNumber || '',
    passportCountry: (methodsDetails.getValues() as any).passportCountry || '',
    email: (methodsDetails.getValues() as any).email || '',
    phoneNumber: (methodsDetails.getValues() as any).phoneNumber || '',
    country: (methodsDetails.getValues() as any).countryCode || '',
    beneficiaryType: (methodsDetails.getValues() as any).beneficiaryType || '',
    entityCategory: (methodsDetails.getValues() as any).entityCategory || '',
  }), [methodsDetails]);

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

  const getBankFormValuesForRules = useCallback(() => ({
    bankCountry: (methodsBank.getValues() as any).bankCountryCode || '',
    bankCode: (methodsBank.getValues() as any).financialInstitutionName || '',
    accountNumber: (methodsBank.getValues() as any).accountNumber || '',
    accountType: (methodsBank.getValues() as any).accountType || '',
    iban: (methodsBank.getValues() as any).iban || '',
    currency: (methodsBank.getValues() as any).currency || '',
    branchSortCode: (methodsBank.getValues() as any).branchSortCode || '',
  }), [methodsBank]);

  const mapBeneficiaryFieldName = useCallback((name: string) => {
    switch (name) {
      case 'counterPartyName':
        return 'beneficiaryName';
      case 'referenceIDX':
        return 'reference';
      case 'financialInstitutionName':
        return 'bankCode';
      case 'bankCountryCode':
        return 'bankCountry';
      case 'countryCode':
        return 'country';
      case 'addressLine1':
        return 'address';
      case 'townName':
        return 'city';
      case 'branchSortCode':
        return 'branchSortCode';
      case 'accountNumber':
        return 'accountNumber';
      case 'accountType':
        return 'accountType';
      case 'iban':
        return 'iban';
      case 'currency':
        return 'currency';
      case 'transactionLimit':
        return 'transactionLimit';
      case 'transactionLimitCurrency':
        return 'transactionLimitCurrency';
      case 'paymentType':
        return 'paymentType';
      case 'email':
        return 'email';
      case 'phoneNumber':
        return 'phoneNumber';
      default:
        return name;
    }
  }, []);

  const mapPersonalFieldsForPassportVisibility = useCallback(
    (fields: any[], identificationType: string, creationMethodValue?: string) =>
      mapCountrySelectFields(fields)
        .map((field: any) => {
          const disabledField =
            creationMethodValue === 'verified' && field.name === 'counterPartyName'
              ? { ...field, disabled: true }
              : field;
          if (disabledField.name === 'passportCountry') {
            const { showWhen, ...rest } = disabledField;
            return rest;
          }
          return disabledField;
        })
        .filter(
          (field: any) =>
            field.name !== 'passportCountry' || identificationType === 'Passport number',
        ),
    [mapCountrySelectFields],
  );

  const buildPaymentCategoryFields = useCallback(
    () => {
      return [
        {
          name: 'paymentType',
          label: 'Payment category',
          value: beneficiary.beneficiaryType || '',
          type: 'select' as const,
          lookupBtn: false,
          options: [
            { label: 'Domestic base', value: 'Domestic-base' },
            { label: 'International', value: 'International' },
          ],
          rightBlank: false,
        },
      ];
    },
    [beneficiary.beneficiaryType],
  );

  const buildEntityCategoryFields = useCallback(
    () => {
      return [
        {
          name: 'EntityCategory',
          label: 'Entity category',
          value: beneficiary.entityCategory || '',
          type: 'select' as const,
          lookupBtn: false,
          options: [
            { label: 'Individual', value: 'Individual' },
            { label: 'Entity', value: 'Entity' },
            { label: 'Not applicable', value: 'Not applicable' },
          ],
          rightBlank: true,
        },
      ];
    },
    [beneficiary.entityCategory],
  );

  const handleChange = (name: string, value: any) => {
    const addressKeys = new Set([
      'addressLine1',
      'addressLine2',
      'townName',
      'countrySubDivision',
      'countryCode',
    ]);
    
    // Special handling for payment type
    if (name === 'paymentType') {
      // Dispatch the paymentType field itself (array of names)
      dispatch(updateBeneficiary({ field: 'paymentType', value: value }));
      
      // Find and dispatch full payment profile objects from Redux state
      const linkedProfiles = Array.isArray(value) && value.length > 0 && paymentProfiles
        ? paymentProfiles.filter((profile: any) =>
            value.includes(
              profile.customerPaymentProfileName ||
              profile.description ||
              profile.name ||
              profile.label ||
              profile.code ||
              profile.paymentProfileID?.toString() ||
              profile.value ||
              '',
            ),
          )
        : [];
      
      dispatch(updateBeneficiary({ field: 'linkedPaymentProfiles', value: linkedProfiles }));
      
      return;
    }
    
    if (name === 'selectedCompany') {
      const v = String(value ?? '');
      
      // Update Redux state
      dispatch(updateBeneficiary({ field: 'selectedCompany', value: v }));
      
      const items = (companyLookup?.items || []) as any[];
      
      const found = items.find((item: any) =>
        (item.cdiNumber && String(item.cdiNumber) === v) ||
        (item.entityKey && String(item.entityKey) === v) ||
        (item.billerId && String(item.billerId) === v)
      );
      
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
          dispatch(updateBeneficiaryObject({ path: ['counterPartyAddress', 'countryCode'], value: found.billerCountryCode }));
          methodsDetails.setValue('countryCode', found.billerCountryCode, { shouldDirty: true, shouldValidate: false });
        }
        
        // Performance optimization: disable validation during bulk update
        Object.entries(updates).forEach(([k, val]) => {
          dispatch(updateBeneficiary({ field: k, value: val }));
          methodsDetails.setValue(k as any, val, { shouldDirty: true, shouldValidate: false });
        });
      }
      return;
    }
    
    if (name === 'counterPartyName' || name === 'billerID') {
      methodsDetails.clearErrors('counterPartyName');
      methodsDetails.clearErrors('billerID');
    }
    if (name === 'countryCode') {
      methodsDetails.clearErrors('countryCode');
    }
    
    if (name === 'selectedBank') {
      const v = String(value ?? '');
      
      // Update Redux state for selectedBank
      dispatch(updateBeneficiary({ field: 'selectedBank', value: v }));
      
      // Don't call setValue for selectedBank here - it would create infinite loop with syncOnChange
      // The form already has the value since it triggered this onChange
      
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
        // Map bank lookup fields to both Redux state and form field names
        const reduxUpdates: Record<string, any> = {
          financialInstitutionName: found.bankName || '',
          branchName: found.branchName || '',
          bic: found.bic || '',
          branchSortCode: found.branchSortCode || found.branchCode || found.preferredBranchCode || '',
          town: found.city || '',
          bankCountryCode: found.countryCode || '',
        };
        
        const formUpdates: Record<string, any> = {
          financialInstitutionName: found.bankName || '',
          bankBranchName: found.branchName || '',
          branchName: found.branchName || '',
          bic: found.bic || '',
          branchSortCode: found.branchSortCode || found.branchCode || found.preferredBranchCode || '',
          bankBranchTownName: found.city || '',
          town: found.city || '',
          bankCountryCode: found.countryCode || '',
        };
        
        // Update Redux state
        Object.entries(reduxUpdates).forEach(([k, val]) => {
          dispatch(updateBeneficiary({ field: k, value: val }));
        });
        
        // Update form values WITHOUT validation during bulk update (performance optimization)
        Object.entries(formUpdates).forEach(([k, val]) => {
          try {
            methodsBank.setValue(k as any, val, { shouldDirty: true, shouldValidate: false });
          } catch (e) {
            // Ignore if field doesn't exist in form
          }
        });
        
        // Also update bankBranchAddress in Redux if needed
        if (found.city) {
          dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'townName'], value: found.city }));
        }
        if (found.countryCode) {
          dispatch(updateBeneficiaryObject({ path: ['bankBranchAddress', 'countryCode'], value: found.countryCode }));
        }
      }
      return;
    }
    
    if (name === 'financialInstitutionName') {
      methodsBank.clearErrors('financialInstitutionName');
    }
    if (name === 'bankCountryCode') {
      methodsBank.clearErrors('bankCountryCode');
    }
    
    if (addressKeys.has(name)) {
      dispatch(updateBeneficiaryObject({ path: ['counterPartyAddress', name], value }));
    } else {
      dispatch(updateBeneficiary({ field: name, value }));
      if (name === 'identificationNumber') {
        dispatch(updateBeneficiary({ field: 'idPassportNumber', value }));
      }
      if (name === 'identificationType' && value !== 'Passport number') {
        dispatch(updateBeneficiary({ field: 'passportCountry', value: '' }));
        methodsDetails.setValue('passportCountry', '', { shouldDirty: true, shouldValidate: true });
        methodsDetails.clearErrors('passportCountry');
      }
    }
  };

  const creationMethod = beneficiary.creationMethod;
  const isCompany = beneficiary.beneficiaryType === 'Company';
  const isDomesticBase = beneficiary.beneficiaryType === 'Domestic Base';
  const isDomesticFX = beneficiary.beneficiaryType === 'Domestic FX and/or International';
  const isVerifiedDomesticFX = creationMethod === 'verified' && isDomesticFX;
  const isVerifiedDomesticBase = creationMethod === 'verified' && isDomesticBase;
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

    setErrorDialogMessage(
      'If both "BIC (SWIFT)" and "Sort code" are unavailable, then intermediary bank details are mandatory.',
    );
    setErrorDialogOpen(true);
    return false;
  }, [isIntermediaryMandatory, hasIntermediarySelection]);

  const beneficiaryBranchName = (beneficiary as any).branchName;
  const beneficiaryTown = (beneficiary as any).town;
  const beneficiaryBankCountryCode = (beneficiary as any).bankCountryCode;

  useEffect(() => {
    if (creationMethod === 'verified' && beneficiary?.verifiedAccount) {
      // Sync to details form
      if (beneficiary.counterPartyName) {
        methodsDetails.setValue('counterPartyName', beneficiary.counterPartyName, { shouldDirty: false });
      }
      // Sync to bank form
      if (beneficiary.financialInstitutionName) {
        methodsBank.setValue('financialInstitutionName', beneficiary.financialInstitutionName, { shouldDirty: false });
      }
      const branchNameValue = beneficiaryBranchName || beneficiary?.bankBranchName || '';
      if (branchNameValue) {
        methodsBank.setValue('branchName', branchNameValue, { shouldDirty: false });
      }
      if (beneficiary.bic) {
        methodsBank.setValue('bic', beneficiary.bic, { shouldDirty: false });
      }
      if (beneficiary.branchSortCode) {
        methodsBank.setValue('branchSortCode', beneficiary.branchSortCode, { shouldDirty: false });
      }
      const townValue = beneficiaryTown || beneficiary?.bankBranchAddress?.townName || '';
      if (townValue) {
        methodsBank.setValue('town', townValue, { shouldDirty: false });
      }
      if (beneficiaryBankCountryCode) {
        methodsBank.setValue('bankCountryCode', beneficiaryBankCountryCode, { shouldDirty: false });
      }
      if (beneficiary.accountNumber) {
        methodsBank.setValue('accountNumber', beneficiary.accountNumber, { shouldDirty: false });
      }
      if (beneficiary.accountType) {
        methodsBank.setValue('accountType', beneficiary.accountType, { shouldDirty: false });
      }
      // Address line 1 in Bank details (nested in counterPartyAddress)
      if (beneficiary.counterPartyAddress?.addressLine1) {
        methodsBank.setValue('addressLine1', beneficiary.counterPartyAddress.addressLine1, { shouldDirty: false });
      }
    }
  }, [
    creationMethod,
    beneficiary?.verifiedAccount,
    beneficiary.counterPartyName,
    beneficiary.financialInstitutionName,
    beneficiaryBranchName,
    beneficiary.bic,
    beneficiary.branchSortCode,
    beneficiaryTown,
    beneficiaryBankCountryCode,
    beneficiary.accountNumber,
    beneficiary.accountType,
    beneficiary.counterPartyAddress?.addressLine1,
    beneficiary?.bankBranchName,
    beneficiary?.bankBranchAddress?.townName,
    methodsBank,
    methodsDetails,
  ]);

  const domesticFXSteps = [
    { label: 'Entity category', description: 'Description' },
    { label: 'Beneficiary details', description: 'Description' },
    { label: 'Beneficiary bank details', description: 'Description' },
    { label: 'Review and submit', description: 'Description' },
  ];

  const steps = isCompany
    ? [
      { label: 'Beneficiary details', description: 'Description' },
      { label: 'Review and submit', description: 'Description' },
    ]
    : isDomesticFX
      ? isVerifiedDomesticFX
        ? [
          { label: 'Verified account', description: 'Description' },
          ...domesticFXSteps,
        ]
        : domesticFXSteps
      : isDomesticBase
        ? isVerifiedDomesticBase
          ? [
            { label: 'Verified account', description: 'Description' },
            { label: 'Beneficiary details', description: 'Description' },
            { label: 'Beneficiary bank details', description: 'Description' },
            { label: 'Review and submit', description: 'Description' },
          ]
          : [
            { label: 'Beneficiary details', description: 'Description' },
            { label: 'Beneficiary bank details', description: 'Description' },
            { label: 'Review and submit', description: 'Description' },
          ]
        : [];

  const handleCancel = useCallback(() => {
    setCancellationDialogOpen(true);
  }, []);

  const handleConfirmCancellation = useCallback(() => {
    setCancellationDialogOpen(false);
    router.push('/setup-and-admin/beneficiary/create' as any);
  }, [router]);

  const handleCancelCancellation = useCallback(() => {
    setCancellationDialogOpen(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    }
  }, [currentStep, steps.length]);

  const handleBankDetailsEditModeChange = useCallback((isEditing: boolean) => {
    setBankDetailsEditMode(isEditing);
  }, []);

  const handleBeneficiaryDetailsEditModeChange = useCallback((isEditing: boolean) => {
    setBeneficiaryDetailsEditMode(isEditing);
  }, []);

  const handlePaymentTypeEditModeChange = useCallback((isEditing: boolean) => {
    setPaymentTypeEditMode(isEditing);
  }, []);

  const onSelectStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= lastHighestProgressIndex) {
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex],
  );

  const renderStepContent = (stepIndex: number) => {
    if ((isVerifiedDomesticFX || isVerifiedDomesticBase) && stepIndex === 0) {
      return <VerifiedAccount step={currentStep} onNext={handleNext} onCancel={handleCancel} />;
    }

    if (isCompany) {
      if (stepIndex === 0) {
        return (
          <Box>
            <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
              <CreateJournyForm
                testIdPrefix={buildTestId(testIdPrefix, 'form')}
                onChange={handleChange}
                mode="edit"
                ShowActionBtns={false}
                renderWithRHF
                formMethods={methodsDetails}
                sectionsInSingleCard
                hideSectionBottomBorder
                hideSectionTopBorder
                sections={[
                  {
                    title: "Beneficiary details",
                    titleIcon: IcnAccountTile as any,
                    fields: companyPersonalFields as any,
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
                        mode="edit"
                        onClearErrors={() => setPayAlertErrors({})}
                        testIdPrefix={buildTestId(testIdPrefix, 'pay-alerts')}
                      />
                    ),
                    customContentPadding: '0',
                  },
                ]}
                rulesProvider={(name) =>
                  getBeneficiaryRulesForField(
                    name as any,
                    getDetailsFormValuesForRules,
                  )}
                onSubmit={(data: any) => {
                  Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
                }}
                onValidationFail={() => {}}
                onLookup={() => {
                  const vals = methodsDetails.getValues() as any;
                  
                  methodsDetails.clearErrors('countryCode');
                  methodsDetails.clearErrors('counterPartyName');
                  methodsDetails.clearErrors('billerID');
                  
                  let hasErrors = false;
                  
                  if (!vals.countryCode) {
                    methodsDetails.setError('countryCode', {
                      type: 'manual',
                      message: 'Country is required.'
                    });
                    hasErrors = true;
                  }
                  
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
                  
                  if (hasErrors) {
                    return;
                  }
                  
                  const params: any = {
                    cdiName: vals.counterPartyName || '',
                    cdiCountryCode: vals.countryCode,
                  };
                  
                  if (vals.billerID) {
                    params.cdiNumber = vals.billerID;
                  }
                  
                  setCompanyLookupTriggered(true);
                  setCompanyLookupLoading(true);
                  dispatch<any>(lookupCompany(params));
                }}
                onReset={() => {
                  dispatch(updateBeneficiary({ field: 'selectedCompany', value: '' }));
                  methodsDetails.setValue('selectedCompany', '', { shouldDirty: false, shouldValidate: false });
                  
                  const searchFields = ['counterPartyName', 'billerID', 'countryCode'];
                  searchFields.forEach(field => {
                    dispatch(updateBeneficiary({ field, value: '' }));
                    methodsDetails.setValue(field as any, '', { shouldDirty: false, shouldValidate: false });
                  });
                  
                  dispatch(updateBeneficiaryObject({ path: ['counterPartyAddress', 'countryCode'], value: '' }));
                  
                  const autoPopulatedFields = [
                    'cdiNumber', 'currency',
                    'financialInstitutionName', 'branchSortCode', 'bic',
                    'bankCountryCode', 'accountNumber', 'accountType'
                  ];
                  autoPopulatedFields.forEach(field => {
                    dispatch(updateBeneficiary({ field, value: '' }));
                    methodsDetails.setValue(field as any, '', { shouldDirty: false, shouldValidate: false });
                  });
                  
                  methodsDetails.clearErrors('countryCode');
                  methodsDetails.clearErrors('counterPartyName');
                  methodsDetails.clearErrors('billerID');
                  
                  setCompanyLookupTriggered(false);
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
                syncOnChange={true}
              />

              <CreateJournyForm
                testIdPrefix={buildTestId(testIdPrefix, 'payment-type-form')}
                title="Payment type"
                titleIcon={IcnCardQuestion as any}
                fields={CompanyUtils.buildPaymentTypeFields(beneficiary, paymentTypeOptions) as any}
                onChange={handleChange}
                mode="edit"
                ShowActionBtns={false}
                renderWithRHF
                formMethods={methodsDetails}
                rulesProvider={(name) =>
                  getBeneficiaryRulesForField(
                    name as any,
                    getDetailsFormValuesForRules,
                  )}
              />
            </RHFProvider>
            <FormActionButtons
              testIdPrefix={buildTestId(testIdPrefix, 'actions')}
              onCancel={handleCancel}
              onNext={async () => {
                const detailsValidPromise = methodsDetails.trigger();
                const payAlertsValid = validatePayAlerts();
                const detailsValid = await detailsValidPromise;
                if (!detailsValid || !payAlertsValid) {
                  // Don't proceed - validation errors will be shown on the form fields
                  return;
                }
                handleNext();
              }}
            />
          </Box>
        );
      }
      if (stepIndex == 1) {
        return (
          <Box>
            <Box sx={{ marginBottom: '16px' }}>
              <CreateJournyForm
                testIdPrefix={buildTestId(testIdPrefix, 'form')}
                onChange={handleChange}
                mode="review"
                ShowActionBtns={false}
                sections={[
                  {
                    title: "Payment category",
                    titleIcon: GridIcon as any,
                    fields: buildPaymentCategoryFields() as any,
                    ShowActionBtns: false,
                  },
                ]}
              />
            </Box>

            <CreateJournyForm
              testIdPrefix={buildTestId(testIdPrefix, 'form')}
              onChange={handleChange}
              mode="review"
              ShowActionBtns={true}
              renderWithRHF
              formMethods={methodsDetails}
              syncOnChange={true}
              onEditModeChange={handleBeneficiaryDetailsEditModeChange}
              hideSectionBottomBorder
              hideSectionTopBorder
              sections={[
                {
                  title: "Beneficiary details",
                  titleIcon: IcnAccountTile as any,
                  fields: companyPersonalFields as any,
                  ShowActionBtns: true,
                },
                {
                  fields: [],
                  ShowActionBtns: false,
                  customContent: (
                    <PayAlertsSection
                      rows={payAlertRows}
                      onRowsChange={handlePayAlertRowsChange}
                      errors={payAlertErrors}
                      mode={beneficiaryDetailsEditMode ? 'edit' : 'review'}
                      onClearErrors={() => setPayAlertErrors({})}
                      testIdPrefix={buildTestId(testIdPrefix, 'pay-alerts')}
                    />
                  ),
                  customContentPadding: '0',
                },
              ]}
              rulesProvider={(name) =>
                getBeneficiaryRulesForField(
                  mapBeneficiaryFieldName(name as string) as any,
                  getDetailsFormValuesForRules,
                )}
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              }}
              onValidationFail={() => {
                setErrorDialogMessage('Please correct the highlighted fields and try again.');
                setErrorDialogOpen(true);
                setErrorDialogContent('');
              }}
            />

            <Box sx={{ marginTop: '16px' }}>
              <CreateJournyForm
                testIdPrefix={buildTestId(testIdPrefix, 'payment-type-form')}
                title="Payment type"
                titleIcon={IcnCardQuestion as any}
                fields={CompanyUtils.buildPaymentTypeFields(beneficiary, paymentTypeOptions) as any}
                onChange={handleChange}
                mode="review"
                ShowActionBtns={true}
                onEditModeChange={handlePaymentTypeEditModeChange}
                renderWithRHF
                formMethods={methodsDetails}
                rulesProvider={(name) =>
                  getBeneficiaryRulesForField(
                    name as any,
                    getDetailsFormValuesForRules,
                  )}
              />
            </Box>

            <FormActionButtons
              testIdPrefix={buildTestId(testIdPrefix, 'actions')}
              onCancel={handleCancel}
              onNext={async () => {
                const detailsValidPromise = methodsDetails.trigger();
                const payAlertsValid = validatePayAlerts();
                const detailsValid = await detailsValidPromise;
                if (!detailsValid || !payAlertsValid) {
                  return;
                }
                await submitBeneficiary();
              }}
              nextText="SUBMIT FOR APPROVAL"
              nextStartIcon={submitting ? <CircularProgress size={20} sx={{ color: '#0062E1' }} /> : undefined}
              nextDisabled={submitting}
            />
          </Box>
        );
      }
    }

    if (
      (isDomesticFX && !isVerifiedDomesticFX && stepIndex === 0) ||
      (isDomesticFX && isVerifiedDomesticFX && stepIndex === 1)
    ) {
      return (
        <EntityCategory
          step={currentStep}
          entityCategory={beneficiary.entityCategory}
          onNext={handleNext}
          onCancel={handleCancel}
        />
      );
    }

    if (
      (isDomesticFX && !isVerifiedDomesticFX && stepIndex === 1) ||
      (isDomesticFX && isVerifiedDomesticFX && stepIndex === 2) ||
      (isDomesticBase && isVerifiedDomesticBase && stepIndex === 1) ||
      (isDomesticBase && !isVerifiedDomesticBase && stepIndex === 0)
    ) {
      let personalFields, addressFields, buildCollection;

      if (isDomesticBase) {
        personalFields = domesticPersonalFields;
        addressFields = mapCountrySelectFields(domesticAddressFields);
        buildCollection = (ben: any, opts: any) => domesticBase.buildCollectionFields(ben, opts);
      } else {
        const entityCategory = beneficiary.entityCategory;
        if (entityCategory === 'Individual') {
          personalFields = mapCountrySelectFields(domesticFxInternational.buildIndividualPersonalFields(beneficiary));
          addressFields = mapCountrySelectFields(domesticFxInternational.buildIndividualAddressFields(beneficiary, countryOptions));
          buildCollection = (ben: any, opts: any) => domesticFxInternational.buildIndividualCollectionFields(ben, opts);
        } else if (entityCategory === 'Entity') {
          personalFields = mapCountrySelectFields(domesticFxInternational.buildEntityPersonalFields(beneficiary));
          addressFields = mapCountrySelectFields(domesticFxInternational.buildEntityAddressFields(beneficiary, countryOptions));
          buildCollection = (ben: any, opts: any) => domesticFxInternational.buildEntityCollectionFields(ben, opts);
        } else {
          personalFields = domesticFxInternational.buildNotApplicablePersonalFields(beneficiary);
          addressFields = mapCountrySelectFields(domesticFxInternational.buildNotApplicableAddressFields(beneficiary, countryOptions));
          buildCollection = (ben: any, opts: any) => domesticFxInternational.buildNotApplicableCollectionFields(ben, opts);
        }
      }

      return (
        <Box>
          <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
            <CreateJournyForm
              testIdPrefix={buildTestId(testIdPrefix, 'form')}
              sections={[
                {
                  title: 'Beneficiary details',
                  titleIcon: IcnAccountTile as any,
                  fields: mapPersonalFieldsForPassportVisibility(
                    personalFields as any[],
                    selectedIdentificationType as string,
                    creationMethod,
                  ) as any,
                  ShowActionBtns: false,
                },
                {
                  title: 'Address details',
                  titleIcon: IcnAccountTile as any,
                  fields: addressFields as any,
                  ShowActionBtns: false,
                },
                {
                  title: 'Pay alerts',
                  titleIcon: BellIcon as any,
                  fields: [],
                  ShowActionBtns: false,
                  customContent: (
                    <PayAlertsSection
                      rows={payAlertRows}
                      onRowsChange={handlePayAlertRowsChange}
                      errors={payAlertErrors}
                      mode="edit"
                      embedded
                      onClearErrors={() => setPayAlertErrors({})}
                      testIdPrefix={buildTestId(testIdPrefix, 'pay-alerts')}
                    />
                  ),
                  customContentPadding: '8px 12px 12px',
                },
              ]}
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              hideSectionBottomBorder
              hideSectionTopBorder
              formMethods={methodsDetails}
              rulesProvider={(name: string, getVals: () => any) =>
                getBeneficiaryRulesForField(name as any, getVals)
              }
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              }}
              onValidationFail={() => {}}
              syncOnChange={true}
            />
          </RHFProvider>
          <FormActionButtons
            testIdPrefix={buildTestId(testIdPrefix, 'actions')}
            onCancel={handleCancel}
            onNext={async () => {
              const detailsValidPromise = methodsDetails.trigger();
              const payAlertsValid = validatePayAlerts();
              const detailsValid = await detailsValidPromise;
              if (!detailsValid || !payAlertsValid) {
                return;
              }
              handleNext();
            }}
          />
        </Box>
      );
    }

    if (
      (isDomesticFX && !isVerifiedDomesticFX && stepIndex === 2) ||
      (isDomesticFX && isVerifiedDomesticFX && stepIndex === 3) ||
      (isDomesticBase && isVerifiedDomesticBase && stepIndex === 2) ||
      (isDomesticBase && !isVerifiedDomesticBase && stepIndex === 1)
    ) {
      let buildBank, buildAccount, buildCollection;

      if (isDomesticBase) {
        buildBank = (ben: any) => domesticBase.buildBankFields(ben, countryOptions);
        buildAccount = (ben: any) => domesticBase.buildAccountFields(ben, currencyOptions, accountTypeOptions);
        buildCollection = (ben: any, opts: any) => domesticBase.buildCollectionFields(ben, opts);
      } else {
        const entityCategory = beneficiary.entityCategory;
        if (entityCategory === 'Individual') {
          buildBank = (ben: any) => domesticFxInternational.buildIndividualBankFields(ben, countryOptions);
          buildAccount = (ben: any) => domesticFxInternational.buildIndividualAccountFields(ben, currencyOptions, accountTypeOptions);
          buildCollection = (ben: any, opts: any) => domesticFxInternational.buildIndividualCollectionFields(ben, opts);
        } else if (entityCategory === 'Entity') {
          buildBank = (ben: any) => domesticFxInternational.buildEntityBankFields(ben, countryOptions);
          buildAccount = (ben: any) => domesticFxInternational.buildEntityAccountFields(ben, currencyOptions, accountTypeOptions);
          buildCollection = (ben: any, opts: any) => domesticFxInternational.buildEntityCollectionFields(ben, opts);
        } else {
          buildBank = (ben: any) => domesticFxInternational.buildNotApplicableBankFields(ben, countryOptions);
          buildAccount = (ben: any) => domesticFxInternational.buildNotApplicableAccountFields(ben, currencyOptions, accountTypeOptions);
          buildCollection = (ben: any, opts: any) => domesticFxInternational.buildNotApplicableCollectionFields(ben, opts);
        }
      }

      const bankFieldsAll = buildBank(beneficiary);
      const bankFieldsRaw =
        creationMethod === 'verified'
          ? bankFieldsAll.filter((f: any) => f.name !== 'selectedBank')
          : bankFieldsAll;
      const verifiedDisabledFields = ['financialInstitutionName', 'branchName', 'bic', 'branchSortCode', 'town', 'bankCountryCode', 'addressLine1'];
      const bankFields = mapCountrySelectFields(bankFieldsRaw).map((f: any) => {
        if (f.name === 'selectedBank') return { ...f, type: 'select', lookupBtn: true, fullWidth: true, options: bankSelectOptions };
        return creationMethod === 'verified' && verifiedDisabledFields.includes(f.name) ? { ...f, disabled: true } : f;
      });

      return (
        <Box>
          <RHFProvider methods={methodsBank} onSubmit={() => {}} asForm={false}>
            <CreateJournyForm
              testIdPrefix={buildTestId(testIdPrefix, 'form')}
              onChange={handleChange}
              hideSectionBottomBorder
              hideSectionTopBorder
              sections={[
                {
                  title: 'Bank details',
                  titleIcon: IcnBranch as any,
                  fields: bankFields as any,
                  customContent: isDomesticFX ? (
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
                  fields: (creationMethod === 'verified'
                    ? buildAccount(beneficiary).map((f: any) =>
                      ['accountNumber', 'accountType'].includes(f.name) ? { ...f, disabled: true } : f
                    )
                    : buildAccount(beneficiary)
                  ) as any,
                  ShowActionBtns: false,
                },
                {
                  title: 'Payment type',
                  titleIcon: IcnCardQuestion as any,
                  fields: buildCollection(beneficiary, paymentTypeOptions) as any,
                  ShowActionBtns: false,
                },
              ]}
              mode="edit"
              ShowActionBtns={true}
              renderWithRHF
              formMethods={methodsBank}
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
                  'branchName',
                  'bic',
                  'branchSortCode',
                  'bankCountryCode'
                ];
                
                fieldsToReset.forEach((field) => {
                  methodsBank.setValue(field as any, '', { shouldDirty: true, shouldValidate: false });
                  dispatch(updateBeneficiary({ field, value: '' }));
                });
                
                methodsBank.setValue('town', '', { shouldDirty: true, shouldValidate: false });
                dispatch(updateBeneficiary({ field: 'town', value: '' }));
                
                methodsBank.setValue('selectedBank', '', { shouldDirty: true, shouldValidate: false });
                dispatch(updateBeneficiary({ field: 'selectedBank', value: '' }));
                
                setLookupTriggered(false);
                setInsufficientInfo(false);
                dispatch(resetBankLookup());
                
                methodsBank.clearErrors('financialInstitutionName');
                methodsBank.clearErrors('bankCountryCode');
              }}
              rulesProvider={(name: string, getVals: () => any) =>
                getBeneficiaryRulesForField(name as any, getVals)
              }
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              }}
              onValidationFail={() => {}}
              syncOnChange={true}
              showInfoBlock={lookupTriggered && !bankLookupLoading && !(beneficiary as any).selectedBank}
              infoBlockResultsFound={(bankLookup?.items?.length ?? 0) > 0}
              infoBlockTitle={
                insufficientInfo
                  ? 'More information is needed to perform the lookup'
                  : (bankLookup?.items?.length ?? 0) > 0
                    ? 'Results found'
                    : 'No results found'
              }
              infoBlockDescription={
                insufficientInfo
                  ? 'Enter the bank name and country/region, then try again'
                  : (bankLookup?.items?.length ?? 0) > 0
                    ? 'Select a bank from the list.'
                    : 'Enter more bank details above and try again, or fill in the information manually.'
              }
              infoMessage={"Complete one or more of the mandatory fields, click LOOKUP to locate and select a specific domestic or international bank branch and populate all fields OR manually enter all the mandatory bank details."}
            />
          </RHFProvider>
          <FormActionButtons
            testIdPrefix={buildTestId(testIdPrefix, 'actions')}
            onCancel={handleCancel}
            onNext={() =>
              methodsBank.handleSubmit(() => {
                if (!validateIntermediarySelectionRequired()) {
                  return;
                }
                handleNext();
              })()
            }
          />
        </Box>
      );
    }

    let personalFields, addressFields;
    let buildBank, buildAccount, buildCollection;

    if (isDomesticBase) {
      personalFields = domesticPersonalFields;
      addressFields = mapCountrySelectFields(domesticAddressFields);
      buildBank = (ben: any) => domesticBase.buildBankFields(ben, countryOptions);
      buildAccount = (ben: any) => domesticBase.buildAccountFields(ben, currencyOptions, accountTypeOptions);
      buildCollection = (ben: any, opts: any) => domesticBase.buildCollectionFields(ben, opts);
    } else {
      const entityCategory = beneficiary.entityCategory;
      if (entityCategory === 'Individual') {
        personalFields = mapCountrySelectFields(domesticFxInternational.buildIndividualPersonalFields(beneficiary));
        addressFields = mapCountrySelectFields(domesticFxInternational.buildIndividualAddressFields(beneficiary, countryOptions));
        buildBank = (ben: any) => domesticFxInternational.buildIndividualBankFields(ben, countryOptions);
        buildAccount = (ben: any) => domesticFxInternational.buildIndividualAccountFields(ben, currencyOptions, accountTypeOptions);
        buildCollection = domesticFxInternational.buildIndividualCollectionFields;
      } else if (entityCategory === 'Entity') {
        personalFields = mapCountrySelectFields(domesticFxInternational.buildEntityPersonalFields(beneficiary));
        addressFields = mapCountrySelectFields(domesticFxInternational.buildEntityAddressFields(beneficiary, countryOptions));
        buildBank = (ben: any) => domesticFxInternational.buildEntityBankFields(ben, countryOptions);
        buildAccount = (ben: any) => domesticFxInternational.buildEntityAccountFields(ben, currencyOptions, accountTypeOptions);
        buildCollection = domesticFxInternational.buildEntityCollectionFields;
      } else {
        personalFields = domesticFxInternational.buildNotApplicablePersonalFields(beneficiary);
        addressFields = mapCountrySelectFields(domesticFxInternational.buildNotApplicableAddressFields(beneficiary, countryOptions));
        buildBank = (ben: any) => domesticFxInternational.buildNotApplicableBankFields(ben, countryOptions);
        buildAccount = (ben: any) => domesticFxInternational.buildNotApplicableAccountFields(ben, currencyOptions, accountTypeOptions);
        buildCollection = domesticFxInternational.buildNotApplicableCollectionFields;
      }
    }

    const bankFieldsAll = buildBank(beneficiary);
    const bankFieldsReview =
      creationMethod === 'verified'
        ? bankFieldsAll.filter((f: any) => f.name !== 'selectedBank')
        : bankFieldsAll;

    const bankFieldsReviewMapped = mapCountrySelectFields(bankFieldsReview);

    // Build review overrides from RHF to display latest edits
    const detailsValues = methodsDetails.getValues();
    const bankValues = methodsBank.getValues();
    const applyOverrides = (fieldsArr: any[], overrides: Record<string, any>) =>
      fieldsArr.map((f: any) => {
        const nf: any = { ...f };
        if (f.type === 'multiChip') {
          const tname = f.multiTargetFieldName || f.name;
          const raw = overrides?.[tname];
          if (Array.isArray(raw)) nf.multiSelectedValues = raw;
          else if (typeof raw === 'string')
            nf.multiSelectedValues = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
          return nf;
        }
        if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name)) nf.value = overrides[f.name];
        if (f.type === 'amount') {
          const currencyName = f.amountCurrencyTargetName || `${f.name}Currency`;
          if (Object.prototype.hasOwnProperty.call(overrides || {}, currencyName))
            nf.amountCurrency = overrides[currencyName];
        }
        return nf;
      });

    const personalFieldsOv = applyOverrides(personalFields as any[], detailsValues as any);
    const addressFieldsOv = applyOverrides(addressFields as any[], detailsValues as any);
    const bankFieldsReviewOv = applyOverrides(bankFieldsReviewMapped as any[], bankValues as any);
    const accountFieldsOv = applyOverrides(buildAccount(beneficiary) as any[], bankValues as any);
    const collectionFieldsOv = applyOverrides(buildCollection(beneficiary, paymentTypeOptions) as any[], bankValues as any);

    return (
      <Box>
        <Box sx={{ marginBottom: '16px' }}>
          <CreateJournyForm
            testIdPrefix={buildTestId(testIdPrefix, 'form')}
            onChange={handleChange}
            mode="review"
            ShowActionBtns={false}
            sections={[
              {
                title: "Payment category",
                titleIcon: GridIcon as any,
                fields: buildPaymentCategoryFields() as any,
                ShowActionBtns: false,
              },
              ...(isDomesticFX ? [{
                title: "Entity category",
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
          mode="review"
          ShowActionBtns={true}
          sectionsInSingleCard
          renderWithRHF
          hideSectionBottomBorder
          hideSectionTopBorder
          formMethods={methodsDetails}
          syncOnChange={true}
          onEditModeChange={handleBeneficiaryDetailsEditModeChange}
          sections={[
            {
              title: "Beneficiary details",
              titleIcon: IcnAccountTile as any,
              fields: mapPersonalFieldsForPassportVisibility(
                personalFieldsOv as any[],
                (detailsValues as any).identificationType || '',
                creationMethod,
              ),
              ShowActionBtns: true,
            },
            {
              title: "Address details",
              titleIcon: IcnAccountTile as any,
              fields: addressFieldsOv as any,
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
                  mode={beneficiaryDetailsEditMode ? 'edit' : 'review'}
                  onClearErrors={() => setPayAlertErrors({})}
                  testIdPrefix={buildTestId(testIdPrefix, 'pay-alerts')}
                />
              ),
              customContentPadding: '0',
            },
          ]}
          rulesProvider={(name) =>
            getBeneficiaryRulesForField(
              mapBeneficiaryFieldName(name as string) as any,
              () => methodsDetails.getValues() as any,
            )}
          onSubmit={(data: any) => {
            Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            const payAlertsValid = validatePayAlerts();
            if (!payAlertsValid) {
              return false;
            }
            return true;
          }}
          onValidationFail={() => {
            setErrorDialogMessage('Please correct the highlighted fields and try again.');
            setErrorDialogOpen(true);
            setErrorDialogContent('');
          }}
        />

        <Box sx={{ marginTop: '16px' }}>
          <CreateJournyForm
            testIdPrefix={buildTestId(testIdPrefix, 'form')}
            onChange={handleChange}
            mode="review"
            ShowActionBtns={true}
            onEditModeChange={handleBankDetailsEditModeChange}
            renderWithRHF
            hideSectionBottomBorder
            hideSectionTopBorder
            formMethods={methodsBank}
            syncOnChange={true}
            sections={[
              {
                title: "Bank details",
                titleIcon: IcnBranch as any,
                fields: (creationMethod === 'verified'
                  ? (bankFieldsReviewOv as any).map((f: any) => {
                    const verifiedDisabledFields = ['financialInstitutionName', 'branchName', 'bic', 'branchSortCode', 'town', 'bankCountryCode', 'addressLine1'];
                    if (f.name === 'bankCountryCode') {
                      return { ...f, type: 'select', options: countryOptions, disabled: true };
                    }
                    if (verifiedDisabledFields.includes(f.name)) return { ...f, disabled: true };
                    return f;
                  })
                  : (bankFieldsReviewOv as any).map((f: any) => {
                    if (f.name === 'bankCountryCode') {
                      return { ...f, type: 'select', options: countryOptions };
                    }
                    if (f.name === 'selectedBank') {
                      return { ...f, type: 'select', lookupBtn: true, fullWidth: true, options: bankSelectOptions, showWhenEditingInReview: true };
                    }
                    return f;
                  })
                ),
                ShowActionBtns: true,
              },
              {
                title: "Account details",
                titleIcon: IcnAccountTitle as any,
                fields: (creationMethod === 'verified'
                  ? (accountFieldsOv as any).map((f: any) =>
                    ['accountNumber', 'accountType'].includes(f.name) ? { ...f, disabled: true } : f
                  )
                  : accountFieldsOv as any
                ),
                ShowActionBtns: false,
              },
            ]}
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
              if (!params.bankName ||!params.countryCode) {
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
                'branchName',
                'bic',
                'branchSortCode',
                'bankCountryCode'
              ];
              
              fieldsToReset.forEach((field) => {
                methodsBank.setValue(field as any, '', { shouldDirty: true, shouldValidate: false });
                dispatch(updateBeneficiary({ field, value: '' }));
              });
              
              methodsBank.setValue('town', '', { shouldDirty: true, shouldValidate: false });
              dispatch(updateBeneficiary({ field: 'town', value: '' }));
              
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
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={() => {
              setErrorDialogMessage('Please correct the highlighted fields and try again.');
              setErrorDialogOpen(true);
              setErrorDialogContent('');
            }}
          />
        </Box>

        <Box sx={{ marginTop: '16px' }}>
          <CreateJournyForm
            testIdPrefix={buildTestId(testIdPrefix, 'payment-type-form')}
            title="Payment type"
            titleIcon={IcnCardQuestion as any}
            fields={collectionFieldsOv as any}
            onChange={handleChange}
            mode="review"
            ShowActionBtns={true}
            syncOnChange={true}
            onEditModeChange={handlePaymentTypeEditModeChange}
            renderWithRHF
            formMethods={methodsBank}
            rulesProvider={(name) =>
              getBeneficiaryRulesForField(
                name as any,
                () => methodsBank.getValues() as any,
              )}
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={() => {}}
          />
        </Box>

        <FormActionButtons
          testIdPrefix={buildTestId(testIdPrefix, 'actions')}
          onCancel={handleCancel}
          onNext={async () => {
            const detailsValidPromise = methodsDetails.trigger();
            const bankValidPromise = methodsBank.trigger();
            const payAlertsValid = validatePayAlerts();
            const [detailsValid, bankValid] = await Promise.all([
              detailsValidPromise,
              bankValidPromise,
            ]);
            const intermediarySelectionValid = validateIntermediarySelectionRequired();
            if (!detailsValid || !bankValid || !payAlertsValid || !intermediarySelectionValid) {
              return;
            }
            await submitBeneficiary();
          }}
          nextText="SUBMIT FOR APPROVAL"
          nextStartIcon={submitting ? <CircularProgress size={20} sx={{ color: '#0062E1' }} /> : undefined}
          nextDisabled={submitting}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: 3 }}>
        <Breadcrumb
          links={[
            { href: '/', label: 'Dashboard' },
            { href: '/setup-and-admin/beneficiary', label: 'Beneficiaries' },
            {
              href: '/setup-and-admin/beneficiary/create',
              label: 'Select a creation method',
            },
            {
              href: '/setup-and-admin/beneficiary/type',
              label: 'Select a beneficiary type',
            },
            {
              href: '/setup-and-admin/beneficiary/details',
              label: 'Create a beneficiary',
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px' }}>
          {`Create a beneficiary${beneficiary.beneficiaryType ? ` (${beneficiary.beneficiaryType}${beneficiary.creationMethod ? `, ${beneficiary.creationMethod}` : ''})` : ''}`}
        </Heading>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        {isCompany ? (
          <Box data-testid={buildTestId(testIdPrefix, 'company-flow')}>{renderStepContent(currentStep)}</Box>
        ) : (
          <Paper
            data-testid={buildTestId(testIdPrefix, 'stepper-container')}
            sx={{
              p: '0.5rem 1rem',
              backgroundColor: '#F4F5F7',
              boxShadow: 'none',
            }}
          >
            <Stepper activeStep={currentStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label} completed={index < lastHighestProgressIndex}>
                  <StepLabel
                    onClick={() => onSelectStep(index)}
                    data-testid={buildTestId(testIdPrefix, 'step-label', index)}
                    sx={{ cursor: index <= lastHighestProgressIndex ? 'pointer' : 'default' }}
                    optional={
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '13px' }}>
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent data-testid={buildTestId(testIdPrefix, 'step-content', index)}>
                   
                      {index === currentStep && renderStepContent(currentStep)}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}
      </Box>
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
      <Dialog
        name="validation-error-dialog"
        data-testid={buildTestId(testIdPrefix, 'validation-error-dialog')}
        title={errorDialogMessage || 'System error'}
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
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
            {submitting ? (
              <>
                <CircularProgress size={48} sx={{ color: '#0062E1' }} />
                <Box sx={{ fontWeight: 700, fontSize: '16px', textAlign: 'center', lineHeight: '24px' }}>
                  Submitting...
                </Box>
              </>
            ) : (
              <>
                <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
                <Box sx={{ fontWeight: 700, fontSize: '16px', textAlign: 'center', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {errorDialogContent}
                </Box>
              </>
            )}
          </Box>
        }
        secondaryCTALabel={submitting ? '' : 'TRY AGAIN'}
        onSecondaryCTA={async () => {
          await submitBeneficiary();
        }}
        tertiaryCTALabel={submitting ? '' : 'CANCEL'}
        onTertiaryCTA={() => {
          if (!submitting) {
            setErrorDialogOpen(false);
          }
        }}
        maxWidth="560px"
        secondaryCTAWidth="125px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />
      <Dialog
        name="duplicate-beneficiary-dialog"
        data-testid={buildTestId(testIdPrefix, 'duplicate-beneficiary-dialog')}
        title="Duplicate beneficiary"
        open={duplicateBeneficiaryDialogOpen}
        onClose={() => setDuplicateBeneficiaryDialogOpen(false)}
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
                This beneficiary already exists
              </Box>
              <Box sx={{ fontWeight: 400, fontSize: '14px', textAlign: 'center' }}>
                A beneficiary already exists with this beneficiary code.
              </Box>
          </Box>
        }
        secondaryCTALabel="RETURN TO CREATE"
        onSecondaryCTA={() => setDuplicateBeneficiaryDialogOpen(false)}
        tertiaryCTALabel="CANCEL"
        onTertiaryCTA={() => {
          setDuplicateBeneficiaryDialogOpen(false);
          router.push('/setup-and-admin/beneficiary' as any);
        }}
        maxWidth="560px"
        secondaryCTAWidth="185px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />
      <CancellationConfirmationDialog
        open={cancellationDialogOpen}
        onClose={handleCancelCancellation}
        onDismiss={handleCancelCancellation}
        onCancel={handleConfirmCancellation}
        cancelLabel="YES, CANCEL"
      />
    </Box>
  );
}