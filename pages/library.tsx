// pages/library.tsx
import { useEffect, useState } from "react";
import Link from "next/link";

type Author = {
  id: string;
  username: string | null;
  displayName: string | null;
};

type Submission = {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null; 
  createdAt: string;            // will arrive as ISO string
  author?: Author | null;
  category?: string | null;
};

export default function LibraryPage() {
const [rows, setRows] = useState<Submission[]>([]);
const [cursor, setCursor] = useState<string | null>(null);
const [initialLoading, setInitialLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [loadingMore, setLoadingMore] = useState(false);

async function loadPage(c?: string | null) {
  try {
    const qs = c ? `?cursor=${c}` : "";
    const r = await fetch(`/api/submissions${qs}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const { items, nextCursor } = await r.json();
    setRows((prev) => (c ? [...prev, ...items] : items));
    setCursor(nextCursor);
  } catch (e: any) {
    setError(e?.message ?? "Failed to load");
  } finally {
    setInitialLoading(false);
  }
}

useEffect(() => { loadPage(null); }, []);



  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Library of Figures</h1>
      <p className="text-sm text-gray-600 mt-1">
        Public submissions from the community.
      </p>

      {/* states */}
{initialLoading && <p className="mt-8">Loading…</p>}
{!initialLoading && error && (
  <p className="mt-8 text-red-600">Error: {error}</p>
)}
{!initialLoading && !error && rows.length === 0 && (
  <p className="mt-8 text-gray-500">No submissions yet.</p>
)}


      {/* list */}
      <ul className="mt-6 space-y-4">
        {rows.map((s) => {
          const date = new Date(s.createdAt);
          const authorName =
            s.author?.displayName || s.author?.username || "Someone";
          return (
            <li key={s.id} className="border rounded p-4 hover:bg-gray-50">
              <Link href={`/submissions/${s.id}`} className="text-lg font-semibold">
                {s.title}
              </Link>
              <div className="text-sm text-gray-600 mt-1">
                {authorName} • {date.toLocaleString()}
                {s.category ? ` • ${s.category}` : null}
                {s.fileUrl ? <span className="ml-2">📎 File attached</span> : null}
              </div>
              {s.content ? (
                <p className="text-sm text-gray-800 mt-2 line-clamp-2 whitespace-pre-wrap">
                  {s.content}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

<button
  className="mt-6 px-3 py-2 border rounded"
  disabled={!cursor || loadingMore}
  onClick={() => {
    setLoadingMore(true);
    loadPage(cursor).finally(() => setLoadingMore(false));
  }}
>
  {cursor ? (loadingMore ? "Loading…" : "Load more") : "No more"}
</button>

    </main>
  );
}
