import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { motion } from "framer-motion";
import Avatar from "@/components/Avatar";


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
  <motion.main
    className="max-w-4xl mx-auto px-4 py-10 space-y-14"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >


      {/* ======== TOP HEADER ======== */}
<section className="space-y-4 pb-6 border-b">

  <div className="flex items-center gap-4">
    <Avatar name={username} size={64} />

    <div>
      <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
      <p className="text-sm text-gray-500">@{username}</p>
    </div>
  </div>

  <p className="text-sm text-gray-700 max-w-2xl leading-relaxed">
    {bio || "This Figure has not written a bio yet — but their journey is unfolding."}
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
        <h2 className="text-lg font-semibold tracking-tight text-gray-800">
          About This Figure
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
          A mind contributing to open mathematical exploration. Their work reflects curiosity,
          self-driven inquiry, and a commitment to collaborative discovery.
        </p>

        <motion.div
    className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
>


          {/* Focus Areas */}
          <motion.div
  className="research-card p-4"
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  viewport={{ once: true }}
>


            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Focus Areas
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Patterns • Number Theory • Logic
            </p>
          </motion.div>


          {/* Research Style */}
          <motion.div
  className="research-card p-4"
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  viewport={{ once: true }}
>


            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Research Style
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Exploratory • Visual • Conjectural
            </p>
          </motion.div>


          {/* Collaboration Signal */}
          <motion.div
  className="research-card p-4"
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  viewport={{ once: true }}
>


            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Collaborative Signal
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Open to discussion and mathematical dialogue.
            </p>
          </motion.div>

          {/* Work Philosophy */}
<motion.div
  className="research-card p-4"
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  viewport={{ once: true }}
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
            {submissions.map((s, i) => {
  const created = new Date(s.createdAt).toLocaleString();

  return (
    <motion.li
      key={s.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: i * 0.06 }}   // <— stagger
    >
      <Link
        href={`/submissions/${s.id}`}
        className="block research-card px-5 py-4 rounded-lg bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-gray-800">{s.title}</h3>
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
          <p className="text-xs text-gray-500">{s.commentCount} comments</p>
        </div>
      </Link>
    </motion.li>
  );
})}

          </ul>
        )}
      </motion.section>
{/* NAVIGATION: PREVIOUS / NEXT FIGURE */}
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

</motion.footer>

    </motion.main>
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
