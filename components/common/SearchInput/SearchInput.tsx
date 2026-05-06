import React from 'react';
import { TextField, MenuItem, SxProps, Theme } from '@mui/material';
import { buildTestId } from 'src/utils/testIds';

export interface SearchInputProps {
  rules: { label: string; value: string }[];
  selectedRule: string;
  onRuleChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  sx?: SxProps<Theme>;
  style?: React.CSSProperties;
  className?: string;
  size?: 'small' | 'medium';
  testIdPrefix?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  rules,
  selectedRule,
  onRuleChange,
  placeholder = 'Select an option',
  label,
  sx,
  style,
  className,
  size = 'small',
  testIdPrefix = 'search-input',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRuleChange(event.target.value);
  };

  return (
    <TextField
      select
      fullWidth
      value={selectedRule}
      onChange={handleChange}
      placeholder={placeholder}
      label={label || placeholder}
      size={size}
      className={className}
      style={style}
      data-testid={buildTestId(testIdPrefix, 'dropdown')}
      sx={[
        {
          '& .MuiInputBase-root': {
            backgroundColor: '#ffffff',
            borderRadius: '8px',
          },
          '& .MuiInputBase-input': {
            color: '#000000 !important',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <MenuItem value="" data-testid={buildTestId(testIdPrefix, 'menu-item-default')}>
        <em>{placeholder}</em>
      </MenuItem>
      {rules.map(rule => (
        <MenuItem 
          key={rule.value} 
          value={rule.value}
          data-testid={buildTestId(testIdPrefix, 'menu-item', rule.value)}
        >
          {rule.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SearchInput;
 