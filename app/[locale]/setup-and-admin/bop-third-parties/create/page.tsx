'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Grid } from '@mui/material';
import { Breadcrumb, Button, Heading } from 'dist/standard-bank-react';
import { useDispatch } from 'react-redux';
import { resetBopThirdParty } from '@store/slices/bopThirdPartySlice';

import { buildTestId } from 'src/utils/testIds';
import { ArrowIcon, UserIcon, BuildingIcon, CloseIcon } from '@lib/icons';
import { CardSelection, CardSelectionOption } from 'components/common/creationMethod';
import { bopThirdPartiesUrl, getBreadcrumbLinks } from '../bopThirdPartyHelper';

export default function BopThirdPartyCreatePage() {
  const router = useRouter();
  const t = useTranslations('bopThirdParties');
  const dispatch = useDispatch();
  
  const testIdPrefix = 'bop-third-parties-create';
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const creationOptions: CardSelectionOption[] = useMemo(
    () => [
      {
        value: 'individual',
        label: t('individualThirdPartyLabel'),
        description: t('optionalDescription'),
        icon: UserIcon,
      },
      {
        value: 'entity',
        label: t('entityThirdPartyLabel'),
        description: t('optionalDescription'),
        icon: BuildingIcon,
      },
    ],
    [t]
  );

  const handleSelect = useCallback((method: string) => {
    setSelectedMethod(method);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedMethod) {
      dispatch(resetBopThirdParty());
      router.push(`${bopThirdPartiesUrl.details}?type=${selectedMethod}`);
    }
  }, [selectedMethod, router, dispatch]);

  return (
    <Grid container spacing={4} padding={2}>
      <Grid size={12}>
        <Breadcrumb 
          data-testid={buildTestId(testIdPrefix, 'breadcrumb')} 
          links={getBreadcrumbLinks('create', t)} 
        />
      </Grid>

      <Grid size={12}>
        <Heading as="h4" fontSize="28px">
          {t('createPageTitle')}
        </Heading>
      </Grid>

      <Grid size={12}>
        <Heading 
          as="h6" 
          fontSize="14px" 
          style={{ 
            fontWeight: 400, 
            color: 'text.secondary' 
          }}
        >
          {t('supportingCopyOptional')}
        </Heading>
      </Grid>

      <Grid container spacing={2} size={12}>
        <Grid size={12}>
          <CardSelection
            testIdPrefix={`${testIdPrefix}-card-selection`}
            options={creationOptions}
            selectedValue={selectedMethod}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid 
          size={12} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button
            buttonVariant="tertiary"
            data-testid={buildTestId(testIdPrefix, 'button-cancel')}
            onClick={() => router.push(bopThirdPartiesUrl.home as string)}
            aria-label={t('cancelButton')}
            startIcon={
              <Image 
                src={CloseIcon} 
                alt="" 
                width={20} 
                height={20} 
                aria-hidden="true"
              />
            }
          >
            {t('cancelButton')}
          </Button>
          
          <Button
            buttonVariant="primary"
            data-testid={buildTestId(testIdPrefix, 'button-next')}
            onClick={handleNext}
            disabled={!selectedMethod}
            aria-label={t('nextButtonUpper')}
            startIcon={
              <Image 
                src={ArrowIcon} 
                alt="" 
                width={20} 
                height={20} 
                aria-hidden="true"
              />
            }
          >
            {t('nextButtonUpper')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
