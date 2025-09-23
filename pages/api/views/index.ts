import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendError } from "@/lib/apiError";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return sendError(res, 405, "Method Not Allowed");
  try {
    const body = req.body as { submissionId?: string };
    const submissionId = body.submissionId;

    if (!submissionId) return sendError(res, 400, "submissionId required");

    // TEMP user (until auth)
    const userId = process.env.DEV_SEED_USER_ID ?? null;

    await prisma.view.create({ data: { userId: userId ?? undefined, submissionId } });

    // Pull tags/category of the viewed submission
    const sub = await prisma.submission.findUnique({
      where: { id: submissionId }, select: { tags: true, category: true }
    });

    if (userId && sub) {
      const tags = [...(sub.tags ?? [])];
      if (sub.category) tags.push(`cat:${sub.category}`);

      // upsert weights
      await Promise.all(tags.map(tag =>
        prisma.tagPref.upsert({
          where: { userId_tag: { userId, tag } },
          create: { userId, tag, weight: 1 },
          update: { weight: { increment: 1 } }
        })
      ));
    }

    return res.status(204).end();
  } catch (e) {
    return sendError(res, 400, e);
  }
}
