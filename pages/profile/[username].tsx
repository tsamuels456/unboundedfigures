// pages/profile/[username].tsx
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/lib/prisma";
import { useSession } from "@supabase/auth-helpers-react";

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
    const session = useSession();

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
          {session?.user?.id === user.id && (

          <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const displayName = form.displayName.value;
        const bio = form.bio.value;

        const res = await fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName, bio }),
        });

        if (res.ok) {
          alert("Profile updated!");
          location.reload();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to update profile");
        }
      }}
      className="mt-6 space-y-4 border-t border-gray-200 pt-4"
    >
      <div>
        <label className="block text-sm font-medium">Display Name</label>
        <input
          name="displayName"
          defaultValue={user.displayName ?? ""}
          className="border w-full p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          name="bio"
          defaultValue={user.bio ?? ""}
          rows={3}
          className="border w-full p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Save Changes
      </button>
    </form>
    )}
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

  // 🧠 Convert Dates → Strings
  return {
    props: {
      user: { ...user, createdAt: user.createdAt.toISOString() },
      submissions: submissions.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    },
  };
}

