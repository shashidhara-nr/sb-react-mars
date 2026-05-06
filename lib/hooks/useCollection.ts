import { AppDispatch, RootState } from "@store/index";
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { fetchDebtors, updateFilter, clearFilters, setSort } from "@store/slices/collectionSlice";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseCollectionResult {
    debtors: any[];
    loading: boolean;
    error: string | null;
    filters: {
        debtorName: string;
        debtorCode: string;
    };
    currentPage: number;
    pageSize: 50 | 100 | 5 | 15 | 30;
    rowCount: number;
    hasFilters: boolean;
    sortBy: string;
    sortAsc: boolean;
    fetchDebtors: (params?: any) => void;
    updateFilter: (key: 'debtorName' | 'debtorCode', value: string) => void;
    setFilters: (filters: { debtorName: string; debtorCode: string }) => void;
    clearFilters: () => void;
    handlePageChange: (newPage: number) => void;
    handlePerPageChange: (newPerPage: number) => void;
    handleSort: (columnId: string) => void;
}

export const useCollection = (): UseCollectionResult => {
    const dispatch = useAppDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    
    const {
        debtors,
        loading,
        error,
        filters,
        pageSize,
        rowCount,
        sortBy,
        sortAsc,
    } = useAppSelector((state) => state.collection);
    
    const handleFetchDebtors = useCallback((params?: any) => {
        dispatch(fetchDebtors(params));
    }, [dispatch]);
    
    const handleUpdateFilter = useCallback((key: 'debtorName' | 'debtorCode', value: string) => {
        dispatch(updateFilter({ key, value }));
    }, [dispatch]);
    
    const handleSetFilters = useCallback((newFilters: { debtorName: string; debtorCode: string }) => {
        dispatch(updateFilter({ key: 'debtorName', value: newFilters.debtorName }));
        dispatch(updateFilter({ key: 'debtorCode', value: newFilters.debtorCode }));
        setCurrentPage(1);
        setTimeout(() => {
            dispatch(fetchDebtors({ position: 0, pageSize }));
        }, 0);
    }, [dispatch, pageSize]);
    
    const handleClearFilters = useCallback(() => {
        dispatch(clearFilters());
        setCurrentPage(1);
        setTimeout(() => {
            dispatch(fetchDebtors({ position: 0, pageSize }));
        }, 0);
    }, [dispatch, pageSize]);
    
    const hasFilters = useMemo(() => {
        return Boolean(filters?.debtorName || filters?.debtorCode);
    }, [filters?.debtorName, filters?.debtorCode]);
    
    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
        const newPosition = (newPage - 1) * pageSize;
        dispatch(fetchDebtors({ position: newPosition, pageSize }));
    }, [dispatch, pageSize]);
    
    const handlePerPageChange = useCallback((newPerPage: number) => {
        setCurrentPage(1);
        dispatch(fetchDebtors({ position: 0, pageSize: newPerPage }));
    }, [dispatch]);
    
    const handleSort = useCallback((columnId: string) => {
        if (columnId !== 'debtorName' && columnId !== 'debtorCode') {
            return;
        }
        
        const newSortAsc = sortBy === columnId ? !sortAsc : true;
        dispatch(setSort({ sortBy: columnId, sortAsc: newSortAsc }));
        setCurrentPage(1);
        
        dispatch(fetchDebtors({ 
            position: 0, 
            pageSize,
            sortBy: columnId,
            asc: newSortAsc,
        }));
    }, [dispatch, pageSize, sortBy, sortAsc]);
    
    useEffect(() => {
        handleFetchDebtors();
    }, [handleFetchDebtors]);
    
    return {
        debtors,
        loading,
        error,
        filters,
        currentPage,
        pageSize,
        rowCount,
        hasFilters,
        sortBy,
        sortAsc,
        fetchDebtors: handleFetchDebtors,
        updateFilter: handleUpdateFilter,
        setFilters: handleSetFilters,
        clearFilters: handleClearFilters,
        handlePageChange,
        handlePerPageChange,
        handleSort,
    };
}