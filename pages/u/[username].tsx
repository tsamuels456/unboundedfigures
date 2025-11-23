// pages/u/[username].tsx

import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SubmissionCard = {
  id: string;
  title: string;
  createdAt: string;
  category: string | null;
  commentCount: number;
};

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
};

const PublicProfilePage: NextPage<ProfileProps> = ({
  username,
  displayName,
  bio,
  joinedAt,
  stats,
  submissions,
}) => {
  const name = displayName || username;
  const joinedDate = new Date(joinedAt).toLocaleDateString();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* ============= ACADEMIC-CREATIVE HEADER BLOCK ============= */}
      <section className="space-y-6 border-b pb-8">
        {/* Name + Username */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{name}</h1>
          <p className="text-md text-gray-500">@{username}</p>
        </div>

        {/* Bio */}
        <p className="text-base text-gray-700 max-w-2xl leading-relaxed">
          {bio ||
            "This Figure has not written a bio yet. Their research and ideas are still unfolding."}
        </p>

        {/* Academic identity grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg border bg-white/80 shadow-sm">
            <p className="font-semibold text-gray-800">Focus Areas</p>
            <p className="text-gray-600 text-xs mt-1">
              Patterns • Number Theory • Logic
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-white/80 shadow-sm">
            <p className="font-semibold text-gray-800">Research Style</p>
            <p className="text-gray-600 text-xs mt-1">
              Exploratory • Visual • Conjectural
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-white/80 shadow-sm">
            <p className="font-semibold text-gray-800">Collaborative Signal</p>
            <p className="text-gray-600 text-xs mt-1">
              Open to discussion and mathematical dialogue
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 text-sm pt-2">
          <div>
            <p className="font-semibold">Joined</p>
            <p className="text-gray-600">{joinedDate}</p>
          </div>

          <div>
            <p className="font-semibold">Submissions</p>
            <p className="text-gray-600">{stats.submissions}</p>
          </div>

          <div>
            <p className="font-semibold">Comments</p>
            <p className="text-gray-600">{stats.comments}</p>
          </div>
        </div>
      </section>

      {/* SUBMISSIONS SECTION */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Submissions</h2>
          <p className="text-xs text-gray-500">
            Public work by <span className="font-medium">@{username}</span>
          </p>
        </div>

        {submissions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No public submissions yet. Check back soon.
          </p>
        ) : (
          <ul className="space-y-3">
            {submissions.map((s) => {
              const created = new Date(s.createdAt).toLocaleString();
              return (
                <li key={s.id}>
                  <Link
                    href={`/submissions/${s.id}`}
                    className="block border rounded-xl px-4 py-3 hover:bg-gray-50 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">{s.title}</h3>
                        <p className="text-xs text-gray-500">
                          {created}
                          {s.category && (
                            <>
                              {" "}
                              · <span>{s.category}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="text-right text-xs text-gray-500">
                        <p>{s.commentCount} comments</p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (
  ctx
) => {
  const username = String(ctx.params?.username || "").trim();

  if (!username) return { notFound: true };

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { submissions: true, comments: true }},
      submissions: {
        where: { visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          category: true,
          _count: { select: { comments: true }},
        },
      },
    },
  });

  if (!user) return { notFound: true };

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
    },
  };
};

export default PublicProfilePage;
