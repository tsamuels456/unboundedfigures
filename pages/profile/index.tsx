// pages/profile/index.tsx

import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { getServerSupabaseClient } from "@/lib/supabaseServer";
import { prisma } from "@/lib/prisma";

interface ProfileRedirectProps {
  userId: string | null;
  username: string | null;
}

export const getServerSideProps: GetServerSideProps<ProfileRedirectProps> = async (ctx) => {
  const supabase = getServerSupabaseClient(ctx);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: { destination: "/auth/signin?redirect=/profile", permanent: false },
    };
  }

  const local = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  return {
    props: {
      userId: user.id,
      username: local?.username ?? null,
    },
  };
};

const ProfilePage: NextPage<ProfileRedirectProps> = ({ userId, username }) => {
  const session = useSession();

  // State
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile
  useEffect(() => {
    if (!session) return;

    async function loadProfile() {
      try {
        const res = await fetch("/api/profile/me");
        const data = await res.json();

        if (data?.profile) {
          setDisplayName(data.profile.displayName || "");
          setBio(data.profile.bio || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
      setLoading(false);
    }

    loadProfile();
  }, [session]);

  // Save profile
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return alert("You must sign in");

    setSaving(true);
    setError(null);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        bio,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data?.error || "Failed to update profile");
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
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      {/* VIEW PUBLIC PROFILE BUTTON */}
      {username && (
        <div className="mb-6">
          <Link
            href={`/u/${username}`}
            className="inline-block text-sm px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black transition"
          >
            View Public Profile
          </Link>
        </div>
      )}

      {!loading ? (
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

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      ) : (
        <p>Loading profile...</p>
      )}
    </main>
  );
};

export default ProfilePage;

