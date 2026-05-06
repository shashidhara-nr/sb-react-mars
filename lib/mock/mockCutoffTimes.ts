// mockCutoffTimes.ts
export const mockCutoffTimesData = Array.from({ length: 200 }, (_, i) => ({
  id: `${i + 1}`,
  countryRegion: i % 3 === 0 ? 'ZA' : i % 3 === 1 ? 'US' : 'UK',
  instrumentClass: `Class${(i % 5) + 1}`,
  instrumentName: `Instrument${(i % 10) + 1}`,
  transactionType: ['sameDay', 'nextDay', 'immediate', 'urgent'][i % 4],
  transactionCurrency: ['AED', 'AFA', 'AFN', 'ARS', 'GBP'][i % 5],
  internalCutoff: `16:${String(i % 60).padStart(2, '0')}`,
  externalCutoff: `17:${String(i % 60).padStart(2, '0')}`,
  processingDays: `Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday`,
  onUsLeadDays: `${(i % 3) + 1}`,
  offUsLeadDays: `${(i % 5) + 1}`,
  timeZone: `Africa/Johannesburg`,
}));
