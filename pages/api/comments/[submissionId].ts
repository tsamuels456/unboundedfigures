// pages/api/comments/[submissionId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendError } from "@/lib/apiError";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { submissionId } = req.query;
      if (!submissionId || typeof submissionId !== "string") {
        return sendError(res, 400, "Invalid submissionId");
      }

      const comments = await prisma.comment.findMany({
        where: { submissionId },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
        },
      });

      return res.status(200).json(comments);
    } catch (e: any) {
      return sendError(res, 400, e.message || "Failed to fetch comments");
    }
  }

  return sendError(res, 405, "Method not allowed");
}
