// pages/api/me/ensure.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiSupabaseClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getApiSupabaseClient(req, res);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if a local User row exists
  const found = await prisma.User.findUnique({ where: { authId: user.id } });
  if (found) return res.status(200).json(found);

  // Create a default username from Supabase UID
  const defaultUsername = `figure_${user.id.slice(0, 8)}`;

  const created = await prisma.User.create({
    data: {
      authId: user.id,
      username: defaultUsername,
      displayName: user.email ?? defaultUsername,
      role: 'FIGURE',
    },
  });

  return res.status(201).json(created);
}
