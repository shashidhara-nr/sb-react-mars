
// mockParticipatingBanks.ts
// Comprehensive mock data for participating banks

interface ParticipatingBank {
  id: string;
  bankName: string;
  country: string;
  bankCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

const bankData = [
  {
    bankName: 'Stanbic Bank Kenya',
    country: 'Kenya',
    bankCode: 'STBKKENA',
    contactPerson: 'John Mwangi',
    email: 'john.mwangi@stanbic.co.ke',
    phone: '+254 20 4229000',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Bank South Sudan',
    country: 'South Sudan',
    bankCode: 'STBKSSDA',
    contactPerson: 'Peter Deng',
    email: 'peter.deng@stanbic.ss',
    phone: '+211 912 345678',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Bank Zimbabwe',
    country: 'Zimbabwe',
    bankCode: 'STBKZWHA',
    contactPerson: 'Tendai Mutuma',
    email: 'tendai.mutuma@stanbic.co.zw',
    phone: '+263 4 790800',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Botswana',
    country: 'Botswana',
    bankCode: 'STBKBWBA',
    contactPerson: 'Gorata Molefe',
    email: 'gorata.molefe@stanbic.co.bw',
    phone: '+267 365 4400',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Côte d\'Ivoire',
    country: 'Côte d\'Ivoire',
    bankCode: 'STBKCIHA',
    contactPerson: 'Marie Ahoure',
    email: 'marie.ahoure@stanbic.ci',
    phone: '+225 20 21 71 71',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Ghana',
    country: 'Ghana',
    bankCode: 'STBKGHGA',
    contactPerson: 'Kwamena Asante',
    email: 'kwamena.asante@stanbic.com.gh',
    phone: '+233 302 611 611',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Nigeria',
    country: 'Nigeria',
    bankCode: 'STBKNGNA',
    contactPerson: 'Chioma Okafor',
    email: 'chioma.okafor@stanbicng.com',
    phone: '+234 1 422 7000',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Tanzania',
    country: 'Tanzania',
    bankCode: 'STBKTZTA',
    contactPerson: 'Julius Kipchoge',
    email: 'julius.kipchoge@stanbic.co.tz',
    phone: '+255 22 219 7600',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Uganda',
    country: 'Uganda',
    bankCode: 'STBKUGUA',
    contactPerson: 'Samuel Mwebaze',
    email: 'samuel.mwebaze@stanbicuganda.com',
    phone: '+256 312 263 000',
    status: 'Active' as const,
  },
  {
    bankName: 'Stanbic Zambia',
    country: 'Zambia',
    bankCode: 'STBKZMZA',
    contactPerson: 'Patricia Banda',
    email: 'patricia.banda@stanbic.co.zm',
    phone: '+260 211 379 000',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank Angola',
    country: 'Angola',
    bankCode: 'SBZNLUAD',
    contactPerson: 'Carlos Silva',
    email: 'carlos.silva@standardbank.ao',
    phone: '+244 222 641 000',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank London',
    country: 'United Kingdom',
    bankCode: 'SBZAGB2L',
    contactPerson: 'James Patterson',
    email: 'james.patterson@standardbank.co.uk',
    phone: '+44 20 7887 8000',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank Malawi',
    country: 'Malawi',
    bankCode: 'SBZNMWMW',
    contactPerson: 'Grace Chikafa',
    email: 'grace.chikafa@standardbank.mw',
    phone: '+265 1 820 888',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank Mauritius',
    country: 'Mauritius',
    bankCode: 'SBZNMUMU',
    contactPerson: 'Anil Kumar',
    email: 'anil.kumar@standardbank.mu',
    phone: '+230 206 2000',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank Mozambique',
    country: 'Mozambique',
    bankCode: 'SBZNMZMO',
    contactPerson: 'João Santos',
    email: 'joao.santos@standardbank.co.mz',
    phone: '+258 21 350 600',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank Namibia',
    country: 'Namibia',
    bankCode: 'SBZNNANA',
    contactPerson: 'Shilumbo Mbumba',
    email: 'shilumbo.mbumba@standardbank.com.na',
    phone: '+264 61 294 5111',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank RDC',
    country: 'Democratic Republic of Congo',
    bankCode: 'SBZNCDCD',
    contactPerson: 'Didier Mubake',
    email: 'didier.mubake@standardbank.cd',
    phone: '+243 81 777 6000',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank South Africa',
    country: 'South Africa',
    bankCode: 'SBZAZASA',
    contactPerson: 'Sizwe Dlamini',
    email: 'sizwe.dlamini@standardbank.co.za',
    phone: '+27 11 415 1000',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Bank Swaziland',
    country: 'Eswatini',
    bankCode: 'SBZNSZSZ',
    contactPerson: 'Nalumiso Sikhosana',
    email: 'nalumiso.sikhosana@standardbank.co.sz',
    phone: '+268 2404 2000',
    status: 'Active' as const,
  },
  {
    bankName: 'Standard Lesotho Bank',
    country: 'Lesotho',
    bankCode: 'SBLSLS00',
    contactPerson: 'Tumisang Mofokeng',
    email: 'tumisang.mofokeng@standardlesotho.co.ls',
    phone: '+266 22 314 000',
    status: 'Inactive' as const,
  },
];

export const mockParticipatingBanks: ParticipatingBank[] = bankData.map((bank, index) => ({
  id: `${index + 1}`,
  bankName: bank.bankName,
  country: bank.country,
  bankCode: bank.bankCode,
  contactPerson: bank.contactPerson,
  email: bank.email,
  phone: bank.phone,
  status: bank.status,
}));

// Legacy export for backward compatibility
export const mockParticipatingBanksData = mockParticipatingBanks.map((bank) => ({
  id: bank.id,
  participatingBankName: bank.bankName,
  branchSortCode: bank.bankCode,
  bicSwift: bank.bankCode,
  serviceType: 'Banking Services',
  status: {
    value: bank.status,
    color: bank.status === 'Active' ? 'success' : 'error',
  },
}));
