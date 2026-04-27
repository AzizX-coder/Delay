'use client';
import Link from 'next/link';
import { useEffect, useTransition } from 'react';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { markNotificationsRead } from '@/lib/actions';
import type { Profile } from '@/lib/types';

type Item = { id: string; kind: string; payload: any; created_at: string; read_at: string | null; from?: Profile };

const KIND_ICON: Record<string, (c: string) => React.ReactNode> = {
  follow: c => <Icon.profile s={16} c={c} />,
  like: c => <Icon.heart s={16} c={c} filled />,
  comment: c => <Icon.comment s={16} c={c} />,
  contest: c => <Icon.trophy s={16} c={c} />,
};

const KIND_TEXT: Record<string, (n: Item) => string> = {
  follow: () => 'started following you',
  like: () => 'liked your story',
  comment: () => 'commented on your story',
  contest: n => n.payload?.text || 'New contest update',
};

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const s = Math.max(1, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60); if (m < 60) return `${m}m`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h`;
  const dy = Math.round(h / 24); return `${dy}d`;
}

export function NotificationsView({ items }: { items: Item[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [, start] = useTransition();

  useEffect(() => { start(() => { markNotificationsRead(); }); }, []);

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 38, fontWeight: 500, color: ink,
          letterSpacing: -0.9, margin: 0 }}>Notifications</h1>
        <span style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
          {items.length} total
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{
          ...liquidSurface({ dark, intensity: 'med' }),
          borderRadius: 22, padding: '52px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
            background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon.bell s={28} c={mute} /></div>
          <h2 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 22, fontWeight: 500, color: ink,
            letterSpacing: -0.4, margin: '0 0 8px' }}>You're all caught up.</h2>
          <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute, margin: 0 }}>
            New activity from people you follow will appear here.
          </p>
        </div>
      ) : (
        <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 18, overflow: 'hidden' }}>
          {items.map((n, i) => {
            const text = KIND_TEXT[n.kind]?.(n) || n.kind;
            const icon = KIND_ICON[n.kind]?.(tokens.orange);
            const slug = n.payload?.story_slug;
            const from = n.from;
            const target = slug ? `/story/${slug}` : from ? `/profile/${from.username}` : '#';
            return (
              <Link key={n.id} href={target} style={{
                display: 'flex', gap: 14, padding: '16px 18px',
                borderTop: i === 0 ? 'none' : `0.5px solid ${line}`,
                textDecoration: 'none', color: 'inherit',
                background: !n.read_at ? (dark ? 'rgba(255,87,34,0.05)' : 'rgba(255,87,34,0.04)') : 'transparent',
              }}>
                {from ? (
                  <Avatar name={from.display_name[0]} size={40} seed={from.avatar_seed} />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: tokens.orangeGrad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{icon}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, marginBottom: 2 }}>
                    {from && <span style={{ fontWeight: 600 }}>{from.display_name} </span>}
                    {text}
                  </div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
                    {timeAgo(n.created_at)} ago
                  </div>
                </div>
                {!n.read_at && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                    background: tokens.orange, alignSelf: 'center' }} />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
