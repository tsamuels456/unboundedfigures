import Link from "next/link";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function Navbar() {
  const supabase = useSupabaseClient();
  const session = useSession();

  return (
    <nav className="flex justify-between p-4 bg-gray-100">
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/submit">Submit</Link>
      </div>
      <div className="flex gap-3">
        {session ? (
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        ) : (
          <>
            <Link href="/auth/signin">Sign in</Link>
            <Link href="/auth/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

