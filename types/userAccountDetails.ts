export interface UserAccountDetails {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  editDate?: string;
  authorisationClass: string;
  language: string;
  communicationPermissions?: string;
  userId: string;
  userName: string;
  idNumber: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth: string;
  email: string;
  mobile?: string;
  phoneNumber?: string;
  adminRole: string;
  roles: string[];
  status: 'Active' | 'Suspended';
  addressLine1?: string;
  addressLine2?: string;
  countryRegion?: string;
  communicationPreference?: string;
}

export interface CreateUserAccountDetails {
  userAccountName?: string;
  dateRange?:string;
  firstName?: string;
  lastName?: string;
  email?:string;
  searchUserAccounts?: string;
  authClass?: string;
  addressLine1?: string;
  addressLine2?: string;
  countryRegion?: string;
  phoneNumber?: string;
  emailAddress?: string;
  idNumber?: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  selectUserAccount?: string;
  roles?: string[];
}
