import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../../store';
import {
  resetBopThirdParty,
  resetManagedBopThirdParty,
  updateBopThirdParty,
  updateBopThirdPartyObject,
  updateManagedBopThirdParty,
  updateManagedBopThirdPartyObject,
  clearError,
  createBopThirdParty,
  fetchBopThirdPartyById,
  updateBopThirdPartyById,
  deleteBopThirdPartyById,
} from '../../store/slices/bopThirdPartySlice';
import { BopThirdPartyPayload } from '../../types/setup-and-admin/bopThirdParty';

interface UseBopThirdPartyResult {
  // State
  bopThirdParty: BopThirdPartyPayload;
  managedBopThirdParty: BopThirdPartyPayload;
  isLoading: boolean;
  error: string | null;
  
  // Actions for main bopThirdParty
  updateField: (field: string, value: any) => void;
  updateObject: (path: string[], value: any) => void;
  resetData: () => void;
  
  // Actions for managedBopThirdParty
  updateManagedField: (field: string, value: any) => void;
  updateManagedObject: (path: string[], value: any) => void;
  resetManagedData: () => void;
  
  // API operations
  createBopThirdPartyRequest: (payload?: BopThirdPartyPayload) => Promise<any>;
  getBopThirdPartyById: (id: string) => Promise<any>;
  updateBopThirdPartyRequest: (id: string, payload?: BopThirdPartyPayload) => Promise<any>;
  deleteBopThirdPartyRequest: (id: string) => Promise<any>;
  
  // Error handling
  clearErrorMessage: () => void;
}

/**
 * Custom hook for managing BOP Third Party state and operations
 * Similar to useDebtors but tailored for BOP Third Party entities
 */
export function useBopThirdParty(): UseBopThirdPartyResult {
  const dispatch = useAppDispatch();
  
  // Selectors
  const bopThirdParty = useAppSelector((state) => state.bopThirdParty.bopThirdParty);
  const managedBopThirdParty = useAppSelector((state) => state.bopThirdParty.managedBopThirdParty);
  const isLoading = useAppSelector((state) => state.bopThirdParty.isLoading);
  const error = useAppSelector((state) => state.bopThirdParty.error);
  
  // Actions for main bopThirdParty
  const updateField = (field: string, value: any) => {
    dispatch(updateBopThirdParty({ field, value }));
  };
  
  const updateObject = (path: string[], value: any) => {
    dispatch(updateBopThirdPartyObject({ path, value }));
  };
  
  const resetData = () => {
    dispatch(resetBopThirdParty());
  };
  
  // Actions for managedBopThirdParty
  const updateManagedField = (field: string, value: any) => {
    dispatch(updateManagedBopThirdParty({ field, value }));
  };
  
  const updateManagedObject = (path: string[], value: any) => {
    dispatch(updateManagedBopThirdPartyObject({ path, value }));
  };
  
  const resetManagedData = () => {
    dispatch(resetManagedBopThirdParty());
  };
  
  const createBopThirdPartyRequest = useCallback(async (payload?: BopThirdPartyPayload) => {
    try {
      const dataToSubmit = payload || bopThirdParty;
      const resultAction = await dispatch(createBopThirdParty(dataToSubmit));
      
      if (createBopThirdParty.fulfilled.match(resultAction)) {
        dispatch(resetBopThirdParty());
        return resultAction;
      } else {
        throw new Error('Failed to create BOP third party');
      }
    } catch (error) {
      console.error('Error creating BOP third party:', error);
      throw error;
    }
  }, [dispatch, bopThirdParty]);
  
  const getBopThirdPartyById = useCallback(async (id: string) => {
    try {
      const resultAction = await dispatch(fetchBopThirdPartyById(id));
      
      if (fetchBopThirdPartyById.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error('Failed to fetch BOP third party');
      }
    } catch (error) {
      console.error('Error fetching BOP third party:', error);
      throw error;
    }
  }, [dispatch]);
  
  const updateBopThirdPartyRequest = useCallback(async (id: string, payload?: BopThirdPartyPayload) => {
    try {
      const dataToSubmit = payload || managedBopThirdParty;
      const resultAction = await dispatch(updateBopThirdPartyById({ id, payload: dataToSubmit }));
      
      if (updateBopThirdPartyById.fulfilled.match(resultAction)) {
        return resultAction;
      } else {
        throw new Error('Failed to update BOP third party');
      }
    } catch (error) {
      console.error('Error updating BOP third party:', error);
      throw error;
    }
  }, [dispatch, managedBopThirdParty]);
  
  const deleteBopThirdPartyRequest = useCallback(async (id: string) => {
    try {
      const resultAction = await dispatch(deleteBopThirdPartyById(id));
      
      if (deleteBopThirdPartyById.fulfilled.match(resultAction)) {
        dispatch(resetManagedBopThirdParty());
        return resultAction;
      } else {
        throw new Error('Failed to delete BOP third party');
      }
    } catch (error) {
      console.error('Error deleting BOP third party:', error);
      throw error;
    }
  }, [dispatch]);
  
  const clearErrorMessage = () => {
    dispatch(clearError());
  };
  
  return {
    // State
    bopThirdParty,
    managedBopThirdParty,
    isLoading,
    error,
    
    // Actions for main bopThirdParty
    updateField,
    updateObject,
    resetData,
    
    // Actions for managedBopThirdParty
    updateManagedField,
    updateManagedObject,
    resetManagedData,
    
    // API operations
    createBopThirdPartyRequest,
    getBopThirdPartyById,
    updateBopThirdPartyRequest,
    deleteBopThirdPartyRequest,
    
    // Error handling
    clearErrorMessage,
  };
}
