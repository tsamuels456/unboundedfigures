// pages/u/[username].tsx

import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { motion } from "framer-motion";
import Avatar from "@/components/Avatar";
import { useState } from "react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";


// ---------- Types ----------

type SubmissionCard = {
  id: string;
  title: string;
  createdAt: string;
  category: string | null;
  commentCount: number;
};

type NeighborUser = {
  username: string;
  displayName: string | null;
} | null;

type ProfileProps = {
  username: string;
  displayName: string | null;
  bio: string | null;
  joinedAt: string;
  stats: {
    submissions: number;
    comments: number;
  };
  submissions: SubmissionCard[];
  previousUser: NeighborUser;
  nextUser: NeighborUser;

  // NEW
  followers: number;
  following: number;
  isOwnProfile: boolean;
  isFollowing: boolean;
};


// ---------- Divider Component ----------

const Divider = ({ title }: { title: string }) => (
  <div className="relative mb-10">
    <hr className="border-[var(--border-soft)]" />
    <span
      className="
        absolute left-0 -top-3 bg-white px-3 text-xs font-medium
        uppercase tracking-wider text-[var(--accent-brown)]
      "
    >
      {title}
    </span>
  </div>
);

// ---------- Page Component ----------

const PublicProfilePage: NextPage<ProfileProps> = ({
  username,
  displayName,
  bio,
  joinedAt,
  stats,
  submissions,
  previousUser,
  nextUser,
  followers,
  following,
  isOwnProfile,
  isFollowing: initialIsFollowing,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(followers);
  const [followLoading, setFollowLoading] = useState(false);

  async function handleFollowToggle() {
    if (isOwnProfile || followLoading) return;

    setFollowLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (res.status === 401) {
        // Not signed in – send to sign-in with redirect back to this profile
        window.location.href = `/auth/signin?redirect=/u/${username}`;
        return;
      }

      if (!res.ok) {
        console.error("Failed to toggle follow");
        return;
      }

      const data = await res.json();
      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followers ?? followerCount);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  }

  const name = displayName || username;
  const joinedDate = new Date(joinedAt).toLocaleDateString();

  return (
    <motion.main
      className="max-w-4xl mx-auto px-4 py-10 space-y-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ========== HEADER / IDENTITY ========== */}
      <section className="space-y-4 border-b pb-6">
  <div className="flex items-start justify-between gap-4">
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
      <p className="text-sm text-gray-500">@{username}</p>
    </div>

    {!isOwnProfile && (
      <button
        onClick={handleFollowToggle}
        disabled={followLoading}
        className={`px-4 py-1.5 rounded-full border text-sm font-medium transition ${
          isFollowing
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-white text-gray-900 hover:bg-gray-50"
        }`}
      >
        {followLoading
          ? isFollowing
            ? "Unfollowing..."
            : "Following..."
          : isFollowing
          ? "Following"
          : "Follow"}
      </button>
    )}
  </div>

  <p className="text-sm text-gray-600 max-w-2xl">
    {bio || "No bio yet. This Figure has more to say soon."}
  </p>

  <div className="flex flex-wrap gap-6 text-xs text-gray-500">
    <div>
      <p className="font-semibold text-gray-700 text-xs">Joined</p>
      <p>{joinedDate}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700 text-xs">Submissions</p>
      <p>{stats.submissions}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700 text-xs">Comments</p>
      <p>{stats.comments}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700 text-xs">Followers</p>
      <p>{followerCount}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700 text-xs">Following</p>
      <p>{following}</p>
    </div>
  </div>
</section>

      {/* ========== ABOUT THIS FIGURE ========== */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        viewport={{ once: true }}
      >
        <Divider title="About This Figure" />

        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
          A mind contributing to open mathematical exploration. Their work
          reflects curiosity, self-driven inquiry, and a commitment to
          collaborative discovery.
        </p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          {/* Focus Areas */}
          <motion.div
            className="
              p-4 rounded-md bg-white 
              border border-[var(--accent-blue)]/30 
              shadow-sm hover:shadow-md hover:bg-[var(--accent-blue-soft)]
              transition
            "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-[var(--accent-brown)] uppercase tracking-wide">
              Focus Areas
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Patterns • Number Theory • Logic
            </p>
          </motion.div>

          {/* Research Style */}
          <motion.div
            className="
              p-4 rounded-md bg-white 
              border border-[var(--accent-blue)]/30 
              shadow-sm hover:shadow-md hover:bg-[var(--accent-blue-soft)]
              transition
            "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-[var(--accent-brown)] uppercase tracking-wide">
              Research Style
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Exploratory • Visual • Conjectural
            </p>
          </motion.div>

          {/* Collaborative Signal */}
          <motion.div
            className="
              p-4 rounded-md bg-white 
              border border-[var(--accent-blue)]/30 
              shadow-sm hover:shadow-md hover:bg-[var(--accent-blue-soft)]
              transition
            "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-[var(--accent-brown)] uppercase tracking-wide">
              Collaborative Signal
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Open to discussion and mathematical dialogue.
            </p>
          </motion.div>

          {/* Work Philosophy */}
          <motion.div
            className="
              p-4 rounded-md bg-white 
              border border-[var(--accent-blue)]/30 
              shadow-sm hover:shadow-md hover:bg-[var(--accent-blue-soft)]
              transition
            "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-[var(--accent-brown)] uppercase tracking-wide">
              Work Philosophy
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Driven by curiosity, guided by structure. This Figure approaches
              mathematical exploration with patience, clarity, and a willingness
              to revisit ideas — believing that rigor and creativity strengthen
              each other.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ========== SUBMISSIONS ========== */}
      <motion.section
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        viewport={{ once: true }}
      >
        <Divider title="Submissions" />

        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-serif font-semibold text-gray-900">
            Public Work
          </h2>
          <p className="text-xs text-gray-500">
            Contributions by <span className="font-medium">@{username}</span>
          </p>
        </div>

        {submissions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No public submissions yet — this Figure is still gathering ideas.
          </p>
        ) : (
          <ul className="space-y-4">
            {submissions.map((s, i) => {
              const created = new Date(s.createdAt).toLocaleString();
              return (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <Link
                    href={`/submissions/${s.id}`}
                    className="
                      block rounded-lg px-4 py-4 
                      bg-white 
                      border border-[var(--accent-blue)]/20 
                      hover:bg-[var(--accent-blue-soft)] 
                      hover:shadow-md 
                      transition
                    "
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {s.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {created}
                          {s.category && (
                            <>
                              {" • "}
                              <span>{s.category}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {s.commentCount} comments
                      </p>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.section>

      {/* ========== PREVIOUS / NEXT NAVIGATION ========== */}
      <motion.footer
        className="flex items-center justify-between pt-10 text-sm text-gray-600"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true }}
      >
        {/* Previous */}
        {previousUser ? (
          <Link
            href={`/u/${previousUser.username}`}
            className="text-[var(--accent-blue)] hover:text-[var(--accent-brown)] underline"
          >
            ← Previous:{" "}
            {previousUser.displayName || "@" + previousUser.username}
          </Link>
        ) : (
          <span />
        )}

        {/* Next */}
        {nextUser ? (
          <Link
            href={`/u/${nextUser.username}`}
            className="text-[var(--accent-blue)] hover:text-[var(--accent-brown)] underline"
          >
            Next: {nextUser.displayName || "@" + nextUser.username} →
          </Link>
        ) : (
          <span />
        )}
      </motion.footer>
    </motion.main>
  );
};

// ---------- Server-side data ----------

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (
  ctx
) => {
  const username = String(ctx.params?.username || "").trim();

  if (!username) {
    return { notFound: true };
  }

    const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          submissions: true,
          comments: true,
          followers: true,
          following: true,
        },
      },
      submissions: {
        where: { visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          category: true,
          _count: { select: { comments: true } },
        },
      },
    },
  });


    if (!user) {
  return { notFound: true };
}

// FIXED — correct server-side client
const supabase = createServerSupabaseClient(ctx);

// Fetch current logged-in viewer
const { data: viewerData } = await supabase.auth.getUser();
const viewer = viewerData?.user ?? null;

let isOwnProfile = false;
let isFollowing = false;

if (viewer) {
  isOwnProfile = user.authId === viewer.id;

  if (!isOwnProfile) {
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: viewer.id,
        followingId: user.id,
      },
      select: { id: true },
    });
    isFollowing = !!follow;
  }
}


  const previousUser = await prisma.user.findFirst({
    where: { createdAt: { lt: user.createdAt } },
    orderBy: { createdAt: "desc" },
    select: { username: true, displayName: true },
  });

  const nextUser = await prisma.user.findFirst({
    where: { createdAt: { gt: user.createdAt } },
    orderBy: { createdAt: "asc" },
    select: { username: true, displayName: true },
  });

    return {
    props: {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      joinedAt: user.createdAt.toISOString(),
      stats: {
        submissions: user._count.submissions,
        comments: user._count.comments,
      },
      submissions: user.submissions.map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.createdAt.toISOString(),
    category: s.category,
    commentCount: s._count.comments,
})),


      previousUser,
      nextUser,

      followers: user._count.followers,
      following: user._count.following,
      isOwnProfile,
      isFollowing,
    },
  };
};


export default PublicProfilePage;
