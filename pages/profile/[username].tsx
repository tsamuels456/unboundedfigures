// pages/profile/[username].tsx
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/lib/prisma";

type PageProps = {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    createdAt: string;
  } | null;
  submissions: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
};

export default function ProfilePage({ user, submissions }: PageProps) {
  if (!user) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="mt-2">This user does not exist.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">@{user.username}</h1>
      <p className="text-gray-600">{user.displayName || "Unnamed figure"}</p>
      {user.bio && <p className="mt-2">{user.bio}</p>}

      <h2 className="text-xl font-semibold mt-8">Submissions</h2>
      <ul className="mt-3 space-y-2">
        {submissions.map((s) => (
          <li key={s.id}>
            <a className="underline" href={`/submissions/${s.id}`}>{s.title}</a>
            <span className="text-sm text-gray-500 ml-2">
              {new Date(s.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
        {submissions.length === 0 && <li className="text-gray-500">No submissions yet.</li>}
      </ul>
    </main>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const username = String(ctx.params?.username ?? "");

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, displayName: true, bio: true, createdAt: true },
  });

  if (!user) return { props: { user: null, submissions: [] } };

  const submissions = await prisma.submission.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
    take: 20,
  });

  return { props: { user, submissions } };
}
