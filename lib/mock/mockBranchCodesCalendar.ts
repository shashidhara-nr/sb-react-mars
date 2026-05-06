import { formatBankName } from '@lib/utils/valueFormatters';

const banks = [
  'standardBankSouthAfrica',
  'stanbicBankKenyaLimited',
  'nedbankLimited',
  'firstNationalBank',
  'capitecBank',
  'standardBankDEAngola'
];

const countries = ['ZA', 'US', 'UK'];

export const mockBranchCodes = Array.from({ length: 200 }, (_, i) => {
  const bankValue = banks[i % banks.length];
  return {
    id: `${i + 1}`,
    bankName: bankValue, // Actual value for filtering/comparison
    bankNameDisplay: formatBankName(bankValue), // Display value for UI
    branchName: `Branch ${i + 1}`,
    branchCode: `BC${String(i + 1).padStart(3, '0')}`,
    country: countries[i % countries.length],
    city: `City ${i + 1}`,
    address: `Street Line(${i + 1}),Street line(${i + 2})`
  };
});
