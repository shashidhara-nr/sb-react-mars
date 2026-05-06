'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Grid } from '@mui/material';
import { Breadcrumb, Heading, Button, Dialog, Amount, TextField } from 'dist/standard-bank-react';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { RootState, AppDispatch } from '@store/index';
import { updateManagedProfile } from '@store/slices/createTransactionalAuthorisationProfileSlice';
import {
  updateAuthRuleName,
  updateAuthRuleDescription,
  removeRule,
  saveCurrentRule,
} from 'store/slices/createAuthRuleSlice';
import { FormActionButtons } from 'components/common/formActionButtons';
import { CreateJournyForm } from 'components/common';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import AuthorizationRuleCreateLogic, { getRulesForField } from 'src/utils/AuthorizationRuleCreateLogic';
import AuthorizationRuleAccordion from '@molecules/AuthorizationRuleAccordion';
import AuthorizationRuleFormAccordion, { AuthorizationRuleFormAccordionHandle } from '@molecules/AuthorizationRuleFormAccordion';
import IcnPeopleNameTag from 'public/icons/icn_people_1_nametag.svg';
import AddIcon from 'public/icons/icn_add.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import EditIcon from 'public/icons/col-icon-left-pencil.svg';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import ListIcon from 'public/icons/col-icon-list.svg';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import { buildProfileDetailsFields } from 'src/utils/TransactionalAuthProfileField';

function ManagePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const managedProfile = useAppSelector(
    (state) => state.createTransactionalAuthorisationProfile?.managedProfile,
  );
  const { authRuleName, authRuleDescription, savedRules, currentRule } = useAppSelector(
    (state) => state.createAuthRule,
  );
  const viewed: any = managedProfile;
  const currentRuleNumber = savedRules.length + 1;

  const [mode, setMode] = useState<'review' | 'edit'>('review');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCurrentRule, setShowCurrentRule] = useState(savedRules.length === 0);
  const [removalErrors, setRemovalErrors] = useState<Record<number, string>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const accordionRef = useRef<AuthorizationRuleFormAccordionHandle>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Fetch profile by id on mount
    dispatch(
      updateManagedProfile({
        field: 'profileName',
        value: '[Authorisation profile name]',
      }),
    );
    dispatch(
      updateManagedProfile({
        field: 'description',
        value:
          '[Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.]',
      }),
    );
    dispatch(
      updateManagedProfile({
        field: 'currency',
        value: 'ZAR',
      }),
    );
    dispatch(
      updateManagedProfile({
        field: 'allowOwnAuthorisation',
        value: true,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (name: string, value: any) => {
    dispatch(updateManagedProfile({ field: name, value }));
  };

  const formMethods = useForm({
    mode: 'onTouched',
    values: {
      profileName: viewed?.profileName || '',
      description: viewed?.description || '',
      currency: viewed?.currency || 'ZAR',
      allowOwnAuthorisation: viewed?.allowOwnAuthorisation || false,
    },
  });

  // Track if user has made changes by monitoring form dirty state
  useEffect(() => {
    if (formMethods.formState.isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [formMethods.formState.isDirty]);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    router.push('/setup-and-admin/transactional-authorisation-profile' as any);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleFinalSubmit = () => {
    // Final submission after changes
    setShowSuccess(true);
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
      // Save and navigate immediately to prevent visual flash
      if (accordionSaved) {
        dispatch(saveCurrentRule());
      }
      // TODO: Add actual save logic here
      console.log('Saving profile:', viewed);
      setMode('review');
      setHasUnsavedChanges(true);
    }
  };

  const handleDelete = () => {
    console.log('Deleting profile:', viewed);
    setDeleteDialogOpen(false);
    router.push('/setup-and-admin/transactional-authorisation-profile' as any);
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

  const profileFields = buildProfileDetailsFields(managedProfile);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showSuccess ? (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Breadcrumb
              links={[
                { href: '/', label: 'Dashboard' },
                { href: '/setup-and-admin/transactional-authorisation-profile', label: 'Transactional authorisation profile' },
                {
                  href: '/setup-and-admin/transactional-authorisation-profile/manage',
                  label: 'Manage authorisation profile',
                },
              ]}
            />
          </Box>
          <Heading as="h4" fontSize="28px" style={{ marginBottom: '24px' }}>
            Manage {viewed?.profileName || 'authorisation profile'}
          </Heading>
          <SuccessMessage
            title="Success"
            message="Authorisation profile successfully edited and submitted for approval."
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
              setShowSuccess(false);
              setMode('review');
              setHasUnsavedChanges(false);
            }}
            primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
            primaryCTAStyle={{
              height: '48px',
              whiteSpace: 'nowrap',
            }}
          />
        </Box>
      ) : (
        <Box sx={{ p: 2, mb: -2 }}>
          <Breadcrumb
            links={[
              { href: '/', label: 'Dashboard' },
              {
                href: '/setup-and-admin/transactional-authorisation-profile',
                label: 'Transactional Authorisation Profile',
              },
              {
                href: '/setup-and-admin/transactional-authorisation-profile/manage',
                label: 'Manage Profile',
              },
            ]}
          />
          <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
            Manage {viewed?.profileName || '[Profile Name]'}
          </Heading>

        <Grid container spacing={0}>
          <Grid size={12} sx={{ mt: 3, mb: '16px' }}>
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
                showRemoveButton={true}
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
          {showCurrentRule && (
            <Grid size={12} sx={{ mb: '16px' }}>
              <AuthorizationRuleFormAccordion
                ref={accordionRef}
                ruleNumber={currentRuleNumber || 1}
                onSaveSuccess={handleSaveSuccess}
              />
            </Grid>
          )}
          <Grid size={12} sx={{ mb: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <Button
              buttonVariant="tertiary"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}
              startIcon={<Image src={DeleteIcon} alt="Delete" width={24} height={24} />}
            >
              DELETE PROFILE
            </Button>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                buttonVariant="tertiary"
                startIcon={<Image src={AddIcon} alt="Add" width={20} height={20} />}
                style={{ height: '48px' }}
                onClick={handleAddRule}
              >
                ADD A RULE
              </Button>
              {hasUnsavedChanges && mode === 'review' && (
                <Button
                  buttonVariant="primary"
                  onClick={handleFinalSubmit}
                  style={{ height: '48px', whiteSpace: 'nowrap' }}
                >
                  SUBMIT PROFILE FOR APPROVAL
                </Button>
              )}
            </Box>
          </Grid>
          {mode === 'edit' && (
            <Grid size={12}>
              <FormActionButtons
                onCancel={handleCancel}
                onNext={handleSubmit}
                cancelText="CANCEL"
                nextText="SAVE"
                nextButtonVariant="primary"
              />
            </Grid>
          )}
        </Grid>
        </Box>
      )}

      <Dialog
        name="delete-profile-dialog"
        title="Delete Profile"
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
              Are you sure you want to delete this authorisation profile?
            </Box>
          </Box>
        }
        secondaryCTALabel="YES, DELETE"
        tertiaryCTALabel="CANCEL"
        onSecondaryCTA={handleDelete}
        onTertiaryCTA={() => setDeleteDialogOpen(false)}
        maxWidth="560px"
        secondaryCTAWidth="130px"
        secondaryCTAHeight="48px"
        tertiaryCTAWidth="82px"
        tertiaryCTAHeight="48px"
      />

      <CancellationConfirmationDialog
        open={showCancelModal}
        onClose={handleCloseCancelModal}
        onCancel={handleConfirmCancel}
        onDismiss={handleCloseCancelModal}
        title="Cancel profile edit"
        heading="Are you sure you want to cancel?"
        subheading="All unsaved changes will be lost."
        dismissLabel="NO, GO BACK"
        cancelLabel="YES, CANCEL"
      />
    </Box>
  );
}

export default ManagePage;
