import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { SubmissionCreateSchema } from "@/lib/validators/submission";
import { sendError } from "@/lib/apiError";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      try {
      // 1) Validate body
      const parsed = SubmissionCreateSchema.parse(req.body);

      // 2) Temporary author fallback (until auth is wired)
      const fallbackAuthorId = process.env.DEV_SEED_USER_ID;
      const authorId = parsed.authorId ?? fallbackAuthorId;

      if (!authorId) {
  // If you’re missing the env var in dev, return a clear error
  return sendError(res, 400, "No author available. Set DEV_SEED_USER_ID in .env.local or pass authorId.");
}

      // 3) Enforce at least one of content or fileUrl
      if (!parsed.content && !parsed.fileUrl) {
        return sendError(res, 400, "Provide either content or fileUrl.");

      }

      // 4) Create
      const created = await prisma.submission.create({
        data: {
          title: parsed.title,
          content: parsed.content ?? null,
          fileUrl: parsed.fileUrl ?? null,
          tags: parsed.tags ?? [],
          aiNote: parsed.aiNote ?? null,
          category: parsed.category,
          visibility: parsed.visibility,
          allowComments: parsed.allowComments,
          upvotes: 0,
          author: { connect: { id: authorId } },
        },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
        },
      });

      return res.status(201).json(created);
    }catch (e) {
    return sendError(res, 400, e);
  }
}

    if (req.method === "GET") {
      try {
  const take = Math.min(Math.max(parseInt(String(req.query.limit || '20'), 10), 5), 50);
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
}catch (e) {
    return sendError(res, 400, e);
  }
}


    res.setHeader("Allow", ["GET", "POST"]);
    return sendError(res, 405, "Method Not Allowed");


  } catch (err) {
  return sendError(res, 400, err);
}

}
