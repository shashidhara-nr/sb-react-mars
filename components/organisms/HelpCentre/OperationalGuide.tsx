'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';
import styles from './OperationalGuide.module.scss';

const OperationalGuide = () => {
  const t = useTranslations('helpCentre');
  const testIdPrefix = 'operational-guide';

  const operationalGuide = {
    title: t('operationalGuideTitle'),
    description: t('operationalGuideDescription'),
    thumbnail: '/icons/operational-guide-thumbnail.svg',
  };

  return (
    <Box className={styles.operationalGuideContainer}>
      <Box className={styles.operationalGuideCard}>
        <Box className={styles.operationalGuideCardInner}>
          {/* Left: Thumbnail Image */}
          <Box className={styles.operationalGuideThumbnail}>
            <img
              src={operationalGuide.thumbnail}
              alt="Electronic Banking Operational Guide"
            />
          </Box>

          {/* Right: Text Content */}
          <Box className={styles.operationalGuideContent}>
            <Typography className={styles.operationalGuideTitle}>
              {operationalGuide.title}
            </Typography>
            <Tooltip title={operationalGuide.description} arrow>
              <Typography className={styles.operationalGuideDescription}>
                {operationalGuide.description}
              </Typography>
            </Tooltip>
            <Box className={styles.operationalGuideButtonContainer}>
              <Box 
                className={styles.operationalGuideButton}
                data-testid={buildTestId(testIdPrefix, 'button', 'download')}
              >
                <Typography>{t('download').toUpperCase()}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OperationalGuide;
