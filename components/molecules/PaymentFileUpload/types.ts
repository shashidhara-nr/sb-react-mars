export type PaymentStatus =
  | 'verified'
  | 'partially-verified'
  | 'not-verified'
  | 'invalid'
  | 'duplicate';
 
export interface Payment {
  id: string;
  name: string;
  status: PaymentStatus;
  accountNumber: string;
  beneficiaryCode?: string;
  bankName?: string;
  cdiNumber?: string;
  beneficiaryReference?: string;
  iban?: string;
  transactionLimit?: string;
}
 
export interface PaymentRowProps {
  payment: Payment;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRemove: (id: string) => void;
}
 
 