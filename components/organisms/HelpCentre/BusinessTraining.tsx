'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Box, TextField, InputAdornment } from '@mui/material';
import Image from 'next/image';
import SearchIcon from '../../../public/icons/icn_search_black.svg';
import Tag from 'components/atoms/Tag/index';
import HelpCentreCardList from './HelpCentreCardList';
import { buildTestId } from 'src/utils/testIds';
import styles from './HelpCentre.module.scss';
import helpCentreCardsData from 'lib/mock/helpCentreData.json';

const BusinessTraining = () => {
  const t = useTranslations('helpCentre');
  const testIdPrefix = 'business-training';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  }, []);

  const handleCategoryDelete = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  }, []);

  return (
    <Box className={styles.trainingContainer}>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('searchTraining')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid={buildTestId(testIdPrefix, 'input', 'search')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Image
                  src={SearchIcon}
                  alt="Search"
                  width={23}
                  height={23}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: '#F8F8FA',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': {
                borderColor: '#E0E0E0',
              },
              '&:hover fieldset': {
                borderColor: '#0051FF',
              },
            },
          }}
        />
      </Box>

      {/* Category Filter Tags */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }} data-testid={buildTestId(testIdPrefix, 'tags', 'category')} data-tour="category-tags">
        {helpCentreCardsData.categories.map((category) => (
          <Tag
            key={category.id}
            label={category.label}
            isSelected={selectedCategories.includes(category.id)}
            onClick={() => handleCategoryToggle(category.id)}
            onDelete={() => handleCategoryDelete(category.id)}
            data-testid={buildTestId(testIdPrefix, 'tag', category.id)}
          />
        ))}
      </Box>

      {/* Help Centre Cards with Pagination for All Categories */}
      <Box>
        {helpCentreCardsData.categories
          .filter((category) => selectedCategories.length === 0 || selectedCategories.includes(category.id))
          .map((category) => {
            const filteredCards = (helpCentreCardsData.data[category.label as keyof typeof helpCentreCardsData.data] || [])
              .filter((card) => card.title.toLowerCase().includes(searchQuery.toLowerCase()));
            
            return filteredCards.length > 0 ? (
              <HelpCentreCardList
                key={category.id}
                title={category.label}
                cards={filteredCards}
                category={category.label}
              />
            ) : null;
          })}
      </Box>
    </Box>
  );
};

export default BusinessTraining;
