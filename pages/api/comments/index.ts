// pages/api/comments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getLocalUser } from "@/lib/getLocalUser";
import { sendError } from "@/lib/apiError";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { content, submissionId } = req.body;

      if (!content || !submissionId) {
        return sendError(res, 400, "Missing content or submissionId");
      }

      // get the authenticated user
      const { supabaseUser, localUser } = await getLocalUser(req, res);
      if (!supabaseUser) return sendError(res, 401, "Not authenticated");
      if (!localUser) return sendError(res, 409, "Local user not initialized");

      // create the comment
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: localUser.id,
          submissionId,
        },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
        },
      });

      return res.status(201).json(comment);
    } catch (e: any) {
      return sendError(res, 400, e.message || "Failed to create comment");
    }
  }

  return sendError(res, 405, "Method not allowed");
}
