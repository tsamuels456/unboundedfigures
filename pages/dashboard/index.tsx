// pages/dashboard/index.tsx

import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { motion } from "framer-motion";

import { prisma } from "@/lib/prisma";
import { getServerSupabaseClient } from "@/lib/supabaseServer";
import DashboardSidebar from "@/components/DashboardSidebar";

type ActivityItem = {
  type: "submission" | "comment";
  id: string;
  createdAt: string;
  title: string;
  content?: string;
  submissionId?: string;
};

type RecentWorkItem = {
  id: string;
  title: string;
  createdAt: string;
  category: string | null;
  commentCount: number;
};

type DashboardProps = {
  username: string;
  displayName: string | null;
  submissions: number;
  comments: number;
  followers: number;
  following: number;
  activity: ActivityItem[];
  recentWork: RecentWorkItem[];
};


/* ---------- Small helper components ---------- */

const OverviewCard = ({ title, value }: { title: string; value: number }) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="border rounded-xl px-4 py-4 bg-white shadow-sm hover:shadow-md"
    >
      <p className="text-xs font-semibold tracking-[0.16em] uppercase text-gray-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </motion.div>
  );
};

const Divider = ({ title }: { title: string }) => (
  <div className="relative my-4">
    <hr className="border-gray-200" />
    <span className="absolute left-0 -top-3 bg-[#f7f5f1] px-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-500">
      {title}
    </span>
  </div>
);

/* ---------- Page component ---------- */

const DashboardPage: NextPage<DashboardProps> = ({
  username,
  displayName,
  submissions,
  comments,
  followers,
  following,
  activity,
  recentWork,
}) => {

  const name = displayName || username;

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#f7f5f1]"
    >
      <div className="max-w-6xl mx-auto flex gap-10 px-4 py-10">
        {/* Fixed left sidebar (desktop) */}
        <DashboardSidebar username={username} />

        {/* Main dashboard content */}
        <section className="flex-1 space-y-10">
          {/* HEADER */}
          <header className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {name}&apos;s Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              View your activity, contributions, and progress.
            </p>
          </header>

          {/* GRID: overview + public profile card */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <OverviewCard title="Total submissions" value={submissions} />
  <OverviewCard title="Total comments" value={comments} />
  <OverviewCard title="Followers" value={followers} />
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    transition={{ duration: 0.2 }}
    className="border rounded-xl px-4 py-4 bg-white shadow-sm hover:shadow-md flex flex-col justify-between"
  >
    <p className="text-xs font-semibold tracking-[0.16em] uppercase text-gray-500">
      Public profile
    </p>
    <div className="mt-2 text-sm">
      <p className="text-gray-600 mb-1">
        Share your work as <span className="font-medium">@{username}</span>.
      </p>
      <Link
        href={`/u/${username}`}
        className="inline-flex items-center text-xs text-blue-700 hover:underline"
      >
        View your public page →
      </Link>
    </div>
  </motion.div>
</section>


          {/* YOUR WORK */}
          <section className="space-y-3">
            <Divider title="Your work" />

            {recentWork.length === 0 ? (
              <p className="text-sm text-gray-500">
                You haven&apos;t shared any submissions yet. Your recent work
                will appear here.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentWork.map((item, i) => {
                  const created = new Date(item.createdAt).toLocaleString();
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="border rounded-lg px-4 py-3 bg-white shadow-sm hover:shadow-md hover:bg-gray-50"
                    >
                      <Link
                        href={`/submissions/${item.id}`}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">{created}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{item.commentCount} comments</p>
                          {item.category && (
                            <p className="mt-0.5 text-[11px] text-gray-400">
                              {item.category}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* RECENT ACTIVITY */}
          <section className="space-y-3">
            <Divider title="Recent activity" />
            {activity.length === 0 ? (
              <p className="text-sm text-gray-500">
                No recent activity yet. Start contributing and your work will
                appear here.
              </p>
            ) : (
              <ul className="space-y-2">
                {activity.map((item, index) => {
                  const date = new Date(item.createdAt).toLocaleString();
                  const isSubmission = item.type === "submission";

                  return (
                    <motion.li
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                      className="border rounded-xl px-4 py-3 bg-white shadow-sm hover:shadow-md"
                    >
                      {isSubmission ? (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            New submission:{" "}
                            <Link
                              href={`/submissions/${item.id}`}
                              className="text-blue-700 hover:underline"
                            >
                              {item.title}
                            </Link>
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">{date}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            Commented on{" "}
                            {item.submissionId ? (
                              <Link
                                href={`/submissions/${item.submissionId}`}
                                className="text-blue-700 hover:underline"
                              >
                                {item.title}
                              </Link>
                            ) : (
                              item.title
                            )}
                          </p>
                          {item.content && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                              “{item.content}”
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-gray-500">{date}</p>
                        </>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </section>
        </section>
      </div>
    </motion.main>
  );
};

/* ---------- Data fetching ---------- */

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (
  ctx
) => {
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

  // Pull profile
  const me = await prisma.user.findUnique({
  where: { authId: user.id },
  select: {
    id: true,
    username: true,
    displayName: true,
    _count: {
      select: {
        submissions: true,
        comments: true,
        followers: true,
        following: true,
      },
    },
  },
});


  if (!me) {
    return {
      redirect: {
        destination: "/api/me/ensure",
        permanent: false,
      },
    };
  }

  // Latest submissions by this user (for both activity + "Your work")
  const mySubmissions = await prisma.submission.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      createdAt: true,
      category: true,
      _count: { select: { comments: true } },
    },
  });

  // Latest comments by this user
  const myComments = await prisma.comment.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      content: true,
      createdAt: true,
      submission: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Build activity stream (submission + comment events)
  const activity: ActivityItem[] = [
    ...mySubmissions.map((s) => ({
      type: "submission" as const,
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      title: s.title,
    })),
    ...myComments.map((c) => ({
      type: "comment" as const,
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      title: c.submission.title,
      content: c.content,
      submissionId: c.submission.id,
    })),
  ].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );

  // "Your work" = top 5 most recent submissions
  const recentWork: RecentWorkItem[] = mySubmissions.slice(0, 5).map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.createdAt.toISOString(),
    category: s.category,
    commentCount: s._count.comments,
  }));

  return {
  props: {
    username: me.username,
    displayName: me.displayName,
    submissions: me._count.submissions,
    comments: me._count.comments,
    followers: me._count.followers,
    following: me._count.following,
    activity,
    recentWork,
  },
};

};

export default DashboardPage;
