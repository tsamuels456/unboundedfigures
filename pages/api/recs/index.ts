import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendError } from "@/lib/apiError";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return sendError(res, 405, "Method Not Allowed");
  try {
    const userId = process.env.DEV_SEED_USER_ID ?? null;
    // after: const userId = process.env.DEV_SEED_USER_ID ?? null;

// allow opt-out via query or header
const off = req.query.off === "1"
  || req.headers["dnt"] === "1"              // Do Not Track
  || req.headers["sec-gpc"] === "1";         // Global Privacy Control

if (off) {
  const items = await prisma.submission.findMany({
    take: 10, orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, username: true, displayName: true } } },
  });
  return res.json({ items });
}

    if (!userId) {
      const items = await prisma.submission.findMany({
        take: 10, orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, username: true, displayName: true } } },
      });
      return res.json({ items });
    }

    const prefs = await prisma.tagPref.findMany({
      where: { userId }, orderBy: { weight: "desc" }, take: 5
    });
    const topTags = prefs.map(p => p.tag);

    const recentViews = await prisma.view.findMany({
      where: { userId }, orderBy: { createdAt: "desc" }, take: 100, select: { submissionId: true }
    });
    const viewed = recentViews.map(v => v.submissionId);

    const items = await prisma.submission.findMany({
      where: {
        id: { notIn: viewed },
        OR: [
          { tags: { hasSome: topTags.filter(t => !t.startsWith("cat:")) } },
          { category: { in: topTags.filter(t => t.startsWith("cat:")).map(t => t.slice(4)) } },
        ],
        visibility: "PUBLIC",
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, username: true, displayName: true } } },
    });

    if (items.length === 0) {
      const recent = await prisma.submission.findMany({
        take: 10, orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, username: true, displayName: true } } },
      });
      return res.json({ items: recent });
    }

    return res.json({ items });
  } catch (e) {
    return sendError(res, 400, e);
  }
}
