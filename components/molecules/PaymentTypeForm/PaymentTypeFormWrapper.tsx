import * as React from 'react';
import PaymentTypeForm, { PaymentTypeFormState } from './PaymentTypeForm';
import PaymentTypeDetails from './PaymentTypeDetails';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { fetchAuthorisationProfiles } from '@store/slices/setup-admin/commonSlice/authorisationProfileSlice';
import type { RootState, AppDispatch } from 'store/index';
interface PaymentTypeFormWrapperProps {
  form: PaymentTypeFormState;
  errors: Record<string, string>;
  submitting: boolean;
  onFormChange: (form: PaymentTypeFormState) => void;
  status: { ok?: boolean; message?: string };
  initialMode?: 'view' | 'edit' | 'create';
  reviewMode?: boolean;
  onSave?: (data: PaymentTypeFormState) => void;
  onCancel?: () => void;
  onValidSubmit?: (data: PaymentTypeFormState) => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
}

export default function PaymentTypeFormWrapper({
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
}: Readonly<PaymentTypeFormWrapperProps>) {
  const dispatch = useAppDispatch();
  const [mode, setMode] = React.useState<'view' | 'edit' | 'create'>(initialMode);
  const { data: authorisationProfileData } = useAppSelector((state) => state.authorisationProfile);
  React.useEffect(() => {
    // When the page enters review mode, show the read-only details.
    if (reviewMode) {
      setMode('view');
    }
  }, [reviewMode]);
  React.useEffect(() => {
      dispatch(fetchAuthorisationProfiles());
    }, [dispatch]);
  
  const authorizationsProfileList = React.useMemo(() => {
    return authorisationProfileData?.map(profile => ({
      label: profile.authProfileName,
      value: String(profile.authProfileKey)
    })) || [];
  }, [authorisationProfileData]);

  const handleEnterEdit = () => {
    // When user clicks Edit from the summary view, always go into
    // explicit 'edit' mode so the header Save/Cancel buttons show.
    setMode('edit');
    onStartEdit?.();
  };

  const handleEnterView = () => {
    setMode('view');
    onEndEdit?.();
  };

  if (mode === 'view') {
    return (
      <PaymentTypeDetails
        form={form}
        reviewMode
        onEdit={handleEnterEdit}
      />
    );
  }

  // edit or create
  return (
    <PaymentTypeForm
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
      authorizationsProfileList={authorizationsProfileList}
    />
  );
}
