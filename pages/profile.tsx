// pages/profile.tsx
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function ProfilePage() {
  const session = useSession();

  // state values
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    loadProfile();
  }, [session]);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile/me");
      const data = await res.json();

      if (data?.profile) {
        setUsername(data.profile.username || "");
        setDisplayName(data.profile.displayName || "");
        setBio(data.profile.bio || "");
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    }
    setLoaded(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return alert("You must sign in");

    setSaving(true);
    setError(null);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, bio }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data?.error || "Failed to update profile");
      return;
    }

    alert("Profile updated!");
  }

  // if not signed in
  if (!session) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="mt-2">You must be signed in to edit your profile.</p>
        <div className="mt-4 flex gap-4">
          <Link className="underline" href="/auth/signin?redirect=/profile">
            Sign in
          </Link>
          <Link className="underline" href="/auth/signup?redirect=/profile">
            Create account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      {/* Public profile link */}
      <p className="text-sm text-gray-600 mb-4">
        Public profile:{" "}
        <Link href={`/u/${username}`} className="underline">
          unboundedfigures.org/u/{username}
        </Link>
      </p>

      {!loaded ? (
        <p>Loading profile...</p>
      ) : (
        <form onSubmit={onSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              className="w-full border rounded p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Display Name</label>
            <input
              className="w-full border rounded p-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              className="w-full border rounded p-2 h-32"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
    </main>
  );
}


