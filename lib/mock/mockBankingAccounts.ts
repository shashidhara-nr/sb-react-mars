export const mockBankingAccountsData = Array.from({ length: 200 }, (_, i) => ({
    id: `${i + 1}`,
    accountName: `[Account name ${i + 1}]`,
    accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
    serialNumber: `SN${String(i + 1).padStart(4, '0')}`,
    accountType: ['Current account', 'Savings account', 'Credit account', 'Loan account'][i % 4],
    accountOwner: `Owner ${i + 1}`,
    branchSortCode: `SC${String(i + 1).padStart(4, '0')}`,
    bankName: `Bank ${i + 1}`,
    links: { href: `/banking-accounts/${i + 1}`, text: 'viewAccount' },
}));

export const mockBankingAccountDetailsData = Array.from({ length: 200 }, (_, i) => {
    const bankNames = ['standardBankSouthAfrica', 'stanbicBankKenyaLimited', 'nedbankLimited', 'firstNationalBank', 'capitecBank'];
    const countryCodes = ['ZA', 'US', 'UK'];
    const countryNames = ['South Africa', 'United States', 'United Kingdom'];
    const countryIndex = i % 3;
    return {
        id: `${i + 1}`,
        customerName: `Customer ${i + 1}`,
        customerId: `CUST${String(i + 1).padStart(4, '0')}`,
        companyRegistrationNumber: `CRN${String(i + 1).padStart(6, '0')}`,
        bankName: bankNames[i % bankNames.length],
        countryRegion: countryCodes[countryIndex],
        status: { value: i % 2 === 0 ? 'active' : 'inactive', color: i % 2 === 0 ? 'success' : 'error' },
        links: { href: `/banking-accounts/${i + 1}`, text: 'viewDetails' },
        // Additional fields for account details
        accountOwnerName: `Customer ${i + 1}`,
        hostToHostInterimStatementType: 'Daily',
        branchName: `Branch ${i + 1}`,
        bic: `BIC${String(i + 1).padStart(4, '0')}`,
        sortCode: `SC${String(i + 1).padStart(4, '0')}`,
        townCity: ['Johannesburg', 'New York', 'London'][countryIndex],
        country: countryNames[countryIndex],
        accountNumber: `ACC${String(i + 1).padStart(8, '0')}`,
        iban: `IBAN${String(i + 1).padStart(10, '0')}`,
        currency: ['ZAR', 'USD', 'GBP'][countryIndex],
        accountType: ['Current account', 'Savings account', 'Credit account', 'Loan account'][i % 4],
        serialNumber: `SN${String(i + 1).padStart(4, '0')}`,
        currencyAndTransactionLimit: `${['ZAR', 'USD', 'GBP'][countryIndex]} 1,000,000`,
        paymentType: ['TCIB', 'Internet Banking', 'Mobile Banking'][i % 3],
    };
});
