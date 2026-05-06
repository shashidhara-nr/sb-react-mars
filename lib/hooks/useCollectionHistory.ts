import { AppDispatch, RootState } from '@store/index';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import {
  fetchCollectionHistory,
  setDebtorInfo,
  setFilters as setFiltersAction,
  clearFilters,
  CollectionHistoryFilters,
} from '@store/slices/collectionHistorySlice';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCollectionHistoryParams {
  debtorCode?: string;
  debtorName?: string;
  autoFetch?: boolean;
}

export const useCollectionHistory = ({
  debtorCode: initialDebtorCode = '',
  debtorName: initialDebtorName = '',
  autoFetch = true,
}: UseCollectionHistoryParams = {}) => {
  const dispatch = useAppDispatch();
  const isFirstMount = useRef(true);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    collectionHistories,
    loading,
    error,
    filters,
    debtorCode,
    pageSize,
    rowCount,
  } = useAppSelector((state) => state.collectionHistory);

  useEffect(() => {
    if (initialDebtorCode && initialDebtorCode !== debtorCode) {
      dispatch(setDebtorInfo({
        debtorCode: initialDebtorCode,
        debtorName: initialDebtorName,
      }));
    }
  }, [initialDebtorCode, initialDebtorName, debtorCode, dispatch]);

  const handleSetFilters = useCallback(
    (newFilters: Partial<CollectionHistoryFilters>) => {
      dispatch(setFiltersAction(newFilters));
      setCurrentPage(1);
      setTimeout(() => {
        dispatch(fetchCollectionHistory({
          position: 0,
          pageSize,
          debtorCode: initialDebtorCode || debtorCode,
          filters: { ...filters, ...newFilters },
        }));
      }, 0);
    },
    [dispatch, pageSize, initialDebtorCode, debtorCode, filters]
  );

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
    setCurrentPage(1);
    setTimeout(() => {
      dispatch(fetchCollectionHistory({
        position: 0,
        pageSize,
        debtorCode: initialDebtorCode || debtorCode,
        filters: {},
      }));
    }, 0);
  }, [dispatch, pageSize, initialDebtorCode, debtorCode]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      const newPosition = (newPage - 1) * pageSize;
      dispatch(fetchCollectionHistory({
        position: newPosition,
        pageSize,
        debtorCode: initialDebtorCode || debtorCode,
        filters,
      }));
    },
    [dispatch, pageSize, initialDebtorCode, debtorCode, filters]
  );

  const handlePerPageChange = useCallback(
    (newPerPage: number) => {
      setCurrentPage(1);
      dispatch(fetchCollectionHistory({
        position: 0,
        pageSize: newPerPage,
        debtorCode: initialDebtorCode || debtorCode,
        filters,
      }));
    },
    [dispatch, initialDebtorCode, debtorCode, filters]
  );

  useEffect(() => {
    if (isFirstMount.current && autoFetch && (initialDebtorCode || debtorCode)) {
      isFirstMount.current = false;
      dispatch(fetchCollectionHistory({ debtorCode: initialDebtorCode || debtorCode }));
    }
  }, [autoFetch, initialDebtorCode, debtorCode, dispatch]);

  return {
    collectionHistories,
    loading,
    error,
    currentPage,
    pageSize,
    rowCount,
    filters,
    setFilters: handleSetFilters,
    clearFilters: handleClearFilters,
    handlePageChange,
    handlePerPageChange,
  };
};
