'use client';

import GridIcon from 'public/icons/icn_view_grid.svg';
import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import { Select, Button } from 'dist/standard-bank-react';
import { Box } from '@mui/material';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { updateBeneficiary } from '@store/slices/createBeneficiarySlice';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { buildTestId } from 'src/utils/testIds';
import { useState } from 'react';

interface EntityCategoryProps {
  onNext?: () => void;
  onCancel?: () => void;
  step?: number;
  entityCategory?: string;
}

function EntityCategory({ onNext, onCancel, step, entityCategory }: EntityCategoryProps) {
  const dispatch = useAppDispatch();
  const beneficiary = useAppSelector((state) => state.createBeneficiary.beneficiary);
  const [showValidationError, setShowValidationError] = useState(false);

  const handleChange = (field: string, value: any) => {
    dispatch(updateBeneficiary({ field, value }));
    setShowValidationError(false);
  };

  const handleNextClick = () => {
    if (!beneficiary.entityCategory) {
      setShowValidationError(true);
      return;
    }
    onNext?.();
  };

  return (
    <Box data-testid={buildTestId('beneficiary-entity-category', 'container')}>
      <UserCard
        title={'Entity category'}
        icon={<Image src={GridIcon} alt="Grid Icon" />}
        testId={buildTestId('beneficiary-entity-category', 'card')}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            marginTop: '36px',
            marginBottom: '20px',
            marginLeft: '5px',
          }}
        >
          <Box
            data-testid={buildTestId('beneficiary-entity-category', 'entity-select')}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              '& .MuiFormControl-root': {
                height: '48px !important',
                margin: '0 !important',
              },
              '& .MuiInputBase-root, & .MuiOutlinedInput-root': {
                height: '48px !important',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px !important',
              },
              '& .MuiSelect-select': {
                height: '48px !important',
                lineHeight: '48px !important',
                padding: '0 14px !important',
                boxSizing: 'border-box',
              },
              '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                top: '45% !important',
                transform: 'translateY(-50%) !important',
                left: '14px !important',
              },
              '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                top: '0px !important',
                left: '1px !important',
              },
            }}
          >
            {/** Entity Category Select with inline error and gating */}
            <Select
              formOptions={{
                sx: {
                  minWidth: '100%',
                  '& .MuiFormHelperText-root': {
                    fontSize: '12px',
                    lineHeight: 1,
                    color: (theme: any) => theme.palette.error.main,
                    marginLeft: '14px',
                    marginTop: '4px',
                  },
                },
              }}
              options={[
                { label: 'Individual', value: 'Individual' },
                { label: 'Entity', value: 'Entity' },
                { label: 'Not applicable', value: 'Not applicable' },
              ]}
              selectProps={{
                label: 'Entity category*',
                required: true,
                labelId: 'entity-category-select',
                onChange: (e: any) => handleChange('entityCategory', e.target.value),
              }}
              name="entityCategory"
              value={beneficiary.entityCategory || ''}
              error={showValidationError && !beneficiary.entityCategory}
              helperText={showValidationError && !beneficiary.entityCategory ? 'Entity category is required' : ''}
              height="52px"
            />
          </Box>
        </Box>
      </UserCard>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          mt: '20px',
          mb: '20px',
        }}
      >
        <Button
          buttonVariant="text"
          onClick={onCancel}
          data-testid={buildTestId('beneficiary-entity-category', 'cancel-button')}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px' , width:'112px'}}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleNextClick}
          data-testid={buildTestId('beneficiary-entity-category', 'next-button')}
          startIcon={<ArrowForwardIcon />}
          disabled={false}
          style={{ height: '48px', minHeight: '48px' , width:'103px'}}
        >
          NEXT
        </Button>
      </Box>
    </Box>
  );
}

export default EntityCategory;
