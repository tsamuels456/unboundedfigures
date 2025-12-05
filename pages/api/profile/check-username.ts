// pages/api/profile/check-username.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const username = String(req.query.username || "").trim();
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  // If not signed in, we just check existence without excluding current user
  const where: any = { username };
  if (user) {
    where.authId = { not: user.id };
  }

  const existing = await prisma.user.findFirst({
    where,
    select: { id: true },
  });

  return res.status(200).json({ available: !existing });
}
