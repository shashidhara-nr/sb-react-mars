import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import { getCollectionTypeById } from '@lib/api/collectionTypesApi';
import { fetchStatementReferences } from '@store/slices/statementReferenceSlice';
import { fetchCollectionTypeAccounts } from '@store/slices/setup-admin/commonSlice/agreementAccountSlice';
import { fetchCustomerAgreement } from '@store/slices/setup-admin/commonSlice/customerAgreementSlice';
import type {
  CollectionTypeFormState,
  FileUploadOptionsState,
  StatementReferencingState,
  HostToHostOptionsState,
  CollectionModelState,
} from 'components/molecules';

interface CollectionTypeData {
  form: CollectionTypeFormState;
  fileUploadOptions: FileUploadOptionsState;
  statementReferencing: StatementReferencingState;
  hostToHostOptions: HostToHostOptionsState;
  collectionModel: CollectionModelState;
  customerAgreement: {
    agreementId: string;
    agreementName: string;
    selectedAccountId: string;
  };
  collectionTypeKey?: number;
}

interface UseManageCollectionTypeResult {
  data: CollectionTypeData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useManageCollectionType(id: string | number): UseManageCollectionTypeResult {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<CollectionTypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const collectionTypeData = await getCollectionTypeById(id);
      setData(collectionTypeData);
      
      await dispatch(fetchCustomerAgreement({ service: 'COLLECTION' })).unwrap();
      
      if (collectionTypeData.customerAgreement.agreementId) {
        await dispatch(fetchCollectionTypeAccounts({agreementKey: collectionTypeData.customerAgreement.agreementId})).unwrap();
        
        if (collectionTypeData.customerAgreement.selectedAccountId) {
          dispatch(fetchStatementReferences({
            agreementKey: collectionTypeData.customerAgreement.agreementId,
            accountKeys: collectionTypeData.customerAgreement.selectedAccountId,
            instrumentClassification: 'COLLECTION',
          }));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load collection type data';
      setError(errorMessage);
      console.error('Error loading collection type:', err);
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
