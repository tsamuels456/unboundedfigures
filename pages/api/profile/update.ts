import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Not signed in" });
  }

  const { displayName, bio } = req.body;

  const updated = await prisma.user.update({
    where: { authId: user.id },
    data: { displayName, bio },
  });

  return res.status(200).json({ updated });
}

