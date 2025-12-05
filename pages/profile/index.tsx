// pages/profile/index.tsx
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import AvatarEditor from "@/components/AvatarEditor";

export default function ProfilePage() {
  const session = useSession();
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  async function loadProfile() {
    const res = await fetch("/api/profile/me");
    const data = await res.json();

    if (data.profile) {
      setUsername(data.profile.username);
      setDisplayName(data.profile.displayName);
      setBio(data.profile.bio || "");
      setAvatarUrl(data.profile.avatarUrl || "");
    }

    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, bio, avatarUrl }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }

    alert("Profile updated!");
  }

  useEffect(() => {
    if (session) loadProfile();
  }, [session]);

  if (!session) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p>Please sign in to edit your profile.</p>
      </main>
    );
  }

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-10 space-y-10">
      <h1 className="text-3xl font-serif font-bold tracking-tight">Profile & Settings</h1>

      <section className="flex gap-10">
        <AvatarEditor initialUrl={avatarUrl} onChange={(url) => setAvatarUrl(url)} />

        <div className="flex-grow">
          <form onSubmit={saveProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                className="w-full border rounded p-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                className="w-full border rounded p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full border rounded p-2 h-32"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Save Changes
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
