interface SwitchUserRow {
  id: string;
  customerName: string;
  userAccount: string;
  lastAccessed: string;
}
export const mockBankSupportContacts = [
    {
        id: '1',
        branchName: 'Mumbai Main Branch',
        contactType: 'Operations',
        phone: '+91 22 4001 1234',
        email: 'ops.mumbai@bank.com',
        country: 'India',
    },
    {
        id: '2',
        branchName: 'Pune Corporate Branch',
        contactType: 'Payments',
        phone: '+91 20 6789 4567',
        email: 'payments.pune@bank.com',
        country: 'India',
    },
];

export const rows: SwitchUserRow[] = [
  {
    id: '1',
    customerName: 'TPS BAS Botswana Profile',
    userAccount: 'Lerato Serobatse',
    lastAccessed: '11 September 2025, 14:50:52',
  },
  {
    id: '2',
    customerName: 'TPS BAS Kenya Profile',
    userAccount: 'Lerato Serobatse',
    lastAccessed: '11 September 2025, 14:50:52',
  },
  {
    id: '3',
    customerName: 'TPS BAS South Africa Profile',
    userAccount: 'Lerato Serobatse',
    lastAccessed: '11 September 2025, 14:50:52',
  },
  {
    id: '4',
    customerName: 'TPS BAS Uganda Profile',
    userAccount: 'Lerato Serobatse',
    lastAccessed: '11 September 2025, 14:50:52',
  },
];