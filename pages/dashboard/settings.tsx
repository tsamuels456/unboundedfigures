// pages/dashboard/settings.tsx

import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import AvatarEditor from "@/components/AvatarEditor";
import Link from "next/link";

type FieldErrors = {
  username?: string;
  displayName?: string;
  bio?: string;
};

export default function DashboardSettingsPage() {
  const session = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Simple client-side validation
  function validate(values: {
    username: string;
    displayName: string;
    bio: string;
  }): FieldErrors {
    const errs: FieldErrors = {};
    const uname = values.username.trim();

    if (!uname) {
      errs.username = "Username is required.";
    } else if (!/^[a-z0-9_]+$/i.test(uname)) {
      errs.username = "Username can only contain letters, numbers, and underscores.";
    } else if (uname.length < 3 || uname.length > 20) {
      errs.username = "Username must be between 3 and 20 characters.";
    }

    if (!values.displayName.trim()) {
      errs.displayName = "Display name is required.";
    } else if (values.displayName.length > 40) {
      errs.displayName = "Display name must be at most 40 characters.";
    }

    if (values.bio.length > 300) {
      errs.bio = "Bio must be at most 300 characters.";
    }

    return errs;
  }

  // Load profile from API
  async function loadProfile() {
    try {
      const res = await fetch("/api/profile/me");
      const data = await res.json();
      if (data.profile) {
        setUsername(data.profile.username || "");
        setDisplayName(data.profile.displayName || "");
        setBio(data.profile.bio || "");
        setAvatarUrl(data.profile.avatarUrl || null);
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Username availability checker (debounced)
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setCheckingUsername(true);
      setUsernameAvailable(null);

      try {
        const res = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(username)}`
        );
        const data = await res.json();
        if (res.ok) {
          setUsernameAvailable(data.available);
        } else {
          setUsernameAvailable(null);
        }
      } catch (e) {
        console.error("Username check failed", e);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate({ username, displayName, bio });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, bio, avatarUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update profile.");
      } else {
        alert("Profile updated!");
      }
    } catch (e) {
      console.error("Save failed", e);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (!session) {
    return (
      <main className="max-w-3xl mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="text-gray-600 text-sm">
          You must be signed in to edit your profile.
        </p>
        <Link href="/auth/signin" className="text-blue-600 underline text-sm">
          Sign in →
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-10">
        <p>Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-10 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-sm text-gray-600">
          Update how you appear across UnboundedFigures.
        </p>
      </header>

      <section className="flex flex-col md:flex-row gap-8">
        {/* Avatar editor */}
        <div>
          <AvatarEditor
            initialUrl={avatarUrl}
            onChange={(url) => setAvatarUrl(url)}
          />
        </div>

        {/* Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <span className="text-xs text-gray-500">
                  Used in your public URL
                </span>
              </div>
              <input
                className="w-full border rounded p-2 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.username}
                </p>
              )}
              {username && !errors.username && (
                <p className="text-xs mt-1">
                  {checkingUsername && "Checking availability…"}
                  {!checkingUsername && usernameAvailable === true && (
                    <span className="text-green-600">
                      This username is available.
                    </span>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="text-red-600">
                      This username is already taken.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Display name
              </label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              {errors.displayName && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full border rounded p-2 text-sm h-32"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                {errors.bio ? (
                  <p className="text-red-600">{errors.bio}</p>
                ) : (
                  <span />
                )}
                <p>{bio.length}/300</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
