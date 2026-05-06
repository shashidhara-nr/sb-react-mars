/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useRouter } from 'next/navigation';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { InfoBlock } from 'components/common';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { buildTestId } from 'src/utils/testIds';
import IcnCardQuestion from 'public/icons/icn_card_question.svg';
import IcnAccountTitle from 'public/icons/icn_account_tile.svg';
import { Box, Typography, Paper, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';
// Removed unused hook import
import VerifiedAccount from '@organisms/debtors/VerifiedAccount';
import GridIcon from 'public/icons/icn_view_grid.svg';
import { FormActionButtons } from 'components/common/formActionButtons';
import IcnAccountTile from 'public/icons/icn_people_1_nametag.svg';
import IcnBroadcast from 'public/icons/icn_broadcast.svg';
import IcnBranch from 'public/icons/icn_branch.svg';
import { updateDebtor, updateDebtorObject, fetchVerifiedAccounts, resetDebtor } from '@store/slices/createDebtorSlice';
import { useDebtors } from '@lib/hooks/useDebtors';
import CreateJournyForm from 'components/common/CreateJournyForm';
import { RHFProvider } from 'components/common';
import { lookupBank, resetBankLookup } from '@store/slices/createBeneficiarySlice';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import {
  buildPersonalFieldsDebtor,
  buildAddressFieldsDebtor,
  buildBankFieldsDebtor,
  buildAccountFieldsDebtor,
  buildCollectionFieldsDebtor,
} from 'src/utils/DebtorsField';
import { getRulesForField as getDebtorRulesForField } from 'src/utils/DebtorsCreateLogic';
import { useTranslations } from 'next-intl';
import { extractErrorIssues, formatErrorMessages } from 'src/utils/errorMessageFormatter';

export default function DebtorDetailPage() {
  const router = useRouter();
   const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtors-details';
  // Removed unused createBeneficiary reference
  const dispatch = useAppDispatch();

  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);

  const [lookupTriggered, setLookupTriggered] = useState(false);
  const [insufficientInfo, setInsufficientInfo] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState<string>('');

  const debtor = useAppSelector((state) => state.createDebtor.debtor);
  const bankLookup = useAppSelector((state) => state.createBeneficiary.bankLookup);
  const verifiedAccountData = useAppSelector((state) => state.createDebtor.debtor);
  const { createDebtorRequest, countryOptions, currencyOptions, accountTypeOptions, collectionTypeOptions, collectionTypesList, fetchCountries, fetchCurrencies, fetchCollectionTypes } = useDebtors();

  // Log currency options whenever they change
  useEffect(() => {
    console.log('💱 Currency options updated:', currencyOptions.length, currencyOptions);
  }, [currencyOptions]);

  // Static options imported from utils

  const bankSelectOptions = (bankLookup?.items || []).map((item: any) => {
    const sortCode = item.preferredBranchCode || item.branchSortCode || item.branchCode;
    const parts = [item.bankName, item.branchName, item.city, item.countryCode].filter(Boolean);
    const label = parts.join(' — ') + (sortCode ? ` (Sort: ${sortCode})` : '');
    const value = sortCode || item.entityKey || item.bankKey || item.bic || item.bankName || label;
    return { label, value };
  });

  // Create RHF methods at top-level to satisfy Rules of Hooks
  // Initialize defaultValues from current Redux state so inputs are prefilled
  const detailsDefaultValues = {
    counterPartyName: debtor.counterPartyName || '',
    referenceIDX: debtor.referenceIDX || '',
    counterPartyReference: debtor.counterPartyReference || '',
    addressLine1: debtor.counterPartyAddress?.addressLine1 || '',
    addressLine2: debtor.counterPartyAddress?.addressLine2 || '',
    countryCode: debtor.counterPartyAddress?.countryCode || '',
    phoneNumber: (debtor as any).phoneNumber || '',
    email: (debtor as any).email || '',
  } as const;

  const bankDefaultValues = {
    financialInstitutionName: debtor.financialInstitutionName || '',
    branchName: (debtor as any).branchName || '',
    bic: debtor.bic || '',
    branchSortCode: debtor.branchSortCode || '',
    town: (debtor as any).town || '',
    bankCountryCode: (debtor as any).bankCountryCode || '',
    selectedBank: (debtor as any).selectedBank || '',
    accountNumber: debtor.accountNumber || '',
    iban: debtor.iban || '',
    currency: (debtor as any).currency || 'ZAR',
    transactionLimit: String((debtor as any)?.transactionLimit ?? ''),
    transactionLimitCurrency: (debtor as any)?.transactionLimitCurrency || 'ZAR',
    accountType: debtor.accountType || '',
    collections: (() => {
      const raw = (debtor as any).collections;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string')
        return raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      return [] as string[];
    })(),
  } as const;

  const methodsDetails = useForm({ mode: 'all', reValidateMode: 'onChange', defaultValues: detailsDefaultValues });
  const methodsBank = useForm({ mode: 'all', reValidateMode: 'onChange', defaultValues: bankDefaultValues });

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

  /* -------------------- FLAGS -------------------- */

  const creationMethod = debtor.creationMethod;
  const isManual = creationMethod === 'manual';
  const isVerified = creationMethod === 'verified';
  const isUpload = creationMethod === 'upload';

  // Sync verified account data from Redux (debtor) to debtor RHF when populated
  useEffect(() => {
    if (isVerified && debtor.verifiedAccount) {
      console.log('🔄 Syncing verified account to form...');
      console.log('📋 Account Type from Redux:', debtor.accountType);
      
      methodsDetails.setValue('counterPartyName', debtor.counterPartyName || '', { shouldDirty: false });
      methodsBank.setValue('financialInstitutionName', debtor.financialInstitutionName || '', { shouldDirty: false });
      methodsBank.setValue('branchName', (debtor as any).branchName || '', { shouldDirty: false });
      methodsBank.setValue('bic', debtor.bic || '', { shouldDirty: false });
      methodsBank.setValue('branchSortCode', debtor.branchSortCode || '', { shouldDirty: false });
      methodsBank.setValue('town', (debtor as any).town || '', { shouldDirty: false });
      methodsBank.setValue('bankCountryCode', (debtor as any).bankCountryCode || '', { shouldDirty: false });
      methodsBank.setValue('accountNumber', debtor.accountNumber || '', { shouldDirty: false });
      methodsBank.setValue('accountType', debtor.accountType || '', { shouldDirty: false });
      
      console.log('✅ Account Type set to form:', debtor.accountType);
      
      // Set address line 1 if available
      if ((debtor as any)?.counterPartyAddress?.addressLine1) {
        methodsDetails.setValue('addressLine1', (debtor as any).counterPartyAddress.addressLine1, { shouldDirty: false });
      }
    }
  }, [isVerified, debtor.verifiedAccount, debtor.counterPartyName, 
      debtor.financialInstitutionName, debtor.bic, debtor.branchSortCode,
      debtor.accountNumber, debtor.accountType, methodsBank, methodsDetails]);

  // Fetch verified accounts when entering verified flow
  useEffect(() => {
    if (isVerified) {
      dispatch(fetchVerifiedAccounts() as any);
    }
  }, [isVerified, dispatch]);

  // Initialize Redux with default currency values if empty
  useEffect(() => {
    const defaultCurrency = debtor.currency || 'ZAR';
    if (!debtor.currency) {
      dispatch(updateDebtor({ field: 'currency', value: defaultCurrency }));
      dispatch(updateDebtor({ field: 'transactionLimitCurrency', value: defaultCurrency }));
      console.log('💱 Initialized currency in Redux:', defaultCurrency);
    }
  }, []);

  /* -------------------- STEPS -------------------- */

  const steps = isManual
    ? [
        { label: translateLang('debtorDetails'), description: translateLang('description') },
        { label: translateLang('bankDetails'), description: translateLang('description') },
        { label: translateLang('reviewAndSubmit'), description: translateLang('description') },
      ]
    : isVerified
      ? [
          { label: translateLang('verifiedAccount'), description: translateLang('description')},
          { label: translateLang('debtorDetails'), description: translateLang('description') },
          { label: translateLang('bankDetails'), description: translateLang('description') },
          { label: translateLang('reviewAndSubmit'), description: translateLang('description') },
        ]
      : isUpload
        ? [
            { label: translateLang('uploadFile'), description: translateLang('description') },
            { label: translateLang('reviewAndSubmit'), description: translateLang('description') },
          ]
        : [];

  /* -------------------- NAVIGATION -------------------- */

  const handleCancel = useCallback(() => {
    dispatch(resetDebtor());
    router.push('/setup-and-admin/debtors/create' as any);
  }, [router, dispatch]);

  const handleNext = useCallback(async () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    } else {
      // Final step - submit for approval
      try {
        const result = await createDebtorRequest();
        // Check if the action was fulfilled (success)
        if (result.type && result.type.endsWith('/fulfilled')) {
          router.push('/setup-and-admin/debtors/details/success' as any);
        } else {
          // Action was rejected or failed
          console.error('Create debtor rejected:', result);
          let errorMsg = translateLang('unableCreateDebtor');
          
          // Try to extract errors from the rejected action payload
          const errorPayload = result.payload;
          if (errorPayload) {
            const errorIssues = extractErrorIssues(errorPayload);
            if (errorIssues && errorIssues.length > 0) {
              try {
                const formattedErrors = formatErrorMessages(errorIssues);
                if (formattedErrors && formattedErrors !== 'Something went wrong. Please try again or contact your bank representative for assistance.') {
                  errorMsg = formattedErrors;
                }
              } catch (err) {
                // Keep generic fallback on error
              }
            }
          }
          
          setErrorDialogMessage(errorMsg);
          setErrorDialogOpen(true);
        }
      } catch (e) {
        console.error('Create debtor failed:', e);
        
        // Extract error issues and try to map to error codes
        const errorIssues = extractErrorIssues((e as any)?.response?.data || (e as any)?.data || e);
        let errorMsg = translateLang('unableCreateDebtor');
        
        if (errorIssues && errorIssues.length > 0) {
          try {
            const formattedErrors = formatErrorMessages(errorIssues);
            if (formattedErrors && formattedErrors !== 'Something went wrong. Please try again or contact your bank representative for assistance.') {
              errorMsg = formattedErrors; // Use mapped error codes
            }
          } catch (err) {
            // Keep generic fallback on error
          }
        }
        
        setErrorDialogMessage(errorMsg);
        setErrorDialogOpen(true);
      }
    }
  }, [currentStep, steps.length, router, createDebtorRequest, translateLang]);

  const onSelectStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= lastHighestProgressIndex) {
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex],
  );

  const buildPersonalFields = useCallback(
    () => buildPersonalFieldsDebtor(debtor, translateLang),
    [debtor.counterPartyName, debtor.referenceIDX, debtor.counterPartyReference],
  );

  const buildAddressFields = useCallback(
    () => buildAddressFieldsDebtor(debtor, translateLang, countryOptions),
    [debtor.counterPartyAddress, countryOptions],
  );

  const buildBankFields = useCallback(
    () => buildBankFieldsDebtor(debtor, translateLang, bankSelectOptions, !isVerified, countryOptions),
    [
      debtor.financialInstitutionName,
      (debtor as any).branchName,
      (debtor as any).bankBranchName,
      debtor.bic,
      debtor.internationalBankBicCode,
      debtor.branchSortCode,
      (debtor as any).town,
      (debtor as any).bankCountryCode,
      (debtor as any).bankBranchAddress?.townName,
      (debtor as any).bankBranchAddress?.countryCode,
      countryOptions,
      bankSelectOptions,
      isVerified,
      translateLang,
    ],
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
    methodsBank.setValue('selectedBank', '', { shouldDirty: true, shouldValidate: false });
    setLookupTriggered(false);
    setInsufficientInfo(false);
    // Clear validation errors when resetting
    methodsBank.clearErrors('financialInstitutionName');
    methodsBank.clearErrors('bankCountryCode');
  }, [dispatch, methodsBank]);

  const buildAccountFields = useCallback(
    () => {
      console.log('🏦 Building account fields. Currency options:', currencyOptions.length);
      return buildAccountFieldsDebtor(debtor, translateLang, currencyOptions, accountTypeOptions);
    },
    [
      debtor.accountNumber,
      debtor.iban,
      (debtor as any).currency,
      (debtor as any)?.transactionLimit,
      (debtor as any)?.transactionLimitCurrency,
      debtor.accountType,
      currencyOptions,
      accountTypeOptions,
    ],
  );

  const buildCollectionFields = useCallback(
    () => buildCollectionFieldsDebtor(debtor, translateLang, collectionTypeOptions),
    [(debtor as any).collections, collectionTypeOptions],
  );

  useEffect(() => {
    console.log('🔄 Fetching countries, currencies, and collection types...');
    fetchCountries();
    fetchCurrencies();
    fetchCollectionTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (collectionTypesList && collectionTypesList.length > 0) {
      dispatch(updateDebtor({ field: 'collectionTypesList', value: collectionTypesList }));
    }
  }, [collectionTypesList, dispatch]);

  /* -------------------- STEP CONTENT -------------------- */

  const renderStepContent = (stepIndex: number) => {
    const handleChange = (name: string, value: any) => {
      const addressKeys = new Set([
        'addressLine1',
        'addressLine2',
        'townName',
        'countrySubDivision',
        'countryCode',
      ]);
      if (addressKeys.has(name)) {
        dispatch(updateDebtorObject({ path: ['counterPartyAddress', name], value }));
      } else {
        dispatch(updateDebtor({ field: name, value }));
        
        // When currency is changed, also update transactionLimitCurrency
        if (name === 'currency') {
          dispatch(updateDebtor({ field: 'transactionLimitCurrency', value }));
          console.log('💱 Currency changed:', value, '→ also updating transactionLimitCurrency');
        }
        
        // When a bank is selected from lookup dropdown, populate related fields
        if (name === 'selectedBank') {
          const v = String(value ?? '');
          const items = (bankLookup?.items || []) as any[];
          const found = items.find((item: any) => {
            const sc = item.preferredBranchCode || item.branchSortCode || item.branchCode;
            return (
              (sc && String(sc) === v) ||
              (item.bankKey && String(item.bankKey) === v) ||
              (item.entityKey && String(item.entityKey) === v) ||
              (item.bic && String(item.bic) === v) ||
              (item.bankName && String(item.bankName) === v)
            );
          });
          if (found) {
            console.log('🏦 Bank lookup found:', found);
            
            // Update Redux state first
            dispatch(updateDebtor({ field: 'financialInstitutionName', value: found.bankName || '' }));
            dispatch(updateDebtor({ field: 'bankBranchName', value: found.branchName || '' }));
            dispatch(updateDebtor({ field: 'internationalBankBicCode', value: found.bic || '' }));
            dispatch(updateDebtor({ field: 'branchSortCode', value: found.preferredBranchCode || found.branchSortCode || found.branchCode || '' }));
            dispatch(updateDebtorObject({ path: ['bankBranchAddress', 'townName'], value: found.city || '' }));
            dispatch(updateDebtorObject({ path: ['bankBranchAddress', 'countryCode'], value: found.countryCode || '' }));
            
            // Then update form state - use setTimeout to ensure Redux updates happen first
            setTimeout(() => {
              methodsBank.setValue('financialInstitutionName', found.bankName || '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
              methodsBank.setValue('branchName', found.branchName || '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
              methodsBank.setValue('bic', found.bic || '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
              methodsBank.setValue('branchSortCode', found.preferredBranchCode || found.branchSortCode || found.branchCode || '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
              methodsBank.setValue('town', found.city || '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
              methodsBank.setValue('bankCountryCode', found.countryCode || '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
              
              // Trigger validation to clear any errors
              methodsBank.trigger(['financialInstitutionName', 'bankCountryCode']);
              
              console.log('✅ Bank fields populated:', {
                bankName: found.bankName,
                country: found.countryCode,
              });
            }, 0);
          }
        }
      }
    };

    // VERIFIED STEP (index 0 when present)
    if (isVerified && stepIndex === 0) {
      return <VerifiedAccount step={currentStep} onNext={handleNext} onCancel={handleCancel} />;
    }

    // PERSONAL DETAILS
    if ((isManual && stepIndex === 0) || (isVerified && stepIndex === 1)) {
      const personalFields = buildPersonalFields();
      const addressFields = buildAddressFields();
      // methodsDetails declared at top-level

      return (
        <Box>
          <RHFProvider methods={methodsDetails} onSubmit={() => {}} asForm={false}>
            <CreateJournyForm
              title={translateLang('personalDetails')}
              titleIcon={IcnAccountTile as any}
              fields={(isVerified
                ? personalFields.map((f: any) => 
                    f.name === 'counterPartyName' ? { ...f, disabled: true } : f
                  )
                : personalFields
              )}
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsDetails}
              rulesProvider={(fieldName: string, getValues: () => any) => {
                return getDebtorRulesForField(fieldName as any, getValues);
              }}
            />

            <CreateJournyForm
              title={translateLang('addressDetails')}
              titleIcon={IcnAccountTile as any}
              fields={addressFields}
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsDetails}
              rulesProvider={(fieldName: string, getValues: () => any) => {
                return getDebtorRulesForField(fieldName as any, getValues);
              }}
            />
          </RHFProvider>

          <FormActionButtons
            onCancel={handleCancel}
            onNext={() => methodsDetails.handleSubmit(() => handleNext())()}
          />
        </Box>
      );
    }

    // BANK DETAILS
    if ((isManual && stepIndex === 1) || (isVerified && stepIndex === 2)) {
      const bankFieldsAll = buildBankFields();
      const verifiedDisabledFields = ['financialInstitutionName', 'branchName', 'bic', 'branchSortCode', 'town', 'bankCountryCode'];
      const bankFields = isVerified
        ? bankFieldsAll.map((f: any) => 
            verifiedDisabledFields.includes(f.name) ? { ...f, disabled: true } : f
          )
        : bankFieldsAll;
      const accountFieldsAll = buildAccountFields();
      const accountFields = isVerified
        ? accountFieldsAll.map((f: any) => 
            ['accountNumber', 'accountType'].includes(f.name) ? { ...f, disabled: true } : f
          )
        : accountFieldsAll;
      const collectionFields = buildCollectionFields();
      // methodsBank declared at top-level

      return (
        <Box>
          <RHFProvider methods={methodsBank} onSubmit={() => {}} asForm={false}>
            <CreateJournyForm
              title={translateLang('bankDetails')}  
              titleIcon={IcnBranch as any}
              fields={bankFields}
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              syncOnChange={true}
              rulesProvider={(fieldName: string, getValues: () => any) => {
                return getDebtorRulesForField(fieldName as any, getValues);
              }}
              formMethods={methodsBank}
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
            />

            <CreateJournyForm
              title={translateLang('accountDetails')}
              titleIcon={IcnAccountTitle as any}
              fields={accountFields}
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsBank}
              rulesProvider={(fieldName: string, getValues: () => any) => {
                return getDebtorRulesForField(fieldName as any, getValues);
              }}
            />

            <CreateJournyForm
              title={translateLang('collectionType')}
              titleIcon={IcnCardQuestion as any}
              fields={collectionFields}
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsBank}
              rulesProvider={(fieldName: string, getValues: () => any) => {
                return getDebtorRulesForField(fieldName as any, getValues);
              }}
            />
          </RHFProvider>

          <FormActionButtons
            onCancel={handleCancel}
            onNext={() => {
              methodsBank.handleSubmit(
                () => {
                  // Success - form is valid
                  handleNext();
                },
                (errors) => {
                  // Validation failed - errors will be shown inline on form fields
                  // Do not show error dialog - field validation is handled by RHF
                }
              )();
            }}
          />
        </Box>
      );
    }

    // REVIEW & SUBMIT
    // Removed unused formData and bankData objects

    // Render review using CreateJournyForm sections with inline Edit/Save/Cancel
    const personalFields = buildPersonalFields();
    const addressFields = buildAddressFields();
    const bankFields = buildBankFields();
    const accountFields = buildAccountFields();
    const collectionFields = buildCollectionFields();

    // Prefer latest RHF values when showing review (fallback to Redux/debtor values)
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
            nf.multiSelectedValues = raw
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean);
          return nf;
        }
        if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name))
          nf.value = overrides[f.name];
        if (f.type === 'amount') {
          const currencyName = f.amountCurrencyTargetName || `${f.name}Currency`;
          if (Object.prototype.hasOwnProperty.call(overrides || {}, currencyName))
            nf.amountCurrency = overrides[currencyName];
        }
        return nf;
      });

    const personalFieldsOv = applyOverrides(personalFields as any[], detailsValues as any);
    const addressFieldsOv = applyOverrides(addressFields as any[], detailsValues as any);
    const bankFieldsOv = applyOverrides(bankFields as any[], bankValues as any);
    const accountFieldsOv = applyOverrides(accountFields as any[], bankValues as any);
    const collectionFieldsOv = applyOverrides(collectionFields as any[], bankValues as any);
   
    return (
      <Box>
        <CreateJournyForm
          onChange={handleChange}
          mode="review"
          ShowActionBtns={true}
          renderWithRHF
          formMethods={methodsDetails}
          syncOnChange={false}
          rulesProvider={(fieldName: string, getValues: () => any) => {
            return getDebtorRulesForField(fieldName as any, getValues);
          }}
          onSubmit={(data: any) => {
            Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
          }}
          onValidationFail={(errors: any) => {
            // Field validation errors are displayed inline by RHF
          }}
          sections={[
            {
              title: translateLang('personalDetails'),
              titleIcon: IcnAccountTile as any,
              fields: (isVerified
                ? (personalFieldsOv as any).map((f: any) => 
                    f.name === 'counterPartyName' ? { ...f, disabled: true } : f
                  )
                : personalFieldsOv as any
              ),
              ShowActionBtns: true,
            },
            {
              title: translateLang('addressDetails'),
              titleIcon: IcnAccountTile as any,
              fields: addressFieldsOv as any,
              ShowActionBtns: false,
            },
          ]}
        />

        <Box sx={{ marginTop: '16px' }}>
          <CreateJournyForm
            onChange={handleChange}
            mode="review"
            ShowActionBtns={true}
            renderWithRHF
            formMethods={methodsBank}
            syncOnChange={false}
            rulesProvider={(fieldName: string, getValues: () => any) => {
              return getDebtorRulesForField(fieldName as any, getValues);
            }}
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={(errors: any) => {
              // Field validation errors are displayed inline by RHF
            }}
            sections={[
              {
                title: translateLang('bankDetails'),
                titleIcon: IcnBranch as any,
                fields: (isVerified
                  ? (bankFieldsOv as any).map((f: any) => {
                      const verifiedDisabledFields = ['financialInstitutionName', 'branchName', 'bic', 'branchSortCode', 'town', 'bankCountryCode'];
                      if (verifiedDisabledFields.includes(f.name)) return { ...f, disabled: true };
                      return f;
                    })
                  : bankFieldsOv as any
                ),
                ShowActionBtns: true,
              },
              {
                title: translateLang('accountDetails'),
                titleIcon: IcnAccountTitle as any,
                fields: (isVerified
                  ? (accountFieldsOv as any).map((f: any) => 
                      ['accountNumber', 'accountType'].includes(f.name) ? { ...f, disabled: true } : f
                    )
                  : accountFieldsOv as any
                ),
                ShowActionBtns: false,
              },
            ]}
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
          />
        </Box>

        <Box sx={{ marginTop: '16px' }}>
          <CreateJournyForm
            title={translateLang('collectionType')}
            titleIcon={IcnCardQuestion as any}
            fields={collectionFieldsOv}
            onChange={handleChange}
            mode="review"
            ShowActionBtns={true}
            renderWithRHF
            formMethods={methodsBank}
            syncOnChange={false}
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={(errors: any) => {
              // Field validation errors are displayed inline by RHF
            }}
          />
        </Box>

        <FormActionButtons
          onCancel={handleCancel}
          onNext={() => {
            // Validate both forms before final submission
            const detailsValid = methodsDetails.trigger();
            const bankValid = methodsBank.trigger();
            
            Promise.all([detailsValid, bankValid]).then(([detailsOk, bankOk]) => {
              if (detailsOk && bankOk) {
                // Both forms are valid, proceed with submission
                handleNext();
              } else {
                // Validation failed - errors will be shown in the form fields
              }
            });
          }}
          nextText={translateLang('reviewAndSubmit')}
        />
      </Box>
    );
  };

  /* -------------------- UI -------------------- */

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box>
        <Breadcrumb
          data-testid="debtor-details-breadcrumb"
          links={[
            { href: '/', label: translateLang('dashboard') },
            { href: '/setup-and-admin/debtors', label: translateLang('debtorsTitle') },
            {
              href: '/setup-and-admin/debtors/create',
              label: translateLang('breadcrumbSelectCreationMethod'),
            },
            {
              href: '/setup-and-admin/debtors/detail',
              label: isVerified ? translateLang('breadcrumbVerifiedAccount') : translateLang('breadcrumbManualEntry'),
            },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginBottom: '44px', marginTop: '32px' }} data-testid={buildTestId(testIdPrefix, 'heading')}>
          {debtor.creationMethod === 'manual' 
            ? translateLang('createDebtorManual')
            : debtor.creationMethod === 'verified'
            ? translateLang('createDebtorVerified')
            : debtor.creationMethod === 'upload'
            ? translateLang('createDebtorUpload')
            : translateLang('createDebtor')}
        </Heading>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Paper sx={{ backgroundColor: '#F4F5F7', boxShadow: 'none', padding: '0!important' }}>
          <Stepper activeStep={currentStep} orientation="vertical" data-testid={buildTestId(testIdPrefix, 'stepper')}>
            {steps.map((step, index) => (
              <Step key={step.label} completed={index < lastHighestProgressIndex}>
                <StepLabel
                  onClick={() => onSelectStep(index)}
                  optional={
                    <Typography variant="body2" sx={{ color: '#697786', fontSize: '12px' }}>
                      {step.description}
                    </Typography>
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent data-testid={buildTestId(testIdPrefix, `step-content-${index}`)}>
                  {index === currentStep && renderStepContent(currentStep)}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>

      <DeleteConfirmationDialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        onPrimaryCTA={handleNext}
        onSecondaryCTA={() => setErrorDialogOpen(false)}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title={translateLang('systemError')}
        message={
          <div style={{ textAlign: 'center' }}>
            {errorDialogMessage === translateLang('unableCreateDebtor') ? (
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
                {errorDialogMessage}
              </div>
            )}
          </div>
        }
        primaryCTALabel={translateLang('tryAgain')}
        secondaryCTALabel={translateLang('cancel')}
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId(testIdPrefix, 'error-dialog')}
      />
    </Box>
  );
}
