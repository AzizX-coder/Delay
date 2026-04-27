'use client';
import Link from 'next/link';
import { Avatar } from './Avatar';
import { CoverPlaceholder } from './CoverPlaceholder';
import { Icon } from './Icon';
import { LikeButton } from './social/LikeButton';
import { BookmarkButton } from './social/BookmarkButton';
import { tokens } from '@/lib/tokens';
import { useTheme } from './ThemeProvider';
import type { Story } from '@/lib/types';

export function StoryRow({ story, seed = 0 }: { story: Story; seed?: number }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  return (
    <Link href={`/story/${story.slug}`} className="hover-lift" style={{
      padding: '22px 0', borderBottom: `0.5px solid ${line}`,
      display: 'grid', gridTemplateColumns: '1fr 180px', gap: 28, alignItems: 'start',
      textDecoration: 'none', color: 'inherit',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Avatar name={story.author?.display_name?.[0] || 'A'} size={22} seed={seed} />
          <span style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: ink, fontWeight: 500 }}>{story.author?.display_name}</span>
          <span style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>· {story.published_at?.slice(5)}</span>
          {story.type === 'audio' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(255,87,34,0.12)', color: tokens.orange,
              fontFamily: 'var(--font-geist)', fontSize: 10.5, fontWeight: 600,
              letterSpacing: 0.3, textTransform: 'uppercase',
            }}><Icon.headphones s={10} c={tokens.orange} /> Audio &middot; {story.mins} daq</span>
          )}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-newsreader)', fontSize: 24, color: ink, fontWeight: 500,
          letterSpacing: -0.4, lineHeight: 1.15, margin: '0 0 8px',
        }}>{story.title}</h3>
        <p style={{
          fontFamily: 'var(--font-newsreader)', fontSize: 15.5, color: mute, lineHeight: 1.5,
          margin: '0 0 14px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{story.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <span>{story.mins} daqiqa {story.type === 'audio' ? 'tinglash' : 'o\'qish'}</span>
          <LikeButton storyId={story.id} initialCount={story.likes} size={14} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.comment s={14} c={mute} /> 0</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
            {story.tags.map(tg => <span key={tg} style={{ padding: '3px 9px', borderRadius: 999,
              background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)' }}>{tg}</span>)}
          </span>
          <BookmarkButton storyId={story.id} size={14} />
        </div>
      </div>
      <CoverPlaceholder w={180} h={200} seed={story.cover_seed} label={story.title.split(' ').slice(0, 3).join(' ')} />
    </Link>
  );
}
