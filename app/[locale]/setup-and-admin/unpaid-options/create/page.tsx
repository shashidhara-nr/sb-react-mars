'use client';

import { Box } from '@mui/material';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { updateUnpaidOption } from '@store/slices/createUnpaidOptionSlice';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { buildUnpaidOptionDetailsFields } from 'src/utils/UnpaidOptionsField';
import { getRulesForField } from 'src/utils/UnpaidOptionsCreateLogic';
import { FormActionButtons } from 'components/common/formActionButtons';
import CreateJournyForm from 'components/common/CreateJournyForm';
import IcnFormFill from 'public/icons/icn_form_fill.svg';
import Image from 'next/image';
import SuccessMessage from '@molecules/SuccessMessage/SucessMessage';
import PlusIcon from 'public/icons/col-icon-plus.svg';
import ListIcon from 'public/icons/col-icon-list.svg';

export default function CreateUnpaidOptionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const unpaidOption = useAppSelector((state) => state.createUnpaidOption?.unpaidOption);

  const [mode, setMode] = useState<'edit' | 'review'>('edit');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    dispatch(updateUnpaidOption({ field, value }));
  };

  // RHF default values
  const detailsDefaultValues = {
    unpaidOptionName: unpaidOption?.unpaidOptionName || '',
    postingOption: unpaidOption?.postingOption || '',
    postingAccount: unpaidOption?.postingAccount || '',
    selectedNominatedAccount: unpaidOption?.selectedNominatedAccount || '',
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
    setShowSuccess(true);
  }, []);

  const buildUnpaidOptionFields = useCallback(
    () => buildUnpaidOptionDetailsFields(unpaidOption, mode),
    [unpaidOption, mode],
  );

  // Keep RHF forms in sync when unpaidOption data loads/changes
  useEffect(() => {
    const detailsDefaults = {
      unpaidOptionName: unpaidOption?.unpaidOptionName || '',
      postingOption: unpaidOption?.postingOption || '',
      postingAccount: unpaidOption?.postingAccount || '',
      selectedNominatedAccount: unpaidOption?.selectedNominatedAccount || '',
    } as const;

    methodsDetails.reset(detailsDefaults);
  }, [unpaidOption, methodsDetails]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showSuccess ? (
        <Box sx={{ p: 2, mb: -2 }}>
          <Breadcrumb
            links={[
              { href: '/', label: 'Dashboard' },
              { href: '/setup-and-admin/unpaid-options', label: 'Unpaid options' },
              { href: '/setup-and-admin/unpaid-options/create', label: 'Create an unpaid option' },
            ]}
          />
          <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
            Create an unpaid option
          </Heading>
        </Box>
      ) : (
        <Box sx={{ p: 2, mb: -2 }}>
          <Breadcrumb
            links={[
              { href: '/', label: 'Dashboard' },
              { href: '/setup-and-admin/unpaid-options', label: 'Unpaid options' },
              { href: '/setup-and-admin/unpaid-options/create', label: 'Create an unpaid option' },
            ]}
          />
          <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
            Create an unpaid option
          </Heading>
        </Box>
      )}

      {showSuccess ? (
        <Box sx={{ flex: 1, p: 2 }}>
          <SuccessMessage
            title="Success"
            message="Unpaid option successfully created and submitted for approval."
            subtext="Please note, Turpis massa sed elementum tempus egestas. Interdum consectetur libero id faucibus nisl tincidunt. Nascetur ridiculus mus mauris vitae ultricies leo."
            primaryCTALabel="CREATE ANOTHER UNPAID OPTION"
            onPrimaryCTA={() => router.push('/setup-and-admin/unpaid-options/create' as any)}
            primaryCTAStartIcon={<Image src={PlusIcon} alt="Plus" width={24} height={24} />}
            primaryCTAStyle={{
              width: '310px',
              height: '48px',
              whiteSpace: 'nowrap',
            }}
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

          {mode === 'edit' && (
            <FormActionButtons
              onCancel={handleCancel}
              onNext={handleNext}
              nextText="Review Unpaid Option"
            />
          )}
          {mode === 'review' && (
            <>
              <FormActionButtons
                onCancel={handleEdit}
                onNext={handleSubmit}
                cancelText="Cancel"
                nextText="Submit unpaid option for approval"
              />
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
