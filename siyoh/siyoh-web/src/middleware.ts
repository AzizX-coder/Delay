import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const PROTECTED = ['/create', '/notifications', '/settings', '/profile/edit'];
const ADMIN_ONLY = ['/admin'];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const enabled = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!enabled) return NextResponse.next();

  const res = NextResponse.next();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet: { name: string; value: string; options?: CookieOptions }[]) =>
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await sb.auth.getUser();

  const path = url.pathname;
  const needsAuth = PROTECTED.some(p => path === p || path.startsWith(p + '/'));
  const needsAdmin = ADMIN_ONLY.some(p => path === p || path.startsWith(p + '/'));

  if ((needsAuth || needsAdmin) && !user) {
    const next = encodeURIComponent(path);
    return NextResponse.redirect(new URL(`/auth/login?next=${next}`, url.origin));
  }

  if (needsAdmin && user) {
    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/feed', url.origin));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
