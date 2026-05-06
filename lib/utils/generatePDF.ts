export const generatePDF = (rows: any[]) => {
  const SIMULATE_PDF_FAILURE = false;
  if (SIMULATE_PDF_FAILURE) {
    throw new Error('PDF generation failed');
  }

  const html = `
    <html>
      <head>
        <style>
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h3>Branch Codes</h3>
        <table>
          <thead>
            <tr>
              <th>Bank</th>
              <th>Branch</th>
              <th>Code</th>
              <th>Country</th>
              <th>City</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            ${rows
      .map(
        r => `
              <tr>
                <td>${r.bankName}</td>
                <td>${r.branchName}</td>
                <td>${r.branchCode}</td>
                <td>${r.country}</td>
                <td>${r.city}</td>
                <td>${r.address}</td>
              </tr>`
      )
      .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  return new Blob([html], { type: 'application/pdf' });
};
