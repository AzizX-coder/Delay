'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { StoryRow } from '@/components/StoryRow';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story } from '@/lib/types';

export function SearchView({ stories }: { stories: Story[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const [q, setQ] = useState('');
  const filtered = q
    ? stories.filter(s =>
        s.title.toLowerCase().includes(q.toLowerCase()) ||
        s.author?.display_name?.toLowerCase().includes(q.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
      )
    : stories;

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 38, fontWeight: 500, color: ink,
        letterSpacing: -0.9, margin: '0 0 18px' }}>Search</h1>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 52, borderRadius: 16, padding: '0 18px', marginBottom: 24,
        ...liquidSurface({ dark, intensity: 'med' }),
      }}>
        <Icon.search s={18} c={mute} />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Title, author, tag…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
            color: ink, fontFamily: 'var(--font-geist)', fontSize: 15 }}
        />
        <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: mute,
          padding: '3px 8px', borderRadius: 4,
          background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)' }}>esc</kbd>
      </div>
      <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute,
        textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600, marginBottom: 6 }}>
        {filtered.length} result{filtered.length === 1 ? '' : 's'}
      </div>
      {filtered.map((s, i) => <StoryRow key={s.id} story={s} seed={i} />)}
    </div>
  );
}
