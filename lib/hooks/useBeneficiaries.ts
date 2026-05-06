import { useEffect, useMemo, useCallback } from 'react';
import {useAppDispatch, useAppSelector} from '@lib/hooks/useAppDispatch';
import { fetchBeneficiariesWithAuth } from '../../store/slices/beneficiariesSlice';
import { RootState, AppDispatch } from '../../store';
import { resetBeneficiary, createBeneficiary as createBeneficiaryThunk, fetchCountryOptions, fetchPaymentTypeOptions, fetchCurrencyOptions, fetchAccountTypeOptions } from '../../store/slices/createBeneficiarySlice';
import type {   Beneficiary } from 'types/redux/beneficiaries';
import { CreateBeneficiaryPayload } from 'types/beneficiary';

interface BeneficiariesApiResponse {
  beneficiaryDetailPerfList: Beneficiary[];
  // add other properties from the API response if needed
}

interface UseBeneficiariesResult {
  data: BeneficiariesApiResponse | null;
  loading: boolean;
  error: any;
  beneficiary: any;
  fetchBeneficiaries: (filters: any) => void;
  createBeneficiary: () => Promise<any>;
  submitCreateBeneficiary: () => void;
  countryOptions: Array<{ label: string; value: string }>;
  accountTypeOptions: Array<{ label: string; value: string }>;
  paymentTypeOptions: Array<{ label: string; value: string }>;
  currencyOptions: Array<{ label: string; value: string }>;
  fetchCountries: () => Promise<any>;
  fetchPaymentTypes: () => Promise<any>;
  fetchCurrencies: () => Promise<any>;
  fetchBatchDetailsAVS: () => Promise<any[]>;
}
export function useBeneficiaries(  { enabled = true }: { enabled?: boolean } = {}): UseBeneficiariesResult {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.beneficiaries);
  const beneficiary = useAppSelector((state) => state.createBeneficiary.beneficiary);
  const countries = useAppSelector((state) => state.createBeneficiary.countries);
  const accountTypes = useAppSelector((state) => state.createBeneficiary.accountTypes) as Array<{ label: string; value: string }>;
  const paymentTypes = useAppSelector((state) => state.createBeneficiary.paymentTypes);
  const paymentProfiles = useAppSelector((state) => state.createBeneficiary.paymentProfiles);
  const currencies = useAppSelector((state) => state.createBeneficiary.currencies);

  const fetchBeneficiaries = (filters: any) =>
    dispatch(fetchBeneficiariesWithAuth(filters));

  // Helper to determine account type code based on description and beneficiary classification
  // Returns numeric codes for domestic (SA), alpha codes for international
  const getAccountTypeCode = (accountType: string | undefined, classification?: string) => {
    if (!accountType) {
      // Default based on classification
      return classification === 'international' ||classification === 'Domestic FX and/or International' 
        ? 'CURR' 
        : '1';
    }
    
    const accountTypeLower = accountType.toLowerCase();
    
    // International beneficiaries use ISO alpha codes (CURR, SAV, etc.)
    if (classification === 'international' || classification === 'Domestic FX and/or International') {
      if (accountTypeLower.includes('current') || accountTypeLower.includes('cheque')) {
        return 'CURR';
      }
      if (accountTypeLower.includes('saving')) {
        return 'SAV';
      }
      if (accountTypeLower.includes('transmission')) {
        return 'TRAN';
      }
      if (accountTypeLower.includes('bond')) {
        return 'BOND';
      }
      if (accountTypeLower.includes('subscription') || accountTypeLower.includes('share')) {
        return 'SUBS';
      }
      if (accountTypeLower === 'other') {
        return 'OTHR';
      }
      
      // If it's already an alpha code (CURR, SAV, etc.), return as-is
      if (accountType.length <= 4 && accountType === accountType.toUpperCase()) {
        return accountType;
      }
      
      return 'CURR'; // Default for international
    }
    
    // Domestic/Company beneficiaries use numeric codes (1, 2, 3, etc.)
    switch (accountTypeLower) {
      case 'current accounts':
      case 'current (cheque) accounts':
      case 'current':
      case 'cheque':
        return '1';
      case 'savings accounts':
      case 'savings':
      case 'saving':
        return '2';
      case 'transmission accounts':
      case 'transmission':
        return '3';
      case 'bond accounts':
      case 'bond':
        return '4';
      case 'subscription share accounts':
      case 'subscription':
        return '6';
      case 'other':
        return '000';
      default:
        return '210'; // Default for domestic
    }
  };

  const createDomesticPayload = (beneficiary: CreateBeneficiaryPayload) => {
    const accountTypeCode = getAccountTypeCode(beneficiary.accountType, 'DOMESTIC');
    const payload: any = {
      action: 'C',
      counterPartyName: beneficiary.counterPartyName,
      referenceIDX: beneficiary.referenceIDX,
      accountNumber: beneficiary.accountNumber,
      accountType: accountTypeCode,
      accountTypeDesc: beneficiary.accountType,
      accountCurrency: beneficiary.accountCurrency || beneficiary.transactionLimitCurrency || '',
      financialInstitutionName: beneficiary.financialInstitutionName,
      internationalBankBicCode: beneficiary.internationalBankBicCode,
      branchSortCode: beneficiary.branchSortCode,
      bankCountryCode: beneficiary.bankCountryCode,
      transactionLimit: beneficiary.transactionLimit,
      transactionLimitCurrency: beneficiary.transactionLimitCurrency,
      classification: 'DOMESTIC',
      counterPartyAddress: {
        addressLine1: beneficiary.counterPartyAddress.addressLine1 || '',
        countryCode: beneficiary.counterPartyAddress.countryCode || '',
      },
      bankBranchAddress: {
        countryCode: beneficiary.bankBranchAddress?.countryCode || beneficiary.bankCountryCode,
      },
      linkedPaymentProfiles:
        beneficiary.paymentType && beneficiary.paymentType.length > 0 && paymentProfiles
          ? paymentProfiles.filter((p) =>
              beneficiary.paymentType?.includes(
                p.customerPaymentProfileName ||
                  p.description ||
                  p.name ||
                  p.label ||
                  p.code ||
                  p.paymentProfileID?.toString() ||
                  p.value ||
                  '',
              ),
            )
          : [],
      alertDetailsListTO: beneficiary.alertDetailsListTO ? {
        lastPage: beneficiary.alertDetailsListTO.lastPage ?? true,
        pageCount: beneficiary.alertDetailsListTO.pageCount ?? 0,
        postition: beneficiary.alertDetailsListTO.postition ?? 0,
        pageSize: beneficiary.alertDetailsListTO.pageSize ?? 0,
        rowCount: beneficiary.alertDetailsListTO.rowCount ?? 0,
        alertDetailsList: (beneficiary.alertDetailsListTO.alertDetailsList || []).map((alert: any, index: number) => ({
          alertType: alert.alertType.length > 0 ? alert.alertType.toUpperCase()[0] : '',
          notify: alert.notify || '',
          titleAndName: alert.titleAndName || '',
          emailOrNumber: alert.emailOrNumber || ''
        })),
      } : {
        lastPage: true,
        pageCount: 0,
        postition: 0,
        pageSize: 0,
        rowCount: 0,
        alertDetailsList: [],
      },
      originatingChannel: 'Online capture',
    };

    if(beneficiary.counterPartyAddress?.addressLine2) {
      payload.counterPartyAddress.addressLine2 = beneficiary.counterPartyAddress.addressLine2;
    }

    if(beneficiary.counterPartyAddress?.townName) {
      payload.counterPartyAddress.townName = beneficiary.counterPartyAddress.townName;
    }

    if(beneficiary.counterPartyAddress?.countrySubDivision) {
      payload.counterPartyAddress.countrySubDivision = beneficiary.counterPartyAddress.countrySubDivision;
    }

    if(beneficiary.bankBranchAddress?.addressLine1) {
      payload.bankBranchAddress.addressLine1 = beneficiary.bankBranchAddress.addressLine1;
    }

    if(beneficiary.bankBranchAddress?.townName) {
      payload.bankBranchAddress.townName = beneficiary.bankBranchAddress.townName;
    }
    return payload;
  }

  const createCompanyPayload = (beneficiary: CreateBeneficiaryPayload) => {
    // Get account type code
    const accountTypeCode = getAccountTypeCode(beneficiary.accountType, 'CDI');
    
    return {
      action: 'C',
      counterPartyName: beneficiary.counterPartyName,
      cdiNumber: (beneficiary as any).cdiNumber || (beneficiary as any).cdinumber || (beneficiary as any).billerID || '',
      cdiName: beneficiary.counterPartyName,
      referenceIDX: beneficiary.referenceIDX,
      counterPartyReference: beneficiary.counterPartyReference || '',
      accountNumber: beneficiary.accountNumber,
      accountType: accountTypeCode,
      accountCurrency: (beneficiary as any).currency || beneficiary.accountCurrency || 'ZAR',
      classification: 'CDI',
      entityCategory: 'C',
      entityType: 'C',
      financialInstitutionName: beneficiary.financialInstitutionName,
      internationalBankBicCode: beneficiary.bic || beneficiary.internationalBankBicCode || '',
      branchSortCode: beneficiary.branchSortCode,
      bankCountryCode: beneficiary.bankCountryCode,
      transactionLimit: parseFloat(String(beneficiary.transactionLimit || 0)),
      transactionLimitCurrency: beneficiary.transactionLimitCurrency || (beneficiary as any).currency || 'ZAR',
      originatingChannel: 'Online capture',
      counterPartyAddress: {
        countryCode: beneficiary.counterPartyAddress?.countryCode || '',
        addressLine1: beneficiary.counterPartyAddress?.addressLine1 || '',
        addressLine2: beneficiary.counterPartyAddress?.addressLine2 || '',
        townName: beneficiary.counterPartyAddress?.townName || '',
        countrySubDivision: beneficiary.counterPartyAddress?.countrySubDivision || '',
        postalCode: beneficiary.counterPartyAddress?.postalCode || '',
        subUrb: (beneficiary.counterPartyAddress as any)?.subUrb || '',
      },
      bankBranchAddress: {
        countryCode: beneficiary.bankCountryCode || '',
        townName: (beneficiary as any).town || '',
        addressLine1: beneficiary.bankBranchAddress?.addressLine1 || '',
        postalCode: beneficiary.bankBranchAddress?.postalCode || '',
      },
      linkedPaymentProfiles:
        beneficiary.paymentType && beneficiary.paymentType.length > 0 && paymentProfiles
          ? paymentProfiles.filter((p) =>
              beneficiary.paymentType?.includes(
                p.customerPaymentProfileName ||
                  p.description ||
                  p.name ||
                  p.label ||
                  p.code ||
                  p.paymentProfileID?.toString() ||
                  p.value ||
                  '',
              ),
            )
          : [],
      alertDetailsListTO: beneficiary.alertDetailsListTO ? {
        lastPage: beneficiary.alertDetailsListTO.lastPage ?? true,
        pageCount: beneficiary.alertDetailsListTO.pageCount ?? 0,
        postition: beneficiary.alertDetailsListTO.postition ?? 0,
        pageSize: beneficiary.alertDetailsListTO.pageSize ?? 0,
        rowCount: beneficiary.alertDetailsListTO.rowCount ?? 0,
        alertDetailsList: (beneficiary.alertDetailsListTO.alertDetailsList || []).map((alert: any, index: number) => ({
          alertType: alert.alertType.length > 0 ? alert.alertType.toUpperCase()[0] : '',
          notify: alert.notify || '',
          titleAndName: alert.titleAndName || '',
          emailOrNumber: alert.emailOrNumber || ''
        })),
      } : {
        lastPage: true,
        pageCount: 0,
        postition: 0,
        pageSize: 0,
        rowCount: 0,
        alertDetailsList: [],
      },
      ignoreCDIBenRefWarnings: false,
      ignoreAccVerificationWarnings: false,
      overrideIssues: true,
    };
  }

  const createDomesticFxInternationalPayload = (beneficiary: CreateBeneficiaryPayload) => {
    const accountTypeCode = getAccountTypeCode(beneficiary.accountType, 'international');
    
    // Map entity category to entity type code
    const getEntityTypeCode = (entityCategory: string | undefined) => {
      if (!entityCategory) return 'I';
      switch (entityCategory) {
        case 'Individual':
          return 'I';
        case 'Entity':
          return 'E';
        case 'Not applicable':
          return 'N';
        default:
          return 'I';
      }
    };

    // Map identification type to backend code
    const getIdentificationType = (identificationType: string | undefined) => {
      if (!identificationType) return '';
      if (identificationType === 'Identification number') return 'ID';
      if (identificationType === 'Passport number') return 'PASS';
      return identificationType;
    };

    const entityTypeCode = getEntityTypeCode(beneficiary.entityCategory);
    const isIndividual = entityTypeCode === 'I';

    // Build base payload
    const payload: any = {
      action: 'C',
      referenceIDX: beneficiary.referenceIDX,
      counterPartyReference: beneficiary.counterPartyReference || '',
      transactionLimit: beneficiary.transactionLimit ? String(beneficiary.transactionLimit) : '',
      originatingChannel: 'Online capture',
      classification: 'international',
      entityCategory: entityTypeCode,
      entityType: entityTypeCode,
      authoriseStatus: 'PND',
      declineReason: '',
      declineTimestamp: '',
      declineUserName: '',
    };

    // Add individual-specific fields
    if (isIndividual) {
      payload.counterPartyName = `${beneficiary.firstName || ''} ${beneficiary.lastName || ''}`.trim();
      payload.surname = beneficiary.lastName || beneficiary.surname || '';
      // Note: Do NOT send firstName field to backend - it causes 500 error
      payload.gender = beneficiary.gender || '';
      payload.nationality = beneficiary.nationality || '';
      payload.passportCountry = beneficiary.passportCountry || '';
      payload.identificationType = getIdentificationType(beneficiary.identificationType);
      payload.identificationNumber = beneficiary.identificationNumber || '';
    } else {
      // Entity or Not Applicable
      payload.counterPartyName = beneficiary.counterPartyName || '';
      if (entityTypeCode === 'E') {
        payload.nationality = beneficiary.nationality || '';
      }
    }

    // Counterparty address
    payload.counterPartyAddress = {
      addressLine1: beneficiary.counterPartyAddress?.addressLine1 || '',
      addressLine2: beneficiary.counterPartyAddress?.addressLine2 || '',
      addressLine3: beneficiary.counterPartyAddress?.addressLine3 || '',
      townName: beneficiary.counterPartyAddress?.townName || '',
      countrySubDivision: beneficiary.counterPartyAddress?.countrySubDivision || '',
      countryCode: beneficiary.counterPartyAddress?.countryCode || '',
      postalCode: beneficiary.counterPartyAddress?.postalCode || '',
      subUrb: beneficiary.counterPartyAddress?.subUrb || '',
    };

    // Bank branch address - Note: In the form, bank address fields might be stored differently
    // Check for both bankBranchAddress and any fields that might be mapped to bank address
    const bankAddressLine1 = (beneficiary as any).bankAddressLine1 || beneficiary.bankBranchAddress?.addressLine1 || '';
    const bankAddressLine2 = (beneficiary as any).bankAddressLine2 || beneficiary.bankBranchAddress?.addressLine2 || '';
    const bankTownName = (beneficiary as any).bankBranchTownName || beneficiary.bankBranchAddress?.townName || '';
    const bankPostalCode = (beneficiary as any).bankPostalCode || beneficiary.bankBranchAddress?.postalCode || '';
    
    payload.bankBranchAddress = {
      addressLine1: bankAddressLine1,
      townName: bankTownName,
      countryCode: beneficiary.bankCountryCode || beneficiary.bankBranchAddress?.countryCode || '',
      postalCode: bankPostalCode,
    };

    // Bank details
    payload.financialInstitutionName = beneficiary.financialInstitutionName || '';
    payload.internationalBankBicCode = beneficiary.bic || beneficiary.internationalBankBicCode || '';
    payload.iban = beneficiary.iban || '';
    payload.branchSortCode = beneficiary.branchSortCode || '';
    payload.accountNumber = beneficiary.accountNumber || '';
    payload.accountType = accountTypeCode;
    payload.accountTypeDesc = beneficiary.accountType || '';
    payload.transactionLimitCurrency = beneficiary.transactionLimitCurrency || beneficiary.accountCurrency || '';
    payload.accountCurrency = beneficiary.accountCurrency || '';
    payload.bankCountryCode = beneficiary.bankCountryCode || '';

    // Intermediary bank details (if provided)
    if (beneficiary.intermediaryBankBicCode || beneficiary.intermediaryBankName) {
      payload.intermediaryBankBicCode = beneficiary.intermediaryBankBicCode || '';
      payload.intermediaryBankName = beneficiary.intermediaryBankName || '';
      payload.intermediaryBankTownName = beneficiary.intermediaryBankTownName || '';
    }

    // Corresponding/Clearing bank details (if provided)
    if (beneficiary.correspondingBankBicCode || beneficiary.correspondingBankName) {
      payload.correspondingBankBicCode = beneficiary.correspondingBankBicCode || '';
      payload.correspondingBankName = beneficiary.correspondingBankName || '';
      payload.correspondingBankTownName = beneficiary.correspondingBankTownName || '';
    }

    // Payment profiles
    payload.linkedPaymentProfiles =
      beneficiary.paymentType && beneficiary.paymentType.length > 0 && paymentProfiles
        ? paymentProfiles.filter((p) =>
            beneficiary.paymentType?.includes(
              p.customerPaymentProfileName ||
                p.description ||
                p.name ||
                p.label ||
                p.code ||
                p.paymentProfileID?.toString() ||
                p.value ||
                '',
            ),
          )
        : [];

    // Alert details
    payload.alertDetailsListTO = beneficiary.alertDetailsListTO ? {
      lastPage: beneficiary.alertDetailsListTO.lastPage ?? true,
      pageCount: beneficiary.alertDetailsListTO.pageCount ?? 0,
      postition: beneficiary.alertDetailsListTO.postition ?? 0,
      pageSize: beneficiary.alertDetailsListTO.pageSize ?? 0,
      rowCount: beneficiary.alertDetailsListTO.rowCount ?? 0,
      alertDetailsList: (beneficiary.alertDetailsListTO.alertDetailsList || []).map((alert: any) => ({
        alertType: alert.alertType.length > 0 ? alert.alertType.toUpperCase()[0] : '',
        notify: alert.notify || '',
        titleAndName: alert.titleAndName || '',
        emailOrNumber: alert.emailOrNumber || '',
      })),
    } : {
      lastPage: true,
      pageCount: 0,
      postition: 0,
      pageSize: 0,
      rowCount: 0,
      alertDetailsList: [],
    };

    return payload;
  }


  // Call this to create a beneficiary via API
  const createBeneficiary = async () => {
    console.log('Creating beneficiary with data:', beneficiary);
    try {
      let payload: any;
      switch(beneficiary.beneficiaryType) {
        case 'DOMESTIC':
        case 'Domestic Base':
          payload = createDomesticPayload(beneficiary);
          break;
        case 'Company':
          payload = createCompanyPayload(beneficiary);
          break;
        case 'Domestic FX and/or International':
          payload = createDomesticFxInternationalPayload(beneficiary);
          break;
        default:
          payload = beneficiary;
          break;
      }
      const resultAction = await dispatch(
        createBeneficiaryThunk(payload),
      );
      // Optionally handle resultAction for success/error
      return resultAction;
    } catch (error) {
      // Optionally handle error
      throw error;
    }
  };

  // Country options come from slice state
  const countryOptions = useMemo(() => countries, [countries]);

  const accountTypeOptions = useMemo(() => accountTypes, [accountTypes]);

  // Payment type options come from slice state
  const paymentTypeOptions = useMemo(() => paymentTypes, [paymentTypes]);

  // Currency options come from slice state
  const currencyOptions = useMemo(() => currencies, [currencies]);

  // Method to fetch countries via slice thunk - memoized to prevent unnecessary re-creation
  const fetchCountries = useCallback(async () => {
    const result = await dispatch(fetchCountryOptions());
    return result;
  }, [dispatch]);

  // Method to fetch payment types via slice thunk - memoized to prevent unnecessary re-creation
  const fetchPaymentTypes = useCallback(async () => {
    const result = await dispatch(fetchPaymentTypeOptions());
    return result;
  }, [dispatch]);

  // Method to fetch currencies via slice thunk - memoized to prevent unnecessary re-creation
  const fetchCurrencies = useCallback(async () => {
    const result = await dispatch(fetchCurrencyOptions());
    return result;
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCurrencyOptions());
    dispatch(fetchPaymentTypeOptions());
    dispatch(fetchCountryOptions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (beneficiary.bic) dispatch(fetchAccountTypeOptions({bic: beneficiary.bic}));
  }, [dispatch, beneficiary.bic]);

  // helper for verified-account API
  const fetchBatchDetailsAVS = useCallback(async () => {
    const { getBatchDetailsAVS } = await import('../api/beneficiaryApi');
    const response = await getBatchDetailsAVS();
    return response;
  }, []);

  // Ensure beneficiaryDetailPerfList is always an array
  const safeData: BeneficiariesApiResponse | null = data
    ? {
        ...data,
        beneficiaryDetailPerfList: data.beneficiaryDetailPerfList ?? [],
      }
    : null;
const submitCreateBeneficiary = () => {
    // Here you would call your API with the full beneficiary object
    // For now, just log it and reset
    console.log('Submitting beneficiary:', beneficiary);
    // dispatch(apiCall(beneficiary));
    dispatch(resetBeneficiary());
  };
  return { data: safeData, loading, error, beneficiary, fetchBeneficiaries, createBeneficiary, submitCreateBeneficiary, countryOptions, paymentTypeOptions, currencyOptions, accountTypeOptions, fetchCountries, fetchPaymentTypes, fetchCurrencies, fetchBatchDetailsAVS };
}
