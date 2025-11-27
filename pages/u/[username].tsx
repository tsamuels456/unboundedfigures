import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Elegant academic divider
const Divider = ({ title }: { title: string }) => (
  <div className="relative my-10">
    <hr className="border-gray-300" />
    <span className="absolute left-0 -top-3 bg-white px-2 text-xs tracking-widest text-gray-500 uppercase">
      {title}
    </span>
  </div>
);

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
};


const PublicProfilePage: NextPage<ProfileProps> = ({
  username,
  displayName,
  bio,
  joinedAt,
  stats,
  submissions,
  previousUser,
  nextUser,
}) => {

  const name = displayName || username;
  const joinedDate = new Date(joinedAt).toLocaleDateString();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-14 font-sans">

      {/* ========== TOP HEADER ========== */}
      
        <section className="space-y-3 pb-6 border-b">
  <h1 className="text-4xl font-serif font-semibold leading-tight tracking-tight text-gray-900">
    {name}
  </h1>

  <p className="text-sm text-gray-600">@{username}</p>

  <p className="text-gray-700 max-w-2xl leading-relaxed">
    {bio || "This Figure hasn’t written a bio yet — but their journey is unfolding."}
  </p>

  <div className="flex flex-wrap gap-8 text-xs text-gray-500">
    <div>
      <p className="font-semibold text-gray-700">Joined</p>
      <p>{joinedDate}</p>
    </div>

    <div>
      <p className="font-semibold text-gray-700">Submissions</p>
      <p>{stats.submissions}</p>
    </div>

    <div>
      <p className="font-semibold text-gray-700">Comments</p>
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
          <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white"
>

            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Focus Areas
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Patterns • Number Theory • Logic
            </p>
          </div>

          {/* Research Style */}
          <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white"
>

            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Research Style
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Exploratory • Visual • Conjectural
            </p>
          </div>

          {/* Collaboration Signal */}
          <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white"
>

            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Collaborative Signal
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Open to discussion and mathematical dialogue.
            </p>
          </div>
          {/* Work Philosophy */}
<div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white"
>
  <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
    Work Philosophy
  </p>

  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
    Driven by curiosity, guided by structure. This Figure approaches 
    mathematical exploration with patience, clarity, and a willingness 
    to revisit ideas from new angles — believing that rigorous thinking 
    and creative insight strengthen each other.
  </p>
</div>

        </div>
      </section>

      {/* ========== SUBMISSIONS ========== */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-serif font-semibold text-gray-900 tracking-tight">
Submissions</h2>
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
                    className="block border rounded-lg px-4 py-4 hover:shadow-md hover:bg-white transition bg-gray-50"
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
{/* NAVIGATION: PREVIOUS / NEXT FIGURE */}
<footer className="flex items-center justify-between pt-10 text-sm text-gray-600">

  {/* Previous */}
  {previousUser ? (
    <Link
      href={`/u/${previousUser.username}`}
      className="hover:underline"
    >
      ← Previous: {previousUser.displayName || "@" + previousUser.username}
    </Link>
  ) : (
    <span />
  )}

  {/* Next */}
  {nextUser ? (
    <Link
      href={`/u/${nextUser.username}`}
      className="hover:underline"
    >
      Next: {nextUser.displayName || "@" + nextUser.username} →
    </Link>
  ) : (
    <span />
  )}

</footer>

    </main>
  );
};

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (ctx) => {
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
          _count: {
            select: { comments: true },
          },
        },
      },
    },
  });

  // ✅ Narrow the type here
  if (!user) {
    return { notFound: true };
  }

  // ✅ Now TypeScript knows `user` is not null

  const previousUser = await prisma.user.findFirst({
    where: { createdAt: { lt: user.createdAt } },
    orderBy: { createdAt: "desc" },
    select: {
      username: true,
      displayName: true,
    },
  });

  const nextUser = await prisma.user.findFirst({
    where: { createdAt: { gt: user.createdAt } },
    orderBy: { createdAt: "asc" },
    select: {
      username: true,
      displayName: true,
    },
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
      previousUser: previousUser || null,
      nextUser: nextUser || null,
    },
  };
};


export default PublicProfilePage;
