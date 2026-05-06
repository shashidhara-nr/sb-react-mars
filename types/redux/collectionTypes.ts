 
export interface CollectionTypeStatus {
  value: string;
  label: string;
  color: string;
}
 
export interface CollectionTypeLinks {
  text: string;
  href: string;
}
 
export interface CollectionType {
  id: number | string;
  collectionTypeName: string;
  authorisationProfile: string;
  customerAgreement: string;
  numberOfCount: number;
  status: CollectionTypeStatus;
  links: CollectionTypeLinks;
}
 
export interface CollectionTypeFilters {
  collectionTypeName?: string;
  authorisationProfile?: string;
  numberOfCount?: string | number;
  status?: string;
}
 
export interface CollectionTypesState {
  data: CollectionType[];
  filteredData: CollectionType[];
  filters: CollectionTypeFilters;
  selectedTab: number;
  loading: boolean;
  error: string | null;
  deleteError: string | null;
  searchType: string;
  searchValue: string;
}

export const COLLECTION_TYPE_STATUS_CODES = {
  ACTIVE: 'ACT',
  AWAITING_APPROVAL: 'APP',
  DRAFT: 'DRAFT',
} as const;
