import { useCallback } from 'react';
import {useAppDispatch, useAppSelector} from '@lib/hooks/useAppDispatch';
import { 
  resetBiller, 
  createBiller, 
  fetchBillerById, 
  deleteManagedBillerById, 
  resetManagedBiller,
  fetchAllBills 
} from '../../store/slices/createBillerSlice';

interface UseBillersResult {
  biller: any;
  managedBiller: any;
  allBills: any[];
  loading: boolean;
  error: string | null;
  createBillerRequest: () => Promise<any>;
  submitCreateBiller: () => void;
  getBillerById: (id: string) => Promise<any>;
  deleteBillerById: (id: string) => Promise<any>;
  getAllBills: () => Promise<any>;
}

export function useBillers(): UseBillersResult {
  const dispatch = useAppDispatch();
  const biller = useAppSelector((state) => state.createBiller.biller);
  const managedBiller = useAppSelector((state) => state.createBiller.managedBiller);
  const allBills = useAppSelector((state) => state.createBiller.allBills);
  const loading = useAppSelector((state) => state.createBiller.loading);
  const error = useAppSelector((state) => state.createBiller.error);

  const createBillerRequest = useCallback(async () => {
    try {
      const resultAction = await dispatch(createBiller(biller));
      if (createBiller.fulfilled.match(resultAction)) {
        dispatch(resetBiller());
      }
      return resultAction;
    } catch (error) {
      dispatch(resetBiller());
      throw error;
    }
  }, [dispatch, biller]);

  const submitCreateBiller = useCallback(() => {
    // Placeholder for submission/approval flow
    console.log('Submitting biller for approval:', biller);
    dispatch(resetBiller());
  }, [dispatch, biller]);

  const getBillerById = useCallback(async (id: string) => {
    const resultAction = await dispatch(fetchBillerById(id));
    return resultAction;
  }, [dispatch]);

  const deleteBillerById = useCallback(async (id: string) => {
    const resultAction = await dispatch(deleteManagedBillerById(id));
    if (deleteManagedBillerById.fulfilled.match(resultAction)) {
      dispatch(resetManagedBiller());
    }
    return resultAction;
  }, [dispatch]);

  const getAllBills = useCallback(async () => {
    const resultAction = await dispatch(fetchAllBills());
    return resultAction;
  }, [dispatch]);

  return { 
    biller, 
    managedBiller, 
    allBills,
    loading, 
    error, 
    createBillerRequest, 
    submitCreateBiller, 
    getBillerById, 
    deleteBillerById,
    getAllBills 
  };
}
