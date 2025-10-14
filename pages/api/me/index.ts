// pages/api/me/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getLocalUser } from "@/lib/getLocalUser";
import { sendError } from "@/lib/apiError";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { supabaseUser, localUser } = await getLocalUser(req, res);
      if (!supabaseUser) return sendError(res, 401, "Not authenticated");
      if (!localUser) return sendError(res, 409, "Local user not initialized");

      const me = await prisma.user.findUnique({
        where: { id: localUser.id },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          role: true,
          createdAt: true,
          _count: { select: { submissions: true } },
        },
      });

      return res.status(200).json(me);
    } catch (e: any) {
      return sendError(res, 400, e.message || "Unknown error");
    }
  }

  // PATCH handler
  else if (req.method === "PATCH") {
    try {
      const { supabaseUser, localUser } = await getLocalUser(req, res);
      if (!supabaseUser) return sendError(res, 401, "Not authenticated");
      if (!localUser) return sendError(res, 409, "Local user not initialized");

      const { displayName, bio } = req.body;

      const updated = await prisma.user.update({
        where: { id: localUser.id },
        data: {
          displayName: displayName ?? localUser.displayName,
          bio: bio ?? localUser.bio,
        },
        select: { id: true, displayName: true, bio: true },
      });

      return res.status(200).json(updated);
    } catch (e: any) {
      return sendError(res, 400, e.message || "Failed to update profile");
    }
  }

  // If neither GET nor PATCH
  else {
    return sendError(res, 405, "Method Not Allowed");
  }
}
