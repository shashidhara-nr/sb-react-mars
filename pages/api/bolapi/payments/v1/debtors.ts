import type { NextApiRequest, NextApiResponse } from 'next';
import { mockDebtors } from '../../../../../lib/mock/mockDebtors';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get pagination and filter parameters from query
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const position = parseInt(req.query.position as string) || 0; // Backend uses position (offset)
    const counterPartyName = req.query.counterPartyName as string;
    const accountNumber = req.query.accountNumber as string;
    const referenceIDX = req.query.referenceIDX as string;
    const bicSwiftCode = req.query.bicSwiftCode as string;
    const branchSortCode = req.query.branchSortCode as string;
    const collectionType = req.query.collectionType as string;
    const bankName = req.query.bankName as string;
    const status = req.query.status as string;
    const sortBy = req.query.sortBy as string;
    const asc = req.query.asc === 'true';
    
    // Map mock data to match backend API structure
    let counterPartyList = mockDebtors.map((item: any) => ({
      entityKey: parseInt(item.id),
      counterPartyName: item.debtorName?.name || '',
      accountNumber: item.debtorName?.accountNumber || item.accountNumber || '',
      branchSortCode: item.debtorName?.branch || '',
      bankName: item.bankName,
      bicSwiftCode: item.bicSwift,
      collectionType: item.collectionType,
      authoriseStatus: item.status?.value || 'Active',
      statusCode: item.status?.value === 'Active' ? 'ACT' : 
                  item.status?.value === 'Inactive' ? 'INA' :
                  item.status?.value === 'Awaiting Approval' ? 'APP' :
                  item.status?.value === 'Awaiting Customer Repair' ? 'REP' :
                  item.status?.value === 'Unusable' ? 'UNU' : 'ACT',
      referenceIDX: item.debtorCode || '',
      counterPartyReference: item.debtorReference || '',
      accountType: 'Current',
      customerKey: '12345',
      countryCode: 'ZA',
      transactionLimit: 100000,
      transactionLimitCurrency: 'ZAR',
    }));

    // Apply server-side filters
    if (counterPartyName) {
      const search = counterPartyName.toLowerCase();
      counterPartyList = counterPartyList.filter((item: any) =>
        item.counterPartyName?.toLowerCase().includes(search)
      );
    }
    if (accountNumber) {
      const search = accountNumber.toLowerCase();
      counterPartyList = counterPartyList.filter((item: any) =>
        item.accountNumber?.toLowerCase().includes(search)
      );
    }
    if (referenceIDX) {
      const search = referenceIDX.toLowerCase();
      counterPartyList = counterPartyList.filter((item: any) =>
        item.referenceIDX?.toLowerCase().includes(search)
      );
    }
    if (bicSwiftCode) {
      const search = bicSwiftCode.toLowerCase();
      counterPartyList = counterPartyList.filter((item: any) =>
        item.bicSwiftCode?.toLowerCase().includes(search)
      );
    }
    if (branchSortCode) {
      const search = branchSortCode.toLowerCase();
      counterPartyList = counterPartyList.filter((item: any) =>
        item.branchSortCode?.toLowerCase().includes(search)
      );
    }
    if (collectionType) {
      counterPartyList = counterPartyList.filter((item: any) =>
        item.collectionType === collectionType
      );
    }
    if (bankName) {
      const search = bankName.toLowerCase();
      counterPartyList = counterPartyList.filter((item: any) =>
        item.bankName?.toLowerCase().includes(search)
      );
    }
    if (status) {
      counterPartyList = counterPartyList.filter((item: any) =>
        item.statusCode === status || item.authoriseStatus === status
      );
    }

    // Apply sorting
    if (sortBy) {
      counterPartyList.sort((a: any, b: any) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return asc ? comparison : -comparison;
        }
        
        if (aVal < bVal) return asc ? -1 : 1;
        if (aVal > bVal) return asc ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination after filtering - use position as offset
    const startIndex = position;
    const endIndex = startIndex + pageSize;
    const paginatedData = counterPartyList.slice(startIndex, endIndex);
    const isLastPage = endIndex >= counterPartyList.length;

    // Return debtors in the backend API format
    return res.status(200).json({
      counterPartyList: paginatedData,
      debtorDetailTOs: paginatedData, // Include both for compatibility
      lastPage: isLastPage,
      pageCount: Math.ceil(counterPartyList.length / pageSize),
      position: position,
      pageSize: pageSize,
      rowCount: counterPartyList.length
    });
  }

  if (req.method === 'POST') {
    // Handle create debtor
    const newDebtor = {
      entityKey: Date.now(),
      ...req.body,
    };
    return res.status(201).json(newDebtor);
  }

  if (req.method === 'DELETE') {
    // Handle delete debtors
    return res.status(200).json({ message: 'Debtors deleted successfully' });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ message: 'Method Not Allowed' });
}
