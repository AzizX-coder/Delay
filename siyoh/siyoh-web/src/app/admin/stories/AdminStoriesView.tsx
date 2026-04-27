'use client';
import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Chip } from '@/components/Chip';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story } from '@/lib/types';

export function AdminStoriesView({ stories }: { stories: Story[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'text' | 'audio'>('all');

  const filtered = stories.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false;
    if (q && !(s.title.toLowerCase().includes(q.toLowerCase()) || s.author?.display_name?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Library</div>
          <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 500, color: ink,
            letterSpacing: -0.6, margin: 0 }}>Stories</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 12, padding: '0 14px', height: 40 }}>
            <Icon.search s={15} c={mute} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search title or author"
              style={{ border: 'none', outline: 'none', background: 'transparent', color: ink,
                fontFamily: 'var(--font-geist)', fontSize: 13, width: 240 }} />
          </div>
          {(['all', 'text', 'audio'] as const).map(f => (
            <Chip key={f} active={filter === f} dark={dark} onClick={() => setFilter(f)}>{f}</Chip>
          ))}
        </div>
      </div>

      <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 18, padding: 22 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-geist)' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Title</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Author</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Tags</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Plays</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderTop: `0.5px solid ${line}`, fontSize: 13, color: ink }}>
                <td style={{ padding: '12px 10px', fontFamily: 'var(--font-newsreader)', fontWeight: 500 }}>{s.title}</td>
                <td style={{ padding: '12px 10px', color: mute }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={s.author?.display_name?.[0] || 'A'} size={22} seed={s.cover_seed} />
                    {s.author?.display_name}
                  </span>
                </td>
                <td style={{ padding: '12px 10px', color: mute, textTransform: 'capitalize' }}>{s.type}</td>
                <td style={{ padding: '12px 10px', color: mute }}>{s.tags.join(', ')}</td>
                <td style={{ padding: '12px 10px', color: mute }}>{s.plays.toLocaleString()}</td>
                <td style={{ padding: '12px 10px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 999,
                    background: s.status === 'published' ? 'rgba(255,87,34,0.12)' : 'rgba(26,22,19,0.06)',
                    color: s.status === 'published' ? tokens.orangeDeep : mute,
                    fontSize: 11, fontWeight: 600,
                  }}>{s.status}</span>
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                  <button aria-label="More" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Icon.more s={16} c={mute} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
