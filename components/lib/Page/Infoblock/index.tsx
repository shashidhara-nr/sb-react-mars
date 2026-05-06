// @ts-nocheck
import { Box, SvgIcon, useTheme } from '@mui/material';
import Heading from '../Heading';
import InfoIcon from '../../../../assets/icons/alert.svg?react';
import InfoIconTriangle from '../../../../assets/icons/alerttriangle.svg?react';

interface InfoBlockProps {
  title: string;
  description: string;
  color?: string;
  width?: string;
  backgroundColor?: string;
  alertIconStyle: 'circle' | 'triangle';
}

const InfoBlock = ({
  title,
  description,
  color,
  width = '100%',
  backgroundColor,
  alertIconStyle = 'circle',
}: InfoBlockProps) => {
  const theme = useTheme();
  const finalColor = color ?? theme.palette.common.black;
  const finalBackgroundColor = backgroundColor ?? theme.palette.common.white;
  return (
    <Box
      sx={{
        padding: '1rem',
        width: { width },
        border: `0.1rem solid ${finalColor}`,
        color: `${finalColor}`,
        borderLeft: `10px solid ${finalColor}`,
        borderRadius: '8px',
        backgroundColor: `${finalBackgroundColor}`,
        h2: {
          padding: '0px',
          margin: '0px',
          color: `${finalColor}`,
        },
        p: {
          margin: '0px',
          padding: '0px',
          fontSize: '1rem',
          color: '#000000',
        },

        '.icon': {
          /* applies to all SVGs with a class of icon */
          fill: 'blue',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.9rem',
          padding: '1rem 0.625rem',
          color: `${finalColor}`,
        }}
      >
        <SvgIcon
          component={alertIconStyle === 'circle' ? InfoIcon : InfoIconTriangle}
          inheritViewBox
          style={{ alignSelf: 'flex-start', marginTop: '0.2rem' }}
        />
        <Box sx={{ marginLeft: '8px', color: 'inherit' }}>
          <Heading as="h3" padding="0 0 0 0" margin="0 0 0 0">
            {title}
          </Heading>
          <Box
            sx={{
              margin: '0px;',
              font: theme.typography.sRegular,
              color: theme.palette.text.primary,
            }}
          >
            {description}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InfoBlock;
