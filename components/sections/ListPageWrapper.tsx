'use client';

import { Grid, TextField, InputAdornment, Box } from '@mui/material';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import { CSSProperties, ReactNode, Ref } from 'react';
import SearchBar, { SearchOption } from 'components/common/SearchBar/SearchBar';
import styles from './ListPageWrapper.module.scss';
import { buildTestId } from 'src/utils/testIds';

type BreadcrumbLink = {
  href: string;
  label: string;
};

type ListPageWrapperProps = {
  breadcrumbLinks: BreadcrumbLink[];
  title: string;
  action?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchIcon?: ReactNode;
  searchClearIcon?: ReactNode;
  onSearchClear?: () => void;
  containerSpacing?: number;
  containerPaddingBottom?: number | string;
  titleFontSize?: string;
  titleMinHeight?: string;
  contentRef?: Ref<HTMLDivElement>;
  testIdPrefix?: string;
  children: ReactNode;

  searchBar?: boolean | {
    searchTypeOptions?: SearchOption[];
    searchTypePlaceholder?: string;
    searchFieldType?: 'input' | 'dropdown';
    searchFieldOptions?: SearchOption[];
    searchFieldPlaceholder?: string;
    searchFieldPlaceholderMap?: Record<string, string>;
    onSearch?: (searchType: string, searchValue: string) => void;
    onClear?: () => void;
    searchType?: string;
    searchValue?: string;
    onSearchTypeChange?: (value: string) => void;
    onSearchValueChange?: (value: string) => void;
    disabled?: boolean;
  };
};

const ListPageWrapper = ({
  breadcrumbLinks,
  title,
  action,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchIcon,
  searchClearIcon,
  onSearchClear,
  containerSpacing = 2,
  containerPaddingBottom = 2,
  titleFontSize = '24px',
  titleMinHeight = '40px',
  contentRef,
  testIdPrefix = 'list-page',
  children,
  searchBar,
}: ListPageWrapperProps) => {
  const containerStyle: CSSProperties = {
    ['--list-page-container-pb' as string]:
      typeof containerPaddingBottom === 'number'
        ? `${containerPaddingBottom * 8}px`
        : containerPaddingBottom,
  };

  const headerStyle: CSSProperties = {
    ['--list-page-title-min-height' as string]: titleMinHeight,
  };

  return (
    <Grid
      container
      spacing={containerSpacing}
      className={styles.container}
      style={containerStyle}
      data-testid={buildTestId(testIdPrefix, 'container')}
    >
      <Grid
        size={12}
        className={styles.breadcrumbRow}
        data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
      >
        <Breadcrumb links={breadcrumbLinks} />
      </Grid>
      <Grid
        size={12}
        className={styles.headerRow}
        style={headerStyle}
        data-testid={buildTestId(testIdPrefix, 'header')}
      >
        <Heading as="h4" fontSize={titleFontSize}>
          {title}
        </Heading>
        {action}
      </Grid>
      {!searchBar && searchPlaceholder && (
        <Grid size={12} className={styles.searchRow} data-testid={buildTestId(testIdPrefix, 'search')}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            InputProps={{
              ...(searchIcon
                ? {
                    startAdornment: (
                      <InputAdornment position="start">{searchIcon}</InputAdornment>
                    ),
                  }
                : {}),
              ...(searchClearIcon && searchValue
                ? {
                    endAdornment: (
                      <InputAdornment 
                        position="end" 
                        onClick={onSearchClear}
                        sx={{ cursor: 'pointer' }}
                      >
                        {searchClearIcon}
                      </InputAdornment>
                    ),
                  }
                : {}),
            }}
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'search-input-element'),
            }}
            className={styles.searchField}
            data-testid={buildTestId(testIdPrefix, 'search-input')}
          />
        </Grid>
      )}
      {searchBar && (
        <Grid size={12} data-testid={buildTestId(testIdPrefix, 'enhanced-search')}>
          <Box sx={{ mb: 3 }}>
            <SearchBar
              {...(typeof searchBar === 'object' ? searchBar : {})}
              testIdPrefix={buildTestId(testIdPrefix, 'search-bar')}
            />
          </Box>
        </Grid>
      )}
      <Grid
        size={12}
        ref={contentRef}
        className={styles.content}
        data-testid={buildTestId(testIdPrefix, 'content')}>

          {children}
        </Grid>
    </Grid>
  );
}
export default ListPageWrapper;
