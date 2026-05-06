import React from 'react';
import { Box, Typography, Stack, IconButton } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';

const iconMap: Record<string, React.ReactElement> = {
  LinkedIn: <LinkedInIcon fontSize="small" />,
  YouTube: <YouTubeIcon fontSize="small" />,
  Facebook: <FacebookIcon fontSize="small" />,
  X: <XIcon fontSize="small" />,
};

const links = [
  'SECURITY CENTRE',
  'REGULATORY',
  'LEGAL',
  'TERMS AND CONDITIONS',
  'RATES AND PRICING',
];

export interface FooterSocialIcon {
  icon: string;
  label: string;
  href: string;
}

export interface FooterProps {
  socialIcons?: FooterSocialIcon[];
  description?: string;
  links?: string[];
}

const defaultSocialIcons: FooterSocialIcon[] = [
  { icon: 'LinkedIn', label: 'LinkedIn', href: '#' },
  { icon: 'YouTube', label: 'YouTube', href: '#' },
  { icon: 'X', label: 'X', href: '#' },
  { icon: 'Facebook', label: 'Facebook', href: '#' },
];

const defaultDescription =
  'Standard Bank is a licensed financial services provider in terms of the Financial Advisory and Intermediary Services Act and a registered credit provider in terms of the National Credit Act, registration number NCRCP15';

const Footer: React.FC<FooterProps> = ({
  socialIcons,
  description,
  links: linksProp,
}) => {
  const icons =
    socialIcons && socialIcons.length > 0 ? socialIcons : defaultSocialIcons;
  const footerLinks = linksProp && linksProp.length > 0 ? linksProp : links;
  const desc = description || defaultDescription;

  return (
    <Box
      sx={{
        bgcolor: '#001652',
        color: '#fff',
        py: { xs: 3, md: 2 },
        px: { xs: 2, sm: 3, md: 6, lg: 8 },
        borderTop: '1px solid #fff1',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 3, md: 2 },
          width: '100%',
        }}
      >
        {/* Links and Description Section */}
        <Box
          sx={{ width: { xs: '100%', md: 'auto' }, maxWidth: { md: '70%' } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 3, md: 5 }}
            mb={2}
            sx={{
              flexWrap: 'wrap',
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {footerLinks.map((text) => (
              <Typography
                key={text}
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: 12, sm: 13, md: 14 },
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {text}
              </Typography>
            ))}
          </Stack>
          <Typography
            sx={{
              fontSize: { xs: 12, sm: 12.5, md: 13 },
              color: '#fff',
              maxWidth: { xs: '100%', md: 700 },
              lineHeight: 1.5,
              mt: 1,
              opacity: 0.9,
            }}
          >
            {desc}
          </Typography>
        </Box>

        {/* Social Icons Section */}
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
          alignItems="center"
          sx={{
            mt: { xs: 2, md: 0 },
            alignSelf: { xs: 'center', md: 'flex-start' },
          }}
        >
          {icons.map(({ icon, label, href }) => (
            <IconButton
              key={label}
              href={href}
              aria-label={label}
              sx={{
                border: '1px solid #fff',
                borderRadius: 2,
                color: '#fff',
                width: { xs: 36, sm: 38, md: 40 },
                height: { xs: 36, sm: 38, md: 40 },
                p: 0,
                transition: 'all 0.2s',
                '&:hover': {
                  background: '#DFEEFD',
                  color: '#0051FF',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {iconMap[icon]
                ? React.cloneElement(
                    iconMap[icon] as React.ReactElement<{ sx?: object }>,
                    {
                      sx: { fontSize: { xs: 16, sm: 18, md: 18 } },
                    },
                  )
                : null}
            </IconButton>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
