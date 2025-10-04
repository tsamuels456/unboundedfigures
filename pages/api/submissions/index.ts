import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { SubmissionCreateSchema } from "@/lib/validators/submission";
import { sendError } from "@/lib/apiError";
import { getLocalUser } from '@/lib/getLocalUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { supabaseUser, localUser } = await getLocalUser(req, res);
      if (!supabaseUser) return res.status(401).json({ error: "Not authenticated" });
      if (!localUser) return res.status(409).json({ error: "Local user not initialized" });

      const { title, content, fileUrl, category, tags = [], aiNote, visibility = "PUBLIC", allowComments = true } = req.body;
      if (!content && !fileUrl)
        return res.status(400).json({ error: "Provide either content or fileUrl." });

      const created = await prisma.submission.create({
        data: {
          title,
          content: content ?? null,
          fileUrl: fileUrl ?? null,
          tags,
          aiNote: aiNote ?? null,
          category,
          visibility,
          allowComments,
          upvotes: 0,
          authorId: localUser.id, // ✅ real user
        },
        include: { author: { select: { id: true, username: true, displayName: true } } },
      });

      return res.status(201).json(created);
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || "Unknown error" });
    }
  }

  if (req.method === "GET") {
    try {
      const take = Math.min(Math.max(parseInt(String(req.query.limit || "20"), 10), 5), 50);
      const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

      const items = await prisma.submission.findMany({
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, username: true, displayName: true } } },
      });

      const hasMore = items.length > take;
      const pageItems = hasMore ? items.slice(0, take) : items;
      const nextCursor = hasMore ? pageItems[pageItems.length - 1].id : null;

      return res.status(200).json({ items: pageItems, nextCursor });
    } catch (e) {
      return sendError(res, 400, e);
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return sendError(res, 405, "Method Not Allowed");
}


