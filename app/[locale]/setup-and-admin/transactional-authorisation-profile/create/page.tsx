'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Grid } from '@mui/material';
import { Breadcrumb, Heading, Button, Amount, TextField } from 'dist/standard-bank-react';
import { CreateJournyForm } from 'components/common';
import FormActionButtons from 'components/common/formActionButtons';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import AuthorizationRuleCreateLogic from 'src/utils/AuthorizationRuleCreateLogic';
import AuthorizationRuleAccordion from '@molecules/AuthorizationRuleAccordion';
import AuthorizationRuleFormAccordion, { AuthorizationRuleFormAccordionHandle } from '@molecules/AuthorizationRuleFormAccordion';
import IcnPeopleNameTag from 'public/icons/icn_people_1_nametag.svg';
import AddIcon from 'public/icons/icn_add.svg';
import EditIcon from 'public/icons/col-icon-left-pencil.svg';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import ListIcon from 'public/icons/col-icon-list.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { RootState, AppDispatch } from 'store';
import { resetProfile, updateProfile } from '@store/slices/createTransactionalAuthorisationProfileSlice';
import {
  updateAuthRuleName,
  updateAuthRuleDescription,
  removeRule,
  saveCurrentRule,
  resetAuthRule,
} from 'store/slices/createAuthRuleSlice';
import { buildProfileDetailsFields } from 'src/utils/TransactionalAuthProfileField';
import { getRulesForField } from 'src/utils/TransactionalAuthProfileCreateLogic';

export default function CreateTransactionalAuthorisationProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(
    (state) => state.createTransactionalAuthorisationProfile?.profile,
  );
  const { authRuleName, authRuleDescription, savedRules, currentRule } = useAppSelector(
    (state) => state.createAuthRule,
  );

  const currentRuleNumber = savedRules.length + 1;

  const [mode, setMode] = useState<'edit' | 'review'>('edit');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCurrentRule, setShowCurrentRule] = useState(savedRules.length === 0);
  const [removalErrors, setRemovalErrors] = useState<Record<number, string>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const accordionRef = useRef<AuthorizationRuleFormAccordionHandle>(null);

  const handleChange = (field: string, value: any) => {
    dispatch(updateProfile({ field, value }));
  };

  const formMethods = useForm({
    mode: 'onTouched',
    values: {
      profileName: profile?.profileName || '',
      description: profile?.description || '',
      currency: profile?.currency || 'ZAR',
      allowOwnAuthorisation: profile?.allowOwnAuthorisation || false,
    },
  });

  const resetCreateFormState = useCallback(() => {
    dispatch(resetProfile());
    dispatch(resetAuthRule());
    formMethods.reset({
      profileName: '',
      description: '',
      currency: 'ZAR',
      allowOwnAuthorisation: false,
    });
    setMode('edit');
    setShowSuccess(false);
    setShowCurrentRule(true);
    setRemovalErrors({});
  }, [dispatch, formMethods]);

  // Always open the transactional authorisation profile create journey with clean state.
  useEffect(() => {
    resetCreateFormState();
  }, [resetCreateFormState]);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    router.push('/setup-and-admin/transactional-authorisation-profile?cancelled=true' as any);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleSubmit = async () => {
    let allValid = true;
    let accordionSaved = false;

    // Validate profile fields
    await formMethods.handleSubmit(
      async () => {
        // Form is valid
      },
      async (errors) => {
        // Form has errors
        allValid = false;
      },
    )();

    // If accordion is open, validate it
    if (showCurrentRule && accordionRef.current) {
      const accordionValid = accordionRef.current.validateAllConditions();
      if (!accordionValid) {
        allValid = false;
      } else {
        // Accordion is valid, save the rule automatically
        accordionSaved = true;
      }
    }

    // Check if we have saved rules or just saved one
    const hasSavedRules = savedRules && savedRules.length > 0;

    if (!hasSavedRules && !accordionSaved) {
      allValid = false;
    }

    if (allValid) {
      // Save and switch to review mode
      if (accordionSaved) {
        dispatch(saveCurrentRule());
      }
      setMode('review');
      setShowCurrentRule(false);
    }
  };

  const handleFinalSubmit = () => {
    // Final submission after review
    setShowSuccess(true);
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleSaveSuccess = () => {
    setShowCurrentRule(false);
    setRemovalErrors({});
  };

  const handleAddRule = () => {
    setShowCurrentRule(true);
    setRemovalErrors({});
  };

  const { errors } = formMethods.formState;

  useEffect(() => {
  }, [errors]);

  const profileFields = buildProfileDetailsFields(profile);

  return (
    <Box sx={{ p: 2 }}>
      {showSuccess ? (
        <Box>
          <Box sx={{ mb: 2 }}>
            <Breadcrumb
              links={[
                { href: '/', label: 'Dashboard' },
                { href: '/setup-and-admin/transactional-authorisation-profile', label: 'Transactional authorisation profile' },
                {
                  href: '/setup-and-admin/transactional-authorisation-profile/create',
                  label: 'Create an authorisation profile',
                },
              ]}
            />
          </Box>
          <Heading as="h4" fontSize="28px" style={{ marginBottom: '24px' }}>
            Create an authorisation profile
          </Heading>
          <SuccessMessage
            title="Success"
            message="Authorisation profile successfully created and submitted for approval."
            subtext="Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo."
            tertiaryCTALabel="GO TO TRANSACTIONAL AUTHORISATION PROFILE HUB"
            onTertiaryCTA={() => router.push('/setup-and-admin/transactional-authorisation-profile' as any)}
            tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
            tertiaryCTAStyle={{
              height: '48px',
              whiteSpace: 'nowrap',
            }}
            primaryCTALabel="CREATE ANOTHER AUTHORISATION PROFILE"
            onPrimaryCTA={() => {
              resetCreateFormState();
            }}
            primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
            primaryCTAStyle={{
              height: '48px',
              whiteSpace: 'nowrap',
            }}
          />
        </Box>
      ) : (
        <Grid container spacing={0}>
          <Grid size={12} sx={{ mb: '32px' }}>
            <Breadcrumb
              links={[
                { href: '/', label: 'Dashboard' },
                { href: '/setup-and-admin/transactional-authorisation-profile', label: 'Transactional authorisation profile' },
                {
                  href: '/setup-and-admin/transactional-authorisation-profile/create',
                  label: 'Create an authorisation profile',
                },
              ]}
            />
          </Grid>
          <Grid size={12} sx={{ mb: '44px' }}>
            <Heading as="h4" fontSize="28px">
              Create an authorisation profile
            </Heading>
          </Grid>
          <Grid size={12} sx={{ mb: '16px' }}>
            <CreateJournyForm
              sections={[
                {
                  titleIcon: IcnPeopleNameTag as any,
                  title: 'Authorisation profile details',
                  fields: profileFields,
                  ShowActionBtns: mode === 'review',
                },
              ]}
              onChange={handleChange}
              mode={mode}
              ShowActionBtns={mode === 'review'}
              renderWithRHF
              formMethods={formMethods}
              syncOnChange={true}
              rulesProvider={(name) => getRulesForField(name as any)}
              onSubmit={(data: any) => {
                Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              }}
              onValidationFail={() => {}}
              validationContext="transactionalAuthProfile"
            />
          </Grid>
          {(savedRules || []).map((rule, index) => (
            <Grid size={12} key={index} sx={{ mb: '16px' }}>
              <AuthorizationRuleAccordion
                title={`Authorisation rule ${index + 1}`}
                operations={[]}
                showSaveButton={false}
                showRemoveButton={mode === 'review'}
                onRemove={() => {
                  if (savedRules.length === 1 && !showCurrentRule) {
                    setRemovalErrors({ [index]: 'ERROR: ONE AUTHORISATION RULE IS NEEDED PER PROFILE' });
                    return;
                  }
                  setRemovalErrors({});
                  dispatch(removeRule(index));
                }}
                hasValidationError={!!removalErrors[index]}
                errorMessage={removalErrors[index]}
                defaultExpanded={mode === 'edit'}
              >
                <Box
                  sx={{
                    p: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      height: '48px',
                    },
                    '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: '14px',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      top: '0px',
                      left: '0px',
                    },
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Amount
                        value={rule.conditions?.[0]?.amount || ''}
                        currency={rule.conditions?.[0]?.currency || 'USD'}
                        currencyOptions={[
                          { label: 'USD - US Dollar', value: 'USD' },
                          { label: 'EUR - Euro', value: 'EUR' },
                          { label: 'GBP - British Pounds', value: 'GBP' },
                        ]}
                        handleChangeCurrency={() => {}}
                        handleChangeValue={() => {}}
                        label="Transaction limit"
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': { height: '48px' },
                        }}
                        error={false}
                        helperText=""
                        disabled
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        type="text"
                        name={`authRuleConstruct-${index}`}
                        label="Authorisation rule construct"
                        value={rule.authRuleConstruct || ''}
                        onChange={() => {}}
                        error={false}
                        helperText=""
                        disabled
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': { height: '48px' },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </AuthorizationRuleAccordion>
            </Grid>
          ))}
          {showCurrentRule && mode === 'edit' && (
            <Grid size={12} sx={{ mb: '16px' }}>
              <AuthorizationRuleFormAccordion
                ref={accordionRef}
                ruleNumber={currentRuleNumber || 1}
                onSaveSuccess={handleSaveSuccess}
              />
            </Grid>
          )}
          {mode === 'edit' && (
            <Grid size={12} sx={{ mb: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                buttonVariant="tertiary"
                startIcon={<Image src={AddIcon} alt="Add" width={20} height={20} />}
                style={{ height: '48px' }}
                onClick={handleAddRule}
              >
                ADD A RULE
              </Button>
            </Grid>
          )}
          <Grid size={12}>
            <FormActionButtons
              onCancel={handleCancel}
              onNext={mode === 'edit' ? handleSubmit : handleFinalSubmit}
              cancelText="CANCEL"
              nextText={mode === 'edit' ? 'REVIEW AND SUBMIT' : 'SUBMIT PROFILE FOR APPROVAL'}
              nextButtonVariant="primary"
            />
          </Grid>
        </Grid>
      )}

      <CancellationConfirmationDialog
        open={showCancelModal}
        onClose={handleCloseCancelModal}
        onCancel={handleConfirmCancel}
        onDismiss={handleCloseCancelModal}
        title="Cancellation confirmation"
        heading="Are you sure you want to cancel?"
        subheading="Any unsaved data will be lost."
        dismissLabel="DISMISS"
        cancelLabel="YES, CANCEL"
      />
    </Box>
  );
}
