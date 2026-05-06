'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import Image from 'next/image';
import SelectField from 'components/atoms/Select/Select';
import Textfield from 'components/atoms/Textfield/Textfield';
import SearchIcon from 'public/icons/icn_search_blue.svg';
import CloseCircleIcon from 'public/icons/icn_close_circle.svg';
import { buildTestId } from 'src/utils/testIds';
import styles from './SearchBar.module.scss';

export interface SearchOption {
  label: string;
  value: string;
}

interface ValidationErrors {
  searchType: string;
  searchValue: string;
}


const DEFAULT_SEARCH_OPTIONS: SearchOption[] = [
  { label: 'Name', value: 'name' },
  { label: 'ID', value: 'id' },
  { label: 'Code', value: 'code' },
];

export interface SearchBarProps {
  searchTypeOptions?: SearchOption[];
  searchTypePlaceholder?: string;
  searchFieldType?: 'input' | 'dropdown';
  searchFieldOptions?: SearchOption[];
  searchFieldPlaceholder?: string;
  searchFieldPlaceholderMap?: Record<string, string>;
  onSearch?: (searchType: string, searchValue: string) => void;
  onClear?: () => void;
  className?: string;
  testIdPrefix?: string;
  searchType?: string;
  searchValue?: string;
  onSearchTypeChange?: (value: string) => void;
  onSearchValueChange?: (value: string) => void;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTypeOptions = DEFAULT_SEARCH_OPTIONS,
  searchTypePlaceholder = 'Select search type',
  searchFieldType = 'input',
  searchFieldOptions = [],
  searchFieldPlaceholder = 'Enter value',
  searchFieldPlaceholderMap,
  onSearch = () => {},
  onClear,
  className = '',
  testIdPrefix = 'search-bar',
  searchType: controlledSearchType,
  searchValue: controlledSearchValue,
  onSearchTypeChange,
  onSearchValueChange,
  disabled = false,
}) => {
  const t = useTranslations('common');
  const [internalSearchType, setInternalSearchType] = useState('');
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({
    searchType: '',
    searchValue: '',
  });

  const isControlled = controlledSearchType !== undefined;
  const searchType = isControlled ? controlledSearchType : internalSearchType;
  const searchValue = controlledSearchValue !== undefined ? controlledSearchValue : internalSearchValue;

  const clearErrors = useCallback((field: keyof ValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // Clear errors when component is disabled
  useEffect(() => {
    if (disabled) {
      setErrors({ searchType: '', searchValue: '' });
    }
  }, [disabled]);

  // Clear search value error when field becomes disabled (no search type selected)
  useEffect(() => {
    if (!searchType) {
      setErrors((prev) => ({ ...prev, searchValue: '' }));
    }
  }, [searchType]);

  const handleClear = useCallback(() => {
    // Clear internal state if uncontrolled
    if (!isControlled) {
      setInternalSearchType('');
      setInternalSearchValue('');
    }
    // Clear errors
    setErrors({ searchType: '', searchValue: '' });
    // Call parent clear callback if provided
    if (onClear) {
      onClear();
    }
  }, [isControlled, onClear]);

  const handleSearchTypeChange = useCallback(
    (_name: string, value: string | number) => {
      const stringValue = String(value);

      if (isControlled && onSearchTypeChange) {
        onSearchTypeChange(stringValue);
      } else {
        setInternalSearchType(stringValue);
      }

      if (stringValue) {
        clearErrors('searchType');
      }

      // Clear search value and its error when type changes
      if (controlledSearchValue !== undefined && onSearchValueChange) {
        onSearchValueChange('');
      } else {
        setInternalSearchValue('');
      }
      clearErrors('searchValue');
    },
    [isControlled, onSearchTypeChange, controlledSearchValue, onSearchValueChange, clearErrors]
  );

  const handleSearchValueChange = useCallback(
    (_name: string, value: string | number) => {
      const stringValue = String(value);

      if (controlledSearchValue !== undefined && onSearchValueChange) {
        onSearchValueChange(stringValue);
      } else {
        setInternalSearchValue(stringValue);
      }

      if (stringValue) {
        clearErrors('searchValue');
      } else {
        // If value is cleared via backspace (empty string), trigger full clear
        handleClear();
      }
    },
    [controlledSearchValue, onSearchValueChange, clearErrors, handleClear]
  );

  const validateAndSubmit = useCallback(() => {
    if (disabled) return;

    const newErrors: ValidationErrors = {
      searchType: !searchType ? 'Required' : '',
      // Only validate search value if search type is selected (field is enabled)
      searchValue: searchType && !searchValue ? 'Required' : '',
    };

    setErrors(newErrors);

    if (!newErrors.searchType && !newErrors.searchValue) {
      onSearch(searchType, searchValue);
    }
  }, [searchType, searchValue, onSearch, disabled]);

  const isFieldDisabled = disabled || !searchType;
  const fieldClassName = useMemo(
    () => `${styles.searchField} ${!searchType ? styles.searchFieldDisabled : ''}`,
    [searchType]
  );

  // Compute dynamic placeholder based on search type
  const dynamicPlaceholder = useMemo(() => {
    if (!searchType) return searchFieldPlaceholder;
    return searchFieldPlaceholderMap?.[searchType] || searchFieldPlaceholder;
  }, [searchType, searchFieldPlaceholder, searchFieldPlaceholderMap]);

  return (
    <Box
      className={`${styles.searchBarContainer} ${className}`}
      data-testid={buildTestId(testIdPrefix, 'container')}
    >
      <Box className={styles.searchTypeDropdown}>
        <SelectField
          name="searchType"
          label={searchTypePlaceholder}
          value={searchType}
          onChange={handleSearchTypeChange}
          options={searchTypeOptions}
          disabled={disabled}
          height="48px"
          error={!disabled && !!errors.searchType}
          helperText={!disabled ? errors.searchType : ''}
          dataTestId={buildTestId(testIdPrefix, 'search-type')}
        />
      </Box>

      <Box className={fieldClassName}>
        {searchFieldType === 'input' ? (
          <>
            <Textfield
              name="searchValue"
              label={dynamicPlaceholder}
              value={searchValue}
              onChange={handleSearchValueChange}
              disabled={isFieldDisabled}
              error={!disabled && !isFieldDisabled && !!errors.searchValue}
              helperText={!disabled && !isFieldDisabled ? errors.searchValue : ''}
              dataTestId={buildTestId(testIdPrefix, 'search-value-input')}
            />
            {searchValue && !isFieldDisabled && (
              <button
                onClick={handleClear}
                className={styles.clearButton}
                data-testid={buildTestId(testIdPrefix, 'clear-button')}
                type="button"
              >
                <Image src={CloseCircleIcon} alt="clear" width={24} height={24} />
              </button>
            )}
          </>
        ) : (
          <SelectField
            name="searchValue"
            label={dynamicPlaceholder}
            value={searchValue}
            onChange={handleSearchValueChange}
            options={searchFieldOptions}
            disabled={isFieldDisabled}
            height="48px"
            error={!disabled && !isFieldDisabled && !!errors.searchValue}
            helperText={!disabled && !isFieldDisabled ? errors.searchValue : ''}
            dataTestId={buildTestId(testIdPrefix, 'search-value-dropdown')}
          />
        )}
      </Box>

      <Box className={styles.searchButton}>
        <Button
          buttonVariant="secondary"
          onClick={validateAndSubmit}
          disabled={disabled}
          startIcon={<Image src={SearchIcon} alt="search" width={24} height={24} />}
          data-testid={buildTestId(testIdPrefix, 'search-button')}
        >
          {t('search')}
        </Button>
      </Box>
    </Box>
  );
};

export default SearchBar;
