'use client';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Contest } from '@/lib/types';

const statusColor: Record<Contest['status'], string> = {
  open: 'rgba(255,87,34,0.18)',
  upcoming: 'rgba(26,22,19,0.06)',
  judging: 'rgba(255,200,150,0.3)',
  closed: 'rgba(26,22,19,0.06)',
};

export function AdminContestsView({ contests }: { contests: Contest[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Programs</div>
          <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 500, color: ink,
            letterSpacing: -0.6, margin: 0 }}>Contests</h1>
        </div>
        <button style={{
          height: 40, padding: '0 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: tokens.orangeGrad, color: '#fff',
          fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
          boxShadow: '0 8px 18px rgba(255,87,34,0.35)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}><Icon.create s={16} c="#fff" /> New contest</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {contests.map(c => (
          <div key={c.id} style={{
            ...liquidSurface({ dark, intensity: 'med' }),
            borderRadius: 18, padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 20, color: ink, fontWeight: 500,
                margin: 0, letterSpacing: -0.3 }}>{c.title}</h3>
              <span style={{
                padding: '3px 10px', borderRadius: 999, background: statusColor[c.status],
                color: c.status === 'open' ? tokens.orangeDeep : ink,
                fontFamily: 'var(--font-geist)', fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 0.3,
              }}>{c.status}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 14, color: mute,
              margin: '0 0 14px', lineHeight: 1.5 }}>{c.description}</p>
            <div style={{ display: 'flex', gap: 18, fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
              <span><strong style={{ color: ink, fontWeight: 600 }}>Window:</strong> {c.starts_at} → {c.ends_at}</span>
              <span><strong style={{ color: ink, fontWeight: 600 }}>Prize:</strong> {c.prize}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
