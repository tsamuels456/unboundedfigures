import { useState } from "react";

type Props = {
  initialUrl: string | null;
  onChange?: (url: string) => void;
};

export default function AvatarEditor({ initialUrl, onChange }: Props) {
  const [preview, setPreview] = useState(initialUrl);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) {
      setPreview(data.url);
      onChange?.(data.url);
    }
  }

  return (
    <div className="space-y-2">
      <img
        src={preview || "/default-avatar.png"}
        className="w-28 h-28 rounded-full object-cover border shadow-sm"
      />
      <label className="text-sm text-blue-700 underline cursor-pointer">
        Change photo
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </div>
  );
}
