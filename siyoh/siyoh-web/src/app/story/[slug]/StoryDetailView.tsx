'use client';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { CoverPlaceholder } from '@/components/CoverPlaceholder';
import { Icon } from '@/components/Icon';
import { LikeButton } from '@/components/social/LikeButton';
import { BookmarkButton } from '@/components/social/BookmarkButton';
import { FollowButton } from '@/components/social/FollowButton';
import { ShareButton } from '@/components/social/ShareButton';
import { CommentThread } from '@/components/social/CommentThread';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story, Comment, Profile } from '@/lib/types';

export function StoryDetailView({
  story, comments, liked, saved, following, me,
}: {
  story: Story; comments: Comment[];
  liked: boolean; saved: boolean; following: boolean;
  me: Profile | null;
}) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const paragraphs = (story.body || story.excerpt).split(/\n\n+/);
  const isAudio = story.type === 'audio' || story.type === 'both';

  return (
    <div className="anim-fade-in">
      <div style={{ height: 280, background: tokens.orangeGrad, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.3), transparent 60%)' }} />
        <Link href="/feed" className="press" style={{
          position: 'absolute', top: 20, left: 20, zIndex: 3,
          height: 36, padding: '0 14px', borderRadius: 999,
          background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', color: '#fff',
          fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
        }}><Icon.back s={14} c="#fff" /> Orqaga</Link>
      </div>

      <article style={{ padding: '0 60px 160px', marginTop: -100, position: 'relative', maxWidth: 740, margin: '0 auto' }}>
        <div className="anim-fade-up" style={{ display: 'flex', gap: 28, alignItems: 'flex-end', marginBottom: 28 }}>
          <div style={{ transform: 'rotate(-2deg)', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <CoverPlaceholder w={180} h={240} seed={story.cover_seed}
              label={story.title.split(' ').slice(0, 3).join(' ')} />
          </div>
          <div style={{ paddingBottom: 20, flex: 1, marginTop: 30 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {story.tags.map(tg => (
                <span key={tg} style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', color: '#fff',
                  fontFamily: 'var(--font-geist)', fontSize: 10.5, fontWeight: 600,
                  letterSpacing: 0.4, textTransform: 'uppercase',
                }}>{tg}</span>
              ))}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-newsreader)', fontSize: 52, color: '#fff', fontWeight: 400,
              letterSpacing: -1, lineHeight: 1.02, margin: '0 0 14px',
            }}>{story.title}</h1>
            <Link href={`/profile/${story.author?.username}`} style={{
              display: 'flex', alignItems: 'center', gap: 10, color: '#fff', textDecoration: 'none',
            }}>
              <Avatar name={story.author?.display_name?.[0] || 'A'} size={30} seed={story.cover_seed} />
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>{story.author?.display_name}</div>
                <div style={{ opacity: 0.85 }}>@{story.author?.username} &middot; {story.published_at?.slice(5)} &middot; {story.mins} daqiqa</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="anim-fade-up delay-100" style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          {isAudio ? (
            <button className="press" style={{
              height: 50, padding: '0 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: tokens.orangeGrad, color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 14.5, fontWeight: 600,
              boxShadow: '0 10px 24px rgba(255,87,34,0.35)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}><Icon.play s={16} c="#fff" /> Tinglash &middot; {story.mins} daqiqa</button>
          ) : (
            <button className="press" style={{
              height: 50, padding: '0 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: tokens.orangeGrad, color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 14.5, fontWeight: 600,
              boxShadow: '0 10px 24px rgba(255,87,34,0.35)',
            }}>O&apos;qishni boshlash &middot; {story.mins} daqiqa</button>
          )}
          <div style={{
            height: 50, width: 50, borderRadius: 14, border: `0.5px solid ${line}`,
            background: dark ? 'rgba(255,237,213,0.03)' : 'rgba(26,22,19,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><BookmarkButton storyId={story.id} initialSaved={saved} size={20} /></div>
          <div style={{
            height: 50, width: 50, borderRadius: 14, border: `0.5px solid ${line}`,
            background: dark ? 'rgba(255,237,213,0.03)' : 'rgba(26,22,19,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><ShareButton title={story.title} url={`/story/${story.slug}`} size={20} /></div>
          <div style={{ marginLeft: 'auto' }}>
            {story.author_id !== me?.id && (
              <FollowButton
                targetId={story.author_id}
                initialFollowing={following}
                displayName={story.author?.display_name}
              />
            )}
          </div>
        </div>

        <div className="anim-fade-up delay-200">
          {paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: 'var(--font-newsreader)', fontSize: 21, lineHeight: 1.65, color: ink,
              marginBottom: 22, letterSpacing: -0.1,
            }}>
              {i === 0 && (
                <span style={{
                  fontSize: 80, float: 'left', lineHeight: 0.8, fontWeight: 400,
                  color: tokens.orange, marginRight: 10, marginTop: 10, fontStyle: 'italic',
                }}>{p[0]}</span>
              )}
              {i === 0 ? p.slice(1) : p}
            </p>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: '24px 0', borderTop: `0.5px solid ${line}`,
          display: 'flex', alignItems: 'center', gap: 22 }}>
          <LikeButton storyId={story.id} initialLiked={liked} initialCount={story.likes} size={20} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            color: mute, fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 500 }}>
            <Icon.comment s={18} c={mute} /> {comments.length}
          </span>
          <span style={{ marginLeft: 'auto', color: mute, fontFamily: 'var(--font-geist)', fontSize: 13 }}>
            {story.plays.toLocaleString()} marta o&apos;qildi
          </span>
        </div>

        <CommentThread storyId={story.id} initialComments={comments} me={me} />
      </article>
    </div>
  );
}
