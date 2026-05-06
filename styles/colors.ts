import { ColorSystemOptions } from '@mui/material';

export const light: ColorSystemOptions = {
  palette: {
    mode: 'light',
    common: {
      white: '#ffffff',
      black: '#000000',
    },
    primary: {
      main: '#0033AA',
      light: '#BFDCFC',
      dark: ' #02070D',
      contrastText: '#02070D',
      lighter: '#F2F6FF',
    },
    secondary: {
      main: '#0051FF',
      light: '#DFEEFD',
      lighter: '#F2F6FF',
      disabledLight: '#ELE8FE',
      disabledDark: '#AABCFB',
      dark: '#003FCA',
    },
    tertiary: {
      main: '#00cafb',
      light: '#e55aff',
      dark: '#002933',
    },
    error: {
      main: '#e31e46',
      light: '#F6C2C2',
      lighter: '#FBE6E6',
      dark: '#C00228',
      contrastText: '#FEF5F5',
    },
    warning: {
      main: '#FF8A00',
      light: '#FFE9C7',
      dark: undefined,
      contrastText: '#FFFBF6',
    },
    success: {
      main: '#008545',
      light: '#BFE0CC',
      lighter: ' #F5FAF7',
      dark: undefined,
      contrastText: '#000000',
    },
    text: {
      primary: '#02070d',
      secondary: '#222e37',
      disabled: '#697786',
    },
    background: {
      paper: '#fff',
      default: '#F4F5F7',
    },
    action: {
      hover: '#E7F6F6',
      disabled: '#465463',
      disabledBackground: '#E3E6EA',
    },
    navy: {
      main: '#1A314D',
    },
    grey: {
      50: '#E3E6EA',
      100: '#F4F5F7',
      200: '#F8F8FA',
      300: '#CED3D9',
      400: '#697786',
      500: '#222e37',
      600: '#242E37',
    },
  },
};

// export const dark = light;
export const dark: ColorSystemOptions = {
  palette: {
    mode: 'dark',
    error: {
      main: '#00ff00',
      light: '#fbe9ec',
      dark: '#330009',
      contrastText: '#fff',
    },
     navy: {
      main: '#1A314D',
    },
  },
};
