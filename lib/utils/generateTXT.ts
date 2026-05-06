export const generateTXT = (rows: any[]) =>
    rows
        .map(
            r =>
                `${r.bankName} | ${r.branchName} | ${r.branchCode} | ${r.country} | ${r.city} | ${r.address}`
        )
        .join('\n');