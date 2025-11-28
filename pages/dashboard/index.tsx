// pages/dashboard/index.tsx

import type { GetServerSideProps, NextPage } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSupabaseClient } from "@/lib/supabaseServer";
import Link from "next/link";

type DashboardProps = {
  username: string;
  displayName: string | null;
  submissions: number;
  comments: number;
};

const DashboardPage: NextPage<DashboardProps> = ({
  username,
  displayName,
  submissions,
  comments,
}) => {
  const name = displayName || username;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {name}&apos;s Dashboard
        </h1>
        <p className="text-gray-600 text-sm">
          View your activity, contributions, and progress.
        </p>
      </header>

      {/* DASHBOARD STATS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-600">Total Submissions</p>
          <p className="text-2xl font-semibold">{submissions}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-600">Total Comments</p>
          <p className="text-2xl font-semibold">{comments}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-600">Public Profile</p>
          <Link
            href={`/u/${username}`}
            className="text-blue-700 hover:underline text-sm"
          >
            View your public page →
          </Link>
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;

export const getServerSideProps: GetServerSideProps<
  DashboardProps
> = async (ctx) => {
  const supabase = getServerSupabaseClient(ctx);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: "/auth/signin?redirect=/dashboard",
        permanent: false,
      },
    };
  }

  // Fetch from Prisma by authId
  const profile = await prisma.user.findUnique({
    where: { authId: user.id },
    include: {
      _count: {
        select: {
          submissions: true,
          comments: true,
        },
      },
    },
  });

  if (!profile) {
    return { notFound: true };
  }

  return {
    props: {
      username: profile.username,
      displayName: profile.displayName,
      submissions: profile._count.submissions,
      comments: profile._count.comments,
    },
  };
};
