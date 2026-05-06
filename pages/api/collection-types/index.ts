import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      // TODO: Create collection type. For now, echo and succeed.
      return res.status(200).json({ ok: true, message: 'Collection type created', data: payload });
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? 'Server error' });
    }
  }

  // Unsupported methods
  return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
}
