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
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-14 font-sans">

      {/* ========== TOP HEADER ========== */}
      <section className="space-y-4 border-b pb-8">
        <h1 className="text-4xl font-serif font-semibold tracking-tight">
          {name}
        </h1>

        <p className="text-gray-500 text-sm">@{username}</p>

        <p className="text-gray-700 max-w-2xl text-sm leading-relaxed">
          {bio || "This Figure hasn’t written a bio yet — but their journey is unfolding."}
        </p>

        <div className="flex flex-wrap gap-10 pt-2 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-800">Joined</p>
            <p>{joinedDate}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Submissions</p>
            <p>{stats.submissions}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Comments</p>
            <p>{stats.comments}</p>
          </div>
        </div>
      </section>

      {/* ========== ABOUT THIS FIGURE ========== */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-gray-800">
          About This Figure
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
          A mind contributing to open mathematical exploration. Their work reflects curiosity,
          self-driven inquiry, and a commitment to collaborative discovery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">

          {/* Focus Areas */}
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Focus Areas
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Patterns • Number Theory • Logic
            </p>
          </div>

          {/* Research Style */}
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Research Style
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Exploratory • Visual • Conjectural
            </p>
          </div>

          {/* Collaboration Signal */}
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Collaborative Signal
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Open to discussion and mathematical dialogue.
            </p>
          </div>
        </div>
      </section>

      {/* ========== SUBMISSIONS ========== */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Submissions</h2>
          <p className="text-xs text-gray-500">
            Public work by <span className="font-medium">@{username}</span>
          </p>
        </div>

        {submissions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No public submissions yet — this Figure is still gathering ideas.
          </p>
        ) : (
          <ul className="space-y-4">
            {submissions.map((s) => {
              const created = new Date(s.createdAt).toLocaleString();
              return (
                <li key={s.id}>
                  <Link
                    href={`/submissions/${s.id}`}
                    className="block border rounded-xl px-5 py-4 bg-white shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm text-gray-800">
                          {s.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {created}
                          {s.category && (
                            <> · <span>{s.category}</span></>
                          )}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        {s.commentCount} comments
                      </p>
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

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (ctx) => {
  const username = String(ctx.params?.username || "");

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { submissions: true, comments: true } },
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
