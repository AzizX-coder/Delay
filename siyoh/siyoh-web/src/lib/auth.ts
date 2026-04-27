import { createClient, supabaseEnabled } from './supabase/server';
import type { Profile } from './types';

export async function getCurrentUser(): Promise<{ profile: Profile | null; userId: string | null }> {
  if (!supabaseEnabled) return { profile: null, userId: null };
  const sb = createClient();
  if (!sb) return { profile: null, userId: null };
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { profile: null, userId: null };
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
  return { profile: profile as Profile | null, userId: user.id };
}
