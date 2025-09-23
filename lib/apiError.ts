import type { NextApiResponse } from 'next';

export function sendError(res: NextApiResponse, status: number, err: unknown) {
  const msg = (err as any)?.issues?.[0]?.message
           || (err as any)?.message
           || (typeof err === 'string' ? err : 'Unknown error');
  return res.status(status).json({ error: msg });
}
