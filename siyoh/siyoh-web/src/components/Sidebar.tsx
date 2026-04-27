'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiyohLogo } from './Logo';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from './ThemeProvider';
import type { Profile } from '@/lib/types';

const NAV_BASE = [
  { k: 'home', href: '/feed', label: 'Bosh sahifa', icon: Icon.home },
  { k: 'explore', href: '/explore', label: 'Kashf etish', icon: Icon.explore },
  { k: 'books', href: '/books', label: 'Kitoblar', icon: Icon.books },
  { k: 'notifications', href: '/notifications', label: 'Bildirishnomalar', icon: Icon.bell },
];

export function Sidebar({ user }: { user?: Profile | null }) {
  const { dark, toggle } = useTheme();
  const pathname = usePathname();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const NAV = user
    ? [...NAV_BASE, { k: 'profile', href: `/profile/${user.username}`, label: 'Sahifalaringiz', icon: Icon.profile }]
    : NAV_BASE;

  const activeKey = pathname.startsWith('/feed') ? 'home'
    : pathname.startsWith('/explore') ? 'explore'
    : pathname.startsWith('/books') ? 'books'
    : pathname.startsWith('/notifications') ? 'notifications'
    : pathname.startsWith('/profile') ? 'profile'
    : pathname.startsWith('/create') ? 'create'
    : pathname.startsWith('/admin') ? 'admin'
    : '';

  return (
    <aside style={{
      padding: '28px 18px', position: 'sticky', top: 0, height: '100vh',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '0 8px 28px' }}>
        <Link href="/feed" style={{ textDecoration: 'none' }}>
          <SiyohLogo size={28} dark={dark} />
        </Link>
      </div>

      <Link href="/create" className="press" style={{
        margin: '0 0 24px', height: 46, borderRadius: 14,
        background: tokens.orangeGrad, color: '#fff',
        fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600, letterSpacing: 0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 8px 20px rgba(255,87,34,0.3)', textDecoration: 'none',
      }}><Icon.create s={18} c="#fff" /> Yaratish</Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => {
          const active = activeKey === n.k;
          return (
            <Link key={n.k} href={n.href} style={{
              height: 42, padding: '0 12px', borderRadius: 12,
              background: active ? (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)') : 'transparent',
              color: active ? ink : mute,
              fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: active ? 600 : 500,
              display: 'flex', alignItems: 'center', gap: 12, letterSpacing: -0.1,
              textDecoration: 'none',
            }}>
              <n.icon s={18} c={active ? ink : mute} /> {n.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 26, padding: '0 12px',
        fontFamily: 'var(--font-geist)', fontSize: 12, color: mute,
        fontStyle: 'italic', lineHeight: 1.5 }}>
        Hali kuzatilayotganlar yo&apos;q. Yozuvchilarni kashf eting va kuzatib boring.
      </div>

      <div style={{ marginTop: 'auto', padding: '14px 10px 0', borderTop: `0.5px solid ${line}`,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <Link href={`/profile/${user.username}`} style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <Avatar name={user.display_name[0]} size={34} seed={user.avatar_seed} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: ink, fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.display_name}</div>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute }}>@{user.username}</div>
            </div>
          </>
        ) : (
          <Link href="/auth/login" className="press" style={{
            flex: 1, height: 38, borderRadius: 10,
            background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
            color: ink, textDecoration: 'none',
            fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>Kirish</Link>
        )}
        <button onClick={toggle} aria-label="Mavzuni almashtirish" className="press" style={{
          width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{dark ? <Icon.sun s={16} c={ink} /> : <Icon.moon s={16} c={ink} />}</button>
      </div>
    </aside>
  );
}
