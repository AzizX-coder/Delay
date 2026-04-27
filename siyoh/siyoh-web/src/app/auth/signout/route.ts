import { NextResponse } from 'next/server';
import { createClient, supabaseEnabled } from '@/lib/supabase/server';

export async function POST(req: Request) {
  if (supabaseEnabled) {
    const sb = createClient();
    if (sb) await sb.auth.signOut();
  }
  return NextResponse.redirect(new URL('/', req.url), { status: 303 });
}

export async function GET(req: Request) {
  return POST(req);
}
