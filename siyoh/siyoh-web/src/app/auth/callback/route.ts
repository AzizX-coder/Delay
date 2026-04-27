import { NextResponse } from 'next/server';
import { createClient, supabaseEnabled } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/auth/confirmed';

  if (code && supabaseEnabled) {
    const sb = createClient();
    if (sb) await sb.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
