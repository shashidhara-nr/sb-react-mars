'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Grid, Typography, Button as MuiButton } from '@mui/material';
import { Breadcrumb, Heading, Button } from 'dist/standard-bank-react';
import { CreateJournyForm } from 'components/common';
import CommonAccordion from 'components/common/CommonAccordion';
import FormActionButtons from 'components/common/formActionButtons';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import SecurityWarningDialog from 'components/common/SecurityWarningDialog';
import NonTransactionalAuthRuleFormAccordion, {
  type NonTransactionalAuthRuleFormAccordionHandle,
} from '@molecules/NonTransactionalAuthRuleFormAccordion';
import { AddIcon, ArrowIcon, SettingIcon,CloseIcon, IcnAccountTile, IconPeopleApproved } from 'lib/icons';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import { RootState, AppDispatch } from 'store';
import { buildTestId } from 'src/utils/testIds';
import {
  updateAuthRuleName,
  updateAuthRuleDescription,
  resetAuthRule,
  initNonTransactionalRules,
  addNonTransactionalRule,
  loadNonTransactionalRuleForEdit,
  updateNonTransactionalRuleConstruct,
  saveNonTransactionalRule,
} from 'store/slices/createAuthRuleSlice';
import { navlinks, getBreadcrumbLinks } from '../nonTransactionalHelper';

const MAX_NON_TRANSAC_AUTH_RULE = 10;

const Page = () => {
  const testIdPrefix = 'non-transactional-authorisation-create';
  const t = useTranslations('nonTransactionalHubData');
  const router = useRouter();
  const params = useParams() as { locale?: string };
  const locale = params?.locale;
  const dispatch = useAppDispatch();
  const { authRuleName, authRuleDescription, nonTransactionalRules } = useAppSelector(
    (state) => state.createAuthRule,
  );

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [showMaxRulesDialog, setShowMaxRulesDialog] = useState(false);
  const [isReview, setIsReview] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [showUnsavedSubmitDialog, setShowUnsavedSubmitDialog] = useState(false);
  const ruleConstructSnapshotRef = useRef<Record<string, string>>({});
  const ruleAccordionRefs = useRef<Record<string, NonTransactionalAuthRuleFormAccordionHandle | null>>({});

  const formMethods = useForm({
    mode: 'onTouched',
    values: {
      authRuleName: authRuleName || '',
      authRuleDescription: authRuleDescription || '',
    },
    defaultValues: {
      authRuleName: '',
      authRuleDescription: '',
    },
  });

  // Start the create journey with a clean slate (prevents previously saved rules
  // from appearing when navigating back to this page).
  useEffect(() => {
    dispatch(resetAuthRule());
    setIsReview(false);
    setEditingRuleId(null);
    setIsProfileEditing(false);
    setShowUnsavedSubmitDialog(false);
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
    dispatch(initNonTransactionalRules({ id }));
  }, [dispatch]);

  const handleChange = (name: string, value: any) => {
    if (name === 'authRuleName') {
      dispatch(updateAuthRuleName(value));
    } else if (name === 'authRuleDescription') {
      dispatch(updateAuthRuleDescription(value));
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

  const handleSubmit = async () => {
    const isValid = await formMethods.trigger();
    if (!isValid) return;

    // In review mode, the primary action is the final submit.
    if (isReview) {
      if (isProfileEditing || Boolean(editingRuleId)) {
        setShowUnsavedSubmitDialog(true);
        return;
      }
      router.push(withLocale(navlinks.createSuccess) as any);
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
  };

  const handleAddRule = () => {
    const total = nonTransactionalRules?.length ?? 0;

    if (total > 0) {
      const lastRule = nonTransactionalRules?.[total - 1];
      if (lastRule) {
        // When the user clicks "ADD A RULE", validate the current rule exactly
        // like the Save action. Validation errors are displayed inline.
        const handler = ruleAccordionRefs.current[lastRule.id];
        const isValid = handler?.validate
          ? handler.validate()
          : Boolean(String(lastRule.authRuleConstruct ?? '').trim());
        if (!isValid) return;

        // If valid but not yet saved, save it first (same behaviour as pressing Save).
        if (lastRule.status !== 'saved') {
          const savedOk = handler?.saveIfValid
            ? handler.saveIfValid()
            : Boolean(String(lastRule.authRuleConstruct ?? '').trim());
          if (!savedOk) return;
        }
      }
    }

    if (total >= MAX_NON_TRANSAC_AUTH_RULE) {
      setShowMaxRulesDialog(true);
      return;
    }

    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
    dispatch(addNonTransactionalRule({ id }));
  };

  const { errors } = formMethods.formState;

  const authRuleNameValue = formMethods.watch('authRuleName');
  const hasAuthRuleName = Boolean(String(authRuleNameValue ?? authRuleName ?? '').trim());

  const profileFields = [
    {
      name: 'authRuleName',
      label: `${t('labelAuthRuleName')}*`,
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
  const totalRules = nonTransactionalRules?.length ?? 0;
  const lastRuleStatus = totalRules > 0 ? nonTransactionalRules?.[totalRules - 1]?.status : undefined;
  
  return (
    <Box sx={{ p: 2 }} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Grid container spacing={0}>
        <Grid size={12} sx={{ mb: '32px' }}>
          <Breadcrumb
            links={getBreadcrumbLinks(t, t('createTitle'))}
            data-testid={buildTestId(testIdPrefix, 'breadcrumb')}
          />
        </Grid>
        <Grid size={12} sx={{ mb: '44px' }}>
          <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>
            {t('createTitle')}
          </Heading>
        </Grid>
        <Grid size={12} sx={{ mb: '16px' }}>
          <CreateJournyForm
            title={t('profileDetailsTitle')}
            titleIcon={IcnAccountTile}
            fields={profileFields as any}
            onChange={handleChange}
            mode={isReview ? 'review' : 'edit'}
            ShowActionBtns={isReview}
            renderWithRHF
            formMethods={formMethods}
            syncOnChange={true}
            rulesProvider={(name: string) => {
              if (name === 'authRuleName') {
                return {
                  required: 'Authorisation rule name is required',
                };
              }
              return {};
            }}
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={() => {}}
            testIdPrefix={buildTestId(testIdPrefix,'create-journey-form')}
          />
        </Grid>

        {!isReview && (nonTransactionalRules?.length ?? 0) > 1 && (
          <Grid size={12} sx={{ mb: '8px' }}>
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#222E37',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              {t('additionalAuthRulesAdded')}
            </Typography>
          </Grid>
        )}

        {!isReview &&
          (nonTransactionalRules || []).map((rule, index) => {
            const canDeleteRules = (nonTransactionalRules?.length ?? 0) > 1;
            return (
              <Grid size={12} key={rule.id} sx={{ mb: '16px' }}>
                <NonTransactionalAuthRuleFormAccordion
                  ref={(handle) => {
                    ruleAccordionRefs.current[rule.id] = handle;
                  }}
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
                    showDeleteButton={false}
                    defaultExpanded={true}
                    actionPlacement="header"
                    onCancel={() => cancelEditRule(rule.id)}
                    onSaveSuccess={() => completeEditRule(rule.id)}
                  />
                </Grid>
              );
            }

            const construct = String(rule?.authRuleConstruct ?? '').trim();
            return (
              <Grid size={12} key={rule.id} sx={{ mb: '16px' }}>
                <CommonAccordion
                  title={t('nonTransactionalRuleTitle', { number: index + 1 })}
                  icon={<Image src={IconPeopleApproved} alt="approved" width={24} height={24} />}
                  reviewMode
                  isEditing={false}
                  actions={
                    <MuiButton
                      onClick={(e) => {
                        e.stopPropagation();
                        beginEditRule(rule.id);
                      }}
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
                  defaultExpanded={true}
                  expandIcon={true}
                  sx={{ borderRadius: '12px' }}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 400, mb: 0.5 }}>
                      {t('labelAuthRuleConstruct')}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                      {construct ? construct : t('noAuthorisationRuleCreated')}
                    </Typography>
                  </Box>
                </CommonAccordion>
              </Grid>
            );
          })}
        {!isReview && (
        <Grid size={12} sx={{ mb: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            buttonVariant="text"
            type="button"
            startIcon={<Image src={AddIcon} alt="Add" width={24} height={24} />}
            sx={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#0051FF',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              height: '48px',
              minHeight: '48px',
              padding: '0 12px',
            }}
            onClick={handleAddRule}
            data-testid={buildTestId(testIdPrefix, 'button-add-rule')}
            aria-label="Add authorisation rule"
          >
            {t('buttonAddRule')}
          </Button>
        </Grid>
        )}
        <Grid size={12}>
          <FormActionButtons
            onCancel={handleCancel}
            onNext={handleSubmit}
            cancelText={t('buttonCancel')}
            nextText={nextLabel}
            cancelIcon={CloseIcon as any}
            nextIcon={ArrowIcon as any}
            nextButtonVariant="primary"
            nextDisabled={false}
            testIdPrefix={buildTestId(testIdPrefix,'form-action')}
          />
        </Grid>
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
          router.push(withLocale(navlinks.createSuccess) as any);
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
        open={showMaxRulesDialog}
        onClose={() => setShowMaxRulesDialog(false)}
        onDismiss={() => setShowMaxRulesDialog(false)}
        onConfirm={() => setShowMaxRulesDialog(false)}
        showConfirmButton={false}
        title={t('dialogMaxRulesTitle')}
        heading={t('dialogMaxRulesHeading')}
        subheading={t('dialogMaxRulesSubheading', { max: MAX_NON_TRANSAC_AUTH_RULE })}
        dismissLabel={t('dialogMaxRulesDismiss')}
        testIdPrefix={buildTestId(testIdPrefix, 'max-rules')}
      />
    </Box>
  );
};

export default Page;
