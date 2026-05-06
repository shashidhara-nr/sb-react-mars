import type { NextApiRequest, NextApiResponse } from 'next';
import sampleDebtor from '../../../../lib/mock/debtors/sampleDebtor.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const data = { id, ...sampleDebtor };
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const entityKey = Number(id);
    return res.status(200).json({
      entityKey,
      status: 'DELETED',
      message: 'Debtor marked for deletion and pending authorization',
    });
  }

  res.setHeader('Allow', 'GET, DELETE');
  return res.status(405).json({ message: 'Method Not Allowed' });
}
