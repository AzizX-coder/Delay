'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { SiyohLogo } from '@/components/Logo';
import { useTheme } from '@/components/ThemeProvider';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { dark } = useTheme();
  return (
    <div className="app-bg" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div className="anim-float-slow" style={{
        position: 'absolute', top: -200, right: -120, width: 520, height: 520,
        borderRadius: '50%',
        background: dark ? 'rgba(255,87,34,0.16)' : 'rgba(255,138,76,0.22)',
        filter: 'blur(110px)', pointerEvents: 'none',
      }} />
      <div className="anim-float-slower" style={{
        position: 'absolute', bottom: -200, left: -120, width: 460, height: 460,
        borderRadius: '50%',
        background: dark ? 'rgba(255,200,150,0.06)' : 'rgba(255,200,150,0.22)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div className="anim-fade-up" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <SiyohLogo size={36} dark={dark} />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
