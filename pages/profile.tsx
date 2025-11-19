// pages/profile.tsx
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function ProfilePage() {
  const session = useSession();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session) return;
    loadProfile();
  }, [session]);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile/me");
      const data = await res.json();

      if (data?.profile) {
        setDisplayName(data.profile.displayName || "");
        setBio(data.profile.bio || "");
      }
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load profile", err);
      setLoaded(true);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return alert("You must sign in");

    setSaving(true);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        bio,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data?.error || "Failed to update profile");
      return;
    }

    alert("Profile updated!");
  }

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

      {!loaded ? (
        <p>Loading profile...</p>
      ) : (
        <form onSubmit={onSave} className="space-y-6">
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

