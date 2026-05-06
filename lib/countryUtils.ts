import { FlagSouthAfrica, FlagUsa, FlagUk } from 'lib/icons';

export interface CountryOption {
  label: string;
  value: string;
  flagIcon: any;
}

export const COUNTRY_LIST: CountryOption[] = [
  { label: 'South Africa', value: 'ZA', flagIcon: FlagSouthAfrica },
  { label: 'United States', value: 'US', flagIcon: FlagUsa },
  { label: 'United Kingdom', value: 'UK', flagIcon: FlagUk }
];

/**
 * Get country option by code
 */
export const getCountryOption = (code: string): CountryOption | undefined => {
  return COUNTRY_LIST.find(c => c.value === code);
};

/**
 * Get flag icon by country code
 */
export const getFlagIcon = (code: string): any => {
  const country = getCountryOption(code);
  return country?.flagIcon;
};

/**
 * Get country label by code
 */
export const getCountryLabel = (code: string): string => {
  const country = getCountryOption(code);
  return country?.label || code;
};
