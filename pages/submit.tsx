// pages/submit.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";  // make sure this import is at the top

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [category, setCategory] = useState("unbounded-space");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);


  const canSubmit = title.trim().length >= 3 && (content.trim().length > 0 || !!file);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
let fileUrl: string | undefined;

if (file) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `submissions/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error: uploadError } = await supabase
    .storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    setLoading(false);
    setError(`Upload failed: ${uploadError.message}`);
    return;
  }

  // get the public URL for the uploaded file
  const { data: pub } = supabase
    .storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
    .getPublicUrl(path);

  fileUrl = pub.publicUrl;
}
    const res = await fetch("/api/submissions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title,
    content: content || undefined,
    category,
    visibility: "PUBLIC",
    allowComments: true,
    aiNote: aiNote || undefined,
    fileUrl,  // 👈 add this here
  }),
});


    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Failed to submit");
      return;
    }

    // Go to the new submission page
    router.push(`/submissions/${data.id}`);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Submit work</h1>
      <p className="text-gray-600 text-sm mt-1">
        Share an idea, sketch, proof, or pattern. Be bold and respectful.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A clear, friendly title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            className="w-full border rounded p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="unbounded-space">Unbounded Space</option>
            <option value="library-of-figures">Library of Figures</option>
            <option value="unsolved-problems">Unsolved Problems</option>
            <option value="millennium-problems">Millennium Problems</option>
            <option value="project-lab">Project Lab</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea
            className="w-full border rounded p-2 h-48 whitespace-pre-wrap"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your idea, conjecture, sketch, etc. LaTeX support coming soon."
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: You can paste plain text or LaTeX; we’ll add rendering later.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">AI Note (optional)</label>
          <input
            className="w-full border rounded p-2"
            value={aiNote}
            onChange={(e) => setAiNote(e.target.value)}
            placeholder='e.g., "Drafted by me; formatting with AI."'
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Upload (PDF/DOC/DOCX)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded p-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. If you upload a file, content is optional.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
