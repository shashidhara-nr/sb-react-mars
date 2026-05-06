import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { create } from 'domain';
import { get } from 'http';
import { AccountGroupAccountDetails, CreateAccountGroupPayload } from 'types/accountGroupDetails';

interface CreateAccountGroupDetailsState {
  create: CreateAccountGroupPayload;
}

const initialState: CreateAccountGroupDetailsState = {
  create: {
    accountGroupName: '',
    serviceAgreement: '',
    addAccounts: [],
    subGroups: [],
    accountGroupDetails: null,
  },
};

const createAccountGroupDetailsSlice = createSlice({
  name: 'createAccountGroupDetails',
  initialState,
  reducers: {
    updateAccountGroupDetails(state, action: PayloadAction<{ field: string; value: any }>) {
      const { field, value } = action.payload;
      (state.create as any)[field] = value;
    },
    deleteAccountFromAddedAccounts(state) {
      state.create.addAccounts = state.create.addAccounts.filter(
        (account) => account.checkbox !== true,
      );
    },
    deleteAddedAccounts(state) {
      state.create.addAccounts = [];
    },
    toggleAccountCheckbox(state, action: PayloadAction<{ id: string }>) {
      const account = state.create.addAccounts.find((account) => account.id === action.payload.id);
      if (account) {
        account.checkbox = !account.checkbox;
      }
    },
    togglesubGroupAccountsCheckbox(
      state,
      action: PayloadAction<{ subGroupIndex: number; id: string }>,
    ) {
      const subGroup = state.create.subGroups[action.payload.subGroupIndex];
      if (subGroup) {
        const account = subGroup.subGroupAccounts.find(
          (account) => account.id === action.payload.id,
        );
        if (account) {
          account.checkbox = !account.checkbox;
        }
      }
    },
    createSubGroup(
      state,
      action: PayloadAction<{ subGroupName: string; account: AccountGroupAccountDetails }>,
    ) {
      const newSubGroup = {
        subGroupName: action.payload.subGroupName,
        subGroupAccounts: action.payload.account ? [action.payload.account] : [],
      };
      state.create.subGroups.push(newSubGroup);
    },
    deleteAllSubGroupAccounts(state) {
      state.create.subGroups = [];
    },
    deleteSubGroupAccountByIndex(state, action: PayloadAction<{ index: number }>) {
      const index = action.payload.index;
      if (index >= 0 && index < state.create.subGroups.length) {
        state.create.subGroups.splice(index, 1);
      }
    },
    deleteAccountsFromSubGroup(state, action: PayloadAction<{ index: number }>) {
      const index = action.payload.index;
      if (index >= 0 && index < state.create.subGroups.length) {
        state.create.subGroups[index].subGroupAccounts = state.create.subGroups[
          index
        ].subGroupAccounts.filter((account) => account.checkbox !== true);
      }
    },
    renameSubGroup(state, action: PayloadAction<{ index: number; name: string }>) {
      const { index, name } = action.payload;

      if (state.create.subGroups[index]) {
        state.create.subGroups[index].subGroupName = name;
      }
    },
    accountGroupDetailsMain(state, action: PayloadAction<{ accountGroupName: string; serviceAgreement: {label: string; value: string} | null }>) {
      state.create.accountGroupDetails = {
        accountGroupName: state.create.accountGroupDetails?.accountGroupName || '',
        serviceAgreement: state.create.accountGroupDetails?.serviceAgreement || null,
      };
    },
  },
});

export const {
  updateAccountGroupDetails,
  deleteAccountFromAddedAccounts,
  deleteAddedAccounts,
  toggleAccountCheckbox,
  togglesubGroupAccountsCheckbox,
  createSubGroup,
  deleteAllSubGroupAccounts,
  deleteSubGroupAccountByIndex,
  deleteAccountsFromSubGroup,
  renameSubGroup,
  accountGroupDetailsMain,
} = createAccountGroupDetailsSlice.actions;
export default createAccountGroupDetailsSlice.reducer;
