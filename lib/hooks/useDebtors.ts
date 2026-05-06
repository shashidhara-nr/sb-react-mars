import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { RootState, AppDispatch } from '../../store';
import { resetDebtor, createDebtor, fetchDebtorById, deleteManagedDebtorById, resetManagedDebtor } from '../../store/slices/createDebtorSlice';
import { fetchCountryOptions, fetchCurrencyOptions, fetchAccountTypeOptions } from '../../store/slices/createBeneficiarySlice';
import { getCollectionTypesList } from '../api/collectionTypesApi';
import { useState, useEffect } from 'react';

interface UseDebtorsResult {
  debtor: any;
  managedDebtor: any;
  createDebtorRequest: () => Promise<any>;
  submitCreateDebtor: () => void;
  countryOptions: Array<{ label: string; value: string }>;
  currencyOptions: Array<{ label: string; value: string }>;
  accountTypeOptions: Array<{ label: string; value: string }>;
  collectionTypeOptions: Array<{ label: string; value: string }>;
  collectionTypesList: Array<any>;
  fetchCountries: () => Promise<any>;
  fetchCurrencies: () => Promise<any>;
  fetchCollectionTypes: () => Promise<void>;
  getDebtorById: (id: string) => Promise<any>;
  deleteDebtorById: (debtor: any) => Promise<any>;
}

export function useDebtors(): UseDebtorsResult {
  const dispatch = useAppDispatch();
  const debtor = useAppSelector((state) => state.createDebtor.debtor);
  const managedDebtor = useAppSelector((state) => state.createDebtor.managedDebtor);
  const countryOptions = useAppSelector((state) => state.createBeneficiary.countries);
  const currencyOptions = useAppSelector((state) => state.createBeneficiary.currencies);
  const accountTypes = useAppSelector((state) => state.createBeneficiary.accountTypes) as Array<{ label: string; value: string }>;
  const [collectionTypeOptions, setCollectionTypeOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [collectionTypesList, setCollectionTypesList] = useState<Array<any>>([]);

  const createDebtorRequest = async () => {
    try {
      const resultAction = await dispatch(createDebtor(debtor));
      if (createDebtor.fulfilled.match(resultAction)) {
        dispatch(resetDebtor());
      }
      return resultAction;
    } catch (error) {
      throw error;
    }
  };

  const submitCreateDebtor = () => {
    // Placeholder for submission/approval flow
    console.log('Submitting debtor for approval:', debtor);
    dispatch(resetDebtor());
  };

  const fetchCountries = async () => {
    const result = await dispatch(fetchCountryOptions());
    return result;
  };

  const fetchCurrencies = async () => {
    console.log('💱 useDebtors: Fetching currencies...');
    const result = await dispatch(fetchCurrencyOptions());
    console.log('💱 useDebtors: Currencies fetched, result:', result.type);
    return result;
  };

  const fetchCollectionTypes = async () => {
    try {
      const response = await getCollectionTypesList();
      console.log('Collection types API response:', response);
      const list = response.collectionTypeList || [];
      const sortedList = [...list].sort((a: any, b: any) => {
        const nameA = (a.collectionTypeName || a.name || a.code || '').toLowerCase();
        const nameB = (b.collectionTypeName || b.name || b.code || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      const options = sortedList.map((item: any) => ({
        label: item.collectionTypeName || item.name || item.code || '',
        value: item.collectionTypeName || item.code || item.name || '',
      })).filter((opt: any) => opt.label && opt.value);
      console.log('Collection type options:', options);
      setCollectionTypeOptions(options);
      setCollectionTypesList(sortedList);
    } catch (error) {
      console.error('Failed to fetch collection types:', error);
      setCollectionTypeOptions([]);
      setCollectionTypesList([]);
    }
  };

  const getDebtorById = async (id: string) => {
    const resultAction = await dispatch(fetchDebtorById(id));
    return resultAction;
  };

  const deleteDebtorById = async (debtor: any) => {
    const resultAction = await dispatch(deleteManagedDebtorById(debtor));
    if (deleteManagedDebtorById.fulfilled.match(resultAction)) {
      dispatch(resetManagedDebtor());
    }
    return resultAction;
  };

  // Auto-fetch account types when BIC changes (same as beneficiaries)
  useEffect(() => {
    if (debtor.bic) {
      dispatch(fetchAccountTypeOptions({ bic: debtor.bic }));
    }
  }, [dispatch, debtor.bic]);

  // Auto-fetch account types when managedDebtor BIC changes
  useEffect(() => {
    if (managedDebtor.bic || managedDebtor.internationalBankBicCode) {
      const bicCode = (managedDebtor.bic || managedDebtor.internationalBankBicCode) as string;
      dispatch(fetchAccountTypeOptions({ bic: bicCode }));
    }
  }, [dispatch, managedDebtor.bic, managedDebtor.internationalBankBicCode]);

  return { 
    debtor, 
    managedDebtor, 
    createDebtorRequest, 
    submitCreateDebtor, 
    countryOptions, 
    currencyOptions,
    accountTypeOptions: accountTypes,
    collectionTypeOptions,
    collectionTypesList,
    fetchCountries, 
    fetchCurrencies,
    fetchCollectionTypes,
    getDebtorById, 
    deleteDebtorById 
  };
}
