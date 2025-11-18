import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Not signed in" });
  }

  const profile = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  return res.status(200).json({ profile });
}
