// pages/u/[username].tsx

import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SubmissionSummary = {
  id: string;
  title: string;
  createdAt: string;
  category: string | null;
};

type PublicUser = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  createdAt: string;
  submissions: SubmissionSummary[];
  _count: {
    submissions: number;
    comments: number;
  };
};

type Props = {
  user: PublicUser | null;
};

const PublicProfilePage: NextPage<Props> = ({ user }) => {
  if (!user) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4">User not found</h1>
        <p className="text-gray-600">
          We couldn&apos;t find that profile. It may have been renamed or does not exist.
        </p>
        <Link href="/" className="mt-4 inline-block underline">
          Go back home
        </Link>
      </main>
    );
  }

  const joined = new Date(user.createdAt).toLocaleDateString();

  return (
    <main className="max-w-3xl mx-auto py-10">
      {/* Header */}
      <section className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold mb-2">
          {user.displayName || user.username}
        </h1>
        <p className="text-gray-600 mb-1">@{user.username}</p>
        <p className="text-gray-500 text-sm mb-2">Joined {joined}</p>

        {user.bio && (
          <p className="mt-3 whitespace-pre-wrap text-gray-800">{user.bio}</p>
        )}

        <div className="mt-4 text-sm text-gray-600 flex gap-4">
          <span>{user._count.submissions} submissions</span>
          <span>{user._count.comments} comments</span>
        </div>
      </section>

      {/* Submissions list */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Submissions</h2>

        {user.submissions.length === 0 && (
          <p className="text-gray-600">No submissions yet.</p>
        )}

        <ul className="space-y-4">
          {user.submissions.map((s) => {
            const created = new Date(s.createdAt).toLocaleString();
            return (
              <li
                key={s.id}
                className="border rounded px-4 py-3 hover:bg-gray-50 transition"
              >
                <Link
                  href={`/submissions/${s.id}`}
                  className="text-lg font-semibold underline"
                >
                  {s.title || "(untitled submission)"}
                </Link>
                <div className="text-sm text-gray-600 mt-1">
                  <span>{created}</span>
                  {s.category && (
                    <>
                      {" • "}
                      <span>{s.category}</span>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const username = ctx.params?.username as string | undefined;

  if (!username) {
    return { notFound: true };
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          category: true,
        },
      },
      _count: {
        select: {
          submissions: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    return { notFound: true };
  }

  // Serialize Dates to strings so Next.js can pass them as JSON
  const safeUser: PublicUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    _count: user._count,
    submissions: user.submissions.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      createdAt: s.createdAt.toISOString(),
    })),
  };

  return {
    props: {
      user: safeUser,
    },
  };
};

export default PublicProfilePage;
