import { AppDispatch, RootState } from "@store/index";
import { fetchCollectionTypes, deleteCollectionTypes, clearDeleteError } from "@store/slices/collectionTypesSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { CollectionType, CollectionTypeFilters, COLLECTION_TYPE_STATUS_CODES } from "types/redux/collectionTypes";

interface UseCollectionTypesParams {
    onShowDeleteError?: () => void;
}

interface UseCollectionResult{
    filteredData: CollectionType[],
    selectedTab: number,
    loading: boolean,
    filters: CollectionTypeFilters,
    searchText: string,
    setSearchText: (text: string) => void,
    selectedRows: CollectionType[],
    setSelectedRows: (rows: CollectionType[]) => void,
    mappedRows: CollectionType[],
    hasFiltersOrSearch: boolean,
    totalRows: number,
    currentPage?: number,
    perPage?: number,
    sortBy?: { field: string; order: 'asc' | 'desc' } | null,
    handleSort: (column: string, order: 'asc' | 'desc') => void,
    handlePageChange: (page: number) => void,
    handlePerPageChange: (perPage: number) => void,
    handleDelete: (items: { collectionTypeKey: string | number; collectionTypeName: string }[]) => Promise<void>;
}

export function useCollectionTypes(params?: UseCollectionTypesParams): UseCollectionResult{
    const dispatch = useAppDispatch();
    const onShowDeleteError = params?.onShowDeleteError;

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [sortBy, setSortBy] = useState<{ field: string; order: 'asc' | 'desc' } | null>({field: "collectionTypeName", order: "asc"});
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState<CollectionType[]>([]);

    const { 
        data, 
        filteredData: rawFilteredData, 
        selectedTab, 
        loading,
        filters,
        deleteError
    } = useAppSelector((state: RootState) => state.collectionTypes);

    const filteredData = useMemo(() => {
        const searchLower = searchText.trim().toLowerCase();
        
        if (!searchLower) {
            return rawFilteredData;
        }
        
        return rawFilteredData.filter((row: CollectionType) => {
            return (
                row.collectionTypeName.toLowerCase().includes(searchLower) ||
                row.customerAgreement.toLowerCase().includes(searchLower)
            );
        });
    }, [rawFilteredData, searchText]);

    const fullMappedData = useMemo(() => {
        const statusFilter =
            selectedTab === 1
                ? COLLECTION_TYPE_STATUS_CODES.AWAITING_APPROVAL
                : selectedTab === 2
                ? COLLECTION_TYPE_STATUS_CODES.ACTIVE
                : selectedTab === 3
                ? COLLECTION_TYPE_STATUS_CODES.DRAFT
                : undefined;

        const dataToMap = statusFilter 
            ? filteredData.filter((row: any) => row.status.value === statusFilter)
            : filteredData;

        return dataToMap;
    }, [filteredData, selectedTab]);

    const totalRows = useMemo(() => fullMappedData.length, [fullMappedData]);

    const mappedRows = useMemo(() => {
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        return fullMappedData.slice(startIndex, endIndex);
    }, [fullMappedData, currentPage, perPage]);

    const hasFiltersOrSearch = useMemo(
        () => Object.keys(filters).length > 0 || searchText.trim().length > 0,
        [filters, searchText]
    );

    const handleSort = useCallback((column: string, order: 'asc' | 'desc') => {
        setSortBy({ field: column, order });
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        setSelectedRows([]);
    }, []);

    const handlePerPageChange = useCallback((perPage: number) => {
        setPerPage(perPage);
        setCurrentPage(1);
        setSelectedRows([]);
    }, []);

    const handleDelete = useCallback(async (items: { collectionTypeKey: string | number; collectionTypeName: string }[]) => {
        try {
            await dispatch(deleteCollectionTypes(items)).unwrap();
            setSelectedRows([]);
            setCurrentPage(1);
        } catch (error) {
            throw error;
        }
    }, [dispatch]);

    useEffect(() => {
        if (deleteError && onShowDeleteError) {
            onShowDeleteError();
        }
    }, [deleteError, onShowDeleteError]);

    const fetchData = useCallback(() => {
        dispatch(fetchCollectionTypes());
    }, [dispatch]);

    useEffect(() => {
        if (!data || data.length === 0) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchText, selectedTab]);

    useEffect(() => {
        setSelectedRows([]);
    }, [filters, searchText, selectedTab]);

    return { 
        filteredData, 
        selectedTab, 
        loading, 
        filters,
        searchText,
        setSearchText,
        selectedRows,
        setSelectedRows,
        mappedRows,
        hasFiltersOrSearch,
        totalRows,
        currentPage, 
        perPage, 
        sortBy, 
        handleSort, 
        handlePageChange, 
        handlePerPageChange,
        handleDelete
    };
};