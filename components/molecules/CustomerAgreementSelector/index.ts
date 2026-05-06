export { default } from './CustomerAgreementSelector';
export type { CustomerAgreementSelectorProps } from './CustomerAgreementSelector';

// Re-export types for convenience
export type Agreement = {
  id: string;
  label: string;
};

export type Account = {
  id: string;
  name: string;
  masked: string;
  accNumber: string;
  sortCode: string;
  bic: string;
  currency?: string | null;
  currencyFull?: string | null;
  country?: string | null;
};
