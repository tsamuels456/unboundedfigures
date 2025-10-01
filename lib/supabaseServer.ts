// lib/supabaseServer.ts
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { GetServerSidePropsContext } from 'next';

export function getServerSupabaseClient(ctx: GetServerSidePropsContext) {
  return createPagesServerClient(ctx);
}

export function getApiSupabaseClient(req: NextApiRequest, res: NextApiResponse) {
  return createPagesServerClient({ req, res });
}
