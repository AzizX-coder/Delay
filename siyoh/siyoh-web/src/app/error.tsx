'use client';
import { useEffect } from 'react';
import { SiyohLogo } from '@/components/Logo';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  useEffect(() => {
    if (typeof console !== 'undefined') console.error(error);
  }, [error]);

  return (
    <div className="app-bg" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div className="anim-float-slow" style={{
        position: 'absolute', top: -200, right: -100, width: 500, height: 500,
        borderRadius: '50%', background: dark ? 'rgba(255,87,34,0.15)' : 'rgba(255,138,76,0.2)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div className="anim-fade-up" style={{
        position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 520,
        ...liquidSurface({ dark, intensity: 'heavy' }),
        borderRadius: 28, padding: '48px 40px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <SiyohLogo size={32} dark={dark} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-newsreader)', fontSize: 36, fontWeight: 500,
          color: ink, letterSpacing: -0.8, margin: '0 0 12px',
        }}>Something quietly broke.</h1>
        <p style={{
          fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute,
          lineHeight: 1.55, margin: '0 0 22px',
        }}>{error.message || 'An unexpected error occurred. Please try again.'}</p>
        {error.digest && (
          <div style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: mute,
            background: dark ? 'rgba(255,237,213,0.05)' : 'rgba(26,22,19,0.04)',
            padding: '8px 12px', borderRadius: 8, marginBottom: 22,
          }}>digest: {error.digest}</div>
        )}
        <button onClick={reset} className="press" style={{
          height: 46, padding: '0 26px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: tokens.orangeGrad, color: '#fff',
          fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 20px rgba(255,87,34,0.3)',
        }}>Try again</button>
      </div>
    </div>
  );
}
