// pages/dashboard/index.tsx
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSupabaseClient } from "@/lib/supabaseServer";
import { motion } from "framer-motion";

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
    <motion.main
      className="max-w-5xl mx-auto px-6 py-10 space-y-14"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{name}'s Dashboard</h1>
        <p className="text-gray-600 text-sm">
          View your activity, contributions, and progress.
        </p>
      </header>

      {/* GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <OverviewCard title="Total Submissions" value={submissions} />
        <OverviewCard title="Total Comments" value={comments} />

        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md"
        >
          <p className="text-sm font-semibold text-gray-700">Public Profile</p>
          <Link
            href={`/u/${username}`}
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View your public page →
          </Link>
        </motion.div>
      </section>
    </motion.main>
  );
};

const OverviewCard = ({ title, value }: { title: string; value: number }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    transition={{ duration: 0.2 }}
    className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md"
  >
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    <p className="text-3xl font-light mt-2">{value}</p>
  </motion.div>
);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = getServerSupabaseClient(ctx);
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: "/auth/signin?redirect=/dashboard",
        permanent: false,
      },
    };
  }

  const me = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      username: true,
      displayName: true,
      _count: { select: { submissions: true, comments: true } },
    },
  });

  if (!me) {
    return {
      redirect: { destination: "/api/me/ensure", permanent: false },
    };
  }

  return {
    props: {
      username: me.username,
      displayName: me.displayName,
      submissions: me._count.submissions,
      comments: me._count.comments,
    },
  };
};

export default DashboardPage;
