'use client';

import { Box } from '@mui/material';
import { Breadcrumb, Heading, Dialog } from 'dist/standard-bank-react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { buildTestId } from 'src/utils/testIds';
import {
  buildPersonalFieldsBopThirdParty,
  buildAddressFieldsBopThirdParty,
  buildPostalAddressFieldsBopThirdParty,
  buildPhoneEmailFieldsBopThirdParty,
  buildEntityDetailsFields,
  buildEntityPhoneEmailFields,
} from 'src/utils/BopThirdPartiesField';
import { getRulesForField } from 'src/utils/BopThirdPartiesCreateLogic';
import { FormActionButtons } from 'components/common/formActionButtons';
import CreateJournyForm from 'components/common/CreateJournyForm';
import { AvatarAlert, IcnLocationOutline, IcnMail, IcnNametag, IcnBroadcast, ResidentCompanyIcon } from '@lib/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@store/index';
import {
  updateManagedBopThirdParty,
  updateManagedBopThirdPartyObject,
} from '@store/slices/bopThirdPartySlice';
import { useBopThirdParty } from '@lib/hooks/useBopThirdParty';
import { useTranslations } from 'next-intl';
import { bopThirdPartiesUrl, getFieldPath, getBreadcrumbLinks, buildDefaultValues } from '../bopThirdPartyHelper';
import styles from "../bopThirdParties.module.scss"

const POSTAL_FIELD_NAMES = [
  'postalAddressLine1',
  'postalAddressLine2',
  'postalPostCode',
  'postalSuburb',
  'postalTownName',
  'postalRegion',
  'postalCountryCode',
] as const;

const getDetailsIcon = (isEntity: boolean) => (isEntity ? ResidentCompanyIcon : IcnNametag);

function BopThirdPartyManagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const thirdPartyId = searchParams?.get('id');
  const typeParam = searchParams?.get('type') || 'individual';
  const postalParam = searchParams?.get('postal') === 'true';
  const dispatch = useAppDispatch();
  const t = useTranslations('bopThirdParties');
  const testIdPrefix = 'bop-third-parties-manage';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasHydratedFormsRef = useRef(false);
  const initialBopThirdPartyRef = useRef<any>(null);
  const hasLoadedDataRef = useRef(false);
  const isInitialPostalSyncRef = useRef(true);

  const managedBopThirdParty = useAppSelector((state) => state.bopThirdParty.managedBopThirdParty);
  
  // Determine entity type from loaded data, falling back to URL parameter
  const { entityType, hasPostalAddress, isCompany, isEntity } = useMemo(() => {
    const type = (managedBopThirdParty?.entityType || typeParam) as 'individual' | 'entity' | 'company';
    const postal = managedBopThirdParty?.hasPostalAddress ?? postalParam;
    const company = type === 'company';
    const entity = type === 'entity' || type === 'company';
    return { entityType: type, hasPostalAddress: postal, isCompany: company, isEntity: entity };
  }, [managedBopThirdParty?.entityType, managedBopThirdParty?.hasPostalAddress, typeParam, postalParam]);
  const { getBopThirdPartyById, updateBopThirdPartyRequest, deleteBopThirdPartyRequest, isLoading } = useBopThirdParty();

  useEffect(() => {
    if (thirdPartyId && !hasLoadedDataRef.current) {
      hasLoadedDataRef.current = true;
      getBopThirdPartyById(thirdPartyId);
    }
  }, [thirdPartyId]);

  const handleChange = useCallback((name: string, value: any) => {
    // UI-only field; never persist to redux
    if (name === 'postalAddressCheckbox') {
      return;
    }

    const fieldPath = getFieldPath(name);

    if (Array.isArray(fieldPath)) {
      dispatch(updateManagedBopThirdPartyObject({ path: fieldPath, value }));
    } else {
      dispatch(updateManagedBopThirdParty({ field: fieldPath as string, value }));
    }
  }, [dispatch]);

  const detailsDefaultValues = useMemo(() => {
    if (!managedBopThirdParty || Object.keys(managedBopThirdParty).length === 0) {
      return {};
    }
    return {
      ...buildDefaultValues(managedBopThirdParty, isEntity, isCompany, managedBopThirdParty.hasPostalAddress || false),
      postalAddressCheckbox: false,
    };
  }, [managedBopThirdParty, isEntity, isCompany]);

  const methodsDetails = useForm<any>({ 
    mode: 'onTouched', 
    values: detailsDefaultValues,
    shouldUnregister: false 
  });
  const methodsAddress = useForm<any>({ 
    mode: 'onTouched', 
    values: detailsDefaultValues,
    shouldUnregister: false 
  });
  const methodsPhoneEmail = useForm<any>({ 
    mode: 'onTouched', 
    values: detailsDefaultValues,
    shouldUnregister: false 
  });

  useEffect(() => {
    hasHydratedFormsRef.current = false;
    initialBopThirdPartyRef.current = null;
    hasLoadedDataRef.current = false;
    isInitialPostalSyncRef.current = true;
    setHasUnsavedChanges(false);
  }, [thirdPartyId]);

  useEffect(() => {
    if (hasHydratedFormsRef.current) return;

    if (managedBopThirdParty && Object.keys(managedBopThirdParty).length > 0) {
      initialBopThirdPartyRef.current = JSON.parse(JSON.stringify(managedBopThirdParty));
      hasHydratedFormsRef.current = true;
    }
  }, [managedBopThirdParty]);

  useEffect(() => {
    if (methodsDetails.formState.isDirty || methodsAddress.formState.isDirty || methodsPhoneEmail.formState.isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [methodsDetails.formState.isDirty, methodsAddress.formState.isDirty, methodsPhoneEmail.formState.isDirty]);

  // Check for validation errors
  const hasValidationErrors = 
    Object.keys(methodsDetails.formState.errors).length > 0 || 
    Object.keys(methodsAddress.formState.errors).length > 0 || 
    Object.keys(methodsPhoneEmail.formState.errors).length > 0;

  const sameAsPhysicalAddressChecked = useWatch({
    control: methodsAddress.control as any,
    name: 'postalAddressCheckbox' as any,
  }) as any;

  const [addressLine1, addressLine2, postCode, suburb, townName, region, countryCode] = useWatch({
    control: methodsAddress.control as any,
    name: ['addressLine1', 'addressLine2', 'postCode', 'suburb', 'townName', 'region', 'countryCode'] as any,
  }) as any[];

  const prevCheckboxRef = useRef(sameAsPhysicalAddressChecked);
  const prevPhysicalAddressRef = useRef<any[]>([]);

  useEffect(() => {
    const checked = Boolean(sameAsPhysicalAddressChecked);
    if (!hasHydratedFormsRef.current) return; // Skip until forms are hydrated

    const physicalAddressValues = [addressLine1, addressLine2, postCode, suburb, townName, region, countryCode];
    const setValueOpts = { shouldDirty: true, shouldTouch: false, shouldValidate: false };

    const checkboxChanged = prevCheckboxRef.current !== checked;
    const physicalAddressChanged = JSON.stringify(prevPhysicalAddressRef.current) !== JSON.stringify(physicalAddressValues);

    if (isInitialPostalSyncRef.current) {
      isInitialPostalSyncRef.current = false;
      prevCheckboxRef.current = checked;
      prevPhysicalAddressRef.current = physicalAddressValues;
      return;
    }

    if (!checkboxChanged && !physicalAddressChanged) return;

    prevCheckboxRef.current = checked;
    prevPhysicalAddressRef.current = physicalAddressValues;

    if (!checked) {
      POSTAL_FIELD_NAMES.forEach(fieldName => {
        methodsAddress.setValue(fieldName as any, '', setValueOpts);
        handleChange(fieldName, '');
      });
      return;
    }

    POSTAL_FIELD_NAMES.forEach((fieldName, index) => {
      const nextValue = physicalAddressValues[index] ?? '';
      methodsAddress.setValue(fieldName as any, nextValue, setValueOpts);
      handleChange(fieldName, nextValue);
    });

    methodsAddress.clearErrors(POSTAL_FIELD_NAMES as any);
  }, [sameAsPhysicalAddressChecked, addressLine1, addressLine2, postCode, suburb, townName, region, countryCode]);

  const handleNext = useCallback(() => {
    if (!thirdPartyId) return;

    router.push(`${bopThirdPartiesUrl.home}/success?action=manage&type=${entityType}` as string);
  }, [router, thirdPartyId, entityType]);

  const handleDelete = useCallback(async () => {
    if (!thirdPartyId) return;

    try {
      await deleteBopThirdPartyRequest(thirdPartyId);
      console.log('BOP third party deleted successfully');
      setDeleteDialogOpen(false);
      router.push('/setup-and-admin/bop-third-parties/');
    } catch (error) {
      console.error('Failed to delete BOP third party:', error);
    } finally {
      setDeleteDialogOpen(false);
      router.push('/setup-and-admin/bop-third-parties/');
    }
  }, [router, thirdPartyId, deleteBopThirdPartyRequest]);

  const postalAddressFieldsWithCheckbox = useMemo(() => {
    const checkboxField = {
      name: 'postalAddressCheckbox',
      label: t('sameAsPhysicalAddressLabel'),
      type: 'checkbox',
      value: Boolean(sameAsPhysicalAddressChecked),
      fullWidth: true,
      rightBlank: false,
    } as any;

    const fields = buildPostalAddressFieldsBopThirdParty(managedBopThirdParty).map((f) => ({
      ...f,
      disabled: Boolean(sameAsPhysicalAddressChecked),
    }));

    return [checkboxField, ...fields];
  }, [managedBopThirdParty, t, sameAsPhysicalAddressChecked]);

  const sections = useMemo(() => { 
    const entity = isEntity;
    const pickByEntity = <T,>(forEntity: T, forIndividual: T) =>
      entity ? forEntity : forIndividual;

    return {
      details: {
        title: pickByEntity(t('entityDetailsTitle'), t('personalDetailsTitle')),
        titleIcon: IcnNametag as any,
        fields: pickByEntity(
          buildEntityDetailsFields(managedBopThirdParty, isCompany),
          buildPersonalFieldsBopThirdParty(managedBopThirdParty),
        ),
      },
      address: {
        sectionsInSingleCard: true,
        sections: [
          {
            title: t('addressDetailsTitle'),
            titleIcon: IcnLocationOutline as any,
            fields: [],
            ShowActionBtns: true,
          },
          {
            title: t('physicalAddressTitle'),
            titleIcon: IcnMail as any,
            hideIconWhenNotEditing: true,
            fields: buildAddressFieldsBopThirdParty(managedBopThirdParty),
            ShowActionBtns: false,
          },
          {
            title: t('postalAddressTitle'),
            titleIcon: IcnMail as any,
            hideIconWhenNotEditing: true,
            fields: postalAddressFieldsWithCheckbox,
            ShowActionBtns: false,
          },
        ],
      },
      phoneEmail: {
        title: t('phoneEmailDetailsTitle'),
        titleIcon: IcnBroadcast as any,
        fields: pickByEntity(
          buildEntityPhoneEmailFields(managedBopThirdParty),
          buildPhoneEmailFieldsBopThirdParty(managedBopThirdParty)
        ),
      },
    };
  }, [isEntity, isCompany, managedBopThirdParty, t, postalAddressFieldsWithCheckbox]);

  const headingText = useMemo(() => {
    if (isEntity) {
      return isCompany ? t('manageCompanyHeading') : t('manageEntityHeading');
    }
    return t('manageIndividualHeading');
  }, [isEntity, isCompany, t]);

  const createSubmitHandler = useCallback((formMethods: any) => {
    return (data: any) => {
      setTimeout(() => {
        const updatedValues = formMethods.getValues();
        formMethods.reset(updatedValues);
      }, 0);
      return true;
    };
  }, []);

  const handleValidationFail = useCallback((errors: any) => {
    console.error('Validation errors:', errors);
  }, []);

  const rulesProvider = useCallback((name: string, getVals: () => any) => 
    getRulesForField(name as any, getVals, isEntity),
    [isEntity]
  );

  const commonFormProps = useMemo(() => ({
    onChange: handleChange,
    mode: 'review' as const,
    ShowActionBtns: true,
    renderWithRHF: true,
    rulesProvider,
    onValidationFail: handleValidationFail,
    syncOnChange: true,
    validationContext: 'bopThirdParties' as const,
    isEntity,
  }), [handleChange, rulesProvider, isEntity, handleValidationFail]);

  return (
    <Box className={styles['bop-thirdparties-manage-container']}>
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          data-testid={buildTestId(testIdPrefix, 'breadcrumb')}
          links={getBreadcrumbLinks('manage', t, {
            id: thirdPartyId || '',
            type: entityType,
            postal: hasPostalAddress,
          })}
        />
        <Heading as="h4" fontSize="28px" className={styles['bop-thirdparties-heading']}>
          {headingText}
        </Heading>

        <Box sx={{ mt: 3 }}>
          <CreateJournyForm
            {...commonFormProps}
            title={sections.details.title}
            titleIcon={getDetailsIcon(isEntity) as any}
            fields={sections.details.fields}
            formMethods={methodsDetails}
            onSubmit={createSubmitHandler(methodsDetails)}
          />
          <Box sx={{ mt: 2 }}>
            <CreateJournyForm
              {...commonFormProps}
              sectionsInSingleCard
              sections={sections.address.sections}
              formMethods={methodsAddress}
              onSubmit={createSubmitHandler(methodsAddress)}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <CreateJournyForm
              {...commonFormProps}
              title={sections.phoneEmail.title}
              titleIcon={IcnBroadcast as any}
              fields={sections.phoneEmail.fields}
              formMethods={methodsPhoneEmail}
              onSubmit={createSubmitHandler(methodsPhoneEmail)}
            />
          </Box>
          
          <FormActionButtons
            testIdPrefix={buildTestId(testIdPrefix, 'form-actions')}
            cancelText={t('cancelButton')}
            showCancel={hasUnsavedChanges}
            onCancel={() => router.push(bopThirdPartiesUrl.home as string)}
            onNext={() => {
              if (hasUnsavedChanges) {
                handleNext();
              } else {
                setDeleteDialogOpen(true);
              }
            }}
            nextText={hasUnsavedChanges ? t('submitChangesButton') : t('deleteDialogTitle')}
            nextButtonVariant={hasUnsavedChanges ? "primary" : "tertiary"}
            useDeleteIcon={!hasUnsavedChanges}
            disabled={hasValidationErrors && hasUnsavedChanges}
          />
        </Box>
      </Box>

      <Dialog
        data-testid={buildTestId(testIdPrefix, 'delete-dialog')}
        name="delete-third-party-dialog"
        title={t('deleteDialogTitle')}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        content={
          <Box className={styles['bop-thirdparties-dialog-box']}>
            <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
            <Box sx={{ fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>
              {t('deleteConfirmMessage')}
            </Box>
          </Box>
        }
        secondaryCTALabel={t('yesDeleteButton')}
        tertiaryCTALabel={t('cancelButton')}
        onSecondaryCTA={handleDelete}
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

export default BopThirdPartyManagePage;