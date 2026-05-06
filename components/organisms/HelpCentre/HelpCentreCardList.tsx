'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import { buildTestId } from 'src/utils/testIds';
import ClipboardIcon from '../../../assets/icons/icn_clipboard.svg';
import ChevronLeftIcon from '../../../assets/icons/icn_chevron_left_color.svg';
import ChevronRightIcon from '../../../assets/icons/icn_chevron_right.svg';
import ExportIcon from '../../../public/icons/export.svg';
import HelpCentreCard from './HelpCentreCard';
import styles from './HelpCentre.module.scss';

interface CardData {
  id: string;
  breadcrumb: string;
  title: string;
  description: string;
  videoUrl?: string;
  videos?: Array<{ id: string; title: string; url: string }>;
}

interface HelpCentreCardListProps {
  title: string;
  cards: CardData[];
  category?: string;
}

const HelpCentreCardList = ({ title, cards, category }: HelpCentreCardListProps) => {
  const t = useTranslations('helpCentre');
  const testIdPrefix = 'help-centre-card-list';
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const [currentPage, setCurrentPage] = useState(1);

  // Responsive items per page: 1 on small screens, 2 on larger screens
  const itemsPerPage = isSmallScreen ? 1 : 2;

  // Reset to page 1 when screen size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(cards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCards = cards.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewAllClick = () => {
    // Convert category/title to URL slug
    const categorySlug = (category || title).toLowerCase().replace(/\s+/g, '-');
    
    // Get first video URL if available
    const firstVideoUrl = cards.length > 0 && cards[0].videoUrl ? cards[0].videoUrl : '';
    
    // Navigate to category details with first video as featured
    const queryParam = firstVideoUrl ? `?video=${encodeURIComponent(firstVideoUrl)}` : '';
    router.push(`/${locale}/help-centre/${categorySlug}${queryParam}`);
  };

  return (
    <Box className={styles.cardListContainer}>
      {/* Title Section */}
      <Box className={styles.cardListTitleSection}>
        <Image
          src={ClipboardIcon}
          alt="Clipboard"
          width={24}
          height={24}
          className={styles.cardListIcon}
        />
        <Typography className={styles.cardListTitle}>
          {title}
        </Typography>
      </Box>

      {/* Cards Grid */}
      <Grid className={styles.cardListGrid}>
        {currentCards.map((card) => (
          <Box key={card.id} className={styles.cardListCardWrapper}>
            <HelpCentreCard
              id={card.id}
              breadcrumb={card.breadcrumb}
              title={card.title}
              description={card.description}
              category={category || title}
              videoUrl={card.videoUrl}
              videos={card.videos}
            />
          </Box>
        ))}
      </Grid>

      {/* Pagination Section */}
      <Box className={styles.cardListPaginationSection} data-testid={buildTestId(testIdPrefix, 'pagination')} data-tour="card-list">
        {/* Pagination Info */}
        <Typography className={styles.cardListPaginationInfo} data-testid={buildTestId(testIdPrefix, 'text', 'pagination-info')}>
          {startIndex + 1}-{Math.min(endIndex, cards.length)} of {cards.length}
        </Typography>

        {/* Right Section: View All Link + Navigation */}
        <Box className={styles.cardListRightSection}>
        {/* View All Link */}
          <Box 
            className={styles.cardListViewAllLink}
            onClick={handleViewAllClick}
            data-testid={buildTestId(testIdPrefix, 'button', 'view-all')}
            sx={{ cursor: 'pointer' }}
          >
            <Typography className={styles.cardListLinkText}>
              {t('viewAllVideos', { count: cards.length }).toUpperCase()}
            </Typography>
            <Image
              src={ExportIcon}
              alt="Export"
              width={16}
              height={16}
              className={styles.cardListLinkIcon}
            />
          </Box>

          {/* Navigation Buttons */}
          <Box className={styles.cardListNavButtons}>
            <Box
              onClick={handlePrevious}
              data-testid={buildTestId(testIdPrefix, 'button', 'previous')}
              className={`${styles.cardListNavButton} ${currentPage === 1 ? styles.cardListDisabled : ''}`}
            >
              <Image
                src={ChevronLeftIcon}
                alt="Chevron Left"
                width={20}
                height={20}
                className={styles.cardListNavIcon}
              />
            </Box>
            <Box
              onClick={handleNext}
              data-testid={buildTestId(testIdPrefix, 'button', 'next')}
              className={`${styles.cardListNavButton} ${currentPage === totalPages ? styles.cardListDisabled : ''}`}
            >
              <Image
                src={ChevronRightIcon}
                alt="Chevron Right"
                width={20}
                height={20}
                className={styles.cardListNavIcon}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HelpCentreCardList;
