'use client';
import { SiyohLogo } from '@/components/Logo';
import { useTheme } from '@/components/ThemeProvider';

export default function GlobalLoading() {
  const { dark } = useTheme();
  return (
    <div className="app-bg" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div className="anim-drift">
        <SiyohLogo size={36} dark={dark} withMark={false} />
      </div>
      <div style={{
        width: 80, height: 3, borderRadius: 2,
        background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.06)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent, #FF6A3D, transparent)',
          animation: 'shimmer 1.2s infinite linear',
          backgroundSize: '200% 100%',
        }} />
      </div>
    </div>
  );
}
