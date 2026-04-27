'use client';
import { useState, useTransition } from 'react';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import { addComment } from '@/lib/actions';
import type { Comment, Profile } from '@/lib/types';

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const s = Math.max(1, Math.round(ms / 1000));
  if (s < 60) return `${s} soniya oldin`;
  const m = Math.round(s / 60); if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.round(m / 60); if (h < 24) return `${h} soat oldin`;
  const dy = Math.round(h / 24); return `${dy} kun oldin`;
}

export function CommentThread({
  storyId, initialComments = [], me,
}: { storyId: string; initialComments?: Comment[]; me?: Profile | null }) {
  const { dark } = useTheme();
  const { push } = useToast();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState('');
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const optimistic: Comment = {
      id: 'tmp-' + Math.random().toString(36).slice(2),
      story_id: storyId, author_id: me?.id || 'me', body: body.trim(),
      created_at: new Date().toISOString(),
      author: me || undefined,
    };
    setComments(c => [optimistic, ...c]);
    setBody('');
    start(async () => {
      const res = await addComment(storyId, optimistic.body);
      if (res.ok && res.comment) {
        setComments(c => c.map(x => x.id === optimistic.id ? (res.comment as Comment) : x));
      } else if (!res.ok) {
        setComments(c => c.filter(x => x.id !== optimistic.id));
        push({ kind: 'error', title: 'Yuborib bo\'lmadi', body: res.error });
      }
    });
  }

  return (
    <section style={{ marginTop: 56 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 26, fontWeight: 400, color: ink,
          letterSpacing: -0.4, margin: 0 }}>Sharhlar</h3>
        <span style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>{comments.length}</span>
      </div>

      <form onSubmit={submit} style={{
        ...liquidSurface({ dark, intensity: 'med' }),
        borderRadius: 16, padding: 16, display: 'flex', gap: 12, marginBottom: 24,
      }}>
        <Avatar name={me?.display_name?.[0] || 'A'} size={36} seed={me?.avatar_seed ?? 0} />
        <div style={{ flex: 1 }}>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder="Fikringiz bilan o'rtoqlashing&hellip;"
            rows={2}
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              resize: 'vertical', color: ink,
              fontFamily: 'var(--font-newsreader)', fontSize: 15, lineHeight: 1.5,
            }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" disabled={pending || !body.trim()} className="press" style={{
              height: 36, padding: '0 16px', borderRadius: 10, border: 'none',
              cursor: pending || !body.trim() ? 'default' : 'pointer',
              background: body.trim() ? tokens.orangeGrad : (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.06)'),
              color: body.trim() ? '#fff' : mute,
              fontFamily: 'var(--font-geist)', fontSize: 12.5, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              opacity: pending ? 0.7 : 1,
            }}>{pending ? 'Yuborilmoqda…' : 'Yuborish'} <Icon.chev s={13} c={body.trim() ? '#fff' : mute} /></button>
          </div>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {comments.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center',
            fontFamily: 'var(--font-newsreader)', color: mute, fontStyle: 'italic', fontSize: 17 }}>
            Birinchi fikrni siz qoldiring.
          </div>
        )}
        {comments.map(c => (
          <div key={c.id} className="anim-fade-in" style={{
            display: 'flex', gap: 12, padding: '16px 0',
            borderBottom: `0.5px solid ${line}`,
          }}>
            <Avatar name={c.author?.display_name?.[0] || 'A'} size={36} seed={c.author?.avatar_seed ?? 0} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-geist)', fontSize: 13.5, color: ink, fontWeight: 600 }}>
                  {c.author?.display_name || 'Kitobxon'}
                </span>
                <span style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
                  · {timeAgo(c.created_at)}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: ink, lineHeight: 1.55 }}>
                {c.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
