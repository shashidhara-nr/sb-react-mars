'use client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

// Font imports
// const BentonSansBold = require('../../../components/lib/styles/fonts/BentonSansProBold_normal_normal.woff2');
// const BentonSansMedium = require('../../../components/lib/styles/fonts/BentonSansProMedium_normal_normal.woff2');
// const BentonSansRegular = require('../../../components/lib/styles/fonts/BentonSansProRegular_normal_normal.woff2');

// Create base theme with typography and breakpoints
const baseTheme = createTheme({
  // typography: {
  //   fontFamily: 'BentonSansPro, sans-serif',
  //   fontSize: 16,
  //   h1: {
  //     fontSize: '1.5rem',
  //     fontWeight: 400,
  //   },
  //   h2: {
  //     fontSize: '1.5rem',
  //     fontWeight: 400,
  //   },
  //   h3: {
  //     fontSize: '1.25rem',
  //     fontWeight: 400,
  //   },
  //   h4: {
  //     fontSize: '1rem',
  //     fontWeight: 400,
  //   },
  //   h5: {
  //     fontSize: '1rem',
  //     fontWeight: 400,
  //   },
  //   h6: {
  //     fontSize: '1rem',
  //     fontWeight: 400,
  //   },
  //   body1: {
  //     fontSize: '1rem',
  //     fontWeight: 400,
  //   },
  //   body2: {
  //     fontSize: '1rem',
  //     fontWeight: 400,
  //   },
  //   button: {
  //     fontSize: '0.875rem',
  //     fontWeight: 700,
  //     lineHeight: 1.5,
  //   },
  //   // Custom typography variants
  //   xxxxlRegular: {
  //     fontSize: '2rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   xxlRegular: {
  //     fontSize: '1.75rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   xxlMedium: {
  //     fontSize: '1.75rem',
  //     fontWeight: 500,
  //     lineHeight: 1.3,
  //   },
  //   xxlBold: {
  //     fontSize: '1.75rem',
  //     fontWeight: 700,
  //     lineHeight: 1.3,
  //   },
  //   xlRegular: {
  //     fontSize: '1.5rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   xlMedium: {
  //     fontSize: '1.5rem',
  //     fontWeight: 500,
  //     lineHeight: 1.3,
  //   },
  //   xlBold: {
  //     fontSize: '1.5rem',
  //     fontWeight: 700,
  //     lineHeight: 1.3,
  //   },
  //   lRegular: {
  //     fontSize: '1.125rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   lMedium: {
  //     fontSize: '1.125rem',
  //     fontWeight: 500,
  //     lineHeight: 1.3,
  //   },
  //   lBold: {
  //     fontSize: '1.125rem',
  //     fontWeight: 700,
  //     lineHeight: 1.3,
  //   },
  //   mRegular: {
  //     fontSize: '1rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   mMedium: {
  //     fontSize: '1rem',
  //     fontWeight: 500,
  //     lineHeight: 1.3,
  //   },
  //   mBold: {
  //     fontSize: '1rem',
  //     fontWeight: 700,
  //     lineHeight: 1.3,
  //   },
  //   sRegular: {
  //     fontSize: '0.875rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   sMedium: {
  //     fontSize: '0.875rem',
  //     fontWeight: 500,
  //     lineHeight: 1.3,
  //   },
  //   sBold: {
  //     fontSize: '0.875rem',
  //     fontWeight: 700,
  //     lineHeight: 1.3,
  //   },
  //   xsRegular: {
  //     fontSize: '0.75rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   xsMedium: {
  //     fontSize: '0.75rem',
  //     fontWeight: 500,
  //     lineHeight: 1.3,
  //   },
  //   xsBold: {
  //     fontSize: '0.75rem',
  //     fontWeight: 700,
  //     lineHeight: 1.3,
  //   },
  //   xxsRegular: {
  //     fontSize: '0.625rem',
  //     fontWeight: 400,
  //     lineHeight: 1.3,
  //   },
  //   xxsMedium: {
  //     fontSize: '0.625rem',
  //     fontWeight: 500,
  //     lineHeight: 1.3,
  //   },
  //   xxsBold: {
  //     fontSize: '0.625rem',
  //     fontWeight: 700,
  //     lineHeight: 1.3,
  //   },
  // },
  
  breakpoints: {
    values: {
      xs: 0,
      sm: 360,
      md: 768,
      lg: 1024,
      xl: 1600,
    },
  },
  palette: {
    mode: 'light',
    common: {
      white: '#ffffff',
      black: '#000000',
    },
    navy: {
      main: '#1A314D',
    },
     primary: {
      // main: '#0033AA',
      main: '#2563eb',
      // light: '#BFDCFC',
      dark: '#003FCA',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0051FF',
      light: '#DFEEFD',
      lighter: '#F2F6FF',
      disabledLight: '#ELE8FE',
      disabledDark: '#AABCFB',
      dark: '#003FCA',
      contrastText: '#ffffff',
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
      contrastText: '#FFFBF6',
    },
    success: {
      main: '#008545',
      light: '#BFE0CC',
      lighter: '#F5FAF7',
      contrastText: '#000000',
    },
    text: {
      primary: '#02070d',
      secondary: '#222e37',
      disabled: '#697786',
      neutral: '#465463',
    },
     background: {
          paper: '#fff',
          default: '#F4F5F7',
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
    
    steel: {
      main: '#465463',
    },
    action: {
      hover: '#E7F6F6',
      disabled: '#465463',
      disabledBackground: '#E3E6EA',
    },
  },
  typography: {
    fontSize: 14,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
     xsMedium: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
      h1: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    // Custom typography variants
    xxxxlRegular: {
      fontSize: '2rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    xxlRegular: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    xxlMedium: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    xxlBold: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    xlRegular: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    xlMedium: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    xlBold: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    lRegular: {
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    lMedium: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    lBold: {
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    mRegular: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    mMedium: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    mBold: {
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    sRegular: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    sMedium: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    sBold: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    xsRegular: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
     
    xsBold: {
      fontSize: '0.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    xxsRegular: {
      fontSize: '0.625rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    xxsMedium: {
      fontSize: '0.625rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    xxsBold: {
      fontSize: '0.625rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
  
  },
  cssVariables: { colorSchemeSelector: 'class' },
});

// Create full theme with component overrides
const theme = createTheme(
  {
    ...baseTheme,
    components: {
      // MuiCssBaseline: {
      //   styleOverrides: `
      //     @font-face {
      //       font-family: 'BentonSansPro';
      //       font-style: normal;
      //       font-display: swap;
      //       font-weight: 400;
      //       src: url(${BentonSansRegular}) format('woff2');
      //     }
      //     @font-face {
      //       font-family: 'BentonSansPro';
      //       font-style: normal;
      //       font-display: swap;
      //       font-weight: 500;
      //       src: url(${BentonSansMedium}) format('woff2');
      //     }
      //     @font-face {
      //       font-family: 'BentonSansPro';
      //       font-style: normal;
      //       font-display: swap;
      //       font-weight: 700;
      //       src: url(${BentonSansBold}) format('woff2');
      //     }
      //   `,
      // },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundColor: baseTheme.palette?.common?.white,

            '&.Mui-disabled': {
              backgroundColor: baseTheme.palette?.action?.disabledBackground,
              color: baseTheme.palette?.action?.disabled,
            },
            '& .MuiToggleButton-root.Mui-selected': {
              backgroundColor: `${baseTheme.palette.secondary.main}`,
              color: `${baseTheme.palette.common.white}`,
              '&: hover': {
                backgroundColor: `${baseTheme.palette.secondary.main}`,
                color: `${baseTheme.palette.common.white}`,
              },
            },
            '& .MuiToggleButton-root': {
              color: `${baseTheme.palette.common.black}`,
              fontSize: baseTheme.typography?.button?.fontSize,
              fontWeight: 500,
              lineHeight: baseTheme.typography?.button?.lineHeight,
              textTransform: 'none',
              '&: hover': {
                backgroundColor: `transparent`,
              },
            },
            '& .table-toggle': {
              border: 'none',
              backgroundColor: 'transparent',

              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: 0,
              },
              '& .MuiToggleButton-root.Mui-selected': {
                backgroundColor: baseTheme.palette?.common?.white,
                color: baseTheme.palette?.secondary?.main,
                borderLeft: `1px solid ${baseTheme.palette?.grey[100]}`,
                borderRight: `1px solid ${baseTheme.palette?.grey[100]}`,
                '&:first-of-type': {
                  borderLeft: 'none',
                },
              },
            },
          },
          grouped: {
            '&:(:first-of-type)': {
              borderRadius: 8,
            },
            '&:(:last-child)': {
              borderRadius: 8,
            },
          },
        },
      },
      // MuiButton: {
      //   styleOverrides: {
      //     contained: {
      //       backgroundColor: baseTheme.palette?.common?.white,
      //       color: baseTheme.palette?.secondary?.main,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette?.secondary?.light,
      //       },

      //       '&.loading.Mui-disabled': {
      //         backgroundColor: baseTheme.palette?.common?.white,
      //         color: 'transparent !important',
      //         text: '" "',
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.secondary?.main,
      //       },
      //     },
      //     outlined: {
      //       color: baseTheme.palette?.common?.white,
      //       borderColor: baseTheme.palette?.common?.white,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette?.secondary?.light,
      //         color: baseTheme.palette?.secondary?.main,
      //       },
      //       '&:disabled': {
      //         backgroundColor: baseTheme.palette?.action?.disabledBackground,
      //         color: baseTheme.palette?.action?.disabled,
      //       },
      //       '&.loading.Mui-disabled': {
      //         backgroundColor: 'transparent !important',
      //         color: 'transparent !important',
      //         text: '" "',
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.common?.white,
      //       },
      //     },
      //     text: {
      //       backgroundColor: 'transparent',
      //       color: baseTheme.palette?.common?.white,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette?.secondary?.light,
      //         color: baseTheme.palette?.secondary?.main,
      //       },
      //       '&:disabled': {
      //         backgroundColor: baseTheme.palette?.action?.disabledBackground,
      //         color: baseTheme.palette?.action?.disabled,
      //       },
      //       '&.loading.Mui-disabled': {
      //         backgroundColor: 'transparent !important',
      //         color: 'transparent !important',
      //         text: '" "',
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.common?.white,
      //       },
      //     },

      //     containedSecondary: {
      //       backgroundColor: baseTheme.palette?.secondary?.main,
      //       color: baseTheme.palette?.secondary?.contrastText,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette?.secondary?.dark,
      //       },
      //       '&:disabled': {
      //         backgroundColor: baseTheme.palette?.action?.disabledBackground,
      //         color: baseTheme.palette?.action?.disabled,
      //       },
      //       '&.loading.Mui-disabled': {
      //         backgroundColor: baseTheme.palette?.secondary?.main,
      //         color: 'transparent !important',
      //         text: '" "',
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.common?.white,
      //       },
      //     },
      //     outlinedSecondary: {
      //       color: baseTheme.palette?.secondary?.main,
      //       borderColor: baseTheme.palette?.secondary?.main,
      //       backgroundColor: baseTheme.palette?.common?.white,
      //       '&:hover': {
      //         color: baseTheme.palette?.common?.white,
      //         backgroundColor: baseTheme.palette?.secondary?.dark,
      //       },
      //       '&:disabled': {
      //         backgroundColor: baseTheme.palette?.action?.disabledBackground,
      //         color: baseTheme.palette?.action?.disabled,
      //       },
      //       '&.loading.Mui-disabled': {
      //         backgroundColor: baseTheme.palette?.common?.white,
      //         color: 'transparent !important',
      //         text: '" "',
      //         borderColor: baseTheme.palette?.secondary?.main,
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.secondary?.main,
      //       },
      //     },

      //     textSecondary: {
      //       color: baseTheme.palette?.secondary?.main,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette?.secondary?.light,
      //       },
      //       '&:disabled': {
      //         backgroundColor: baseTheme.palette?.action?.disabledBackground,
      //         color: baseTheme.palette?.action?.disabled,
      //       },
      //       '&.loading.Mui-disabled': {
      //         backgroundColor: baseTheme.palette?.common?.white,
      //         color: 'transparent !important',
      //         text: '" "',
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.secondary?.main,
      //       },
      //     },

      //     containedError: {
      //       color: baseTheme.palette?.common?.white,
      //       backgroundColor: baseTheme.palette?.error?.main,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette?.error?.dark,
      //       },
      //       '&.loading.Mui-disabled': {
      //         backgroundColor: baseTheme.palette?.error?.main,
      //         color: 'transparent !important',
      //         text: '" "',
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.common?.white,
      //       },
      //     },

      //     outlinedError: {
      //       backgroundColor: baseTheme.palette?.common?.white,
      //       color: baseTheme.palette?.error?.main,
      //       borderColor: baseTheme.palette?.error?.main,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette.error.dark,
      //         color: baseTheme.palette?.common?.white,
      //       },
      //       '&:disabled': {
      //         backgroundColor: baseTheme.palette?.action?.disabledBackground,
      //         color: baseTheme.palette?.action?.disabled,
      //       },
      //       '&.loading.Mui-disabled': {
      //         backgroundColor: baseTheme.palette?.common?.white,
      //         color: 'transparent !important',
      //         text: '" "',
      //         borderColor: baseTheme.palette?.error?.main,
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.error?.main,
      //       },
      //     },

      //     textError: {
      //       backgroundColor: 'transparent',
      //       color: baseTheme.palette?.error?.main,
      //       '&:hover': {
      //         backgroundColor: baseTheme.palette?.error?.lighter,
      //         color: baseTheme.palette?.error?.main,
      //       },
      //       '&.loading .MuiCircularProgress-svg': {
      //         color: baseTheme.palette?.error?.main,
      //       },
      //     },
      //   },
      // },
      MuiFormControlLabel: {
        styleOverrides: {
          label: {
            '&.Mui-disabled': {
              color: baseTheme.palette?.action?.disabled,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            '&.customSelect': {
              backgroundColor: baseTheme.palette?.common?.white,
              padding: 0,
              width: '6.25rem',
              borderRadius: '0.5rem',
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: baseTheme.palette?.common?.white,
            padding: '0 1rem',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {},
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: 'none',
            padding: 0,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: baseTheme.palette?.common?.white,
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            svg: {
              height: '1.5rem',
              width: '1.5rem',
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            marginLeft: '1.5rem',
            '* ': {
              fontSize: '0.75rem',
            },
            'li > button > svg': {
              height: '3rem',
              width: '1.5rem',
            },
            'li:nth-of-type(n+3):not(:nth-last-of-type(-n+2))': {
              [baseTheme.breakpoints.down('md')]: {
                visibility: 'hidden',
                display: 'none',
              },
            },

            '.MuiButtonBase-root-MuiPaginationItem-root': {
              fontSize: '0.75rem',
            },
            '.Mui-selected': {
              color: baseTheme.palette.secondary.main,
              backgroundColor: 'transparent !important',
            },
            '.MuiButtonBase-root': { border: 'none' },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '&.paginationSelect': {
              width: '6.25rem',
            },
            '&.paginationSelect *': {
              border: 'none',
              padding: 0,
            },
            '&.paginationSelect .MuiSelect-select': {
              padding: '0.375rem 1rem',

              borderRadius: '0.5rem',
              border: `1px solid ${baseTheme.palette?.grey[300]}`,
            },
            svg: {},
          },
        },
      },
    },
  },
  baseTheme,
);

export default function MuiThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}