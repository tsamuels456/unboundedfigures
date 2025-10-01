// lib/supabaseBrowser.ts
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const getBrowserSupabaseClient = () => createBrowserSupabaseClient();
