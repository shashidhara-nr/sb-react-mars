'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Breadcrumb, Button, Heading } from 'dist/standard-bank-react';
import { Grid } from "@mui/material";
import CreateManuallyIcon from 'public/icons/icn_form_fill_white.svg';
import FormFillIcon from 'public/icons/icn_form_fill.svg';
import ViewListIcon from 'public/icons/icn_view_list.svg';
import ViewListIconWhite from 'public/icons/icn_view_list_white.svg';
import UploadIcon from 'public/icons/icn_upload.svg';
import UploadIconWhite from 'public/icons/icn_upload_white.svg';
import ArrowIcon from 'public/icons/col-icon-left.svg';
import { updateBeneficiary, resetBeneficiary, fetchVerifiedAccounts } from '@store/slices/createBeneficiarySlice';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import { buildTestId } from 'src/utils/testIds';
import FormActionButtons from 'components/common/formActionButtons';

export default function BeneficiaryCreatePage() {
    const testIdPrefix = 'beneficiary-create-method';
    const router = useRouter();
    const dispatch = useAppDispatch();
    const creationMethod = useAppSelector((state) => state.createBeneficiary.beneficiary?.creationMethod);
    const [selectedMethod, setSelectedMethod] = React.useState<string | null>(creationMethod || null);

    // Keep local state in sync with Redux if Redux changes (e.g. after redirect)
    React.useEffect(() => {
        if(creationMethod === 'verified' && selectedMethod === 'verified') {
            dispatch(fetchVerifiedAccounts());
        }
        setSelectedMethod(creationMethod || null);
    }, [creationMethod, dispatch, selectedMethod]);

    const handleSelect = (method: string) => {
        setSelectedMethod(method);
        dispatch(updateBeneficiary({ field: 'creationMethod', value: method }));
    };

    const handleNext = () => {
        if (selectedMethod) {
            if (selectedMethod === 'upload') {
                router.push('/setup-and-admin/beneficiary/file-upload' as any);
            } else {
                router.push('/setup-and-admin/beneficiary/type' as any);
            }
        }
    };

    const handleCancel = () => {
        router.push('/setup-and-admin/beneficiary');
    }
    const creationOptions: CardSelectionOption[] = [
        {
            value: 'manual',
            label: 'Create manually',
            description: 'Optional concise description.',
            icon: FormFillIcon,
            iconSelected: CreateManuallyIcon
        },
        {
            value: 'verified',
            label: 'Create using a verified account',
            description: 'Optional concise description.',
            icon: ViewListIcon,
            iconSelected: ViewListIconWhite
        },
        {
            value: 'upload',
            label: 'File upload',
            description: 'Optional concise description.',
            icon: UploadIcon,
            iconSelected: UploadIconWhite
        }
    ];

    return (
        <>
            <Grid
                container
                spacing={2}
                padding={2}
                style={{ marginBottom: '20px' }}
                data-testid={buildTestId(testIdPrefix, 'page')}
            >
                <Grid size={12}>
                <div data-testid={buildTestId(testIdPrefix, 'breadcrumb')} style={{display:'contents'}}></div>
                    <Breadcrumb
                        
                        links={[
                            {
                                href: '/',
                                label: 'Dashboard'
                            },
                            {
                                href: '/setup-and-admin/beneficiary',
                                label: 'Beneficiaries'
                            },
                            {
                                href: '/setup-and-admin/beneficiary/create',
                                label: 'Select a creation method'
                            }
                        ]} />
                </Grid>
                <Grid size={12}>
                    <Heading data-testid={buildTestId(testIdPrefix, 'page-title')} as="h4" fontSize="28px">Select a creation method</Heading>
                    <p data-testid={buildTestId(testIdPrefix, 'page-description')}>Select a method for adding your new beneficiary / beneficiaries.</p>
                </Grid>
                <CardSelection
                    options={creationOptions}
                    selectedValue={selectedMethod}
                    onSelect={handleSelect}
                    testIdPrefix={buildTestId(testIdPrefix, 'options')}
                />
                <Grid sx={{ width: '100%' }}>
                    <FormActionButtons testIdPrefix={buildTestId(testIdPrefix, 'actions')} onCancel={handleCancel} onNext={handleNext} nextDisabled={!selectedMethod} />
                </Grid>
            </Grid>
        </>
    );
}
