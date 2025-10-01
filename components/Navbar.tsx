// components/Navbar.tsx
import Link from "next/link";
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function Navbar() {
  const supabase = useSupabaseClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="flex justify-between p-4 bg-gray-100">
      <Link href="/">Home</Link>
      <Link href="/submit">Submit</Link>
      <button onClick={handleSignOut}>Sign out</button>
    </nav>
  );
}
