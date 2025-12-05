// components/AvatarEditor.tsx
import { useState } from "react";

type Props = {
  initialUrl: string | null;
  onChange?: (url: string) => void;
};

export default function AvatarEditor({ initialUrl, onChange }: Props) {
  const [preview, setPreview] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setPreview(data.url);
        onChange?.(data.url);
      } else {
        alert(data.error || "Avatar upload failed");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="w-28 h-28 rounded-full overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center">
        {preview ? (
          <img
            src={preview}
            className="w-full h-full object-cover"
            alt="Avatar preview"
          />
        ) : (
          <span className="text-xs text-gray-500">No avatar</span>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-blue-700 underline cursor-pointer">
          {uploading ? "Uploading…" : "Change photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {uploading && (
          <p className="text-[11px] text-gray-500">Please wait…</p>
        )}
      </div>
    </div>
  );
}

