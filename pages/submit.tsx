// pages/submit.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [category, setCategory] = useState("unbounded-space");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const session = useSession();

  const canSubmit = title.trim().length >= 3 && (content.trim().length > 0 || file);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    let fileUrl: string | undefined;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `submissions/${Date.now()}.${ext}`;
      const { data, error: uploadError } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
        .upload(path, file);

      if (uploadError) {
        setError("File upload failed");
        setLoading(false);
        return;
      }

      const { data: pub } = supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
        .getPublicUrl(path);

      fileUrl = pub.publicUrl;
    }

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        aiNote,
        category,
        visibility: "PUBLIC",
        allowComments: true,
        authorId: session?.user?.id ?? "cmeem1gzu0000vz6c3om1qumn",
        fileUrl,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push(`/submissions/${data.id}`);
    } else {
      setError(data.error ?? "Failed to submit");
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Submit your work</h1>

      {/* If not signed in, show sign-in message */}
      {!session ? (
        <div className="text-center">
          <p className="mb-4">You must be signed in to submit.</p>
          <Link href="/auth/signin?redirect=/submit" className="underline">
            Sign in
          </Link>
          <span className="mx-2">or</span>
          <Link href="/auth/signup?redirect=/submit" className="underline">
            Create account
          </Link>
        </div>
      ) : (
        // Otherwise show the submission form
        <form onSubmit={onSubmit}>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded p-2 mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            className="w-full border rounded p-2 mb-3"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1">AI Note (optional)</label>
          <input
            className="w-full border rounded p-2 mb-3"
            value={aiNote}
            onChange={(e) => setAiNote(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1">Upload File (optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="w-full mb-3"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </main>
  );
}
