// pages/profile.tsx
import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  // Redirect if not logged in
  if (!session) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="mt-2">You must be signed in to view your profile.</p>
        <a className="underline" href="/auth/signin?redirect=/profile">
          Sign in
        </a>
      </main>
    );
  }

  async function loadProfile() {
    const res = await fetch("/api/profile/me");
    const data = await res.json();

    if (res.ok && data.profile) {
      setUsername(data.profile.username ?? "");
      setDisplayName(data.profile.displayName ?? "");
      setBio(data.profile.bio ?? "");
    }
  }

  // load once
  useState(() => {
    loadProfile();
  });

  async function onSave(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, bio }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to update profile");
      return;
    }

    alert("Profile updated!");
    router.reload();
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <form onSubmit={onSave} className="space-y-4">
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
            className="w-full border rounded p-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
