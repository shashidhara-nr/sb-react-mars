'use client';
import { useEffect, useRef, useState } from 'react';
import { Box, Grid, Button as MuiButton } from '@mui/material';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import { CreateJournyForm, CommonSnackbar } from 'components/common';
import CommonAccordion from 'components/common/CommonAccordion';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import SecurityWarningDialog from 'components/common/SecurityWarningDialog';
import NonTransactionalAuthRuleFormAccordion from '@molecules/NonTransactionalAuthRuleFormAccordion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { RootState, AppDispatch } from 'store';
import { buildTestId } from 'src/utils/testIds';
import { AvatarAlert } from 'lib/icons';
import {
  updateAuthRuleName,
  updateAuthRuleDescription,
  resetAuthRule,
  initNonTransactionalRules,
  loadNonTransactionalRuleForEdit,
  updateNonTransactionalRuleConstruct,
  saveNonTransactionalRule,
  setNonTransactionalRules,
} from 'store/slices/createAuthRuleSlice';
import { PeopleIcon, DeleteIcon, ArrowIcon, SettingIcon, CloseIcon, PencilIcon } from 'lib/icons';
import { navlinks, getManageBreadcrumbLinks } from '../nonTransactionalHelper';

const Page = () => {
  const testIdPrefix = 'non-transactional-authorisation-manage';
  const t = useTranslations('nonTransactionalHubData');
  const router = useRouter();
  const params = useParams() as { locale?: string };
  const locale = params?.locale;
  const dispatch = useAppDispatch();
  const { authRuleName, authRuleDescription, nonTransactionalRules, savedRules } = useAppSelector(
    (state) => state.createAuthRule,
  );

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  // Manage should land directly on the same UI shown after "Review and submit".
  const [isReview, setIsReview] = useState(true);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [showUnsavedSubmitDialog, setShowUnsavedSubmitDialog] = useState(false);
  const [showSubmitForApproval, setShowSubmitForApproval] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const ruleConstructSnapshotRef = useRef<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formMethods = useForm({
    mode: 'onTouched',
    values: {
      authRuleName: authRuleName || '',
      authRuleDescription: authRuleDescription || '',
    }
  });

  // Ensure the manage page always has at least one rule to render.
  // If older persisted state only has `savedRules`, hydrate the new `nonTransactionalRules`.
  useEffect(() => {
    if ((nonTransactionalRules?.length ?? 0) > 0) return;

    if ((savedRules?.length ?? 0) > 0) {
      const now = Date.now();
      dispatch(
        setNonTransactionalRules(
          (savedRules || []).map((r, idx) => ({
            id:
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${now}-${idx}`,
            status: 'saved',
            conditions: Array.isArray(r?.conditions) ? r.conditions : [],
            authRuleConstruct: String(r?.authRuleConstruct ?? ''),
          })),
        ),
      );
      return;
    }

    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
    dispatch(initNonTransactionalRules({ id }));
  }, [dispatch, nonTransactionalRules?.length, savedRules, savedRules?.length]);

  const handleChange = (name: string, value: any) => {
    if (name === 'authRuleName') {
      dispatch(updateAuthRuleName(value));
      setIsProfileEditing(true);
    } else if (name === 'authRuleDescription') {
      dispatch(updateAuthRuleDescription(value));
      setIsProfileEditing(true);
    }
  };

  const withLocale = (href: string) => (locale ? `/${locale}${href}` : href);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    router.push(withLocale(navlinks.nonTransactional) as any);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleDeleteProfile = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(resetAuthRule());
    setDeleteDialogOpen(false);
    setSnackbarOpen(true);
      router.push(withLocale(navlinks.nonTransactional) as any);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const canDeleteRules = (nonTransactionalRules?.length ?? 0) > 1;

  const handleSubmit = async () => {
    const isValid = await formMethods.trigger();
    if (!isValid) return;

    // In review mode, the primary action is the final submit.
    if (isReview) {
      if (isProfileEditing || Boolean(editingRuleId)) {
        setShowUnsavedSubmitDialog(true);
        return;
      }
      router.push(withLocale(navlinks.manageSuccess) as any);
      return;
    }

    // First step: go to review on this same page.
    const hasAnyRule = Boolean(nonTransactionalRules && nonTransactionalRules.length > 0);
    const hasAnyConstruct = Boolean(
      (nonTransactionalRules || []).some((r) => String(r?.authRuleConstruct ?? '').trim()),
    );
    if (!hasAnyRule || !hasAnyConstruct) {
      setShowSecurityWarning(true);
      return;
    }

    setIsProfileEditing(false);
    setIsReview(true);
  };

  const beginEditRule = (ruleId: string) => {
    const current = (nonTransactionalRules || []).find((r) => r.id === ruleId);
    if (current) {
      ruleConstructSnapshotRef.current[ruleId] = String(current.authRuleConstruct ?? '');
    }
    setEditingRuleId(ruleId);
    dispatch(loadNonTransactionalRuleForEdit({ id: ruleId }));
  };

  const cancelEditRule = (ruleId: string) => {
    const snapshot = ruleConstructSnapshotRef.current[ruleId];
    if (snapshot !== undefined) {
      dispatch(updateNonTransactionalRuleConstruct({ id: ruleId, value: snapshot }));
    }
    dispatch(saveNonTransactionalRule({ id: ruleId }));
    setEditingRuleId(null);
  };

  const completeEditRule = (ruleId: string) => {
    const current = (nonTransactionalRules || []).find((r) => r.id === ruleId);
    ruleConstructSnapshotRef.current[ruleId] = String(current?.authRuleConstruct ?? '');
    setEditingRuleId(null);
    setShowSubmitForApproval(true);
  };

  const { errors } = formMethods.formState;

  const profileFields = [
    {
      name: 'authRuleName',
      label: t('labelAuthRuleName'),
      value: authRuleName,
      type: 'text' as const,
      required: true,
      error: !!errors.authRuleName,
      helperText: (errors as any).authRuleName?.message || '',
    },
    {
      name: 'authRuleDescription',
      label: t('labelAuthRuleDescription'),
      value: authRuleDescription,
      type: 'text' as const,
      required: false,
      error: !!(errors as any).authRuleDescription,
      helperText: (errors as any).authRuleDescription?.message || '',
    },
  ];

  const nextLabel = isReview ? t('buttonSubmitRuleForApproval') : t('buttonReviewAndSubmit');

  const rulesForReview = nonTransactionalRules || [];

  return (
    <Box sx={{ p: 2 }} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Grid container spacing={0}>
        <Grid size={12} sx={{ mb: '32px' }}>
          <Breadcrumb
            links={getManageBreadcrumbLinks(t)}
            data-testid={buildTestId(testIdPrefix, 'breadcrumb')}
          />
        </Grid>
        <Grid size={12} sx={{ mb: '44px' }}>
          <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>
            {t('manageTitle')}
          </Heading>
        </Grid>
        <Grid size={12} sx={{ mb: '16px' }}>
          <CreateJournyForm
            title={t('profileDetailsTitle')}
            titleIcon={PeopleIcon}
            fields={profileFields as any}
            onChange={handleChange}
            mode={isReview ? 'review' : 'edit'}
            ShowActionBtns={isReview}
            renderWithRHF
            formMethods={formMethods}
            syncOnChange={true}
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
              // Only show the submit CTA once the user has saved changes.
              setIsProfileEditing(false);
              setShowSubmitForApproval(true);
            }}
            onValidationFail={() => {}}
            testIdPrefix={buildTestId(testIdPrefix,'manage-journey-form')}
          />
        </Grid>

        {!isReview &&
          (nonTransactionalRules || []).map((rule, index) => {
            const canDeleteRules = (nonTransactionalRules?.length ?? 0) > 1;
            return (
              <Grid size={12} key={rule.id} sx={{ mb: '16px' }}>
                <NonTransactionalAuthRuleFormAccordion
                  ruleId={rule.id}
                  ruleNumber={index + 1}
                  showDeleteButton={canDeleteRules}
                  defaultExpanded={true}
                />
              </Grid>
            );
          })}

        {isReview &&
          rulesForReview.map((rule, index) => {
            if (editingRuleId === rule.id) {
              return (
                <Grid size={12} key={rule.id} sx={{ mb: '16px' }}>
                  <NonTransactionalAuthRuleFormAccordion
                    ruleId={rule.id}
                    ruleNumber={index + 1}
                    showDeleteButton={canDeleteRules}
                    defaultExpanded={true}
                    actionPlacement="header"
                    onCancel={() => cancelEditRule(rule.id)}
                    onSaveSuccess={() => completeEditRule(rule.id)}
                    onDeleteSuccess={() => {
                      setEditingRuleId(null);
                      setShowUnsavedSubmitDialog(false);
                      setShowSubmitForApproval(true);
                    }}
                  />
                </Grid>
              );
            }

            const construct = String(rule?.authRuleConstruct ?? '').trim();
            return (
              <Grid size={12} key={rule.id} sx={{ mb: '16px' }}>
                <CommonAccordion
                  title={t('nonTransactionalRuleTitle', { number: index + 1 })}
                  icon={<Image src={SettingIcon} alt="settings" width={24} height={24} />}
                  reviewMode
                  isEditing={false}
                  actions={
                    <MuiButton
                      onClick={(e) => {
                        e.stopPropagation();
                        beginEditRule(rule.id);
                      }}
                      startIcon={<Image src={PencilIcon} alt="Edit" width={16} height={16} />}
                      size="small"
                      variant="text"
                      sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}
                      data-testid={buildTestId(testIdPrefix, `button-edit-rule-${index + 1}`)}
                      aria-label={`Edit rule ${index + 1}`}
                    >
                      EDIT
                    </MuiButton>
                  }
                  onEdit={() => {
                    beginEditRule(rule.id);
                  }}
                  defaultExpanded={false}
                  expandIcon={true}
                  sx={{ borderRadius: '12px' }}
                >
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ fontSize: '14px', fontWeight: 400, mb: 0.5 }}>{t('labelAuthRuleConstruct')}</Box>
                    <Box sx={{ fontSize: '14px', fontWeight: 600 }}>
                      {construct ? construct : t('noAuthorisationRuleCreated')}
                    </Box>
                  </Box>
                </CommonAccordion>
              </Grid>
            );
          })}

        {!isReview && (
          <Grid size={12} sx={{ mb: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <Button
              buttonVariant="tertiary"
              type="button"
              startIcon={<Image src={DeleteIcon} alt="Delete" width={24} height={24} />}
              onClick={handleDeleteProfile}
              data-testid={buildTestId(testIdPrefix, 'button-delete-profile')}
              aria-label="Delete authorisation rule profile"
            >
             {t('buttonDeleteProfile')}
            </Button>
          </Grid>
        )}

        {isReview && (
          <Grid
            size={12}
            sx={{
              mt: '8px',
              display: 'flex',
              justifyContent: showSubmitForApproval ? 'space-between' : 'flex-start',
              alignItems: 'center',
            }}
          >
            <Button
              buttonVariant="text"
              type="button"
              startIcon={<Image src={DeleteIcon} alt="Delete" width={24} height={24} />}
              onClick={handleDeleteProfile}
              sx={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                height: '48px',
                minHeight: '48px',
                padding: '0 12px',
              }}
              data-testid={buildTestId(testIdPrefix, 'button-delete-profile')}
              aria-label="Delete authorisation profile"
            >
              {t('buttonDeleteProfile')}
            </Button>

            {showSubmitForApproval ? (
              <Button
                buttonVariant="primary"
                type="button"
                startIcon={<Image src={ArrowIcon} alt="Submit" width={24} height={24} />}
                onClick={handleSubmit}
                data-testid={buildTestId(testIdPrefix, 'button-submit-profile')}
                aria-label="Submit profile for approval"
              >
                {t('buttonSubmitRuleForApproval')}
              </Button>
            ) : null}
          </Grid>
        )}

      </Grid>

      <CancellationConfirmationDialog
        open={showCancelModal}
        onClose={handleCloseCancelModal}
        onCancel={handleConfirmCancel}
        onDismiss={handleCloseCancelModal}
        title={t('dialogCancelTitle')}
        heading={t('dialogCancelHeading')}
        subheading={t('dialogCancelSubheading')}
        dismissLabel={t('dialogCancelDismiss')}
        cancelLabel={t('dialogCancelConfirm')}
        testIdPrefix={buildTestId(testIdPrefix, 'dialog-cancel-confirmation')}
      />

      <CancellationConfirmationDialog
        open={showUnsavedSubmitDialog}
        onClose={() => setShowUnsavedSubmitDialog(false)}
        onDismiss={() => setShowUnsavedSubmitDialog(false)}
        onCancel={() => {
          setShowUnsavedSubmitDialog(false);
          router.push(withLocale(navlinks.manageSuccess) as any);
        }}
        title="Unsaved changes"
        heading="Do you want to leave this page without saving your changes?"
        subheading="Any unsaved changes will be lost."
        dismissLabel="DISMISS"
        cancelLabel={`YES, ${String(nextLabel ?? '').toUpperCase()}`}
        testIdPrefix={buildTestId(testIdPrefix, 'dialog-unsaved-submit')}
      />

      <SecurityWarningDialog
        open={showSecurityWarning}
        onClose={() => setShowSecurityWarning(false)}
        onDismiss={() => setShowSecurityWarning(false)}
        onConfirm={() => {
          setShowSecurityWarning(false);
          setIsReview(true);
        }}
        title={t('dialogSecurityWarningTitle')}
        heading={t('dialogSecurityWarningHeading')}
        subheading={t('dialogSecurityWarningSubheading')}
        dismissLabel={t('dialogSecurityWarningDismiss')}
        confirmLabel={t('dialogSecurityWarningConfirm')}
        testIdPrefix={buildTestId(testIdPrefix, 'security-warning')}
      />

      <SecurityWarningDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onDismiss={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t('dialogProfileDeletionTitle')}
        heading={t('dialogProfileDeletionHeading')}
        subheading={t('dialogProfileDeletionSubheading')}
        dismissLabel={t('dialogProfileDeletionDismiss')}
        confirmLabel={t('dialogProfileDeletionConfirm')}
        testIdPrefix={buildTestId(testIdPrefix, 'dialog-delete-profile')}
        icon={AvatarAlert}
      />

      <CommonSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={t('snackbarProfileDeleteSuccess')}
        severity="success"
      />
    </Box>
  );
};

export default Page;