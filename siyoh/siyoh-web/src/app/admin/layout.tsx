'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiyohLogo } from '@/components/Logo';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { BgBlobs } from '@/components/BgBlobs';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

const NAV = [
  { href: '/admin', label: 'Overview', icon: Icon.home },
  { href: '/admin/stories', label: 'Stories', icon: Icon.books },
  { href: '/admin/users', label: 'Users', icon: Icon.profile },
  { href: '/admin/contests', label: 'Contests', icon: Icon.trophy },
  { href: '/admin/moderation', label: 'Moderation', icon: Icon.shield },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const pathname = usePathname();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div className="app-bg">
      <BgBlobs dark={dark} />
      <div style={{
        display: 'grid', gridTemplateColumns: '240px 1fr',
        minHeight: '100vh', maxWidth: 1440, margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <aside style={{ padding: '28px 18px', borderRight: `0.5px solid ${line}`,
          position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 8px 12px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}><SiyohLogo size={26} dark={dark} /></Link>
          </div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 600, padding: '6px 12px 16px' }}>Admin</div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV.map(n => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} style={{
                  height: 42, padding: '0 12px', borderRadius: 12,
                  background: active ? (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)') : 'transparent',
                  color: active ? ink : mute,
                  fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: active ? 600 : 500,
                  display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
                }}>
                  <n.icon s={18} c={active ? ink : mute} /> {n.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginTop: 'auto', padding: '14px 10px 0', borderTop: `0.5px solid ${line}`,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name="A" size={34} seed={4} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: ink, fontWeight: 500 }}>Admin</div>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute }}>siyoh.app</div>
            </div>
            <button onClick={toggle} aria-label="Toggle theme" style={{
              width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{dark ? <Icon.sun s={16} c={ink} /> : <Icon.moon s={16} c={ink} />}</button>
          </div>
        </aside>
        <main style={{ minHeight: '100vh' }}>{children}</main>
      </div>
    </div>
  );
}
