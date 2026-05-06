// @ts-nocheck
import {
  Button as MUIButton,
  ButtonProps as MUIButtonProps,
  styled,
  ToggleButton,
  Typography,
  useTheme,
} from '@mui/material';
import { DynamicIcon } from '../../DynamicIcon';
import React, { useMemo } from 'react';

export type ButtonProps = {
  buttonVariant?:
    | 'primary'
    | 'primary-header-menu'
    | 'primary-on-colour'
    | 'secondary'
    | 'secondary-on-colour'
    | 'tertiary'
    | 'tertiary-on-colour'
    | 'text'
    | 'error'
    | 'error-secondary'
    | 'error-tertiary';
  small?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
  children?: React.ReactNode;
  toggleButton?: boolean;
  toggleValue?: string;
  upperCaseText?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: string; // Icon name from MUI icons
  imageSrc?: string; // Optional image source for custom icon
  iconPosition?: 'start' | 'end'; // Icon position relative to text
  className?: string;
} & MUIButtonProps;

const StyledMUIButton = styled(MUIButton)<ButtonProps>(({ theme }) =>
  theme.unstable_sx({
    borderRadius: 2,
    textTransform: 'none',
  }),
);

/** This is effectively a wrapper for the MUI Button component. You can use all the props and the component will apply
 * the Design System styles on it.
 */
export default function Button({
  buttonVariant,
  small,
  isLoading,
  disabled,
  children,
  iconOnly,
  toggleButton,
  toggleValue,
  onClick,
  upperCaseText = true,
  icon,
  imageSrc,
  iconPosition,
  className,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const v = useMemo(() => {
    switch (buttonVariant) {
      case 'secondary':
      case 'secondary-on-colour':
      case 'error-secondary':
        return 'outlined';
      case 'text':
      case 'tertiary':
      case 'tertiary-on-colour':
      case 'error-tertiary':
        return 'text';
      case 'primary-on-colour':
      case 'primary':
      case 'error':
        return 'contained';
      default:
        return;
    }
  }, [buttonVariant]);

  const c = useMemo(() => {
    switch (buttonVariant) {
      case 'error':
      case 'error-secondary':
      case 'error-tertiary':
        return 'error';
      case 'primary-header-menu':
        return 'primary';
      case 'primary':
      case 'text':
      case 'secondary':
      case 'tertiary':
        return 'secondary';
      default:
        return;
    }
  }, [buttonVariant]);

  if (toggleButton) {
    return (
      <ToggleButton
        value={toggleValue ? toggleValue : ''}
        sx={{ padding: '16px' }}
      >
        <Typography component="span" sx={{ font: theme.typography.sMedium }}>
          {children}
        </Typography>
      </ToggleButton>
    );
  } else {
    const iconNode =
      icon || imageSrc ? (
        <DynamicIcon
          name={icon as keyof typeof import('@mui/icons-material')}
          imageSrc={imageSrc}
          size={20}
          style={{
            marginRight: iconPosition !== 'end' ? 8 : 0,
            marginLeft: iconPosition === 'end' ? 8 : 0,
          }}
        />
      ) : null;
    return (
      <StyledMUIButton
        disableFocusRipple
        {...rest}
        variant={v}
        color={c}
        loading={isLoading}
        disabled={disabled}
        className={isLoading ? `loading ${className}` : className}
        onClick={onClick}
        sx={{
          minHeight: small ? 36 : 48,
          minWidth: iconOnly || small ? 0 : 100,
          px: iconOnly ? (small ? 1 : 1.5) : small ? 1.5 : 3,
          paddingBottom: iconOnly ? (small ? 1 : 1.5) : small ? 1.25 : 2,
          paddingTop: iconOnly ? (small ? 1 : 1.5) : small ? 1.375 : 2.25,
          textTransform: upperCaseText ? 'uppercase' : '',
          font: theme.typography.sBold,
          ...(buttonVariant === 'primary-header-menu' && {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            border: 'none',
            boxShadow: 'none',
            height: '100%',
            minHeight: 64,
            borderRadius: 0,
            fontWeight: 400,
            minWidth: 130,
            px: 3,
            py: 0,
            '&:hover': {
              backgroundColor: '#00008CFF',
              color: 'white',
              border: 'none',
              height: '100%',
              minHeight: 64,
              fontWeight: 400,
              minWidth: 130,
              px: 3,
              py: 0,
              borderRadius: 0,
            },
          }),
          ...(buttonVariant === 'text' && {
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }),
          ...(buttonVariant === 'secondary' && {
            border: '1px solid #0066FF',
            color: '#0066FF',
            backgroundColor: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'uppercase',
            '& .MuiButton-startIcon': {
              color: 'inherit',
            },
            '&:hover': {
              backgroundColor: '#2563eb',
              color: '#FFFFFF',
            },
            '&:focus': {
              backgroundColor: '#2563eb',
              color: '#FFFFFF',
              borderColor: '#2563eb',
              outline: 'none',
            },
          }),
        }}
      >
        {(icon || imageSrc) &&
          iconPosition !== 'end' &&
          iconNode}
        {children}
        {(icon || imageSrc) &&
          iconPosition === 'end' &&
          iconNode}
      </StyledMUIButton>
    );
  }
}
