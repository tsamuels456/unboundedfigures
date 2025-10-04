import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import Navbar from "@/components/Navbar"; // <-- add this

export default function MyApp({ Component, pageProps }: AppProps<{ initialSession: Session | null }>) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <Navbar />                         {/* <-- render globally */}
      <Component {...pageProps} />       {/* page content */}
    </SessionContextProvider>
  );
}

