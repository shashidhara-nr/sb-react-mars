export type DebtorStatus = 
  | 'verified' 
  | 'partially-verified' 
  | 'not-verified'
  | 'invalid' 
  | 'duplicate';

export interface Debtor {
  id: string;
  name: string;
  status: DebtorStatus;
  accountNumber: string;
  debtorCode?: string;
  bankName?: string;
  cdiNumber?: string;
  debtorReference?: string;
  iban?: string;
  transactionLimit?: string;
  rawData?: any; // Store full API record for detail view
  declineReason?: string;
}

export interface DebtorRowProps {
  debtor:  Debtor;
  isSelected:  boolean;
  isExpanded:  boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRemove: (id: string) => void;
}