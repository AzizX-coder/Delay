'use client';
import { ReactNode } from 'react';

export function Chip({
  children, active = false, dark = false, onClick, icon,
}: { children: ReactNode; active?: boolean; dark?: boolean; onClick?: () => void; icon?: ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 34, padding: '0 14px', borderRadius: 9999,
      border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
      background: active
        ? (dark ? '#F5EDE0' : '#1A1613')
        : (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)'),
      color: active ? (dark ? '#1A1613' : '#F5EDE0') : (dark ? '#F5EDE0' : '#1A1613'),
      letterSpacing: -0.1, flexShrink: 0, transition: 'all 0.18s',
    }}>
      {icon}{children}
    </button>
  );
}
