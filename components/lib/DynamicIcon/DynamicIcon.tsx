import React from 'react';
import * as MuiIcons from '@mui/icons-material';

export type DynamicIconProps = {
  name?: keyof typeof MuiIcons;
  imageSrc?: string; // URL or base64 for custom image
  alt?: string;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  imageSrc,
  alt = '',
  size = 24,
  color = 'inherit',
  style,
  className,
}) => {
  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc || ''}
        alt={alt}
        width={typeof size === 'number' ? size : undefined}
        height={typeof size === 'number' ? size : undefined}
        style={{
          display: 'inline-block',
          objectFit: 'contain',
          ...style,
          width: size,
          height: size,
        }}
        className={className}
      />
    );
  }
  if (name) {
    const IconComponent = MuiIcons[name];
    if (!IconComponent) return null;
    return (
      <IconComponent
        style={{ fontSize: size, color, ...style }}
        className={className}
      />
    );
  }
  return null;
};

export default DynamicIcon;
