'use client';
import Link from 'next/link';
import { useState } from 'react';
import { StoryRow } from '@/components/StoryRow';
import { FollowButton } from '@/components/social/FollowButton';
import { ShareButton } from '@/components/social/ShareButton';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Profile, Story } from '@/lib/types';

const TABS: { k: 'published' | 'drafts' | 'saved' | 'listened'; label: string }[] = [
  { k: 'published', label: 'Nashr qilingan' },
  { k: 'drafts', label: 'Qoralamalar' },
  { k: 'saved', label: 'Saqlangan' },
  { k: 'listened', label: 'Tinglangan' },
];

export function ProfileView({
  profile, stories, following, isMe,
}: { profile: Profile; stories: Story[]; following: boolean; isMe: boolean }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [tab, setTab] = useState<'published' | 'drafts' | 'saved' | 'listened'>('published');

  return (
    <div>
      <div style={{ height: 180, background: tokens.orangeGradSoft, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 50%, rgba(255,138,76,0.4), transparent 60%)' }} />
      </div>

      <div style={{ padding: '0 36px', marginTop: -52, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: tokens.orangeGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-newsreader)', fontSize: 60, color: '#fff', fontWeight: 400,
            border: `4px solid ${dark ? tokens.darkBg : tokens.paper}`,
            boxShadow: '0 14px 30px rgba(255,87,34,0.3)',
          }}>{profile.display_name[0]}</div>
          <div style={{ paddingBottom: 8, flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 40, color: ink, fontWeight: 400,
              letterSpacing: -0.6, margin: '0 0 4px' }}>{profile.display_name}</h1>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute }}>@{profile.username} &middot; {profile.created_at?.slice(0, 7)}&apos;dan beri</div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 8, alignItems: 'center' }}>
            <div style={{
              height: 40, width: 40, borderRadius: 12, border: `0.5px solid ${line}`,
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><ShareButton title={profile.display_name} url={`/profile/${profile.username}`} size={18} /></div>
            {isMe ? (
              <Link href="/profile/edit" className="press" style={{
                height: 40, padding: '0 16px', borderRadius: 12, border: 'none',
                background: dark ? tokens.darkInk : tokens.ink, color: dark ? tokens.darkBg : tokens.paper,
                fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}>Profilni tahrirlash</Link>
            ) : (
              <FollowButton targetId={profile.id} initialFollowing={following} displayName={profile.display_name} />
            )}
          </div>
        </div>

        {profile.bio ? (
          <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 19, color: ink, fontStyle: 'italic',
            lineHeight: 1.5, maxWidth: 540, margin: '0 0 20px' }}>
            {profile.bio}
          </p>
        ) : isMe && (
          <Link href="/profile/edit" style={{
            display: 'inline-block', fontFamily: 'var(--font-newsreader)', fontSize: 16,
            color: mute, fontStyle: 'italic', margin: '0 0 20px',
            textDecoration: 'none',
          }}>+ O&apos;zingiz haqingizda yozing</Link>
        )}

        <div style={{ display: 'flex', gap: 28, padding: '18px 22px', borderRadius: 18,
          ...liquidSurface({ dark, intensity: 'med' }), marginBottom: 28 }}>
          {[
            [String(stories.length), 'Hikoya'],
            ['—', 'Kuzatuvchi'],
            ['—', 'Tinglovchi'],
            ['—', 'Saqlangan'],
            ['—', 'O\'qilgan'],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 26, color: ink, fontWeight: 400 }}>{n}</div>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, marginTop: 2,
                textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 24, borderBottom: `0.5px solid ${line}`, marginBottom: 8 }}>
          {TABS.map(tb => (
            <button key={tb.k} onClick={() => setTab(tb.k)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer', padding: '12px 0',
              fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
              color: tab === tb.k ? ink : mute,
              borderBottom: tab === tb.k ? `2px solid ${tokens.orange}` : '2px solid transparent',
            }}>{tb.label}</button>
          ))}
        </div>

        <div style={{ paddingBottom: 160 }}>
          {tab === 'published' && (
            stories.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 22, color: mute,
                  fontStyle: 'italic', marginBottom: 12 }}>
                  Hali nashr qilinmagan.
                </div>
                {isMe && (
                  <Link href="/create" className="press" style={{
                    height: 40, padding: '0 18px', borderRadius: 10,
                    background: tokens.orangeGrad, color: '#fff',
                    fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 8px 18px rgba(255,87,34,0.3)',
                  }}><Icon.create s={14} c="#fff" /> Birinchi hikoyani yozish</Link>
                )}
              </div>
            ) : stories.map((s, i) => <StoryRow key={s.id} story={s} seed={i} />)
          )}
          {tab !== 'published' && (
            <div style={{ padding: '48px 24px', textAlign: 'center',
              fontFamily: 'var(--font-newsreader)', fontSize: 18, color: mute, fontStyle: 'italic' }}>
              {tab === 'drafts' && 'Qoralamalar yo\'q.'}
              {tab === 'saved' && 'Saqlanganlar yo\'q.'}
              {tab === 'listened' && 'Tinglangan audiolar yo\'q.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
