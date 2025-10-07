// pages/dashboard.tsx
import { GetServerSidePropsContext } from "next";
import { getServerSupabaseClient } from "@/lib/supabaseServer";
import { prisma } from "@/lib/prisma";

type Props = {
  me: { id: string; username: string; displayName: string | null };
  submissions: Array<{ id: string; title: string; createdAt: string }>;
};

export default function Dashboard({ me, submissions }: Props) {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">My Dashboard</h1>
      <p className="text-gray-600">@{me.username}</p>

      <h2 className="text-xl font-semibold mt-8">My submissions</h2>
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
  const supabase = getServerSupabaseClient(ctx);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: "/auth/signin?redirect=/dashboard", permanent: false } };
  }

  const me = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true, username: true, displayName: true },
  });

  if (!me) return { redirect: { destination: "/api/me/ensure", permanent: false } };

  const submissions = await prisma.submission.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
    take: 20,
  });

  return { props: { me, submissions } };
}
