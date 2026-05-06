import { Box, Chip, useTheme } from '@mui/material';
import { CloseCircle } from 'public/icons';
import React, { useState } from 'react';

interface ChipProps {
  labelText?: string;
  deleteIcon?: React.ReactElement;
  avatarIcon?: React.ReactElement;
  disabled: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  backgroundColor?: string; // NEW
  textColor?: string; // NEW
}

export default function CustomChip({
  labelText,
  avatarIcon,
  disabled,
  onClick,
  onDelete,
  deleteIcon = <CloseCircle />,
  backgroundColor, // NEW
  textColor, // NEW
}: ChipProps) {
  const theme = useTheme();

  const [clicked, setClicked] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      setClicked((prev) => !prev);
      onDelete();
    }
  };

  const handleClick = () => {
    setClicked((prev) => !prev);
    if (onClick) onClick();
  };
  return (
    <Chip
      label={labelText}
      onClick={onClick ? handleClick : undefined}
      onDelete={onDelete ? handleDelete : undefined}
      icon={
        <Box
          sx={{
            width: 23,
            height: 23,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarIcon}
        </Box>
      }
      disabled={disabled}
      deleteIcon={onDelete ? deleteIcon : undefined}
      sx={{
        color:
          textColor ??
          (clicked ? theme.palette.common.white : theme.palette.secondary.main),

        border: `1px solid ${theme.palette.secondary.main}`,
        backgroundColor:
          backgroundColor ??
          (clicked ? theme.palette.secondary.main : theme.palette.common.white),
        span: {
          font: theme.typography.sRegular,
        },
        '&.Mui-disabled': {
          backgroundColor: theme.palette.action.disabledBackground,
          color: theme.palette.action.disabled,
          border: `1px solid ${theme.palette.action.disabledBackground}`,
          opacity: 1,
        },
        '&.Mui-disabled .MuiChip-icon': {
          color: theme.palette.action.disabled,
        },
        '&.Mui-disabled .MuiChip-deleteIcon': {
          color: theme.palette.action.disabled,
        },
        '& .MuiChip-deleteIcon': {
          color: clicked
            ? theme.palette.common.white
            : theme.palette.secondary.main,
        },
        '& .MuiChip-icon': {
          color: clicked
            ? theme.palette.common.white
            : theme.palette.secondary.main,
        },
        '&:hover': {
          backgroundColor: !clicked
            ? theme.palette.secondary.light
            : theme.palette.secondary.main,
          color: !clicked
            ? theme.palette.secondary.main
            : theme.palette.common.white,
          '& .MuiChip-icon': {
            color: !clicked
              ? theme.palette.secondary.main
              : theme.palette.common.white,
          },
          '& .MuiChip-deleteIcon': {
            color: !clicked
              ? theme.palette.secondary.main
              : theme.palette.common.white,
          },
        },
      }}
    />
  );
}
