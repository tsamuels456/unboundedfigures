// lib/getLocalUser.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';

/**
 * Returns the local user (row in your User table) or null if not authenticated.
 * DOES NOT create a user. Use /api/me/ensure on sign-in to upsert it.
 */
export async function getLocalUser(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabaseUser: null, localUser: null };

  // Find local user by authId
  const localUser = await prisma.user.findUnique({ where: { authId: user.id } });
  return { supabaseUser: user, localUser };
}
