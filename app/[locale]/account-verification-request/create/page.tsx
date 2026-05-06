'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { Breadcrumb, Button, Heading } from 'dist/standard-bank-react';
import { Grid } from "@mui/material";
import { buildTestId } from 'src/utils/testIds';
import { updateVerificationRequest } from '@store/slices/createAccountVerificationRequestSlice';
import { RootState } from '@store/index';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import { useTranslations } from 'next-intl';
import ArrowIcon from 'public/icons/col-icon-left.svg';


export default function AccountVerificationRequestCreatePage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const t = useTranslations('accountVerificationRequest');
    const testIdPrefix = 'account-verification-request-create';
    
    const serviceType = useSelector((state: RootState) => state.createAccountVerificationRequest.verificationRequest?.serviceType);
    const [selectedMethod, setSelectedMethod] = React.useState<string | null>(serviceType || null);

    React.useEffect(() => {
        setSelectedMethod(serviceType || null);
    }, [serviceType]);

    const handleSelect = (method: string) => {
        setSelectedMethod(method);
        dispatch(updateVerificationRequest({ field: 'serviceType', value: method }));
    };

    const handleNext = () => {
        if (selectedMethod === 'single') {
            router.push('/account-verification-request/create/details' as any);
        } else if (selectedMethod === 'batch') {
            router.push('/account-verification-request/create/batch' as any);
        }
    };

    const creationOptions: CardSelectionOption[] = [
        {
            value: 'single',
            label: 'Single immediate response',
            description: 'Optional comma-separated list',
            icon: '/icons/icn_account_tile_add.svg' as any,
            iconSelected: '/icons/icn_account_tile_add_white.svg' as any
        },
        {
            value: 'batch',
            label: 'Batch delayed response',
            description: 'Optional comma-separated list',
            icon: '/icons/icn_document_up.svg' as any,
            iconSelected: '/icons/icn_document_up_white.svg' as any
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
                                label: t('dashboard')
                            },
                            {
                                href: '/account-verification-request',
                                label: t('accountVerificationRequest')
                            },
                            {
                                href: '/account-verification-request/create',
                                label: t('verificationRequestServiceType')
                            }
                        ]} />
                </Grid>
                <Grid size={12}>
                    <Heading as="h4" fontSize="28px" data-testid={buildTestId(testIdPrefix, 'heading')}>
                        Verification request service type
                    </Heading>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Supporting copy (optional)</p>
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
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            buttonVariant="primary"
                            onClick={handleNext}
                            startIcon={<Image src={ArrowIcon} alt="Next" width={20} height={20} />}
                            data-testid={buildTestId(testIdPrefix, 'next-button')}
                            sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}
                        >
                            {t('next')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
