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

  // ✅ Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  if (existingUser) {
    return res.status(200).json(existingUser);
  }

  // ✅ Otherwise, create new user
  const defaultUsername = `figure_${user.id.slice(0, 8)}`;

  const created = await prisma.user.create({
    data: {
      authId: user.id,
      username: defaultUsername,
      displayName: user.email ?? defaultUsername,
      role: 'FIGURE',
    },
  });

  return res.status(201).json(created);
}
