'use client';

import Image from 'next/image';
import { Box } from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import ArrowIcon from 'public/icons/col-icon-left.svg';
import IcnBin from 'public/icons/icn_bin.svg';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';
import React from 'react';

interface FormActionButtonsProps {
  onCancel?: () => void;
  onNext?: () => void;
  cancelText?: string;
  nextText?: string;
  cancelIcon?: string;
  nextIcon?: string;
  showCancel?: boolean;
  showNext?: boolean;
  cancelWidth?: string;
  nextWidth?: string;
  nextButtonVariant?: 'primary' | 'secondary' | 'tertiary';
  nextButtonWidth?: string;
  nextButtonHeight?: string;
  useDeleteIcon?: boolean;
  disabled?: boolean;
  nextDisabled?: boolean;
  testIdPrefix?: string;
  children?: React.ReactNode;
  nextStartIcon?: React.ReactNode;
}

export const FormActionButtons = ({
  onCancel,
  onNext,
  cancelText = 'CANCEL',
  nextText = 'NEXT',
  cancelIcon = IcnCloseIcon,
  nextIcon = ArrowIcon,
  showCancel = true,
  showNext = true,
  cancelWidth = 'auto',
  nextWidth = 'auto',
  nextButtonVariant = 'primary',
  nextButtonWidth,
  nextButtonHeight,
  useDeleteIcon = false,
  disabled = false,
  nextDisabled,
  testIdPrefix = 'form-actions',
  children = null,
  nextStartIcon,
}: FormActionButtonsProps) => {
  const translateLang = useTranslations('debtorsHubData');
  const iconToUse = useDeleteIcon ? IcnBin : nextIcon;
  const isNextDisabled = nextDisabled ?? disabled;
  return (
    <Box
      data-testid={buildTestId(testIdPrefix, 'container')}
      sx={{
        display: 'flex',
        justifyContent: showCancel ? 'space-between' : 'flex-end',
        alignItems: 'center',
        gap: '12px',
        mt: '20px',
      }}
    >
      {showCancel && cancelText !== '' && (
        <Button
          buttonVariant="text"
          data-testid={buildTestId(testIdPrefix, 'cancel-button')}
          sx={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#0051FF',
            textTransform: 'uppercase',
            width: cancelWidth,
            minWidth: '112px',
            height: '48px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            letterSpacing: '0.4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 16px',
            opacity: disabled ? 0.5 : 1,
          }}
          onClick={onCancel}
          disabled={disabled}
          startIcon={
            <Image
              src={cancelIcon}
              alt={translateLang('cancel').toLowerCase()}
              width={20}
              height={20}
            />
          }
          style={{ height: '48px', minHeight: '48px' }}
        >
          {cancelText}
        </Button>
      )}
      <Box>
        {children}
        {showNext && (
          <Button
            buttonVariant={nextButtonVariant}
            data-testid={buildTestId(testIdPrefix, 'next-button')}
            sx={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              backgroundColor: nextButtonVariant === 'primary' ? '#0051FF' : undefined,
              color: nextButtonVariant === 'primary' ? '#fff' : undefined,
              borderRadius: '4px',
              cursor: isNextDisabled ? 'not-allowed' : 'pointer',
              letterSpacing: '0.4px',
              width: nextButtonWidth || nextWidth,
              minWidth: nextButtonWidth ? nextButtonWidth : '103px',
              padding: '0 16px',
              opacity: isNextDisabled ? 0.5 : 1,
            }}
            onClick={onNext}
            disabled={isNextDisabled}
            startIcon={
              nextStartIcon || (
                <Image
                  src={iconToUse}
                  alt={translateLang('next').toLowerCase()}
                  width={24}
                  height={24}
                />
              )
            }
            style={{
              height: nextButtonHeight || '48px',
              minHeight: nextButtonHeight || '48px',
              width: nextButtonWidth || nextWidth,
            }}
          >
            {nextText}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FormActionButtons;
