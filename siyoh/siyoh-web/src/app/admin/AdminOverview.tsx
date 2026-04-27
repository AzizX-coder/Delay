'use client';
import { Avatar } from '@/components/Avatar';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story } from '@/lib/types';

export function AdminOverview({ stories, writerCount, contestCount }: { stories: Story[]; writerCount: number; contestCount: number }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const totalPlays = stories.reduce((a, s) => a + s.plays, 0);
  const totalLikes = stories.reduce((a, s) => a + s.likes, 0);

  const stats = [
    { label: 'Stories', value: stories.length, hint: 'published' },
    { label: 'Writers', value: writerCount, hint: 'active' },
    { label: 'Plays', value: totalPlays.toLocaleString(), hint: 'all time' },
    { label: 'Likes', value: totalLikes.toLocaleString(), hint: 'all time' },
    { label: 'Contests', value: contestCount, hint: 'open + upcoming' },
  ];

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Overview</div>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 500, color: ink,
          letterSpacing: -0.6, margin: 0 }}>Good morning, admin.</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            ...liquidSurface({ dark, intensity: 'med' }),
            borderRadius: 18, padding: '18px 20px',
          }}>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
              textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 30, color: ink, fontWeight: 500,
              letterSpacing: -0.6, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, marginTop: 2 }}>{s.hint}</div>
          </div>
        ))}
      </div>

      <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 18, padding: 22, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 18, color: ink, fontWeight: 500, margin: 0 }}>Recent stories</h3>
          <span style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>Last {Math.min(stories.length, 6)}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-geist)' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Title</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Author</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Plays</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stories.slice(0, 6).map(s => (
              <tr key={s.id} style={{ borderTop: `0.5px solid ${line}`, fontSize: 13, color: ink }}>
                <td style={{ padding: '12px 10px', fontFamily: 'var(--font-newsreader)', fontWeight: 500 }}>{s.title}</td>
                <td style={{ padding: '12px 10px', color: mute }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={s.author?.display_name?.[0] || 'A'} size={22} seed={s.cover_seed} />
                    {s.author?.display_name}
                  </span>
                </td>
                <td style={{ padding: '12px 10px', color: mute, textTransform: 'capitalize' }}>{s.type}</td>
                <td style={{ padding: '12px 10px', color: mute }}>{s.plays.toLocaleString()}</td>
                <td style={{ padding: '12px 10px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 999,
                    background: 'rgba(255,87,34,0.12)', color: tokens.orangeDeep,
                    fontSize: 11, fontWeight: 600,
                  }}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
