// lib/supabaseBrowser.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const getBrowserSupabaseClient = () => createPagesBrowserClient();

