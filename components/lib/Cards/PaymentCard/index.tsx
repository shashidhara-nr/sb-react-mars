import { Box, Typography, Checkbox } from '@mui/material';
import React, { useState } from 'react';

interface PaymentCardProps {
  icon: React.ReactElement<{ style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  selectedIcon?: React.ReactElement<{ style?: React.CSSProperties }>;
}

export default function PaymentCard({
  icon,
  title,
  subtitle,
  selected: selectedProp,
  onSelect,
  selectedIcon,
}: PaymentCardProps) {
  // If controlled, use prop, else manage state internally
  const [internalSelected, setInternalSelected] = useState(false);
  const selected = selectedProp !== undefined ? selectedProp : internalSelected;
  // Toggle selection for both card and radio
  const handleToggle = () => {
    if (onSelect) {
      onSelect(!selected);
    } else {
      setInternalSelected((prev) => !prev);
    }
  };
  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const checked = event.target.checked;
    if (onSelect) {
      onSelect(checked);
    } else {
      setInternalSelected(checked);
    }
  };

  const iconColor = selected ? '#fff' : '#000';
  const bgColor = selected ? '#0051FF' : '#fff';
  const textColor = selected ? '#fff' : '#000';
  const displayIcon = selected && selectedIcon ? selectedIcon : icon;
  const iconWithColor = React.cloneElement(displayIcon, {
    style: {
      ...(displayIcon.props.style || {}),
      color: iconColor,
      fontSize: 40,
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        borderRadius: '1rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '1.5rem',
        minWidth: 400,
        minHeight: 180,
        border: selected ? `2px solid #0051FF` : `1px solid #e0e0e0`,
        transition: 'background 0.2s, color 0.2s',
        cursor: 'pointer',
      }}
      data-selected={selected}
      onClick={handleToggle}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        {iconWithColor}
      </Box>
      <Typography
        variant="h6"
        sx={{ color: textColor, fontWeight: 600, mb: 0.5, textAlign: 'center' }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: textColor, opacity: 0.8, mb: 2, textAlign: 'center' }}
      >
        {subtitle}
      </Typography>
      <Checkbox
        checked={selected}
        onChange={handleCheckbox}
        sx={{
          color: selected ? '#fff' : '#000',
          '&.Mui-checked': {
            color: '#fff',
          },
        }}
        icon={
          <span
            style={{
              display: 'inline-block',
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${selected ? '#fff' : '#000'}`,
              background: selected ? '#fff' : 'transparent',
            }}
          />
        }
        checkedIcon={
          <span
            style={{
              display: 'inline-block',
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid #fff`,
              background: '#fff',
              position: 'relative',
            }}
          >
            <span
              style={{
                display: 'block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#0051FF',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </span>
        }
        onClick={(e) => e.stopPropagation()}
      />
    </Box>
  );
}
