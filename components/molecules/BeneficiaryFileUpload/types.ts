export type BeneficiaryStatus = 
  | 'verified' 
  | 'partially-verified' 
  | 'not-verified'
  | 'invalid' 
  | 'duplicate';

export interface Beneficiary {
  id: string;
  name: string;
  status: BeneficiaryStatus;
  accountNumber: string;
  beneficiaryCode?: string;
  bankName?: string;
  cdiNumber?: string;
  beneficiaryReference?: string;
  iban?: string;
  transactionLimit?: string;
  recordType?: 'valid' | 'invalid' | 'duplicate' | 'error';
  declineReason?: string;
}

export interface BeneficiaryRowProps {
  beneficiary:  Beneficiary;
  isSelected:  boolean;
  isExpanded:  boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRemove: (id: string) => void;
}