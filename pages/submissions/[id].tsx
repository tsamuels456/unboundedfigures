// pages/submissions/[id].tsx
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useEffect } from "react";

type Props = {
  submission: {
    id: string;
    title: string;
    content: string | null;   // keep your existing fields
    fileUrl: string | null;
    createdAt: string;
    category: string | null;
    author: { username: string | null; displayName: string | null } | null;
  } | null;

  comments: Array<{
    id: string;
    content: string;
    createdAt: string; // Date will be serialized to string
    author: { id: string; username: string | null; displayName: string | null } | null;
  }>;
};



export default function SubmissionPage({ submission, comments }: Props) {
  useEffect(() => {
  if (!submission?.id) return;

  // respect toggle
  if (typeof window !== "undefined" && localStorage.getItem("UF_RECS_OFF") === "1") return;

  fetch("/api/views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissionId: submission.id }),
  });
}, [submission?.id]);


  if (!submission) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <p className="mt-2">This submission does not exist.</p>
      </main>
    );
  }

  const date = new Date(submission.createdAt).toLocaleString();
  const authorName =
    submission.author?.displayName ||
    submission.author?.username ||
    "Unknown";

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">{submission.title}</h1>
      <div className="text-gray-600 text-sm mt-2">
        {authorName} • {date} • {submission.category || "Uncategorized"}
      </div>
      <article className="mt-6 whitespace-pre-wrap leading-relaxed">
        {submission.content}
      </article>

      {submission?.fileUrl ? (
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 px-3 py-2 border rounded hover:bg-gray-50"
        >
          Download attached file
        </a>
          ) : null}
          <section className="mt-10">
  <h3 className="text-xl font-semibold mb-3">Comments</h3>
  {comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}

  <ul className="space-y-4">
    {comments.map((c) => (
      <li key={c.id} className="border-t pt-3">
        <p className="whitespace-pre-wrap">{c.content}</p>
        <p className="text-sm text-gray-500 mt-1">
          by {c.author?.displayName || c.author?.username || "Unknown"} •{" "}
          {new Date(c.createdAt).toLocaleString()}
        </p>
      </li>
    ))}
  </ul>
</section>

    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, displayName: true } },
    },
  });
  // Get comments for this submission
const comments = await prisma.comment.findMany({
  where: { submissionId: id },
  orderBy: { createdAt: "asc" },
  include: {
    author: {
      select: { id: true, username: true, displayName: true }
    }
  }
});
return { props: { submission, comments } };
  
};
