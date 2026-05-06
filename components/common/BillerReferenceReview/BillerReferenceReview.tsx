'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { buildTestId } from 'src/utils/testIds';

export interface ReferenceSection {
  typeId: string;
  typeName: string;
  value: string;
  isDynamic: boolean;
}

export interface BillerReferenceReviewProps {
  // Title and Icon
  title: string;
  icon: any;
  iconAlt?: string;
  
  // Data
  activeSections: ReferenceSection[];
  
  // Translation function
  t: (key: string) => string;
  
  // Style classes
  styles: {
    reviewSectionBox?: string;
    referenceReviewCard?: string;
    referenceReviewHeader?: string;
    referenceIconBox?: string;
    referenceReviewTitle?: string;
    referenceReviewLabel?: string;
    referenceReviewValue?: string;
    referenceReviewEmptyState?: string;
  };
  
  // Optional customization
  emptyStateMessage?: string;
  testIdPrefix?: string;
}

export const BillerReferenceReview = ({
  title,
  icon,
  iconAlt = 'reference icon',
  activeSections,
  t,
  styles,
  emptyStateMessage,
  testIdPrefix = 'biller-reference-review',
}: BillerReferenceReviewProps) => {
  return (
    <Box className={styles.reviewSectionBox} data-testid={buildTestId(testIdPrefix, 'container')}>
      <Box className={styles.referenceReviewCard}>
        <Box className={styles.referenceReviewHeader} data-testid={buildTestId(testIdPrefix, 'header')}>
          <Box className={styles.referenceIconBox}>
            <Image src={icon} alt={iconAlt} width={28} height={28} />
            <Typography className={styles.referenceReviewTitle}>
              {title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ padding: '12px' }} data-testid={buildTestId(testIdPrefix, 'content')}>
          {activeSections.length > 0 ? (
            activeSections.map((section, index) => {
              const displayValue = section.value || '-';
              const dynamicValue = section.isDynamic ? t('valueDynamicYes') : t('valueDynamicNo');
              return (
                <Box 
                  key={`review-ref-${section.typeId}`} 
                  sx={{ mb: 3 }}
                  data-testid={buildTestId(testIdPrefix, 'section', section.typeId)}
                >
                  {/* Header Row */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', mb: 1 }}>
                    <Typography variant="body2" className={styles.referenceReviewLabel}>
                      Reference Name
                    </Typography>
                    <Typography variant="body2" className={styles.referenceReviewLabel}>
                      Reference
                    </Typography>
                    <Typography variant="body2" className={styles.referenceReviewLabel}>
                      Dynamic Reference
                    </Typography>
                  </Box>
                  
                  {/* Data Row */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <Typography 
                      className={styles.referenceReviewValue}
                      data-testid={buildTestId(testIdPrefix, 'name', section.typeId)}
                    >
                      {section.typeName}
                    </Typography>
                    <Typography 
                      className={styles.referenceReviewValue}
                      data-testid={buildTestId(testIdPrefix, 'value', section.typeId)}
                    >
                      {displayValue}
                    </Typography>
                    <Typography 
                      className={styles.referenceReviewValue}
                      data-testid={buildTestId(testIdPrefix, 'dynamic', section.typeId)}
                    >
                      {dynamicValue}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Box className={styles.referenceReviewEmptyState} data-testid={buildTestId(testIdPrefix, 'empty-state')}>
              <Typography variant="body2" className={styles.referenceReviewLabel}>
                {title}
              </Typography>
              <Typography className={styles.referenceReviewValue}>
                {emptyStateMessage || t('messageNoReferenceTypesAdded')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
