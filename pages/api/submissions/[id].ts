import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  try {
    if (req.method === "GET") {
      const item = await prisma.submission.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
        },
      });
      if (!item) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(item);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Unknown error" });
  }
}
