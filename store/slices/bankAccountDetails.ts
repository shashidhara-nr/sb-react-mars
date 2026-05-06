import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BankAccountDetails } from 'types/bankAccountDetails';

interface BankAccountDetailsState {
  details: BankAccountDetails;
}

const initialState: BankAccountDetailsState = {
    details: {
        id: '',
        accountOwnerName: '',
        hostToHostInterimStatementType: '',
        bankName: '',
        branchName: '',
        bic: '',
        sortCode: '',
        townCity: '',
        country: '',
        accountNumber: '',
        iban: '',
        currency: '',
        accountType: '',
        currencyAndTransactionLimit: '',
        paymentType: '',
    },
};

const bankAccountDetailsSlice = createSlice({
  name: 'bankAccountDetails',
  initialState,
  reducers: {},
});

export default bankAccountDetailsSlice.reducer;
