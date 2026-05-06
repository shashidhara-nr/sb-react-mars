'use client';

import React from 'react';
import Image from 'next/image';
import { Box, useTheme } from '@mui/material';
import { Chip } from 'dist/standard-bank-react';
import IcnCheckNormal from 'public/icons/icn_check_normal.svg';

export interface UsageOption {
  label: string;
  value: string;
}

interface UsageChipsProps {
  options: UsageOption[];
  selectedValues: string[];
  onChange: (value: string) => void;
  checkIcon?: string;
  uncheckIcon?: string;
}
export const UsageChips = ({ 
  options,
  selectedValues, 
  onChange,
  checkIcon = IcnCheckNormal,
  uncheckIcon,
}: UsageChipsProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        
        return (
          <Chip
            key={option.value}
            labelText={option.label}
            avatarIcon={
              isSelected ? (
                <Image src={checkIcon} alt="check" width={16} height={16} />
              ) : uncheckIcon ? (
                <Image src={uncheckIcon} alt="close" width={16} height={16} />
              ) : undefined
            }
            onClick={() => onChange(option.value)}
            disabled={false}
            backgroundColor={
              isSelected ? theme.palette.secondary.main : theme.palette.common.white
            }
            textColor={
              isSelected ? theme.palette.common.white : theme.palette.secondary.main
            }
          />
        );
      })}
    </Box>
  );
};

export default UsageChips;
