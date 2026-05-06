import { useTheme } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import { Typography, useMediaQuery } from '@mui/material';
import Button from '../../Forms/Button/index';
import { Icon } from '@atoms/index';
import styles from './Breadcrumb.module.scss';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadCrumbProps = {
  links: BreadcrumbItem[];
};

export const BreadcrumbList = ({ links }: BreadCrumbProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const backButtonLink = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div role="presentation">
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<Icon className={styles.chevronRight} name="arrow" width='16' height='16' bgColor={theme.palette.text.secondary} />}
        className={styles.breadcrumbs}
      >
        {!isMobile
          ? links.map((link, index) =>
            index === links.length - 1 ? (
              <Typography
                key={index}
                variant="body2"
                component="span"
                className={styles.breadcrumbText}
              >
                {link.label}
              </Typography>
            ) : (
              <Chip
                key={index}
                label={link.label}
                component="a"
                href={link.href}
                className={styles.breadcrumbChip}
              />
            ),
          )
          : links.length > 1 && (
            <Button
              onClick={() => {
                const fallbackLink = links[0]?.href;
                const backHref =
                  links[links.length - 2]?.href ?? fallbackLink;
                if (backHref) backButtonLink(backHref);
              }}
              startIcon={<Icon name="backArrow" width='16' height='16' bgColor={theme.palette.secondary.main} />}
              buttonVariant="tertiary"
              small
              upperCaseText={false}
            >
              {`Back to ${links[links.length - 2]?.label}`}
            </Button>
          )}
      </Breadcrumbs>
    </div>
  );
}

export default BreadcrumbList;