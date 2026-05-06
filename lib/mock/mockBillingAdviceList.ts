export const mockBillingAdviceListData = Array.from({ length: 200 }, (_, i) => ({
    id: `${i + 1}`,
    billingAdviceId: `${i + 1}`,
    accountNumber: `XXXXXXXX${String(i + 1).padStart(2, '0')}`,
    branchSortCode: `SC${String(i + 1).padStart(4, '0')}`,
    bicSwift: `BIC${String(i + 1).padStart(4, '0')}`,
    currencyCode: 'GBP',
    amount: (Math.random() * 10000).toFixed(2),
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], // YYYY-MM-DD
    links: { href: `/billing-advice-list/details?accountId=${i + 1}`, text: 'viewAdvice' }
}));

export const mockBillingAdviceDetailData = Array.from({ length: 200 }, (_, i) => ({
    id: `${i + 1}`,
    chargeCode: `CC${String(i + 1).padStart(3, '0')}`,
    description: `Charge description ${i + 1}`,
    chargeQuantity: (Math.random() * 10 + 1).toFixed(2),
    vatAmount: (Math.random() * 100).toFixed(2),
    basicCharge: (Math.random() * 500).toFixed(2),
    totalExclVAT: (Math.random() * 600).toFixed(2),
    totalInclVAT: (Math.random() * 700).toFixed(2)
}));
