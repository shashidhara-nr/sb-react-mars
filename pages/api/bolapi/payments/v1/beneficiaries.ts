import type { NextApiRequest, NextApiResponse } from 'next';
import { mockBeneficiariesHub } from '../../../../../lib/mock/mockBeneficiariesHub';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get pagination and filter parameters from query
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const position = parseInt(req.query.position as string) || 0; // Backend uses position (offset)
    const counterPartyName = req.query.counterPartyName as string;
    const accountNumber = req.query.accountNumber as string;
    const branchSortCode = req.query.branchSortCode as string;
    const paymentCategory = req.query.paymentCategory as string;
    const statusCode = req.query.statusCode as string;
    const searchText = req.query.searchText as string;
    
    // Map mock data to match backend API structure
    let beneficiaryDetailPerfList = mockBeneficiariesHub.map((item: any) => ({
      entityKey: parseInt(item.id),
      counterPartyName: item.counterPartyName?.name || '',
      accountNumber: item.counterPartyName?.accountNumber || '',
      branchSortCode: item.counterPartyName?.branch || '',
      bankName: item.bankName,
      bicSwiftCode: item.bicSwiftCode,
      paymentCategory: item.paymentCategory,
      authoriseStatus: item.authoriseStatus,
      referenceIDX: item.beneficiaryCode || '',
      insClassification: item.paymentCategory || 'domestic',
      currency: 'USD',
      statusCode: 'N',
    }));

    // Apply server-side filters
    if (counterPartyName) {
      const search = counterPartyName.toLowerCase();
      beneficiaryDetailPerfList = beneficiaryDetailPerfList.filter((item: any) =>
        item.counterPartyName?.toLowerCase().includes(search)
      );
    }
    if (accountNumber) {
      const search = accountNumber.toLowerCase();
      beneficiaryDetailPerfList = beneficiaryDetailPerfList.filter((item: any) =>
        item.accountNumber?.toLowerCase().includes(search)
      );
    }
    if (branchSortCode) {
      const search = branchSortCode.toLowerCase();
      beneficiaryDetailPerfList = beneficiaryDetailPerfList.filter((item: any) =>
        item.branchSortCode?.toLowerCase().includes(search)
      );
    }
    if (paymentCategory) {
      beneficiaryDetailPerfList = beneficiaryDetailPerfList.filter((item: any) =>
        item.insClassification === paymentCategory || item.paymentCategory === paymentCategory
      );
    }
    if (statusCode) {
      beneficiaryDetailPerfList = beneficiaryDetailPerfList.filter((item: any) =>
        item.authoriseStatus === statusCode
      );
    }
    if (searchText) {
      const search = searchText.toLowerCase();
      beneficiaryDetailPerfList = beneficiaryDetailPerfList.filter((item: any) =>
        item.counterPartyName?.toLowerCase().includes(search) ||
        item.accountNumber?.toLowerCase().includes(search) ||
        item.referenceIDX?.toLowerCase().includes(search)
      );
    }

    // Apply pagination after filtering - use position as offset
    const startIndex = position;
    const endIndex = startIndex + pageSize;
    const paginatedData = beneficiaryDetailPerfList.slice(startIndex, endIndex);
    const isLastPage = endIndex >= beneficiaryDetailPerfList.length;

    // Return beneficiaries in the backend API format
    return res.status(200).json({
      beneficiaryDetailPerfList: paginatedData,
      lastPage: isLastPage,
      pageCount: Math.ceil(beneficiaryDetailPerfList.length / pageSize),
      postition: position,
      pageSize: pageSize,
      rowCount: beneficiaryDetailPerfList.length
    });
  }

  if (req.method === 'POST') {
    // Handle create beneficiary
    const newBeneficiary = {
      entityKey: Date.now(),
      ...req.body,
    };
    return res.status(201).json(newBeneficiary);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ message: 'Method Not Allowed' });
}
