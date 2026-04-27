'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/Icon';

export default function ConfirmedPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  useEffect(() => {
    const t = setTimeout(() => router.push('/feed'), 2400);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 22, padding: 32, textAlign: 'center' }}>
      <div className="anim-scale-in" style={{
        width: 84, height: 84, borderRadius: '50%', margin: '0 auto 20px',
        background: tokens.orangeGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 18px 36px rgba(255,87,34,0.36)',
      }}>
        <Icon.check s={42} c="#fff" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 500, color: ink,
        letterSpacing: -0.6, margin: '0 0 8px' }}>You're in.</h1>
      <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 16, color: mute,
        lineHeight: 1.55, margin: '0 0 24px' }}>
        Welcome to Siyoh. Taking you to your feed…
      </p>
      <Link href="/feed" className="press" style={{
        height: 46, padding: '0 24px', borderRadius: 12,
        background: tokens.orangeGrad, color: '#fff',
        fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 20px rgba(255,87,34,0.3)',
      }}>Go now <Icon.chev s={16} c="#fff" /></Link>
    </div>
  );
}
