/**
 * Supabase Public Client (Server-Side, no cookies)
 *
 * Usa questo client per le letture pubbliche nelle pagine cachate (ISR),
 * es. il menu pubblico /{slug}. Non legge i cookie, quindi non rende la
 * pagina dinamica. Solo dati accessibili con la anon key.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
