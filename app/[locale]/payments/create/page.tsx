'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { Grid } from "@mui/material";
import AfricaIcon from 'public/icons/africa.svg';
import GlobeIcon from 'public/icons/globe.svg';
import UploadIcon from 'public/icons/icn_upload.svg';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import { buildTestId } from 'src/utils/testIds';
import FormActionButtons from 'components/common/formActionButtons';

const testIdPrefix = 'payment-creation-method';

export default function PaymentCreatePage() {
    const router = useRouter();
    const t = useTranslations('payments');
    const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);

    const handleSelect = (method: string) => {
        setSelectedMethod(method);
    };

    const handleNext = () => {
        if (selectedMethod) {
            // TODO: Navigate to the appropriate next step based on selection
            if (selectedMethod === 'file-upload') {
                // router.push('/payments/file-upload' as any);
                console.log('Navigate to file upload');
            } else if (selectedMethod === 'domestic') {
                // router.push('/payments/domestic/details' as any);
                console.log('Navigate to domestic payment details');
            } else if (selectedMethod === 'international') {
                // router.push('/payments/international/details' as any);
                console.log('Navigate to international payment details');
            }
        }
    };

    const handleCancel = () => {
        router.push('/payments');
    }

    const creationOptions: CardSelectionOption[] = [
        {
            value: 'domestic',
            label: t('domesticPayment'),
            description: t('domesticPaymentDescription'),
            icon: AfricaIcon
        },
        {
            value: 'international',
            label: t('internationalPayment'),
            description: t('internationalPaymentDescription'),
            icon: GlobeIcon
        },
        {
            value: 'file-upload',
            label: t('fileUpload'),
            description: t('fileUploadDescription'),
            icon: UploadIcon
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
                    <div data-testid={buildTestId(testIdPrefix, 'breadcrumb')} style={{ display: 'contents' }}></div>
                    <Breadcrumb
                        links={[
                            {
                                href: '/',
                                label: t('dashboard')
                            },
                            {
                                href: '/payments',
                                label: t('payments')
                            },
                            {
                                href: '/payments/create',
                                label: t('selectCreationMethod')
                            }
                        ]}
                    />
                </Grid>
                <Grid size={12}>
                    <Heading
                        data-testid={buildTestId(testIdPrefix, 'page-title')}
                        as="h4"
                        fontSize="28px"
                    >
                        {t('paymentCreation')}
                    </Heading>
                    <p data-testid={buildTestId(testIdPrefix, 'page-description')}>
                        {t('supportingCopy')}
                    </p>
                </Grid>
                <CardSelection
                    options={creationOptions}
                    selectedValue={selectedMethod}
                    onSelect={handleSelect}
                    testIdPrefix={buildTestId(testIdPrefix, 'options')}
                />
                <Grid sx={{ width: '100%' }}>
                    <FormActionButtons
                        testIdPrefix={buildTestId(testIdPrefix, 'actions')}
                        onCancel={handleCancel}
                        onNext={handleNext}
                        nextDisabled={!selectedMethod}
                        showCancel={false}
                    />
                </Grid>
            </Grid>
        </>
    );
}
