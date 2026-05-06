'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { Breadcrumb, Button, Heading } from 'dist/standard-bank-react';
import { Grid } from '@mui/material';
const ResidentIndividualIcon = '/icons/icn_people_1_money.svg';
const ResidentIndividualIconWhite = '/icons/icn_people_1_money_white.svg';
const ResidentCompanyIcon = '/icons/icn_building.svg';
const ResidentCompanyIconWhite = '/icons/icn_building_white.svg';
const InternationalIcon = '/icons/icn_cash_international.svg';
const InternationalIconWhite = '/icons/icn_cash_international_white.svg';
const AfricaIcon = '/icons/icn_africa.svg';
const AfricaWhiteIcon = '/icons/icn_africa_white.svg';
const ArrowIcon = '/icons/col-icon-left.svg';
const ArrowIconBack = '/icons/col-icon-left-back.svg';
import { updateBeneficiary } from '@store/slices/createBeneficiarySlice';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import { buildTestId } from 'src/utils/testIds';
export default function BeneficiaryTypePage() {
    const testIdPrefix = 'beneficiary-type-selection';
    const router = useRouter();
    const dispatch = useAppDispatch();
    const beneficiaryType = useAppSelector((state) => state.createBeneficiary.beneficiary.beneficiaryType);
    const creationMethod = useAppSelector((state) => state.createBeneficiary.beneficiary.creationMethod);
    const [selectedType, setSelectedType] = React.useState<string | null>(beneficiaryType || null);

  React.useEffect(() => {
    setSelectedType(beneficiaryType || null);
  }, [beneficiaryType]);

  const handleSelect = (type: string) => {
    setSelectedType(type);
    dispatch(updateBeneficiary({ field: 'beneficiaryType', value: type }));
  };

  const handleNext = () => {
    if (selectedType) {
      router.push('/setup-and-admin/beneficiary/details' as any);
    }
  };

  const handleBackButtonClick = () => {
    router.push('/setup-and-admin/beneficiary/create');
  };

  const allTypeOptions: CardSelectionOption[] = [
    {
      value: 'Domestic Base',
      label: 'Domestic Base',
      description: 'Optional concise description.',
      icon: ResidentIndividualIcon,
      iconSelected: ResidentIndividualIconWhite,
    },
    {
      value: 'Company',
      label: 'Company',
      description: 'Optional concise description.',
      icon: ResidentCompanyIcon,
      iconSelected: ResidentCompanyIconWhite,
    },
    {
      value: 'Domestic FX and/or International',
      label: 'Domestic FX and/or International',
      description: 'Optional concise description.',
      icon: creationMethod === 'verified' ? AfricaIcon : InternationalIcon,
      iconSelected: creationMethod === 'verified' ? AfricaWhiteIcon : InternationalIconWhite,
    },
  ];

  const beneficiaryTypeOptions: CardSelectionOption[] =
    creationMethod === 'verified'
      ? allTypeOptions.filter((opt) => opt.value !== 'Company')
      : allTypeOptions;

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
          <Breadcrumb
            links={[
              {
                href: '/',
                label: 'Dashboard',
              },
              {
                href: '/setup-and-admin/beneficiary',
                label: 'Beneficiaries',
              },
              {
                href: '/setup-and-admin/beneficiary/create',
                label: 'Select a creation method',
              },
              {
                href: '/setup-and-admin/beneficiary/type',
                label: 'Select a beneficiary type',
              },
            ]}
          />
        </Grid>
        <Grid size={12}>
          <Heading as="h4" fontSize="28px">
            Select a beneficiary type
          </Heading>
          <p>This is the first step of the manual entry beneficiary creation flow.</p>
        </Grid>
        <CardSelection
          options={beneficiaryTypeOptions}
          selectedValue={selectedType}
          onSelect={handleSelect}
          testIdPrefix={buildTestId(testIdPrefix, 'options')}
        />
        <Grid
          size={12}
          sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}
        >
          <Button
            buttonVariant="text"
            onClick={handleBackButtonClick}
            data-testid={buildTestId(testIdPrefix, 'back-button')}
            startIcon={<Image src={ArrowIconBack} alt="Back" width={24} height={24} />}
            style={{ height: '48px', minHeight: '48px', width: '103px' }}
          >
            BACK
          </Button>
          <Button
            buttonVariant="primary"
            onClick={handleNext}
            data-testid={buildTestId(testIdPrefix, 'next-button')}
            disabled={!selectedType}
            startIcon={<Image src={ArrowIcon} alt="Next" width={24} height={24} />}
            style={{ height: '48px', minHeight: '48px', minWidth: '103px' }}
          >
            NEXT
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
