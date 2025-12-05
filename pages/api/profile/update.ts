// pages/api/profile/update.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { username, displayName, bio, avatarUrl } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { authId: user.id },
      data: {
        username,
        displayName,
        bio,
        avatarUrl, // THIS IS NOW VALID
      },
    });

    return res.status(200).json({ success: true, user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Profile update failed" });
  }
}


