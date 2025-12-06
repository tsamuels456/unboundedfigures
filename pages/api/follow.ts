// pages/api/follow.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { username } = req.body as { username?: string };

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "username required" });
  }

  // Find the target user by username
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, authId: true },
  });

  if (!target) {
    return res.status(404).json({ error: "User not found" });
  }

  // Find the current user by Supabase auth id
  const me = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true },
  });

  if (!me) {
    return res.status(400).json({ error: "Profile not found" });
  }

  if (me.id === target.id) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  // Check if we already follow this user
  const existing = await prisma.follow.findFirst({
    where: {
      followerId: me.id,
      followingId: target.id,
    },
  });

  let isFollowing: boolean;

  if (existing) {
    // Unfollow
    await prisma.follow.delete({
      where: { id: existing.id },
    });
    isFollowing = false;
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        followerId: me.id,
        followingId: target.id,
      },
    });
    isFollowing = true;
  }

  // Return fresh follower counts for the target
  const counts = await prisma.user.findUnique({
    where: { id: target.id },
    select: {
      _count: {
        select: { followers: true, following: true },
      },
    },
  });

  return res.status(200).json({
    isFollowing,
    followers: counts?._count.followers ?? 0,
    following: counts?._count.following ?? 0,
  });
}
