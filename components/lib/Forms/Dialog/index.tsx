import {
  Dialog as MUIDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Divider,
  useTheme,
} from '@mui/material';
import { padding } from '../../styles/spacing';
import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Button from '../Button';

interface DialogProps {
  /** Used for aria labels and form controls */
  name: string;
  /** The title of the modal */
  title: string;
  titleBackgroundColor?: 'primary' | 'white';
  /** The content */
  content: React.ReactNode;
  /** Show/hide the modal */
  open: boolean;
  /** If supplied an X buton to close will be added */
  onClose?: () => void;
  /** If supplied an Accept primary buton will be added */
  onPrimaryCTA?: () => void;
  /** If supplied a Decline secondary buton will be added */
  primaryCTALoading?: boolean;
  iconOnlyPrimaryCTA?: boolean;
  primaryCTAStartIcon?: React.ReactNode;
  primaryCTAEndIcon?: React.ReactNode;
  primaryCTASize?: 'small' | 'medium' | 'large';
  primaryCTAWidth?: string | number;
  primaryCTAHeight?: string | number;
  primaryCTAStyle?: React.CSSProperties;

  onSecondaryCTA?: () => void;
  /** Label for the optional accept button */
  secondaryCTALoading?: boolean;
  iconOnlySecondaryCTA?: boolean;
  secondaryCTAStartIcon?: React.ReactNode;
  secondaryCTAEndIcon?: React.ReactNode;
  secondaryCTASize?: 'small' | 'medium' | 'large';
  secondaryCTAWidth?: string | number;
  secondaryCTAHeight?: string | number;
  secondaryCTAStyle?: React.CSSProperties;

  onTertiaryCTA?: () => void;
  tertiaryCTALoading?: boolean;
  iconOnlyTertiaryCTA?: boolean;
  tertiryCTAStartIcon?: React.ReactNode;
  tertiaryCTAEndIcon?: React.ReactNode;
  tertiaryCTASize?: 'small' | 'medium' | 'large';
  tertiaryCTAWidth?: string | number;
  tertiaryCTAHeight?: string | number;
  tertiaryCTAStyle?: React.CSSProperties;

  primaryCTALabel?: string | React.ReactNode;
  /** Label for the optional decline button */
  secondaryCTALabel?: string | React.ReactNode;
  /** When true a loading animation is played on the accept button */
  tertiaryCTALabel?: string | React.ReactNode;
  loading?: boolean;
  /** Optional max width property for the modal */
  maxWidth?: string;
}

export default function Dialog({
  name,
  title,
  titleBackgroundColor = 'primary',
  content,
  open,
  primaryCTALabel = '',
  secondaryCTALabel = '',
  tertiaryCTALabel = '',
  onClose,
  onPrimaryCTA,
  primaryCTALoading,
  onSecondaryCTA,
  secondaryCTALoading,
  onTertiaryCTA,
  tertiaryCTALoading,
  iconOnlyPrimaryCTA = false,
  iconOnlySecondaryCTA = false,
  iconOnlyTertiaryCTA = false,
  loading,
  maxWidth = '35rem',
  primaryCTAStartIcon,
  primaryCTAEndIcon,
  primaryCTASize,
  primaryCTAWidth,
  primaryCTAHeight,
  primaryCTAStyle,
  secondaryCTAStartIcon,
  secondaryCTAEndIcon,
  secondaryCTASize,
  secondaryCTAWidth,
  secondaryCTAHeight,
  secondaryCTAStyle,
  tertiryCTAStartIcon,
  tertiaryCTAEndIcon,
  tertiaryCTASize,
  tertiaryCTAWidth,
  tertiaryCTAHeight,
  tertiaryCTAStyle,
}: DialogProps) {
  const theme = useTheme();
  const dialogTitleStyles = {
    backgroundColor:
      titleBackgroundColor === 'white'
        ? theme.palette.common.white
        : theme.palette.primary.main,
    color:
      titleBackgroundColor === 'white'
        ? theme.palette.common.black
        : theme.palette.common.white,
  };

  // Merge width/height into style prop for primary button
  const primaryButtonStyle: React.CSSProperties = {
    ...primaryCTAStyle,
    ...(primaryCTAWidth && {
      width: primaryCTAWidth,
      minWidth: primaryCTAWidth,
      maxWidth: primaryCTAWidth,
    }),
    ...(primaryCTAHeight && {
      height: primaryCTAHeight,
      minHeight: primaryCTAHeight,
      maxHeight: primaryCTAHeight,
    }),
  };

  // Merge width/height into style prop for secondary button
  const secondaryButtonStyle: React.CSSProperties = {
    ...secondaryCTAStyle,
    ...(secondaryCTAWidth && {
      width: secondaryCTAWidth,
      minWidth: secondaryCTAWidth,
      maxWidth: secondaryCTAWidth,
    }),
    ...(secondaryCTAHeight && {
      height: secondaryCTAHeight,
      minHeight: secondaryCTAHeight,
      maxHeight: secondaryCTAHeight,
    }),
  };

  // Merge width/height into style prop for tertiary button
  const tertiaryButtonStyle: React.CSSProperties = {
    ...tertiaryCTAStyle,
    ...(tertiaryCTAWidth && {
      width: tertiaryCTAWidth,
      minWidth: tertiaryCTAWidth,
      maxWidth: tertiaryCTAWidth,
    }),
    ...(tertiaryCTAHeight && {
      height: tertiaryCTAHeight,
      minHeight: tertiaryCTAHeight,
      maxHeight: tertiaryCTAHeight,
    }),
  };

  return (
    <MUIDialog
      open={open}
      onClose={onClose}
      aria-labelledby={`$alert-dialog-${name}"`}
      aria-describedby={`alert-dialog-${name}-description`}
      fullWidth
      sx={{
        m: 0,
        '& .MuiPaper-root': {
          maxWidth: maxWidth,
        },
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          py: padding.regular,
          px: padding.large,
          display: 'flex',
          ...dialogTitleStyles,
          alignItems: 'center',
          justifyContent: 'space-between',
          '& .MuiButtonBase-root': {
            color: theme.palette.common.white,
          },
        })}
        id={`$alert-dialog-${name}"`}
      >
        {title}
        {onClose && (
          <IconButton
            aria-label="close the delete company dialog"
            onClick={onClose}
            color="primary"
            size="small"
            sx={{
              stroke: dialogTitleStyles.color,
              fill: dialogTitleStyles.color,
              '&: hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <Divider sx={{ m: 0 }} />
      <DialogContent
        sx={{
          px: padding.large,
          py: padding.large,
          backgroundColor: theme.palette.common.white,
          '&.MuiDialogContent-root': { paddingTop: padding.large },
        }}
      >
        {content}
      </DialogContent>

      {(onPrimaryCTA || onSecondaryCTA || onTertiaryCTA) && (
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#F4F5F7',
            py: padding.xSmall,
            px: padding.large,
          }}
          key="actions"
        >
          {onTertiaryCTA && (
            <Button
              onClick={onTertiaryCTA}
              loading={tertiaryCTALoading}
              buttonVariant="tertiary"
              disabled={loading === true}
              iconOnly={iconOnlyTertiaryCTA}
              startIcon={tertiryCTAStartIcon}
              endIcon={tertiaryCTAEndIcon}
              size={tertiaryCTASize}
              style={tertiaryButtonStyle}
            >
              {tertiaryCTALabel}
            </Button>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent:
                onSecondaryCTA || onTertiaryCTA ? 'space-between' : 'flex-end',
              flexGrow: onTertiaryCTA ? 0 : 1,
            }}
          >
            {onSecondaryCTA && (
              <Button
                onClick={onSecondaryCTA}
                loading={secondaryCTALoading}
                buttonVariant="tertiary"
                disabled={loading === true}
                iconOnly={iconOnlySecondaryCTA}
                startIcon={secondaryCTAStartIcon}
                endIcon={secondaryCTAEndIcon}
                size={secondaryCTASize}
                style={secondaryButtonStyle}
              >
                {secondaryCTALabel}
              </Button>
            )}
            {onPrimaryCTA && (
              <Button
                buttonVariant="primary"
                onClick={onPrimaryCTA}
                loading={primaryCTALoading}
                disabled={loading === true}
                iconOnly={iconOnlyPrimaryCTA}
                startIcon={primaryCTAStartIcon}
                endIcon={primaryCTAEndIcon}
                size={primaryCTASize}
                style={primaryButtonStyle}
              >
                {primaryCTALabel}
              </Button>
            )}
          </Box>
        </DialogActions>
      )}
    </MUIDialog>
  );
}
