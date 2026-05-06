'use client';

import { Box } from '@mui/material';
import { Breadcrumb, Heading, Dialog } from 'dist/standard-bank-react';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import {
  updateManagedUnpaidOption,
  fetchUnpaidOptionById,
  deleteManagedUnpaidOptionById,
} from '@store/slices/createUnpaidOptionSlice';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { buildUnpaidOptionDetailsFields } from 'src/utils/UnpaidOptionsField';
import { getRulesForField } from 'src/utils/UnpaidOptionsCreateLogic';
import { FormActionButtons } from 'components/common/formActionButtons';
import CreateJournyForm from 'components/common/CreateJournyForm';
import IcnFormFill from 'public/icons/icn_form_fill.svg';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import ListIcon from 'public/icons/col-icon-list.svg';

export default function ManageUnpaidOptionPage({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const [mode, setMode] = useState<'edit' | 'review'>('review');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [successType, setSuccessType] = useState<'edit' | 'delete'>('edit');

  const dispatch = useAppDispatch();
  const managedUnpaidOption = useAppSelector(
    (state) => state.createUnpaidOption?.managedUnpaidOption,
  );
  const viewed: any = managedUnpaidOption;

  useEffect(() => {
    // Fetch unpaid option by id on mount
    const id = params?.id || '123';
    dispatch(fetchUnpaidOptionById(id) as any)
      .then((result: any) => {
        console.log('Unpaid Option API fetch result:', result);
        if (result?.payload) {
          setInitialData(result.payload);
        }
      })
      .catch((err: any) => console.error('Unpaid Option API fetch error:', err));
  }, [dispatch, params?.id]);

  useEffect(() => {
    // Log the updated managedUnpaidOption to verify state
    if (managedUnpaidOption) {
      console.log('Managed Unpaid Option state:', managedUnpaidOption);
    }
  }, [managedUnpaidOption]);

  const handleChange = (name: string, value: any) => {
    dispatch(updateManagedUnpaidOption({ field: name, value }));
    if (!hasChanges && initialData && initialData[name] !== value) {
      setHasChanges(true);
    }
  };

  // RHF default values for validation-enabled forms
  const detailsDefaultValues = {
    unpaidOptionName: viewed?.unpaidOptionName || '',
    postingOption: viewed?.postingOption || '',
    postingAccount: viewed?.postingAccount || '',
    selectedNominatedAccount: viewed?.selectedNominatedAccount || '',
  } as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });

  const handleCancel = useCallback(() => {
    router.push('/setup-and-admin/unpaid-options' as any);
  }, [router]);

  const handleNext = useCallback(async () => {
    // Trigger validation for all fields before moving to review
    const isValid = await methodsDetails.trigger();
    if (isValid) {
      setMode('review');
    }
  }, [methodsDetails]);

  const handleEdit = useCallback(() => {
    setMode('edit');
  }, []);

  const handleSubmit = useCallback(() => {
    // Submit the changes for approval
    // TODO: Add your API call here to submit changes
    console.log('Submitting changes for approval:', managedUnpaidOption);
    setSuccessType('edit');
    setShowSuccess(true);
  }, [managedUnpaidOption]);

  const handleDelete = useCallback(() => {
    const id = String(viewed?.entityKey ?? params?.id ?? '123');
    dispatch(deleteManagedUnpaidOptionById(id) as any)
      .then(() => {
        console.log('Delete successful');
        setDeleteDialogOpen(false);
        setSuccessType('delete');
        setShowSuccess(true);
      })
      .catch((err: any) => {
        console.error('Delete error:', err);
        setDeleteDialogOpen(false);
      });
  }, [dispatch, viewed, params?.id]);

  const buildUnpaidOptionFields = useCallback(
    () => buildUnpaidOptionDetailsFields(viewed, mode),
    [viewed, mode],
  );

  // Keep RHF forms in sync when managedUnpaidOption data loads/changes
  useEffect(() => {
    const detailsDefaults = {
      unpaidOptionName: managedUnpaidOption?.unpaidOptionName || '',
      postingOption: managedUnpaidOption?.postingOption || '',
      postingAccount: managedUnpaidOption?.postingAccount || '',
      selectedNominatedAccount: managedUnpaidOption?.selectedNominatedAccount || '',
    } as const;

    methodsDetails.reset(detailsDefaults);
  }, [managedUnpaidOption, methodsDetails]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showSuccess ? (
        <Box sx={{ p: 2, mb: -2 }}>
          <Breadcrumb
            links={[
              { href: '/', label: 'Dashboard' },
              { href: '/setup-and-admin/unpaid-options', label: 'Unpaid options' },
              { href: '/setup-and-admin/unpaid-options/manage', label: 'Manage Unpaid Option' },
            ]}
          />
          <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
            Manage unpaid option
          </Heading>
        </Box>
      ) : (
        <Box sx={{ p: 2, mb: -2 }}>
          <Breadcrumb
            links={[
              { href: '/', label: 'Dashboard' },
              { href: '/setup-and-admin/unpaid-options', label: 'Unpaid options' },
              { href: '/setup-and-admin/unpaid-options/manage', label: 'Manage Unpaid Option' },
            ]}
          />
          <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
            Manage unpaid option
          </Heading>
        </Box>
      )}

      {showSuccess ? (
        <Box sx={{ flex: 1, p: 2 }}>
          <SuccessMessage
            title="Success"
            message={
              successType === 'edit'
                ? 'Unpaid option successfully edited and submitted for approval.'
                : 'Unpaid option successfully deleted and submitted for approval.'
            }
            subtext="Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo."
            tertiaryCTALabel="GO TO UNPAID OPTIONS HUB"
            onTertiaryCTA={() => router.push('/setup-and-admin/unpaid-options' as any)}
            tertiaryCTAStartIcon={<Image src={ListIcon} alt="List" width={24} height={24} />}
            tertiaryCTAStyle={{
              width: '280px',
              height: '48px',
              whiteSpace: 'nowrap',
            }}
          />
        </Box>
      ) : (
        <Box sx={{ mt: 3, p: 2 }}>
          <CreateJournyForm
            onChange={handleChange}
            mode={mode}
            ShowActionBtns={true}
            renderWithRHF
            formMethods={methodsDetails}
            rulesProvider={(fieldName: string) => getRulesForField(fieldName as any, () => methodsDetails.getValues())}
            onSubmit={(data: any) => {
              Object.entries(data || {}).forEach(([name, value]) => handleChange(name, value));
            }}
            onValidationFail={() => {}}
            syncOnChange={false}
            sections={[
              {
                title: 'Unpaid option details',
                titleIcon: IcnFormFill as any,
                fields: buildUnpaidOptionFields(),
                ShowActionBtns: true,
              },
            ]}
          />

          {mode === 'review' && hasChanges && (
            <FormActionButtons
              cancelText=""
              showCancel={false}
              onNext={handleSubmit}
              nextText="Submit Changes for Approval"
              nextButtonVariant="primary"
            />
          )}
          {mode === 'review' && !hasChanges && (
            <FormActionButtons
              cancelText=""
              showCancel={false}
              onNext={() => setDeleteDialogOpen(true)}
              nextText="Delete Unpaid Option"
              nextButtonVariant="tertiary"
              useDeleteIcon={true}
            />
          )}
          {mode === 'edit' && (
            <FormActionButtons
              onCancel={handleCancel}
              onNext={handleNext}
              nextText="Review and Submit"
            />
          )}
        </Box>
      )}

      <Dialog
        name="delete-unpaid-option-dialog"
        title="Delete beneficiary"
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        content={
          <Box
            sx={{
              padding: '24px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <Box
              sx={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#DC3545" strokeWidth="2" />
                <path
                  d="M12 7v6M12 17h.01"
                  stroke="#DC3545"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Box>
            <Box sx={{ fontSize: '16px', textAlign: 'center', color: '#333' }}>
              Are you sure you want to delete this unpaid option?
            </Box>
          </Box>
        }
        tertiaryCTALabel="CANCEL"
        secondaryCTALabel="YES, DELETE"
        onTertiaryCTA={() => setDeleteDialogOpen(false)}
        onSecondaryCTA={handleDelete}
        maxWidth="560px"
        tertiaryCTAWidth="100px"
        tertiaryCTAHeight="48px"
        secondaryCTAWidth="125px"
        secondaryCTAHeight="48px"
      />
    </Box>
  );
}
