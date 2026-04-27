'use client';
import Link from 'next/link';
import { Icon } from './Icon';
import { Chip } from './Chip';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from './ThemeProvider';
import { themes } from '@/lib/mock-data';

export function RightRail() {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  return (
    <aside style={{ padding: '22px 26px', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
      <Link href="/search" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 42, borderRadius: 14, padding: '0 14px', marginBottom: 22,
        textDecoration: 'none', color: 'inherit',
        ...liquidSurface({ dark, intensity: 'med' }),
      }}>
        <Icon.search s={16} c={mute} />
        <span style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute, flex: 1 }}>Siyoh ichidan qidirish</span>
        <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: mute,
          padding: '2px 6px', borderRadius: 4,
          background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)' }}>⌘K</kbd>
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Soat audiosi</div>
        <div style={{
          ...liquidSurface({ dark, intensity: 'med' }),
          borderRadius: 18, padding: 18, textAlign: 'center',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, margin: '0 auto 12px',
            background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.headphones s={20} c={mute} />
          </div>
          <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: ink,
            fontStyle: 'italic', marginBottom: 6 }}>Hali audio yo&apos;q.</div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11.5, color: mute, lineHeight: 1.5 }}>
            Birinchi ovozli hikoyani siz yaratasizmi?
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Kuzatib boriladigan yozuvchilar</div>
        <div style={{
          ...liquidSurface({ dark, intensity: 'med' }),
          borderRadius: 18, padding: 18, textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 14, color: mute,
            fontStyle: 'italic', lineHeight: 1.5 }}>
            Hamjamiyat hozirgina shakllanmoqda.
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Mavzular bo&apos;yicha sayr</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {themes.slice(0, 6).map(th => <Chip key={th} dark={dark}>{th}</Chip>)}
        </div>
      </div>
    </aside>
  );
}
