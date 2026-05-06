import {useState,useEffect} from 'react';
import TransferTypeForm, { TransferTypeFormState } from './TransferTypeForm';
import TransferTypeDetails from './TransferTypeDetails';
import { buildTestId } from 'src/utils/testIds';
import { useAppDispatch,useAppSelector } from '@lib/hooks/useAppDispatch';
import type { RootState, AppDispatch } from 'store/index';
import { fetchAccounts } from '@store/slices/setup-admin/commonSlice/accountsSlice';
import type { TransferTypeAccount } from 'types/api/transfer-types.res';
import type { Account } from '@molecules/CustomerAgreementSelector';

interface Props {
  form: TransferTypeFormState;
  errors: Record<string, string>;
  submitting: boolean;
  onFormChange: (form: TransferTypeFormState) => void;
  status: { ok?: boolean; message?: string };
  initialMode?: 'view' | 'edit' | 'create';
  reviewMode?: boolean;
  onSave?: (data: TransferTypeFormState) => void;
  onCancel?: () => void;
  onValidSubmit?: (data: TransferTypeFormState) => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  testIdPrefix?: string;
}

export default function TransferTypeFormWrapper({
  form,
  errors,
  submitting,
  onFormChange,
  status,
  initialMode = 'edit',
  reviewMode = false,
  onSave,
  onCancel,
  onValidSubmit,
  onStartEdit,
  onEndEdit,
  testIdPrefix = 'transfer-type-form-wrapper',
}: Props) {
  const dispatch = useAppDispatch();
  const { data: accountsData, isLoading: accountsLoading } = useAppSelector((state) => state.accounts);
  
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // Shared account state for both Form and Details components
  const [payerAccounts, setPayerAccounts] = useState<Account[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<Account[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]); // Combined pool for lookup
  const [lastFetchedAgreement, setLastFetchedAgreement] = useState<{ agreement: string; type: 'payer' | 'payment' } | null>(null);
  const [fetchQueue, setFetchQueue] = useState<Array<{ agreement: string; type: 'payer' | 'payment' }>>([]);

  // Queue fetches when agreements change
  useEffect(() => {
    if (form.payerCustomerAgreement) {
      setFetchQueue(prev => {
        // Check if we already have this exact fetch (same agreement + type)
        const hasPayer = prev.some(f => f.type === 'payer' && f.agreement === form.payerCustomerAgreement);
        if (hasPayer) return prev;
        // Remove old payer fetch and add new one
        return [...prev.filter(f => f.type !== 'payer'), { agreement: form.payerCustomerAgreement, type: 'payer' as const }];
      });
    }
  }, [form.payerCustomerAgreement]);

  useEffect(() => {
    if (form.paymentCustomerAgreement) {
      setFetchQueue(prev => {
        // Check if we already have this exact fetch (same agreement + type)
        const hasPayment = prev.some(f => f.type === 'payment' && f.agreement === form.paymentCustomerAgreement);
        if (hasPayment) return prev;
        // Remove old payment fetch and add new one
        return [...prev.filter(f => f.type !== 'payment'), { agreement: form.paymentCustomerAgreement, type: 'payment' as const }];
      });
    }
  }, [form.paymentCustomerAgreement]);

  // Process fetch queue one at a time
  useEffect(() => {
    if (fetchQueue.length > 0 && !accountsLoading) {
      const nextFetch = fetchQueue[0];
      setLastFetchedAgreement(nextFetch);
      const accountType = nextFetch.type === 'payer' ? 'D' : 'C';
      dispatch(fetchAccounts({ agreementKey: nextFetch.agreement, accountType }));
      
      setFetchQueue(prev => prev.slice(1));
    }
  }, [fetchQueue, accountsLoading, dispatch]);

  // Transform and store accounts based on the last fetch type
  useEffect(() => {
    if (accountsData && accountsData.length > 0 && lastFetchedAgreement) {
      const transformedAccounts: Account[] = accountsData.map((acc: TransferTypeAccount, index: number) => ({
        id: acc.accountKey.toString(),
        name: acc.accountName || `${index + 1}. [Account name]`,
        masked: acc.accountNumber,
        accNumber: acc.accountNumber,
        sortCode: acc.sortCode,
        bic: acc.bic,
        currency: acc.currency || acc.currencyCode || null,
        currencyFull: acc.currencyDisplayName || null,
        country: acc.countryCode || acc.countryDisplayName || null,
      }));

      if (lastFetchedAgreement.type === 'payer') {
        setPayerAccounts(transformedAccounts);
      } else {
        setPaymentAccounts(transformedAccounts);
      }
      
      // Add to combined pool for easier lookup
      setAllAccounts(prev => {
        // Remove duplicates and add new accounts
        const existingIds = prev.map(a => a.id);
        const newAccounts = transformedAccounts.filter(a => !existingIds.includes(a.id));
        return [...prev, ...newAccounts];
      });
    }
  }, [accountsData, lastFetchedAgreement]);

  useEffect(() => {
    if (reviewMode) {
      setMode('view');
    }
  }, [reviewMode]);

  const handleEnterEdit = () => {
    setMode('edit');
    onStartEdit?.();
  };

  const handleEnterView = () => {
    setMode('view');
    setEditingSection(null); // Reset editing section when returning to view
    onEndEdit?.();
  };

  const handleEditSection = (section: string) => {
    setEditingSection(section);
    setMode('edit');
    onStartEdit?.();
  };

  const handleSave = (data: TransferTypeFormState) => {
    onSave?.(data);
    setEditingSection(null); // Reset after save
    setMode('view'); // Return to view mode
    onEndEdit?.(); // Notify parent to check if changes exist
  };

  const handleCancel = () => {
    onCancel?.();
    setEditingSection(null); // Reset after cancel
    setMode('view'); // Return to view mode
    onEndEdit?.(); // Notify parent
  };

  if (mode === 'view') {
    return (
      <TransferTypeDetails
        form={form}
        reviewMode={true}
        onEdit={handleEnterEdit}
        onEditSection={handleEditSection}
        expandIcon={false}
        payerAccounts={payerAccounts}
        paymentAccounts={paymentAccounts}
        allAccounts={allAccounts}
        testIdPrefix={buildTestId(testIdPrefix, 'details')}
      />
    );
  }

  return (
    <TransferTypeForm
      form={form}
      errors={errors}
      submitting={submitting}
      onFormChange={onFormChange}
      status={status}
      mode={mode}
      reviewMode={editingSection !== null ? true : reviewMode}
      onEdit={handleEnterView}
      onSave={handleSave}
      onCancel={handleCancel}
      onValidSubmit={onValidSubmit}
      initialEditingSection={editingSection}
      payerAccounts={payerAccounts}
      paymentAccounts={paymentAccounts}
      accountsLoading={accountsLoading}
      onSetFetchQueue={setFetchQueue}
      testIdPrefix={buildTestId(testIdPrefix, 'form')}
    />
  );
}
