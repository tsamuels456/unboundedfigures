// components/Navbar.tsx
import Link from "next/link";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function Navbar() {
  const supabase = useSupabaseClient();
  const session = useSession();

  return (
    <nav className="flex justify-between p-4 bg-gray-100">
      {/* LEFT SIDE */}
      <div className="flex gap-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/submit" className="hover:underline">
          Submit
        </Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex gap-3">
        {session ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>

            <Link href="/profile" className="hover:underline">
              Profile
            </Link>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="cursor-pointer hover:underline"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className="hover:underline">
              Sign in
            </Link>
            <Link href="/auth/signup" className="hover:underline">
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}



