'use client';
import Link from 'next/link';
import { SiyohLogo } from '@/components/Logo';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

export default function NotFound() {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  return (
    <div className="app-bg" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div className="anim-float-slow" style={{
        position: 'absolute', top: -200, left: -100, width: 500, height: 500,
        borderRadius: '50%', background: dark ? 'rgba(255,87,34,0.15)' : 'rgba(255,138,76,0.2)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div className="anim-fade-up" style={{
        position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 540,
        ...liquidSurface({ dark, intensity: 'heavy' }),
        borderRadius: 28, padding: '52px 44px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <SiyohLogo size={36} dark={dark} />
        </div>
        <div className="grad-text" style={{
          fontFamily: 'var(--font-newsreader)', fontSize: 128, fontWeight: 500,
          letterSpacing: -4, lineHeight: 1, margin: '0 0 6px',
        }}>404</div>
        <h1 style={{
          fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 500,
          color: ink, letterSpacing: -0.7, margin: '0 0 12px',
        }}>This page wandered off.</h1>
        <p style={{
          fontFamily: 'var(--font-newsreader)', fontSize: 16, color: mute,
          lineHeight: 1.55, margin: '0 0 28px',
        }}>
          The story you're looking for may have been moved, or maybe it was never written.
          Let's find you something else to read.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/" className="press" style={{
            height: 46, padding: '0 22px', borderRadius: 12,
            background: tokens.orangeGrad, color: '#fff',
            fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 20px rgba(255,87,34,0.3)',
          }}><Icon.home s={16} c="#fff" /> Back home</Link>
          <Link href="/feed" className="press" style={{
            height: 46, padding: '0 22px', borderRadius: 12,
            background: 'transparent', color: ink,
            border: `0.5px solid ${dark ? tokens.darkLine : tokens.line}`,
            fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 500,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>Browse stories</Link>
        </div>
      </div>
    </div>
  );
}
