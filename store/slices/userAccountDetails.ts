import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserAccountDetails } from 'types/userAccountDetails';

interface UserAccountDetailsState {
  details: UserAccountDetails;
}

const initialState: UserAccountDetailsState = {
  details: {
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    authorisationClass: '',
    language: '',
    userId: '',
    userName: '',
    idNumber: '',
    dateOfBirth: '',
    email: '',
    mobile: '',
    adminRole: '',
    roles: [],
    status: 'Active',
  },
};

const userAccountDetailsSlice = createSlice({
  name: 'userAccountDetails',
  initialState,
  reducers: {},
});

export default userAccountDetailsSlice.reducer;
