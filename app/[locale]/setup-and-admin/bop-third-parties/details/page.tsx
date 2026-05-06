'use client';

import { Box, Paper, Stepper, Step, StepLabel, StepContent, Typography } from '@mui/material';
import { Breadcrumb, Heading, Dialog } from 'dist/standard-bank-react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import Image from 'next/image';
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
import CreateJournyForm from 'components/common/CreateJournyForm';
import { FormActionButtons } from 'components/common/formActionButtons';
import { AvatarAlert, IcnAccountTile, IcnBroadcast, IcnLocationOutline, IcnNametag, IcnMail, ResidentCompanyIcon } from '@lib/icons';
import { RootState } from '@store/index';
import { updateBopThirdParty, updateBopThirdPartyObject } from '@store/slices/bopThirdPartySlice';
import { useBopThirdParty } from '@lib/hooks/useBopThirdParty';
import { useTranslations } from 'next-intl';
import { bopThirdPartiesUrl, getFieldPath, getBreadcrumbLinks, buildDefaultValues } from '../bopThirdPartyHelper';

const getDetailsIcon = (isEntity: boolean) => isEntity ? ResidentCompanyIcon : IcnNametag;
const getReviewDetailsIcon = (isEntity: boolean) => isEntity ? ResidentCompanyIcon : IcnAccountTile;

const POSTAL_FIELD_NAMES = [
  'postalAddressLine1',
  'postalAddressLine2',
  'postalPostCode',
  'postalSuburb',
  'postalTownName',
  'postalRegion',
  'postalCountryCode',
] as const;

function BopThirdPartyDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get('type') || 'individual';
  const dispatch = useAppDispatch();
  const t = useTranslations('bopThirdParties');
  const testIdPrefix = 'bop-third-parties-details';

  const [currentStep, setCurrentStep] = useState(0);
  const [lastHighestProgressIndex, setLastHighestProgressIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPostalSameAsPhysical, setIsPostalSameAsPhysical] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const entityType = (typeParam as 'individual' | 'entity' | 'company') || 'individual';
  const isCompany = entityType === 'company';
  const isEntity = entityType === 'entity' || entityType === 'company';


  const bopThirdParty = useAppSelector((state) => state.bopThirdParty.bopThirdParty);
  const { createBopThirdPartyRequest, isLoading, error } = useBopThirdParty();


  useMemo(() => {
    dispatch(updateBopThirdParty({ field: 'entityType', value: entityType }));
  }, [entityType, dispatch]);

  const detailsDefaultValues = useMemo(() => ({
    ...buildDefaultValues(bopThirdParty, isEntity, isCompany, true),
    postalAddressCheckbox: false,
  } as const), [bopThirdParty, isEntity, isCompany]);

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues, shouldUnregister: false });
  const methodsReviewDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues, shouldUnregister: false });
  const methodsReviewAddress = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues, shouldUnregister: false });
  const methodsReviewPhoneEmail = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues, shouldUnregister: false });

  const sameAsPhysicalAddress = useWatch({ control: methodsDetails.control, name: 'postalAddressCheckbox' });
  const [addressLine1, addressLine2, postCode, suburb, townName, region, countryCode] = useWatch({
    control: methodsDetails.control,
    name: ['addressLine1', 'addressLine2', 'postCode', 'suburb', 'townName', 'region', 'countryCode'],
  }) as any[];

  useEffect(() => {
    const checked = Boolean(sameAsPhysicalAddress);
    setIsPostalSameAsPhysical(checked);

    const physicalAddressValues = [addressLine1, addressLine2, postCode, suburb, townName, region, countryCode];
    const setValueOpts = { shouldDirty: true, shouldTouch: false, shouldValidate: false };

    if (!checked) {
      POSTAL_FIELD_NAMES.forEach(fieldName => {
        methodsDetails.resetField(fieldName, { defaultValue: '' });
      });
      return;
    }

    POSTAL_FIELD_NAMES.forEach((fieldName, index) => {
      methodsDetails.setValue(fieldName, physicalAddressValues[index] ?? '', setValueOpts);
    });

    methodsDetails.clearErrors(POSTAL_FIELD_NAMES as any);
  }, [sameAsPhysicalAddress, addressLine1, addressLine2, postCode, suburb, townName, region, countryCode, methodsDetails]);

  const handleChange = useCallback((name: string, value: any) => {
    setHasUnsavedChanges(true);

    const fieldPath = getFieldPath(name);

    if (Array.isArray(fieldPath)) {
      dispatch(updateBopThirdPartyObject({ path: fieldPath, value }));
    } else {
      dispatch(updateBopThirdParty({ field: fieldPath as string, value }));
    }
  }, [dispatch]);


  useEffect(() => {
    if (currentStep === 3) {
      const currentValues = methodsDetails.getValues();
      methodsReviewDetails.reset(currentValues);
      methodsReviewAddress.reset(currentValues);
      methodsReviewPhoneEmail.reset(currentValues);
    }
  }, [currentStep]);

  const createReviewSubmitHandler = useCallback((formMethods: any) => {
    return (data: any) => {
      Object.entries(data || {}).forEach(([name, value]) => {
        handleChange(name, value);
        methodsDetails.setValue(name as any, value, { shouldValidate: false, shouldDirty: false });
      });
      setTimeout(() => {
        const updatedValues = formMethods.getValues();
        formMethods.reset(updatedValues);
      }, 0);
      return true;
    };
  }, [handleChange, methodsDetails]);

  const handleCancel = useCallback(() => {
    setCancelDialogOpen(true);
  }, []);

  const getFieldsForStep = useCallback((stepIndex: number): string[] => {
    switch (stepIndex) {
      case 0: 
        return isEntity
          ? ['entityName', 'taxpayerReference', 'idNumber', 'idType']
          : ['firstName', 'lastName', 'dateOfBirth', 'gender', 'taxpayerReference', 'idNumber', 'idType'];
      case 1: 
        const addressFields = [
          'addressLine1', 'postCode', 'suburb', 'townName', 'region', 'countryCode'
        ];
        // Only validate postal fields if user manually enters them (not same as physical)
        if (!isPostalSameAsPhysical) {
          return [
            ...addressFields,
            'postalAddressLine1', 'postalPostCode', 'postalSuburb', 
            'postalTownName', 'postalRegion', 'postalCountryCode'
          ];
        }
        return addressFields;
      case 2: 
        return [
          'contactFirstName',
          'contactLastName',
          'telephoneNumber',
          'mobileNumber',
          'faxNumber'
        ];
      default:
        return [];
    }
  }, [isEntity, isPostalSameAsPhysical]);

  const handleNext = useCallback(async () => {
    console.log('Attempting to go to next step. Current step:', currentStep);
    const fieldsToValidate = getFieldsForStep(currentStep);

    if (fieldsToValidate.length > 0) {
      fieldsToValidate.forEach(field => {
        methodsDetails.setFocus(field as any, { shouldSelect: false });
      });

      const isValid = await methodsDetails.trigger(fieldsToValidate as any);

      if (!isValid) {
        console.error('Validation failed for step:', currentStep, 'Fields:', fieldsToValidate);
        const errors = methodsDetails.formState.errors;
        console.error('Validation errors:', errors);
        fieldsToValidate.forEach(field => {
          const currentValue = methodsDetails.getValues(field as any);
          methodsDetails.setValue(field as any, currentValue, { 
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true 
          });
        });
        
        return; 
      }
    }

    const nextStep = currentStep + 1;
    const totalSteps = 4;

    setLastHighestProgressIndex((prev) => Math.max(prev, nextStep));
    if (nextStep >= totalSteps) {
      const allValid = await methodsDetails.trigger();
      if (!allValid) {
        console.error('Final validation failed');
        const errors = methodsDetails.formState.errors;
        console.error('All validation errors:', errors);
        setErrorDialogMessage(t('validationErrorMessage'));
        setErrorDialogOpen(true);
        return;
      }

      setHasUnsavedChanges(false);
      router.push(`${bopThirdPartiesUrl.home}/success?action=create&type=${entityType}` as any);
    } else {
      setCurrentStep(nextStep);
    }
  }, [currentStep, getFieldsForStep, methodsDetails, t, router]);
  const onSelectStep = useCallback(
    (stepIndex: number) => {
      console.log('Attempting to select step:', stepIndex);
      if (stepIndex <= lastHighestProgressIndex) {
        setCurrentStep(stepIndex);
      }
    },
    [lastHighestProgressIndex, entityType],
  );

  const postalAddressFieldsWithCheckbox = useMemo(() => {
    const checkboxField = {
      name: 'postalAddressCheckbox',
      label: t('sameAsPhysicalAddressLabel'),
      type: 'checkbox',
      value: Boolean(sameAsPhysicalAddress),
      fullWidth: true,
      rightBlank: false,
    } as any;

    const fields = buildPostalAddressFieldsBopThirdParty(bopThirdParty).map((f) => ({
      ...f,
      disabled: Boolean(sameAsPhysicalAddress),
    }));

    return [checkboxField, ...fields];
  }, [bopThirdParty, t, sameAsPhysicalAddress]);

  const headingText = useMemo(() => {
    if (isEntity) {
      return isCompany ? t('createCompanyHeading') : t('createEntityHeading');
    }
    return t('createIndividualHeading');
  }, [isEntity, isCompany, t]);

  const steps = useMemo(() => [
    {
      label: isEntity ? t('entityDetailsTitle') : t('personalDetailsTitle'),
      description: t('stepDescription'),
    },
    {
      label: t('addressDetailsTitle'),
      description: t('stepDescription'),
    },
    {
      label: t('communicationInfoStepLabel'),
      description: t('stepDescription'),
    },
    {
      label: t('reviewSubmitStepLabel'),
      description: t('stepDescription'),
    },
  ], [isEntity, t]);

  const renderStepContent = useCallback(
    (stepIndex: number) => {
      const stepCount = steps.length;
      if (stepIndex === 0) {
        return (
          <Box sx={{ pt: 3, pb: 2 }}>
            <CreateJournyForm
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsDetails}
              rulesProvider={(name: string, getVals: () => any) =>
                getRulesForField(name as any, getVals, isEntity)
              }
              syncOnChange={false}
              validationContext="bopThirdParties"
              isEntity={isEntity}
              sections={[
                {
                  title: isEntity ? t('entityDetailsTitle') : t('personalDetailsTitle'),
                  titleIcon: getDetailsIcon(isEntity) as any,
                  fields: isEntity
                    ? buildEntityDetailsFields(bopThirdParty, isCompany)
                    : buildPersonalFieldsBopThirdParty(bopThirdParty),
                  ShowActionBtns: false,
                },
              ]}
            />
            <FormActionButtons
              testIdPrefix={buildTestId(testIdPrefix, 'form-actions-step-0')}
              onCancel={handleCancel}
              onNext={handleNext}
              nextText={t('nextButton')}
            />
          </Box>
        );
      }

      if (stepIndex === 1) {
        return (
          <Box sx={{ pt: 3, pb: 2 }}>
            <CreateJournyForm
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsDetails}
              rulesProvider={(name: string, getVals: () => any) =>
                getRulesForField(name as any, getVals, isEntity)
              }
              syncOnChange={false}
              validationContext="bopThirdParties"
              isEntity={isEntity}
              sectionsInSingleCard
              sections={[
                {
                  title: t('addressDetailsTitle'),
                  titleIcon: IcnLocationOutline as any,
                  fields: [],
                  ShowActionBtns: false,
                },
                {
                  title: t('physicalAddressTitle'),
                  titleIcon: IcnMail as any,
                  fields: buildAddressFieldsBopThirdParty(bopThirdParty),
                  ShowActionBtns: false,
                },
                {
                  title: t('postalAddressTitle'),
                  titleIcon: IcnMail as any,
                  fields: postalAddressFieldsWithCheckbox,
                  ShowActionBtns: false,
                },
              ]}
            />
            <FormActionButtons
              testIdPrefix={buildTestId(testIdPrefix, 'form-actions-step-1')}
              onCancel={handleCancel}
              onNext={handleNext}
              nextText={t('nextButton')}
            />
          </Box>
        );
      }

      if (stepIndex === 2) {
        return (
          <Box sx={{ pt: 3, pb: 2 }}>
            <CreateJournyForm
              onChange={handleChange}
              mode="edit"
              ShowActionBtns={false}
              renderWithRHF
              formMethods={methodsDetails}
              rulesProvider={(name: string, getVals: () => any) =>
                getRulesForField(name as any, getVals, isEntity)
              }
              syncOnChange={false}
              validationContext="bopThirdParties"
              isEntity={isEntity}
              sections={[
                {
                  title: t('phoneEmailDetailsTitle'),
                  titleIcon: IcnBroadcast as any,
                  fields: isEntity
                    ? buildEntityPhoneEmailFields(bopThirdParty)
                    : buildPhoneEmailFieldsBopThirdParty(bopThirdParty),
                  ShowActionBtns: false,
                },
              ]}
            />
            <FormActionButtons
              testIdPrefix={buildTestId(testIdPrefix, 'form-actions-step-2')}
              onCancel={handleCancel}
              onNext={handleNext}
              nextText={t('reviewSubmitStepLabel')}
            />
          </Box>
        );
      }

      if (stepIndex === 3) {
        // Get current form values for display
        const formValues = methodsDetails.getValues();

        // Build a display object from form values
        const displayData = {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          dateOfBirth: formValues.dateOfBirth,
          gender: formValues.gender,
          taxpayerReference: formValues.taxpayerReference,
          vatReference: formValues.vatReference,
          customsClientNo: formValues.customsClientNo,
          idNumber: formValues.idNumber,
          idType: formValues.idType,
          entityName: formValues.entityName,
          companyCategory: formValues.companyCategory,
          address: {
            addressLine1: formValues.addressLine1,
            addressLine2: formValues.addressLine2,
            postCode: (formValues as any).postCode,
            suburb: (formValues as any).suburb,
            townName: formValues.townName,
            region: formValues.region,
            countryCode: formValues.countryCode,
          },
          postalAddress: {
            addressLine1: formValues.postalAddressLine1,
            addressLine2: formValues.postalAddressLine2,
            postCode: (formValues as any).postalPostCode,
            suburb: (formValues as any).postalSuburb,
            townName: formValues.postalTownName,
            region: formValues.postalRegion,
            countryCode: formValues.postalCountryCode,
          },
          contact: {
            contactFirstName: (formValues as any).contactFirstName,
            contactLastName: (formValues as any).contactLastName,
            telephoneNumber: (formValues as any).telephoneNumber,
            mobileNumber: (formValues as any).mobileNumber,
            faxNumber: (formValues as any).faxNumber,
            email: formValues.email,
            contactName: formValues.contactName,
            jobTitle: formValues.jobTitle,
            mobilePhoneNumber: formValues.mobilePhoneNumber,
            workPhoneNumber: formValues.workPhoneNumber,
          },
          phone: {
            firstName: (formValues as any).phoneFirstName,
            lastName: (formValues as any).phoneLastName,
            mobilePhoneNumber: formValues.mobilePhoneNumber,
            alternatePhoneNumber: (formValues as any).alternatePhoneNumber,
          },
        };

        return (
          <Box sx={{ pt: 3, pb: 2 }}>
            <CreateJournyForm
              onChange={handleChange}
              mode="review"
              ShowActionBtns={true}
              renderWithRHF
              formMethods={methodsReviewDetails}
              title={isEntity ? t('entityDetailsTitle') : t('personalDetailsTitle')}
              titleIcon={getReviewDetailsIcon(isEntity) as any}
              fields={isEntity
                ? buildEntityDetailsFields(displayData, isCompany)
                : buildPersonalFieldsBopThirdParty(displayData)}
              rulesProvider={(name: string, getVals: () => any) =>
                getRulesForField(name as any, getVals, isEntity)
              }
              onSubmit={createReviewSubmitHandler(methodsReviewDetails)}
              onValidationFail={() => {}}
              syncOnChange={false}
              validationContext="bopThirdParties"
              isEntity={isEntity}
            />
            <Box sx={{ mt: 2 }}>
              <CreateJournyForm
                onChange={handleChange}
                mode="review"
                ShowActionBtns={false}
                renderWithRHF
                formMethods={methodsReviewAddress}
                sectionsInSingleCard
                sections={[
                  {
                    title: t('addressDetailsTitle'),
                    titleIcon: IcnLocationOutline as any,
                    fields: [],
                    ShowActionBtns: true,
                  },
                  {
                    title: t('physicalAddressTitle'),
                    titleIcon: undefined,
                    fields: buildAddressFieldsBopThirdParty(displayData),
                    ShowActionBtns: false,
                  },
                  {
                    title: t('postalAddressTitle'),
                    titleIcon: undefined,
                    fields: buildPostalAddressFieldsBopThirdParty(displayData),
                    ShowActionBtns: false,
                  },
                ]}
                rulesProvider={(name: string, getVals: () => any) =>
                  getRulesForField(name as any, getVals, isEntity)
                }
                onSubmit={createReviewSubmitHandler(methodsReviewAddress)}
                onValidationFail={() => {}}
                syncOnChange={false}
                validationContext="bopThirdParties"
                isEntity={isEntity}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <CreateJournyForm
                onChange={handleChange}
                mode="review"
                ShowActionBtns={true}
                renderWithRHF
                formMethods={methodsReviewPhoneEmail}
                title={t('phoneEmailDetailsTitle')}
                titleIcon={IcnBroadcast as any}
                fields={isEntity
                  ? buildEntityPhoneEmailFields(displayData)
                  : buildPhoneEmailFieldsBopThirdParty(displayData)}
                rulesProvider={(name: string, getVals: () => any) =>
                  getRulesForField(name as any, getVals, isEntity)
                }
                onSubmit={createReviewSubmitHandler(methodsReviewPhoneEmail)}
                onValidationFail={() => {}}
                syncOnChange={false}
                validationContext="bopThirdParties"
                isEntity={isEntity}
              />
            </Box>

            <FormActionButtons
              testIdPrefix={buildTestId(testIdPrefix, 'form-actions-step-3')}
              onCancel={handleCancel}
              onNext={handleNext}
              nextText={t('submitForApprovalButton')}
            />
          </Box>
        );
      }

      return null;
    },
    [
      steps.length,
      isEntity,
      isCompany,
      postalAddressFieldsWithCheckbox,
      methodsDetails,
      methodsReviewDetails,
      methodsReviewAddress,
      methodsReviewPhoneEmail,
      bopThirdParty,
      handleChange,
      handleCancel,
      handleNext,
      createReviewSubmitHandler,
      t,
    ],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box>
        <Breadcrumb data-testid={buildTestId(testIdPrefix, 'breadcrumb')} links={getBreadcrumbLinks('details', t)} />
        <Heading as="h4" fontSize="28px" style={{ marginBottom: '44px', marginTop: '32px' }}>
          {headingText}
        </Heading>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Paper sx={{ backgroundColor: '#F4F5F7', boxShadow: 'none', padding: '0!important' }}>
          <Stepper data-testid={buildTestId(testIdPrefix, 'stepper')} activeStep={currentStep} orientation="vertical">
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
                <StepContent>{index === currentStep && renderStepContent(currentStep)}</StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>

      <Dialog
        data-testid={buildTestId(testIdPrefix, 'cancel-dialog')}
        name="cancel-creation-dialog"
        title={t('cancelCreationDialogTitle')}
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
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
              {t('cancelCreationMessage')}
            </Box>
          </Box>
        }
        secondaryCTALabel={t('yesCancelButton')}
        tertiaryCTALabel={t('noContinueButton')}
        onSecondaryCTA={() => {
          setCancelDialogOpen(false);
          router.push(bopThirdPartiesUrl.home as any);
        }}
        onTertiaryCTA={() => setCancelDialogOpen(false)}
        maxWidth="560px"
        secondaryCTAWidth="130px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="130px"
        tertiaryCTAHeight="48px"
      />

      <Dialog
        data-testid={buildTestId(testIdPrefix, 'error-dialog')}
        name="validation-error-dialog"
        title={t('somethingWentWrongTitle')}
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
            <Image src={AvatarAlert} alt="Alert" width={48} height={48} />
            <Box
              sx={{
                fontWeight: 700,
                fontSize: '16px',
                textAlign: 'center',
                color: 'tertiary.light',
              }}
            >
              {errorDialogMessage || t('validationErrorMessage')}
            </Box>
          </Box>
        }
        secondaryCTALabel={t('okButton')}
        onSecondaryCTA={() => setErrorDialogOpen(false)}
        tertiaryCTALabel={t('cancelButton')}
        onTertiaryCTA={() => setErrorDialogOpen(false)}
        maxWidth="560px"
        secondaryCTAWidth="125px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />
    </Box>
  );
}

export default BopThirdPartyDetailsPage;
 