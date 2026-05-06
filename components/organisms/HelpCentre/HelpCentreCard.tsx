'use client';
import { Box, Card, CardContent, Typography, Link, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { buildTestId } from 'src/utils/testIds';
import VideoThumbnail from '../../../assets/icons/video_thumbnail.svg';
import ChevronRight from '../../../public/icons/icn_chevron_right_blue.svg';
import styles from './HelpCentreCard.module.scss';

interface HelpCentreCardProps {
  id: string;
  breadcrumb: string;
  title: string;
  description: string;
  category: string;
  videoUrl?: string;
  videos?: Array<{ id: string; title: string; url: string }>;
}

export default function HelpCentreCard({
  id,
  breadcrumb,
  title,
  description,
  category,
  videoUrl,
  videos,
}: HelpCentreCardProps) {
  const t = useTranslations('helpCentre');
  const testIdPrefix = 'help-centre-card';
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
  
  // Use videos array if available, otherwise fall back to videoUrl
  const firstVideo = videos && videos.length > 0 ? videos[0].url : videoUrl;
  const videoCount = videos ? videos.length : (videoUrl ? 1 : 0);

  return (
    <Card className={styles.card}>
      {/* Image Section */}
      <Box className={styles.imageSection}>
        {/* Video Thumbnail */}
        <Box
          component="img"
          src={VideoThumbnail.src}
          alt="Video Thumbnail"
          className={styles.imageThumbnail}
        />
      </Box>

      {/* Content Section */}
      <CardContent className={styles.contentSection}>
        <Stack className={styles.contentStack}>
          {/* Breadcrumb */}
          <Typography className={styles.breadcrumb}>
            {breadcrumb}
          </Typography>

          {/* Title */}
          <Typography className={styles.title}>
            {title}
          </Typography>

          {/* Description */}
          <Typography className={styles.description}>
            {description}
          </Typography>

          {/* Watch Now Link with Video Count */}
          <Box className={styles.watchSection}>
            <Link
              href={firstVideo ? `/${locale}/help-centre/${categorySlug}?video=${encodeURIComponent(firstVideo)}` : `/${locale}/help-centre/${categorySlug}`}
              data-testid={buildTestId(testIdPrefix, 'button', 'watch-now')}
              className={styles.watchLink}
            >
              {t('watchNow').toUpperCase()}
              <Image
                src={ChevronRight}
                alt="Chevron Right"
                width={16}
                height={16}
                className={styles.chevronIcon}
              />
            </Link>
            {videoCount > 1 && (
              <Typography className={styles.videoCountBadge}>
                +{videoCount - 1} video{videoCount > 2 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
