/**
 * Generates PDF content and opens print dialog for user to save as PDF
 * @param rows - Array of banking account rows to include in the PDF
 * @param sortBy - Sort order for the data (ascending/descending)
 * @param fileName - The name of the file (used as print document title)
 */
export const generateBankingAccountsPDF = (rows: any[], sortBy: 'ascending' | 'descending' = 'ascending', fileName: string = 'Banking Accounts'): void => {
    // DEVELOPMENT: Set this to true to simulate download failure and test error toast
    const SIMULATE_DOWNLOAD_FAILURE = false;

    if (SIMULATE_DOWNLOAD_FAILURE) {
        throw new Error('PDF generation failed - simulated for testing');
    }

    // Sort rows based on sortBy parameter
    const sortedRows = [...rows].sort((a, b) => {
        const nameA = a.accountName?.toLowerCase() || '';
        const nameB = b.accountName?.toLowerCase() || '';
        const comparison = nameA.localeCompare(nameB);
        return sortBy === 'ascending' ? comparison : -comparison;
    });

    // Create HTML content for PDF
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(fileName)}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 20px; 
                    background: white;
                }
                h1 { 
                    font-size: 18px; 
                    margin-bottom: 20px; 
                    color: #333;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 11px;
                }
                th, td { 
                    border: 1px solid #999; 
                    padding: 8px; 
                    text-align: left;
                }
                th { 
                    background-color: #f0f0f0; 
                    font-weight: bold;
                    color: #333;
                }
                tr:nth-child(even) { 
                    background-color: #f9f9f9; 
                }
                @media print {
                    body { margin: 0; }
                    th { background-color: #e0e0e0; }
                }
            </style>
        </head>
        <body>
            <h1>Banking Accounts Report</h1>
            <table>
                <thead>
                    <tr>
                        <th>Account Name</th>
                        <th>Account Number</th>
                        <th>Serial Number</th>
                        <th>Account Type</th>
                        <th>Account Owner</th>
                        <th>Branch Sort Code</th>
                        <th>Bank Name</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedRows
            .map(
                (r) => `
                        <tr>
                            <td>${escapeHtml(r.accountName || '')}</td>
                            <td>${escapeHtml(r.accountNumber || '')}</td>
                            <td>${escapeHtml(r.serialNumber || '')}</td>
                            <td>${escapeHtml(r.accountType || '')}</td>
                            <td>${escapeHtml(r.accountOwner || '')}</td>
                            <td>${escapeHtml(r.branchSortCode || '')}</td>
                            <td>${escapeHtml(r.bankName || '')}</td>
                        </tr>
                    `
            )
            .join('')}
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                };
            </script>
        </body>
        </html>
    `;

    // Open in new window and trigger print
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    }
};

/**
 * Escapes HTML special characters
 */
const escapeHtml = (text: string): string => {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
};
