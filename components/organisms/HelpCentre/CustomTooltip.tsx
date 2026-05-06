import { Box, IconButton, Typography } from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '../../../public/icons/icn_chevron_left_color.svg';
import ChevronRightIcon from '../../../public/icons/icn_chevron_right_blue.svg';
import CloseIconSvg from '../../../public/icons/close_standard_blue.svg';
import { TooltipRenderProps } from 'react-joyride';

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  size,
}: TooltipRenderProps) => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        color: '#222E37',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '280px',
      }}
    >
      {/* Header with close button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography
          sx={{
            fontSize: '14px',
            lineHeight: '1.5',
            fontWeight: 400,
            flex: 1,
            pr: 1,
          }}
        >
          {step.content}
        </Typography>
        <Box
          {...closeProps}
          sx={{
            cursor: 'pointer',
            ml: 1,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={CloseIconSvg}
            alt="Close"
            width={20}
            height={20}
          />
        </Box>
      </Box>

      {/* Footer with navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box
          {...backProps}
          onClick={index === 0 ? undefined : backProps?.onClick}
          sx={{
            cursor: index === 0 ? 'not-allowed' : 'pointer',
            opacity: index === 0 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: index === 0 ? 'transparent' : 'rgba(0, 98, 225, 0.1)',
            },
          }}
        >
          <Image
            src={ChevronLeftIcon}
            alt="Previous"
            width={20}
            height={20}
          />
        </Box>

        <Typography
          sx={{
            fontSize: '12px',
            color: '#666',
            minWidth: '40px',
            textAlign: 'center',
            fontWeight: 500,
            flex: 1,
          }}
        >
          {index + 1} of {size}
        </Typography>

        <Box
          {...primaryProps}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 98, 225, 0.1)',
            },
          }}
        >
          <Image
            src={ChevronRightIcon}
            alt="Next"
            width={20}
            height={20}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CustomTooltip;
