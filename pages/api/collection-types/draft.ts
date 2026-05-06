import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;
    // TODO: Persist draft to DB or service. For now, echo back.
    return res.status(200).json({ ok: true, message: 'Draft saved', data: payload });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message ?? 'Server error' });
  }
}
