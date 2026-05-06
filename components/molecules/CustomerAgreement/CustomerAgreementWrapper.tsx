import * as React from 'react';
import CustomerAgreement from './CustomerAgreement';

interface CustomerAgreementWrapperProps {
  reviewMode?: boolean;
  initialMode?: 'view' | 'edit' | 'create';
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  showAssociatedAccounts?: boolean;
  useBranchCountry?: boolean;
  title?: string;
  initialAgreementId?: string;
  initialAgreementName?: string;
  initialSelectedAccountId?: string;
  onAgreementChange?: (agreementId: string, agreementName?: string) => void;
  onAccountChange?: (accountId: string) => void;
  onBatchChange?: (batch: any[]) => void;
  batchAccount?: string[];
  agreementError?: string | null;
  accountError?: string | null;
  showAccountDetailsInReview?: boolean;
}

export default function CustomerAgreementWrapper({
  reviewMode = false,
  initialMode = 'edit',
  onStartEdit,
  onEndEdit,
  showAssociatedAccounts = true,
  useBranchCountry = false,
  title,
  initialAgreementId,
  initialAgreementName,
  initialSelectedAccountId,
  onAgreementChange,
  onAccountChange,
  onBatchChange,
  batchAccount,
  agreementError,
  accountError,
  showAccountDetailsInReview = false,
}: Readonly<CustomerAgreementWrapperProps>) {
  const [mode, setMode] = React.useState<'view' | 'edit' | 'create'>(initialMode);
  React.useEffect(() => {
    if (reviewMode) {
      setMode('view');
    }
  }, [reviewMode]);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'view' ? 'edit' : 'view';
      if (next === 'edit') onStartEdit?.(); else onEndEdit?.();
      return next;
    });
  };

  const handleCancel = () => {
    setMode('view');
    onEndEdit?.();
  };

  const handleSave = () => {
    setMode('view');
    onEndEdit?.();
  };

  return (
    <CustomerAgreement
      reviewMode={reviewMode}
      onEdit={toggleMode}
      onCancel={handleCancel}
      onSave={handleSave}
      mode={mode}
      showAssociatedAccounts={showAssociatedAccounts}
      useBranchCountry={useBranchCountry}
      title={title}
      expandIcon={false}
      initialAgreementId={initialAgreementId}
      initialAgreementName={initialAgreementName}
      initialSelectedAccountId={initialSelectedAccountId}
      onAgreementChange={onAgreementChange}
      onAccountChange={onAccountChange}
      onBatchChange={onBatchChange}
      batchAccount={batchAccount}
      agreementError={agreementError}
      accountError={accountError}
      showAccountDetailsInReview={showAccountDetailsInReview}
    />
  );
}
