import * as React from 'react';
import CollectionTypeForm, { CollectionTypeFormState } from './CollectionTypeForm';
import CollectionTypeDetails from './CollectionTypeDetails';

interface Props {
  form: CollectionTypeFormState;
  errors: Record<string, string>;
  submitting: boolean;
  onFormChange: (form: CollectionTypeFormState) => void;
  status: { ok?: boolean; message?: string };
  initialMode?: 'view' | 'edit' | 'create';
  reviewMode?: boolean;
  onSave?: (data: CollectionTypeFormState) => void;
  onCancel?: () => void;
  onValidSubmit?: (data: CollectionTypeFormState) => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  variant?: 'collection' | 'transfer';
}
export default function CollectionTypeFormWrapper({
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
  variant = 'collection',
}: Props) {
  const [mode, setMode] = React.useState<'view' | 'edit' | 'create'>(initialMode);

  React.useEffect(() => {
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
    onEndEdit?.();
  };

  if (mode === 'view') {
    return (
      <CollectionTypeDetails
        form={form}
        reviewMode={reviewMode}
        onEdit={handleEnterEdit}
        expandIcon={false}
        variant={variant}
      />
    );
  }

  return (
    <CollectionTypeForm
      form={form}
      errors={errors}
      submitting={submitting}
      onFormChange={onFormChange}
      status={status}
      mode={mode}
      onEdit={handleEnterView}
      onSave={onSave}
      onCancel={onCancel}
      onValidSubmit={onValidSubmit}
      variant={variant}
    />
  );
}
