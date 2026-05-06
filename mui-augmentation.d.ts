// Material-UI custom type extensions
import React from 'react';

declare module '@mui/material/styles' {
  // Extended color options
  interface PaletteColor {
    lighter?: string;
    disabledLight?: string;
    disabledDark?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    disabledLight?: string;
    disabledDark?: string;
  }
  interface TypeText {
    neutral: string;
  }
  // Custom palette colors
  interface Palette {
    tertiary: PaletteColor;
    navy: {
      main: string;
    };
    steel: {
      main: string;
    };
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    navy?: {
      main: string;
    };
    steel?: {
      main: string;
    };
  }

  // Custom typography variants
  interface TypographyVariants {
    xxsRegular: React.CSSProperties;
    xxsMedium: React.CSSProperties;
    xxsBold: React.CSSProperties;
    xsRegular: React.CSSProperties;
    xsMedium: React.CSSProperties;
    xsBold: React.CSSProperties;
    sRegular: React.CSSProperties;
    sMedium: React.CSSProperties;
    sBold: React.CSSProperties;
    mRegular: React.CSSProperties;
    mMedium: React.CSSProperties;
    mBold: React.CSSProperties;
    lRegular: React.CSSProperties;
    lMedium: React.CSSProperties;
    lBold: React.CSSProperties;
    xlRegular: React.CSSProperties;
    xlMedium: React.CSSProperties;
    xlBold: React.CSSProperties;
    xxlRegular: React.CSSProperties;
    xxlMedium: React.CSSProperties;
    xxlBold: React.CSSProperties;
    xxxxlRegular: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    xxsRegular?: React.CSSProperties;
    xxsMedium?: React.CSSProperties;
    xxsBold?: React.CSSProperties;
    xsRegular?: React.CSSProperties;
    xsMedium?: React.CSSProperties;
    xsBold?: React.CSSProperties;
    sRegular?: React.CSSProperties;
    sMedium?: React.CSSProperties;
    sBold?: React.CSSProperties;
    mRegular?: React.CSSProperties;
    mMedium?: React.CSSProperties;
    mBold?: React.CSSProperties;
    lRegular?: React.CSSProperties;
    lMedium?: React.CSSProperties;
    lBold?: React.CSSProperties;
    xlRegular?: React.CSSProperties;
    xlMedium?: React.CSSProperties;
    xlBold?: React.CSSProperties;
    xxlRegular?: React.CSSProperties;
    xxlMedium?: React.CSSProperties;
    xxlBold?: React.CSSProperties;
    xxxxlRegular?: React.CSSProperties;
  }

  // CSS Variables color scheme
  interface ColorSchemeOverrides {
    navy: true;
    steel: true;
    tertiary: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    xxsRegular: true;
    xxsMedium: true;
    xxsBold: true;
    xsRegular: true;
    xsMedium: true;
    xsBold: true;
    sRegular: true;
    sMedium: true;
    sBold: true;
    mRegular: true;
    mMedium: true;
    mBold: true;
    lRegular: true;
    lMedium: true;
    lBold: true;
    xlRegular: true;
    xlMedium: true;
    xlBold: true;
    xxlRegular: true;
    xxlMedium: true;
    xxlBold: true;
    xxxxlRegular: true;
  }
}
