// mockCurrencyRates.ts
// Comprehensive mock data for currency rates

interface CurrencyRate {
  id: string;
  currency: string;
  foreignCurrency: string;
  units: string;
  bankBuyRate: string;
  bankSellRate: string;
}

// Currency data organized by currency code
const currencyRatesByRegion: { [key: string]: Array<{ pair: string; name: string; units: string; buyRate: number; sellRate: number }> } = {
  'KES': [ // Kenya Shilling
    { pair: 'USD/KES', name: 'US DOLLAR', units: '1', buyRate: 127.45, sellRate: 128.65 },
    { pair: 'EUR/KES', name: 'EURO', units: '1', buyRate: 138.90, sellRate: 140.10 },
    { pair: 'GBP/KES', name: 'POUND STERLING', units: '1', buyRate: 161.30, sellRate: 162.50 },
    { pair: 'JPY/KES', name: 'JAPANESE YEN', units: '100', buyRate: 85.80, sellRate: 87.00 },
    { pair: 'CHF/KES', name: 'SWISS FRANC', units: '1', buyRate: 142.45, sellRate: 143.65 },
    { pair: 'AUD/KES', name: 'AUSTRALIAN DOLLAR', units: '1', buyRate: 84.30, sellRate: 85.50 },
    { pair: 'CAD/KES', name: 'CANADIAN DOLLAR', units: '1', buyRate: 93.95, sellRate: 95.15 },
  ],
  'SSP': [ // South Sudan Pound
    { pair: 'USD/SSP', name: 'US DOLLAR', units: '1', buyRate: 1505.45, sellRate: 1510.65 },
    { pair: 'EUR/SSP', name: 'EURO', units: '1', buyRate: 1638.90, sellRate: 1645.10 },
    { pair: 'GBP/SSP', name: 'POUND STERLING', units: '1', buyRate: 1903.30, sellRate: 1910.50 },
    { pair: 'JPY/SSP', name: 'JAPANESE YEN', units: '100', buyRate: 1010.80, sellRate: 1018.00 },
    { pair: 'CHF/SSP', name: 'SWISS FRANC', units: '1', buyRate: 1677.45, sellRate: 1685.65 },
  ],
  'ZWL': [ // Zimbabwe Dollar
    { pair: 'USD/ZWL', name: 'US DOLLAR', units: '1', buyRate: 890.45, sellRate: 895.65 },
    { pair: 'EUR/ZWL', name: 'EURO', units: '1', buyRate: 968.90, sellRate: 975.10 },
    { pair: 'GBP/ZWL', name: 'POUND STERLING', units: '1', buyRate: 1123.30, sellRate: 1130.50 },
    { pair: 'JPY/ZWL', name: 'JAPANESE YEN', units: '100', buyRate: 597.80, sellRate: 604.00 },
    { pair: 'AUD/ZWL', name: 'AUSTRALIAN DOLLAR', units: '1', buyRate: 587.30, sellRate: 594.50 },
  ],
  'BWP': [ // Botswana Pula
    { pair: 'USD/BWP', name: 'US DOLLAR', units: '1', buyRate: 13.45, sellRate: 13.65 },
    { pair: 'EUR/BWP', name: 'EURO', units: '1', buyRate: 14.90, sellRate: 15.10 },
    { pair: 'GBP/BWP', name: 'POUND STERLING', units: '1', buyRate: 17.30, sellRate: 17.50 },
    { pair: 'JPY/BWP', name: 'JAPANESE YEN', units: '100', buyRate: 9.80, sellRate: 10.00 },
    { pair: 'CHF/BWP', name: 'SWISS FRANC', units: '1', buyRate: 15.45, sellRate: 15.65 },
    { pair: 'AUD/BWP', name: 'AUSTRALIAN DOLLAR', units: '1', buyRate: 8.30, sellRate: 8.50 },
    { pair: 'CAD/BWP', name: 'CANADIAN DOLLAR', units: '1', buyRate: 9.95, sellRate: 10.15 },
    { pair: 'SGD/BWP', name: 'SINGAPORE DOLLAR', units: '1', buyRate: 10.20, sellRate: 10.40 },
    { pair: 'HKD/BWP', name: 'HONG KONG DOLLAR', units: '1', buyRate: 1.72, sellRate: 1.76 },
    { pair: 'NZD/BWP', name: 'NEW ZEALAND DOLLAR', units: '1', buyRate: 8.10, sellRate: 8.30 },
  ],
  'XOF': [ // Ivory Coast Franc
    { pair: 'USD/XOF', name: 'US DOLLAR', units: '1', buyRate: 597.45, sellRate: 602.65 },
    { pair: 'EUR/XOF', name: 'EURO', units: '1', buyRate: 655.90, sellRate: 661.10 },
    { pair: 'GBP/XOF', name: 'POUND STERLING', units: '1', buyRate: 757.30, sellRate: 763.50 },
  ],
  'GHS': [ // Ghana Cedi
    { pair: 'USD/GHS', name: 'US DOLLAR', units: '1', buyRate: 12.45, sellRate: 12.65 },
    { pair: 'EUR/GHS', name: 'EURO', units: '1', buyRate: 13.90, sellRate: 14.10 },
    { pair: 'GBP/GHS', name: 'POUND STERLING', units: '1', buyRate: 16.30, sellRate: 16.50 },
  ],
  'NGN': [ // Nigeria Naira
    { pair: 'USD/NGN', name: 'US DOLLAR', units: '1', buyRate: 1234.45, sellRate: 1240.65 },
    { pair: 'EUR/NGN', name: 'EURO', units: '1', buyRate: 1345.90, sellRate: 1352.10 },
    { pair: 'GBP/NGN', name: 'POUND STERLING', units: '1', buyRate: 1558.30, sellRate: 1565.50 },
  ],
  'TZS': [ // Tanzania Shilling
    { pair: 'USD/TZS', name: 'US DOLLAR', units: '1', buyRate: 2456.45, sellRate: 2465.65 },
    { pair: 'EUR/TZS', name: 'EURO', units: '1', buyRate: 2678.90, sellRate: 2687.10 },
    { pair: 'GBP/TZS', name: 'POUND STERLING', units: '1', buyRate: 3108.30, sellRate: 3117.50 },
  ],
  'ZAR': [ // South Africa Rand
    { pair: 'USD/ZAR', name: 'US DOLLAR', units: '1', buyRate: 18.45, sellRate: 18.65 },
    { pair: 'EUR/ZAR', name: 'EURO', units: '1', buyRate: 20.90, sellRate: 21.10 },
    { pair: 'GBP/ZAR', name: 'POUND STERLING', units: '1', buyRate: 23.30, sellRate: 23.50 },
    { pair: 'JPY/ZAR', name: 'JAPANESE YEN', units: '100', buyRate: 12.80, sellRate: 13.00 },
    { pair: 'AUD/ZAR', name: 'AUSTRALIAN DOLLAR', units: '1', buyRate: 12.30, sellRate: 12.50 },
  ],
};

export const mockCurrencyRates: CurrencyRate[] = currencyRatesByRegion['BWP'].map((pair, index) => ({
  id: `${index + 1}`,
  currency: pair.pair,
  foreignCurrency: pair.name,
  units: pair.units,
  bankBuyRate: `${pair.buyRate.toFixed(4)}`,
  bankSellRate: `${pair.sellRate.toFixed(4)}`,
}));

// Function to get rates by currency code
export const getCurrencyRatesByCode = (currencyCode: string): CurrencyRate[] => {
  const rates = currencyRatesByRegion[currencyCode] || currencyRatesByRegion['BWP'];
  return rates.map((pair, index) => ({
    id: `${index + 1}`,
    currency: pair.pair,
    foreignCurrency: pair.name,
    units: pair.units,
    bankBuyRate: `${pair.buyRate.toFixed(4)}`,
    bankSellRate: `${pair.sellRate.toFixed(4)}`,
  }));
};

