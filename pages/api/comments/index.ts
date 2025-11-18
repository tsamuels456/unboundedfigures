// pages/api/comments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getApiSupabaseClient } from "@/lib/supabaseServer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1) Get logged-in Supabase user from cookies
    const supabase = getApiSupabaseClient(req, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // 2) Find the matching Prisma User by authId
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return res
        .status(401)
        .json({ error: "Local user not initialized. Call /api/me/ensure first." });
    }

    // 3) Read body sent from the form
    const { content, submissionId } = req.body as {
      content?: string;
      submissionId?: string;
    };

    if (!content || !submissionId) {
      return res.status(400).json({ error: "Missing content or submissionId" });
    }

    // 4) Create the comment
    const created = await prisma.comment.create({
      data: {
        content,
        submissionId,
        authorId: dbUser.id,
      },
      include: {
        author: { select: { username: true, displayName: true } },
      },
    });

    return res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating comment:", err);
    return res
      .status(500)
      .json({ error: err?.message ?? "Unknown error creating comment" });
  }
}

