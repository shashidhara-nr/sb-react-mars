'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';

import { Breadcrumb, Button, Heading } from 'dist/standard-bank-react';
import { Grid } from "@mui/material";
import { buildTestId } from 'src/utils/testIds';
import CreateManuallyIcon from 'public/icons/icn_account_tile_add.svg';
import FormFillIcon from 'public/icons/icn_account_tile_add_white.svg';
import ViewListIcon from 'public/icons/icn_account_tile_success.svg';
import ViewListIconWhite from 'public/icons/icn_account_tile_success_white.svg';
import UploadIcon from 'public/icons/icn_document_up.svg';
import UploadIconWhite from 'public/icons/icn_document_up_white.svg';
import ArrowIcon from 'public/icons/col-icon-left.svg';
import { updateDebtor, resetDebtor } from '@store/slices/createDebtorSlice';
import { RootState } from '@store/index';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import { FormActionButtons } from 'components/common/formActionButtons';
import { useTranslations } from 'next-intl';

export default function DebtorCreatePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
     const translateLang = useTranslations('debtorsHubData');
    const testIdPrefix = 'debtors-create';
    const creationMethod = useAppSelector((state) => state.createDebtor.debtor?.creationMethod);
    const [selectedMethod, setSelectedMethod] = React.useState<string | null>(creationMethod || null);

    // Reset debtor state when landing on create page to ensure fresh start
    React.useEffect(() => {
        dispatch(resetDebtor());
    }, [dispatch]);

    // Keep local state in sync with Redux if Redux changes (e.g. after redirect)
    React.useEffect(() => {
        setSelectedMethod(creationMethod || null);
    }, [creationMethod]);

    const handleSelect = (method: string) => {
        setSelectedMethod(method);
        dispatch(updateDebtor({ field: 'creationMethod', value: method }));
    };

  const handleNext = () => {
    if (selectedMethod === 'upload') {
      router.push('/setup-and-admin/debtors/file-upload' as any);
    } else {
      router.push('/setup-and-admin/debtors/details' as any);
    }
  };

  const handleCancel = () => {
    dispatch(resetDebtor());
    router.push('/setup-and-admin/debtors' as any);
  };
    const creationOptions: CardSelectionOption[] = [
        {
            value: 'manual',
            label: translateLang('manualTitle'),
            description: translateLang('manualDescription'),
            icon: CreateManuallyIcon,
            iconSelected: FormFillIcon
        },
        {
            value: 'verified',
            label: translateLang('verifiedTitle'),
            description: translateLang('verifiedDescription'),
            icon: ViewListIcon,
            iconSelected: ViewListIconWhite
        },
        {
            value: 'upload',
            label: translateLang('fileUploadTitle'),
            description: translateLang('fileUploadDescription'),
            icon: UploadIcon,
            iconSelected: UploadIconWhite
        }
    ];

    return (
        <>
            <Grid container spacing={4} padding={2} data-testid={buildTestId(testIdPrefix, 'page')}>
                <Grid size={12}>
                    <Breadcrumb
                        links={[
                            {
                                href: '/',
                                label: translateLang('breadcrumbDashboard')
                            },
                            {
                                href: '/setup-and-admin/debtors',
                                label: translateLang('breadcrumbDebtors')
                            },
                            {
                                href: '/setup-and-admin/debtors/create',
                                label: translateLang('breadcrumbSelectCreationMethod')
                            }
                        ]} />
                </Grid>
                <Grid size={12}>
                    <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>{translateLang('title')}</Heading>
                </Grid>
                <Grid container spacing={2} size={12} data-testid={buildTestId(testIdPrefix, 'cards')}>
                    <Grid size={12}>
                        <CardSelection 
                            options={creationOptions}
                            selectedValue={selectedMethod}
                            onSelect={handleSelect}
                            testIdPrefix={buildTestId(testIdPrefix, 'options')}
                        />
                    </Grid>
                    <Grid size={12}>
                        <FormActionButtons
                            testIdPrefix={buildTestId(testIdPrefix, 'actions')}
                            onCancel={handleCancel}
                            onNext={handleNext}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
