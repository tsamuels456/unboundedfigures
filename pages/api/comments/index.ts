import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendError } from "@/lib/apiError";

// POST /api/comments
// Creates a new comment on a submission
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return sendError(res, 405, "Method Not Allowed");

  try {
    const { content, submissionId, authorId } = req.body;

    if (!content || !submissionId || !authorId) {
      return sendError(res, 400, "Missing required fields");
    }

    const created = await prisma.comment.create({
      data: {
        content,
        submissionId,
        authorId,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true } },
      },
    });

    return res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating comment:", err);
    return sendError(res, 500, err?.message || "Internal Server Error");
  }
}
