'use client';

import React from 'react';
import { Box } from '@mui/material';

export interface PhoneDetailField {
  name: string;
  label: string;
  placeholder?: string;
  value: any;
  type?: 'phone' | 'email' | 'text';
  required?: boolean;
  visible?: boolean;
  defaultCountry?: string;
  usageOptions?: Array<{ label: string; value: string }>;
  selectedUsage?: string[];
  onUsageChange?: (usage: string) => void;
  component?: React.ReactNode;
  usageComponent?: React.ReactNode;
}

interface PhoneDetailsProps {
  fields: PhoneDetailField[];
  onChange: (name: string, value: any) => void;
}

export const PhoneDetails = ({ fields, onChange }: PhoneDetailsProps) => {
  const visibleFields = fields.filter(field => field.visible !== false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {visibleFields.map((field) => {
        return (
          <Box
            key={field.name}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              alignItems: 'flex-end',
              boxSizing: 'border-box',
              '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
              '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                top: '50%',
                transform: 'translateY(-50%)',
                left: '14px',
              },
              '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                top: '0px',
                left: '0px',
              },
            }}
          >
            {/* Custom component or default rendering */}
            {field.component}
            
            {/* Usage options rendered as custom component */}
            {field.usageComponent}
          </Box>
        );
      })}
    </Box>
  );
};

export default PhoneDetails;
