export const generateCSV = (rows: any[]) => {
    const headers = [
        'Bank name',
        'Branch name',
        'Branch code',
        'Country',
        'City',
        'Address',
    ];

    const csvRows = [
        headers.join(','),
        ...rows.map(row =>
            [
                row.bankName,
                row.branchName,
                row.branchCode,
                row.country,
                row.city,
                row.address,
            ]
                .map(v => `"${v ?? ''}"`)
                .join(',')
        ),
    ];

    return csvRows.join('\n');
};